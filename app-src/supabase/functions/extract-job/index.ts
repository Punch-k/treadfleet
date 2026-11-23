// extract-job: turns a technician's voice note into structured job fields.
//   POST multipart/form-data { audio?: File, transcript?: string, lang: 'en'|'fr' }  with the user's Supabase JWT.
//   1. Speech-to-text (Deepgram) unless the phone already sent a transcript.
//   2. Claude fills a strict JSON schema, quoting the exact words behind every field. It never prices anything:
//      prices are applied in the app, only from the company's own list.
// Secrets (set with `supabase secrets set`): ANTHROPIC_API_KEY, DEEPGRAM_API_KEY (optional if phones send transcripts).
import Anthropic from 'npm:@anthropic-ai/sdk@1.12.0';
import { createClient } from 'npm:@supabase/supabase-js@2.119.2';
import { z } from 'npm:zod@4.6.7';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type, apikey', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

// ---------- schema the model must fill ----------
const POSITION = {
  type: 'object', additionalProperties: false,
  properties: {
    axle: { type: 'string', enum: ['steer', 'drive', 'trailer'] },
    axle_no: { type: ['integer', 'null'] },
    side: { type: 'string', enum: ['left', 'right'] },
    pos: { type: ['string', 'null'], enum: ['inner', 'outer', null] },
  },
  required: ['axle', 'axle_no', 'side', 'pos'],
};
const SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    unit: { type: ['string', 'null'], description: "The fleet's unit/truck/trailer number exactly as spoken, e.g. '4521'." },
    road_call: { type: ['boolean', 'null'] },
    labour_hours: { type: ['number', 'null'], description: 'Hours of labour the technician stated. Null if not stated.' },
    wheels: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          position: { anyOf: [POSITION, { type: 'null' }] },
          action: { type: ['string', 'null'], enum: ['replace', 'repair', 'inspect', 'rotate', null] },
          removed_tread_32: { type: ['integer', 'null'], description: 'Tread depth of the removed tire in 32nds of an inch.' },
          casing_ok: { type: ['boolean', 'null'] },
          installed_size: { type: ['string', 'null'], description: 'Size of the tire installed, normalized like 11R22.5 or 295/75R22.5.' },
          installed_description: { type: ['string', 'null'], description: 'Brand, ply or model words if spoken.' },
          torque_ft_lb: { type: ['integer', 'null'], description: 'Torque value as spoken, in ft-lb. Never estimate.' },
          pattern: { type: ['string', 'null'], enum: ['crisscross', 'star', 'other', null] },
        },
        required: ['position', 'action', 'removed_tread_32', 'casing_ok', 'installed_size', 'installed_description', 'torque_ft_lb', 'pattern'],
      },
    },
    notes: { type: ['string', 'null'], description: 'Anything else the office should know, in the language of the note.' },
    evidence: {
      type: 'array',
      description: 'For every non-null field, the exact words from the transcript it came from.',
      items: { type: 'object', additionalProperties: false, properties: { field: { type: 'string' }, quote: { type: 'string' } }, required: ['field', 'quote'] },
    },
    uncertain: { type: 'array', items: { type: 'string' }, description: 'Field paths you are not sure about (misheard, ambiguous).' },
  },
  required: ['unit', 'road_call', 'labour_hours', 'wheels', 'notes', 'evidence', 'uncertain'],
} as const;

// Runtime check of the model output before it reaches the app.
const Pos = z.object({ axle: z.enum(['steer', 'drive', 'trailer']), axle_no: z.number().int().nullable(), side: z.enum(['left', 'right']), pos: z.enum(['inner', 'outer']).nullable() });
const Out = z.object({
  unit: z.string().nullable(), road_call: z.boolean().nullable(), labour_hours: z.number().nullable(),
  wheels: z.array(z.object({ position: Pos.nullable(), action: z.enum(['replace', 'repair', 'inspect', 'rotate']).nullable(), removed_tread_32: z.number().int().nullable(), casing_ok: z.boolean().nullable(), installed_size: z.string().nullable(), installed_description: z.string().nullable(), torque_ft_lb: z.number().int().nullable(), pattern: z.enum(['crisscross', 'star', 'other']).nullable() })),
  notes: z.string().nullable(), evidence: z.array(z.object({ field: z.string(), quote: z.string() })), uncertain: z.array(z.string()),
});

const SYSTEM = `You read voice notes from commercial truck tire technicians in Canada (English or French, often noisy, informal, with trade slang) and fill the job record for the office.

Rules:
- Only record what the technician actually said. Never guess or fill in typical values. A missing value is null.
- Torque, tread depth, sizes and hours are safety and billing records: copy the number exactly as spoken. If you are not sure you heard a number right, still give your best reading and add the field path to "uncertain".
- Wheel positions: steer, drive or trailer axle; left (driver side) or right (passenger side); inner or outer on duals. "Axle 2" or "rear drive" sets axle_no.
- One entry in "wheels" per wheel the technician worked on.
- "evidence": for each non-null field, the shortest exact substring of the transcript it came from. Field paths look like "unit", "road_call", "labour_hours", "wheels.0.installed_size", "wheels.0.torque_ft_lb".
- Do not price anything. The office applies prices from its own list.
- Tire sizes the company stocks are listed below; use them to normalize what you hear (e.g. "eleven R twenty-two five" is 11R22.5), but record the size spoken even if it is not stocked.`;

async function transcribe(audio: File, lang: string, keyterms: string[]): Promise<string> {
  const key = Deno.env.get('DEEPGRAM_API_KEY');
  if (!key) throw new Error('speech-to-text is not configured');
  const params = new URLSearchParams({ model: 'nova-3', language: lang === 'fr' ? 'fr' : 'en', smart_format: 'true', numerals: 'true' });
  for (const k of keyterms.slice(0, 50)) params.append('keyterm', k);
  const r = await fetch(`https://api.deepgram.com/v1/listen?${params}`, { method: 'POST', headers: { Authorization: `Token ${key}`, 'Content-Type': audio.type || 'audio/webm' }, body: audio });
  if (!r.ok) throw new Error(`speech-to-text failed (${r.status})`);
  const j = await r.json();
  return j?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  // Who is calling, and which company's price list applies.
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: 'sign in first' }, 401);
  const { data: member } = await supabase.from('members').select('company_id').eq('user_id', user.id).limit(1).maybeSingle();
  if (!member) return json({ error: 'not part of a company' }, 403);
  const { data: prices } = await supabase.from('price_items').select('kind, code, description, size, aliases').eq('company_id', member.company_id).eq('active', true).limit(300);

  const form = await req.formData();
  const lang = form.get('lang') === 'fr' ? 'fr' : 'en';
  let transcript = String(form.get('transcript') ?? '').trim().slice(0, 8000);
  const audio = form.get('audio');
  const sizes = [...new Set((prices ?? []).map(p => p.size).filter(Boolean))] as string[];
  const keyterms = [...sizes, 'steer', 'drive', 'trailer', 'casing', 'torque', 'retread', 'road call', 'PO'];
  try {
    if (audio instanceof File && audio.size > 0 && audio.size < 25_000_000) transcript = (await transcribe(audio, lang, keyterms)) || transcript;
  } catch (e) {
    if (!transcript) return json({ error: (e as Error).message }, 502);
  }
  if (!transcript) return json({ error: 'empty note' }, 400);

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY
  const stock = (prices ?? []).map(p => `- ${p.kind}: ${p.description}${p.size ? ` (${p.size})` : ''}${p.aliases?.length ? ` · also called: ${p.aliases.join(', ')}` : ''}`).join('\n');
  try {
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      system: `${SYSTEM}\n\nCompany price list (for recognizing sizes and words only):\n${stock || '(empty)'}`,
      messages: [{ role: 'user', content: `Language of the note: ${lang === 'fr' ? 'French' : 'English'}\n\n<transcript>\n${transcript}\n</transcript>` }],
    } as never) as Anthropic.Beta.BetaMessage;

    if (response.stop_reason === 'refusal') return json({ error: 'the note could not be read automatically', transcript }, 422);
    if (response.stop_reason === 'max_tokens') return json({ error: 'the note was too long to read in one go', transcript }, 422);
    const text = response.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text').map(b => b.text).join('');
    const parsed = Out.safeParse(JSON.parse(text));
    if (!parsed.success) return json({ error: 'unexpected reader output', transcript }, 502);
    const o = parsed.data;

    // Keep only evidence that really appears in the transcript, and map to the app's shape.
    const evidence: Record<string, string> = {};
    for (const e of o.evidence) if (e.quote && transcript.includes(e.quote)) evidence[e.field.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())] = e.quote;
    const extracted = {
      unit: o.unit ?? undefined, roadCall: o.road_call ?? undefined, labourHours: o.labour_hours ?? undefined, notes: o.notes ?? undefined,
      wheels: o.wheels.map(w => ({
        position: w.position ? { axle: w.position.axle, axleNo: w.position.axle_no ?? undefined, side: w.position.side, pos: w.position.pos ?? undefined } : undefined,
        action: w.action ?? undefined, removedTread32: w.removed_tread_32 ?? undefined, casingOk: w.casing_ok ?? undefined,
        installedSize: w.installed_size ?? undefined, installedDescription: w.installed_description ?? undefined, torqueFtLb: w.torque_ft_lb ?? undefined, pattern: w.pattern ?? undefined,
      })),
      evidence,
      uncertain: o.uncertain.map(f => f.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())),
    };
    return json({ transcript, extracted, model: response.model });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ error: 'busy, try again in a minute', transcript }, 429);
    if (error instanceof Anthropic.AuthenticationError) return json({ error: 'AI service key is not configured', transcript }, 500);
    if (error instanceof Anthropic.APIError) return json({ error: `AI service error ${error.status}`, transcript }, 502);
    return json({ error: 'could not read the note', transcript }, 500);
  }
});
