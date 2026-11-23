import { useRef, useState } from 'react';
import { actions, useStore } from '../store';
import { useT, type Key } from '../i18n';
import { formatMoney, PROVINCES, type Province } from '../domain/tax';
import { uid } from '../domain/lines';
import { totals } from '../domain/invoice';
import { parsePriceCsv, sampleState } from '../sample';
import type { Fleet, PriceItem } from '../domain/types';
import { HOSTED } from '../services';
import { Icon, I } from './Shell';

export function FleetsPage() {
  const { t } = useT(); const fleets = useStore(s => s.fleets);
  const blank: Fleet = { id: '', name: '', poRequired: true };
  const [f, setF] = useState<Fleet | null>(null);
  return (
    <>
      <div className="topbar"><h1>{t('fleets')}</h1><button className="btn primary" onClick={() => setF({ ...blank, id: uid('f') })}><Icon d={I.plus} />{t('newFleet')}</button></div>
      {f && (
        <form className="card stack" style={{ marginBottom: 16 }} onSubmit={e => { e.preventDefault(); if (f.name.trim()) { actions.upsertFleet(f); setF(null); } }}>
          <div className="grid2">
            <label className="f">{t('fleet')}<input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required autoFocus /></label>
            <label className="f">{t('apEmail')}<input type="email" value={f.apEmail ?? ''} onChange={e => setF({ ...f, apEmail: e.target.value })} /></label>
            <label className="f">{t('poPattern')}<input value={f.poPattern ?? ''} onChange={e => setF({ ...f, poPattern: e.target.value || undefined })} placeholder="^WB-\d+$" className="mono" /></label>
            <label className="f">{t('notes')}<input value={f.notes ?? ''} onChange={e => setF({ ...f, notes: e.target.value })} /></label>
          </div>
          <label className="chk"><input type="checkbox" checked={f.poRequired} onChange={e => setF({ ...f, poRequired: e.target.checked })} />{t('poRequired')}</label>
          <div className="row"><button className="btn primary" type="submit">{t('save')}</button><button className="btn ghost" type="button" onClick={() => setF(null)}>{t('cancel')}</button></div>
        </form>
      )}
      <div className="card" style={{ padding: 0 }}><div className="tscroll"><table className="t">
        <thead><tr><th>{t('fleet')}</th><th>{t('apEmail')}</th><th>{t('poRequired')}</th><th>{t('notes')}</th><th /></tr></thead>
        <tbody>{fleets.map(x => <tr key={x.id}><td><b>{x.name}</b></td><td>{x.apEmail}</td><td>{x.poRequired ? '✓' : '—'} {x.poPattern && <span className="mono small muted">{x.poPattern}</span>}</td><td className="muted">{x.notes}</td>
          <td className="num"><button className="btn ghost sm" onClick={() => setF(x)}>{t('edit')}</button><button className="btn ghost sm" onClick={() => actions.deleteFleet(x.id)}>{t('delete')}</button></td></tr>)}</tbody>
      </table></div>{!fleets.length && <div className="empty">—</div>}</div>
    </>
  );
}

export function PricesPage() {
  const { t, lang } = useT(); const prices = useStore(s => s.prices);
  const [p, setP] = useState<PriceItem | null>(null); const [msg, setMsg] = useState('');
  const file = useRef<HTMLInputElement>(null);
  return (
    <>
      <div className="topbar"><h1>{t('prices')}</h1>
        <div className="row">
          <button className="btn" onClick={() => file.current?.click()}>{t('importCsv')}</button>
          <input ref={file} type="file" accept=".csv,text/csv" hidden onChange={async e => { const f = e.target.files?.[0]; if (!f) return; const r = parsePriceCsv(await f.text()); actions.replacePrices([...prices, ...r.items]); setMsg(t('imported', { n: r.items.length }) + (r.errors.length ? ` · ${r.errors.length} ✗` : '')); e.target.value = ''; }} />
          <button className="btn primary" onClick={() => setP({ id: uid('p'), kind: 'tire', code: '', description: '', unit: 'each', priceCents: 0, aliases: [], taxable: true })}><Icon d={I.plus} />{t('newItem')}</button>
        </div>
      </div>
      <p className="muted small" style={{ marginTop: -10 }}>{t('csvHelp')}</p>
      {msg && <p className="pill approved">{msg}</p>}
      {p && (
        <form className="card stack" style={{ marginBottom: 16 }} onSubmit={e => { e.preventDefault(); if (p.code && p.description) { actions.upsertPrice(p); setP(null); } }}>
          <div className="grid3">
            <label className="f">{t('code')}<input value={p.code} onChange={e => setP({ ...p, code: e.target.value })} required /></label>
            <label className="f">{t('kind')}<select value={p.kind} onChange={e => setP({ ...p, kind: e.target.value as PriceItem['kind'] })}>{(['tire', 'labour', 'service', 'fee', 'credit'] as const).map(k => <option key={k} value={k}>{t(`k_${k}` as Key)}</option>)}</select></label>
            <label className="f">{t('unitL')}<select value={p.unit} onChange={e => setP({ ...p, unit: e.target.value as PriceItem['unit'] })}><option>each</option><option>hour</option><option>job</option></select></label>
            <label className="f" style={{ gridColumn: 'span 2' }}>{t('description')}<input value={p.description} onChange={e => setP({ ...p, description: e.target.value })} required /></label>
            <label className="f">{t('size')}<input value={p.size ?? ''} onChange={e => setP({ ...p, size: e.target.value || undefined })} placeholder="11R22.5" /></label>
            <label className="f">{t('price')} (CAD)<input type="number" step="0.01" min={0} value={(p.priceCents / 100).toFixed(2)} onChange={e => setP({ ...p, priceCents: Math.round(+e.target.value * 100) })} /></label>
            <label className="f" style={{ gridColumn: 'span 2' }}>{t('aliases')}<input value={p.aliases.join(', ')} onChange={e => setP({ ...p, aliases: e.target.value.split(',').map(a => a.trim()).filter(Boolean) })} /></label>
          </div>
          <div className="row"><button className="btn primary" type="submit">{t('save')}</button><button className="btn ghost" type="button" onClick={() => setP(null)}>{t('cancel')}</button></div>
        </form>
      )}
      <div className="card" style={{ padding: 0 }}><div className="tscroll"><table className="t">
        <thead><tr><th>{t('code')}</th><th>{t('kind')}</th><th>{t('description')}</th><th>{t('size')}</th><th className="num">{t('price')}</th><th>{t('aliases')}</th><th /></tr></thead>
        <tbody>{prices.map(x => <tr key={x.id}><td className="mono">{x.code}</td><td>{t(`k_${x.kind}` as Key)}</td><td>{x.description}</td><td>{x.size}</td><td className="num">{x.kind === 'credit' ? '−' : ''}{formatMoney(x.priceCents, lang)}{x.unit !== 'each' ? ` / ${x.unit}` : ''}</td><td className="muted small">{x.aliases.join(', ')}</td>
          <td className="num"><button className="btn ghost sm" onClick={() => setP(x)}>{t('edit')}</button><button className="btn ghost sm" onClick={() => actions.deletePrice(x.id)}>{t('delete')}</button></td></tr>)}</tbody>
      </table></div>{!prices.length && <div className="empty">—</div>}</div>
    </>
  );
}

export function SettingsPage() {
  const { t, lang } = useT(); const c = useStore(s => s.company); const jobs = useStore(s => s.jobs); const fleets = useStore(s => s.fleets);
  const [sure, setSure] = useState(false);
  if (!c) return null;
  const up = (p: Partial<typeof c>) => actions.saveCompany({ ...c, ...p });
  const exportCsv = () => {
    const rows = [['invoice_no', 'date', 'fleet', 'unit', 'po', 'subtotal', 'tax', 'total', 'status']];
    jobs.filter(j => j.invoiceNo).forEach(j => { const x = totals(j); rows.push([j.invoiceNo!, (j.approvedAt ?? '').slice(0, 10), fleets.find(f => f.id === j.fleetId)?.name ?? '', j.unit ?? '', j.po ?? '', (x.subtotalCents / 100).toFixed(2), ((x.totalCents - x.subtotalCents) / 100).toFixed(2), (x.totalCents / 100).toFixed(2), j.status]); });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'treadfleet-invoices.csv'; a.click();
  };
  return (
    <>
      <div className="topbar"><h1>{t('settings')}</h1></div>
      <div className="stack" style={{ maxWidth: 760 }}>
        <div className="card stack">
          <h2>{t('company')}</h2>
          <div className="grid2">
            <label className="f">{t('companyName')}<input value={c.name} onChange={e => up({ name: e.target.value })} /></label>
            <label className="f">{t('province')}<select value={c.province} onChange={e => up({ province: e.target.value as Province })}>{PROVINCES.map(p => <option key={p}>{p}</option>)}</select></label>
            <label className="f">{t('gst')}<input value={c.gstNumber ?? ''} onChange={e => up({ gstNumber: e.target.value })} /></label>
            <label className="f">{t('qst')}<input value={c.qstNumber ?? ''} onChange={e => up({ qstNumber: e.target.value })} /></label>
            <label className="f">{t('phone')}<input value={c.phone ?? ''} onChange={e => up({ phone: e.target.value })} /></label>
            <label className="f">{t('address')}<input value={c.address ?? ''} onChange={e => up({ address: e.target.value })} /></label>
            <label className="f">{t('invoicePrefix')}<input value={c.invoicePrefix} onChange={e => up({ invoicePrefix: e.target.value })} /></label>
            <label className="f">{t('nextInvoice')}<input type="number" value={c.nextInvoiceNo} onChange={e => up({ nextInvoiceNo: Math.max(1, +e.target.value || 1) })} /></label>
            <label className="f">{t('retorqueKm')}<input type="number" min={10} value={c.retorqueKm ?? 80} onChange={e => up({ retorqueKm: Math.max(10, +e.target.value || 80) })} /></label>
          </div>
        </div>
        {!HOSTED && <div className="card"><p className="muted" style={{ margin: 0 }}>{t('aiMode')}</p></div>}
        <div className="card row">
          <button className="btn" onClick={exportCsv}>{t('exportCsv')}</button>
          <button className="btn" onClick={() => actions.load(sampleState())}>{t('loadSample')}</button>
          <button className="btn ghost" style={{ color: 'var(--warn)' }} onClick={() => { if (sure) { actions.reset(); setSure(false); } else setSure(true); }}>{sure ? t('resetSure') : t('resetDemo')}</button>
        </div>
        <p className="muted small">{lang === 'fr' ? 'Taux de taxe par défaut de novembre 2026; confirmez-les avec votre comptable.' : 'Default tax rates as of November 2026; confirm them with your accountant.'}</p>
      </div>
    </>
  );
}
