// Voice capture and voice-note reading.
// Demo mode: the browser's live speech recognition (where available) + the built-in rule-based reader.
// Hosted mode (VITE_SUPABASE_URL set): audio goes to the `extract-job` edge function, which transcribes it and asks
// Claude to fill the job schema using only the company's own price list.
import { useCallback, useRef, useState } from 'react';
import type { ExtractedJob, Lang, PriceItem } from './domain/types';
import { localExtract } from './domain/localExtract';

export const HOSTED = Boolean(import.meta.env.VITE_SUPABASE_URL);

export async function extractJob(input: { transcript?: string; audio?: Blob; lang: Lang; prices: PriceItem[]; accessToken?: string }): Promise<{ transcript: string; extracted: ExtractedJob; source: 'ai' | 'local' }> {
  if (HOSTED && input.accessToken) {
    try {
      const fd = new FormData();
      if (input.audio) fd.append('audio', input.audio, 'note.webm');
      if (input.transcript) fd.append('transcript', input.transcript);
      fd.append('lang', input.lang);
      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-job`, { method: 'POST', headers: { Authorization: `Bearer ${input.accessToken}` }, body: fd });
      if (r.ok) { const j = await r.json(); return { transcript: j.transcript, extracted: j.extracted, source: 'ai' }; }
    } catch { /* fall back to the local reader below */ }
  }
  const transcript = input.transcript ?? '';
  return { transcript, extracted: localExtract(transcript), source: 'local' };
}

type SR = { start(): void; stop(): void; lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };

/** Press-and-talk: records audio (kept for the hosted transcriber) and shows a live transcript where the browser supports it. */
export function useRecorder(lang: Lang) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [audio, setAudio] = useState<Blob | undefined>();
  const rec = useRef<MediaRecorder | null>(null);
  const sr = useRef<SR | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const finalText = useRef('');
  const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  const SRClass = W.SpeechRecognition ?? W.webkitSpeechRecognition;
  const liveSupported = Boolean(SRClass);

  const start = useCallback(async () => {
    finalText.current = transcript ? transcript + ' ' : '';
    setSeconds(0); setRecording(true);
    timer.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: BlobPart[] = [];
      const m = new MediaRecorder(stream);
      m.ondataavailable = e => chunks.push(e.data);
      m.onstop = () => { setAudio(new Blob(chunks, { type: m.mimeType })); stream.getTracks().forEach(t => t.stop()); };
      m.start(); rec.current = m;
    } catch { /* no microphone permission: live transcript or typing still works */ }
    if (SRClass) {
      const s = new SRClass(); s.lang = lang === 'fr' ? 'fr-CA' : 'en-CA'; s.continuous = true; s.interimResults = true;
      s.onresult = e => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalText.current += r[0].transcript + ' '; else interim += r[0].transcript;
        }
        setTranscript((finalText.current + interim).trim());
      };
      s.onerror = () => {}; s.onend = () => {};
      try { s.start(); sr.current = s; } catch { /* already running */ }
    }
  }, [SRClass, lang, transcript]);

  const stop = useCallback(() => {
    setRecording(false); window.clearInterval(timer.current);
    try { rec.current?.stop(); } catch { /* not started */ }
    try { sr.current?.stop(); } catch { /* not started */ }
    rec.current = null; sr.current = null;
  }, []);

  return { recording, transcript, setTranscript, seconds, audio, start, stop, liveSupported };
}

export function fileToDataUrl(f: File, maxW = 1280): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(f);
    img.onload = () => {
      const k = Math.min(1, maxW / img.width); const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = rej; img.src = url;
  });
}
