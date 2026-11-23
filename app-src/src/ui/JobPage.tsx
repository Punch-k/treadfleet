import { Fragment, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { actions, useStore } from '../store';
import { useT } from '../i18n';
import { blockers, BLOCKER_TEXT, lineTotal, totals } from '../domain/invoice';
import { formatMoney } from '../domain/tax';
import { linesFromExtraction, positionLabel, uid } from '../domain/lines';
import { torqueFromExtraction, torqueWarning, DEFAULT_RETORQUE_KM } from '../domain/torque';
import { localExtract } from '../domain/localExtract';
import type { Job, JobLine, TorqueRecord, WheelPosition } from '../domain/types';
import { Icon, I } from './Shell';
import { StatusPill } from './Jobs';

/** Highlights the transcript words that each line or field came from. */
function Highlighted({ text, quotes }: { text: string; quotes: string[] }) {
  const qs = quotes.filter(q => q && q.length > 1 && text.includes(q)).sort((a, b) => b.length - a.length);
  if (!qs.length) return <>{text}</>;
  const parts: Array<string | { m: string }> = [text];
  for (const q of qs) {
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]; if (typeof p !== 'string') continue;
      const k = p.indexOf(q); if (k < 0) continue;
      parts.splice(i, 1, p.slice(0, k), { m: q }, p.slice(k + q.length)); i++;
    }
  }
  return <>{parts.map((p, i) => (typeof p === 'string' ? p : <mark key={i}>{p.m}</mark>))}</>;
}

export function JobPage() {
  const { id } = useParams(); const nav = useNavigate(); const { t, lang } = useT();
  const job = useStore(s => s.jobs.find(j => j.id === id || String(j.number) === id));
  const fleets = useStore(s => s.fleets); const prices = useStore(s => s.prices); const company = useStore(s => s.company);
  const [pick, setPick] = useState('');
  const fleet = fleets.find(f => f.id === job?.fleetId);
  const b = useMemo(() => (job ? blockers(job, fleet) : []), [job, fleet]);
  if (!job) return <div className="empty">Not found. <Link to="/">{t('back')}</Link></div>;
  const frozen = ['approved', 'sent', 'closed'].includes(job.status);
  const tot = totals(job);
  const upd = (p: Partial<Job>) => actions.updateJob(job.id, p);
  const setLine = (lid: string, p: Partial<JobLine>) => actions.setLines(job.id, job.lines.map(l => (l.id === lid ? { ...l, ...p } : l)));
  const quotes = [...Object.values(job.extracted?.evidence ?? {}), ...job.lines.map(l => l.evidence ?? '')];
  const reread = () => {
    if (!job.transcript) return;
    const x = localExtract(job.transcript);
    actions.updateJob(job.id, { extracted: x, unit: job.unit || x.unit, lines: linesFromExtraction(x, prices, lang), torque: torqueFromExtraction(x, job.techName, new Date().toISOString(), company?.retorqueKm ?? DEFAULT_RETORQUE_KM), status: 'review' }, 're-read voice note');
  };
  const addTorque = () => actions.setTorque(job.id, [...job.torque, { position: { axle: 'steer', side: 'left' }, valueFtLb: 450, pattern: 'crisscross', techName: job.techName, recordedAt: new Date().toISOString(), retorqueDueKm: company?.retorqueKm ?? DEFAULT_RETORQUE_KM }]);
  const setTq = (i: number, p: Partial<TorqueRecord>) => actions.setTorque(job.id, job.torque.map((r, k) => (k === i ? { ...r, ...p } : r)));

  return (
    <>
      <div className="topbar">
        <div className="row"><button className="btn ghost sm" onClick={() => nav('/')}><Icon d={I.back} />{t('back')}</button><h1>{t('jobNo')} {job.number}</h1><StatusPill s={job.status} /></div>
        <div className="row">
          {job.invoiceNo && <Link className="btn" to={`/jobs/${job.id}/invoice`}><Icon d={I.print} />{t('viewInvoice')} {job.invoiceNo}</Link>}
          {!frozen && <button className="btn primary" disabled={b.length > 0} onClick={() => actions.approve(job.id)}><Icon d={I.check} />{t('approve')}</button>}
          {job.status === 'approved' && <button className="btn dark" onClick={() => actions.markSent(job.id)}>{t('send')}</button>}
        </div>
      </div>

      <div className="job-grid">
        <div className="stack">
          <div className="card">
            <div className="grid3">
              <label className="f">{t('fleet')}<select disabled={frozen} value={job.fleetId ?? ''} onChange={e => upd({ fleetId: e.target.value || undefined })}><option value="">{t('choose')}</option>{fleets.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
              <label className="f">{t('unit')}<input disabled={frozen} value={job.unit ?? ''} onChange={e => upd({ unit: e.target.value })} /></label>
              <label className="f">{t('po')}{fleet?.poRequired ? ' *' : ''}<input disabled={frozen} value={job.po ?? ''} onChange={e => upd({ po: e.target.value })} placeholder={fleet?.notes ?? ''} /></label>
            </div>
            <div className="muted small" style={{ marginTop: 10 }}>{t(job.type)} · {job.location || '—'} · {job.techName ?? t('unassigned')}{job.description ? ` · ${job.description}` : ''}</div>
          </div>

          <div className="card lines">
            <h2>{t('lines')}{frozen && <span className="pill approved">{t('approved')} {job.invoiceNo}</span>}</h2>
            {frozen && <p className="muted small" style={{ marginTop: -6 }}>{t('frozen')}</p>}
            <div className="tscroll"><table className="t">
              <thead><tr><th>{t('item')}</th><th className="num" style={{ width: 80 }}>{t('qty')}</th><th className="num" style={{ width: 120 }}>{t('price')}</th><th className="num" style={{ width: 110 }}>{t('amount')}</th><th style={{ width: 40 }} /></tr></thead>
              <tbody>{job.lines.map(l => (
                <tr key={l.id}>
                  <td><input disabled={frozen} value={l.description} onChange={e => setLine(l.id, { description: e.target.value })} />
                    {l.evidence && <span className="ev">{t('from')}: “{l.evidence}”</span>}
                    {l.needsReview && !frozen && <span className="flag">{t('review')} · <button className="btn ghost sm" onClick={() => setLine(l.id, { needsReview: false })}>{t('reviewed')}</button></span>}</td>
                  <td className="num"><input disabled={frozen} type="number" step="0.25" value={l.qty} onChange={e => setLine(l.id, { qty: +e.target.value })} style={{ textAlign: 'right' }} /></td>
                  <td className="num"><input disabled={frozen} type="number" step="0.01" value={(l.unitPriceCents / 100).toFixed(2)} onChange={e => setLine(l.id, { unitPriceCents: Math.round(+e.target.value * 100) })} style={{ textAlign: 'right' }} /></td>
                  <td className="num">{formatMoney(lineTotal(l.qty, l.unitPriceCents), lang)}</td>
                  <td>{!frozen && <button className="btn ghost sm" aria-label={t('delete')} onClick={() => actions.setLines(job.id, job.lines.filter(x => x.id !== l.id))}>×</button>}</td>
                </tr>))}</tbody>
            </table></div>
            {!frozen && (
              <div className="row" style={{ marginTop: 10 }}>
                <select value={pick} onChange={e => setPick(e.target.value)} style={{ maxWidth: 320 }}><option value="">{t('addFromList')}</option>{prices.map(p => <option key={p.id} value={p.id}>{p.description} · {formatMoney(p.priceCents, lang)}</option>)}</select>
                <button className="btn sm" disabled={!pick} onClick={() => { const p = prices.find(x => x.id === pick)!; actions.setLines(job.id, [...job.lines, { id: uid('ln'), priceItemId: p.id, description: p.description, qty: 1, unitPriceCents: p.kind === 'credit' ? -p.priceCents : p.priceCents, taxable: p.taxable }]); setPick(''); }}>{t('add')}</button>
                <button className="btn ghost sm" onClick={() => actions.setLines(job.id, [...job.lines, { id: uid('ln'), description: '', qty: 1, unitPriceCents: 0, taxable: true }])}>{t('addLine')}</button>
              </div>
            )}
            <div className="totals">
              <span>{t('subtotal')}</span><b>{formatMoney(tot.subtotalCents, lang)}</b>
              {tot.taxes.map(x => <Fragment key={x.code}><span>{x.label}</span><b>{formatMoney(x.amountCents, lang)}</b></Fragment>)}
              <span className="g">{t('total')}</span><b className="g">{formatMoney(tot.totalCents, lang)}</b>
            </div>
          </div>

          <div className="card">
            <h2>{t('torque')}{!frozen && <button className="btn sm" onClick={addTorque}>{t('addTorque')}</button>}</h2>
            {!job.torque.length ? <p className="muted">{t('noTorque')}</p> : (
              <div className="tscroll"><table className="t"><thead><tr><th>{t('position')}</th><th className="num">{t('value')}</th><th>{t('pattern')}</th><th>{t('techL')}</th><th>{t('retorque')}</th></tr></thead>
                <tbody>{job.torque.map((r, i) => { const w = torqueWarning(r.valueFtLb); return (
                  <tr key={i}>
                    <td><PosEdit p={r.position} disabled={frozen} onChange={p => setTq(i, { position: p })} /></td>
                    <td className="num"><input disabled={frozen} type="number" value={r.valueFtLb} onChange={e => setTq(i, { valueFtLb: +e.target.value })} style={{ width: 90, textAlign: 'right' }} /> ft-lb{w && <div className="flag">{t(w === 'low' ? 'tqLow' : 'tqHigh')}</div>}</td>
                    <td>{r.pattern}</td><td>{r.techName ?? '—'}</td><td>{t('atKm', { n: r.retorqueDueKm })}</td>
                  </tr>); })}</tbody></table></div>
            )}
          </div>
        </div>

        <div className="stack">
          <div className="card">
            {b.length && !frozen ? (<><h2>{t('before')}</h2><ul className="blockers">{b.map(x => <li key={x}>{BLOCKER_TEXT[x][lang]}</li>)}</ul></>)
              : !frozen ? <h2 style={{ margin: 0, color: 'var(--go)' }}>{t('readyTo')}</h2>
                : <h2 style={{ margin: 0 }}>{t('approved')} · {job.invoiceNo}</h2>}
          </div>
          <div className="card">
            <h2>{t('voiceNote')}{job.transcript && !frozen && <button className="btn ghost sm" onClick={reread}>{t('reextract')}</button>}</h2>
            {job.transcript ? <div className="transcript"><Highlighted text={job.transcript} quotes={quotes} /></div> : <p className="muted">{t('noNote')}</p>}
            {job.extracted && job.extracted.wheels.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div className="muted small" style={{ fontWeight: 700, marginBottom: 6 }}>{t('extracted')}</div>
                <table className="t"><tbody>{job.extracted.wheels.map((w, i) => (
                  <tr key={i}><td>{positionLabel(w.position, lang)}</td><td>{w.removedTread32 != null ? `${w.removedTread32}/32` : ''}{w.casingOk ? ' · casing OK' : ''}</td><td>{w.installedSize ?? ''}</td><td className="num">{w.torqueFtLb ? `${w.torqueFtLb} ft-lb` : ''}</td></tr>))}</tbody></table>
              </div>
            )}
          </div>
          {job.photos.length > 0 && <div className="card"><h2>{t('photos')}</h2><div className="thumbs">{job.photos.map((p, i) => <img key={i} src={p} alt="" />)}</div></div>}
          <div className="card"><h2>{t('history')}</h2><ul className="hist">{[...job.history].reverse().map((h, i) => <li key={i}><time>{new Date(h.at).toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA', { dateStyle: 'short', timeStyle: 'short' })}</time><span>{h.who}: {h.what}</span></li>)}</ul></div>
        </div>
      </div>
    </>
  );
}

function PosEdit({ p, onChange, disabled }: { p: WheelPosition; onChange: (p: WheelPosition) => void; disabled?: boolean }) {
  const { t, lang } = useT();
  if (disabled) return <>{positionLabel(p, lang)}</>;
  return (
    <div className="row" style={{ gap: 4, flexWrap: 'nowrap' }}>
      <select value={p.axle} onChange={e => onChange({ ...p, axle: e.target.value as WheelPosition['axle'] })} style={{ width: 'auto' }}>{(['steer', 'drive', 'trailer'] as const).map(a => <option key={a} value={a}>{positionLabel({ axle: a, side: 'left' }, lang).split(' ')[0]}</option>)}</select>
      <select value={p.side} onChange={e => onChange({ ...p, side: e.target.value as WheelPosition['side'] })} style={{ width: 'auto' }}><option value="left">{lang === 'fr' ? 'G' : 'L'}</option><option value="right">{lang === 'fr' ? 'D' : 'R'}</option></select>
      <select value={p.pos ?? ''} onChange={e => onChange({ ...p, pos: (e.target.value || undefined) as WheelPosition['pos'] })} style={{ width: 'auto' }} aria-label={t('position')}><option value="">—</option><option value="outer">{lang === 'fr' ? 'ext.' : 'outer'}</option><option value="inner">{lang === 'fr' ? 'int.' : 'inner'}</option></select>
    </div>
  );
}

