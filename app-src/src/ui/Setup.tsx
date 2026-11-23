import { useState } from 'react';
import { actions } from '../store';
import { useT } from '../i18n';
import { PROVINCES, type Province } from '../domain/tax';
import { uid } from '../domain/lines';
import { sampleState } from '../sample';
import { Toggles } from './Shell';

export function Setup() {
  const { t, lang } = useT();
  const [name, setName] = useState(''); const [province, setProvince] = useState<Province>('ON');
  const [prefix, setPrefix] = useState('INV-'); const [next, setNext] = useState(1001); const [gst, setGst] = useState('');
  const ok = name.trim().length > 1;
  return (
    <div style={{ minHeight: '100%', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div className="card" style={{ width: 'min(560px,100%)', padding: 28 }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18 }}><b style={{ font: '800 20px Archivo' }}>TreadFleet</b><Toggles /></div>
        <h1 style={{ fontSize: 26 }}>{t('setupTitle')}</h1>
        <p className="muted" style={{ margin: '6px 0 20px' }}>{t('setupLead')}</p>
        <form className="stack" onSubmit={e => { e.preventDefault(); if (ok) actions.saveCompany({ id: uid('c'), name: name.trim(), province, invoicePrefix: prefix, nextInvoiceNo: next, gstNumber: gst || undefined, defaultLang: lang }); }}>
          <label className="f">{t('companyName')}<input value={name} onChange={e => setName(e.target.value)} autoFocus required /></label>
          <div className="grid2">
            <label className="f">{t('province')}<select value={province} onChange={e => setProvince(e.target.value as Province)}>{PROVINCES.map(p => <option key={p}>{p}</option>)}</select></label>
            <label className="f">{t('gst')}<input value={gst} onChange={e => setGst(e.target.value)} placeholder="123456789 RT0001" /></label>
            <label className="f">{t('invoicePrefix')}<input value={prefix} onChange={e => setPrefix(e.target.value)} /></label>
            <label className="f">{t('nextInvoice')}<input type="number" min={1} value={next} onChange={e => setNext(Math.max(1, +e.target.value || 1))} /></label>
          </div>
          <button className="btn primary" disabled={!ok} type="submit">{t('createCompany')}</button>
        </form>
        <div className="row" style={{ justifyContent: 'center', marginTop: 18, gap: 8 }}>
          <span className="muted small">{t('orSample')}</span>
          <button className="btn sm" onClick={() => actions.load(sampleState())}>{t('loadSample')}</button>
        </div>
      </div>
    </div>
  );
}
