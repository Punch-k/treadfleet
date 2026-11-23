import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { actions, useStore } from '../store';
import { useT } from '../i18n';
import { extractJob, fileToDataUrl, useRecorder } from '../services';
import { linesFromExtraction } from '../domain/lines';
import { torqueFromExtraction, DEFAULT_RETORQUE_KM } from '../domain/torque';
import { SAMPLE_NOTE } from '../sample';
import { Icon, I } from './Shell';
import { StatusPill } from './Jobs';

export function TechToday() {
  const { t } = useT();
  const me = useStore(s => s.techName); const techs = useStore(s => s.techs);
  const allJobs = useStore(s => s.jobs);
  const jobs = allJobs.filter(j => j.techName === me && ['dispatched', 'recorded', 'review'].includes(j.status));
  const fleets = useStore(s => s.fleets);
  return (
    <div className="tech stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 24 }}>{t('todayFor', { n: me })}</h1>
        <label className="row small muted" style={{ gap: 6 }}>{t('whoAmI')}<select value={me} onChange={e => actions.setTechName(e.target.value)} style={{ width: 'auto' }}>{techs.map(x => <option key={x}>{x}</option>)}</select></label>
      </div>
      {!jobs.length && <div className="card empty">{t('noToday')}</div>}
      {jobs.map(j => (
        <Link key={j.id} to={`/jobs/${j.id}`} className={`jobcard ${j.type}`}>
          <div className="row" style={{ justifyContent: 'space-between' }}><span className="muted small">{t(j.type)} · #{j.number}</span><StatusPill s={j.status} /></div>
          <b>{fleets.find(f => f.id === j.fleetId)?.name ?? '—'}{j.unit ? ` · ${t('unit')} ${j.unit}` : ''}</b>
          <span className="muted">{j.location}{j.description ? ` · ${j.description}` : ''}</span>
        </Link>
      ))}
    </div>
  );
}

export function TechJob() {
  const { id } = useParams(); const nav = useNavigate(); const { t, lang } = useT();
  const job = useStore(s => s.jobs.find(j => j.id === id || String(j.number) === id));
  const fleets = useStore(s => s.fleets); const prices = useStore(s => s.prices); const company = useStore(s => s.company);
  const r = useRecorder(lang);
  const [busy, setBusy] = useState(false); const [done, setDone] = useState(false); const [typing, setTyping] = useState(false);
  if (!job) return <div className="empty">Not found</div>;
  const fleet = fleets.find(f => f.id === job.fleetId);
  const submit = async () => {
    setBusy(true);
    const { transcript, extracted } = await extractJob({ transcript: r.transcript, audio: r.audio, lang, prices });
    actions.updateJob(job.id, {
      transcript, extracted, unit: job.unit || extracted.unit,
      lines: linesFromExtraction(extracted, prices, lang),
      torque: torqueFromExtraction(extracted, job.techName, new Date().toISOString(), company?.retorqueKm ?? DEFAULT_RETORQUE_KM),
      status: 'review',
    }, 'voice note recorded');
    setBusy(false); setDone(true);
  };
  return (
    <div className="tech stack">
      <button className="btn ghost sm" style={{ alignSelf: 'flex-start' }} onClick={() => nav('/')}><Icon d={I.back} />{t('back')}</button>
      <div className="card">
        <div className="muted small">{t(job.type)} · #{job.number}</div>
        <h2 style={{ fontSize: 20, margin: '4px 0' }}>{fleet?.name ?? '—'}{job.unit ? ` · ${t('unit')} ${job.unit}` : ''}</h2>
        <div className="muted">{job.location}{job.description ? ` · ${job.description}` : ''}</div>
        <div className="row" style={{ marginTop: 10 }}>
          {job.location && <a className="btn sm" href={`https://maps.google.com/?q=${encodeURIComponent(job.location)}`} target="_blank" rel="noreferrer">{t('navigate')}</a>}
        </div>
      </div>

      {done ? (
        <div className="card" style={{ textAlign: 'center' }}><h2 style={{ justifyContent: 'center', color: 'var(--go)' }}>{t('sentToOffice')}</h2><Link className="btn" to="/">{t('navToday')}</Link></div>
      ) : (
        <div className="card stack">
          <button className={`talk${r.recording ? ' on' : ''}`} onClick={() => (r.recording ? r.stop() : r.start())}>
            <span style={{ display: 'grid', placeItems: 'center', gap: 4 }}><Icon d={I.mic} />{r.recording ? `${t('stop')} · 0:${String(r.seconds).padStart(2, '0')}` : t('talk')}</span>
          </button>
          {!r.liveSupported && <p className="muted small" style={{ textAlign: 'center', margin: 0 }}>{t('noSpeech')}</p>}
          {(r.transcript || r.recording) && !typing && <div className="transcript live">{r.transcript || t('listening')}</div>}
          {typing && <textarea rows={5} value={r.transcript} onChange={e => r.setTranscript(e.target.value)} autoFocus />}
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn ghost sm" onClick={() => setTyping(x => !x)}>{t('typeInstead')}</button>
            <button className="btn ghost sm" onClick={() => r.setTranscript(SAMPLE_NOTE[lang])}>{t('useSample')}</button>
          </div>
          <div>
            <div className="muted small" style={{ fontWeight: 700, marginBottom: 6 }}>{t('photos')}</div>
            <div className="thumbs">
              {job.photos.map((p, i) => <img key={i} src={p} alt="" />)}
              <label className="btn" style={{ width: 84, height: 84, flexDirection: 'column', gap: 2, fontSize: 12 }}>
                <Icon d={I.cam} />{t('addPhoto')}
                <input type="file" accept="image/*" capture="environment" hidden onChange={async e => { const f = e.target.files?.[0]; if (f) actions.updateJob(job.id, { photos: [...job.photos, await fileToDataUrl(f)] }); e.target.value = ''; }} />
              </label>
            </div>
          </div>
          <button className="btn primary" disabled={busy || !r.transcript.trim() || r.recording} onClick={submit}>{busy ? t('readingNote') : t('submit')}</button>
        </div>
      )}
    </div>
  );
}
