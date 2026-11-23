import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { useT } from '../i18n';
import { lineTotal, totals } from '../domain/invoice';
import { formatMoney } from '../domain/tax';
import { positionLabel } from '../domain/lines';
import { Icon, I } from './Shell';

export function InvoiceView() {
  const { id } = useParams(); const { t, lang } = useT();
  const job = useStore(s => s.jobs.find(j => j.id === id || String(j.number) === id));
  const company = useStore(s => s.company); const fleets = useStore(s => s.fleets);
  if (!job || !company) return <div className="empty">Not found</div>;
  const fleet = fleets.find(f => f.id === job.fleetId);
  const tot = totals(job);
  const date = new Date(job.approvedAt ?? job.createdAt).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { dateStyle: 'long' });
  const subject = encodeURIComponent(`${t('invoice')} ${job.invoiceNo ?? ''} · ${company.name} · ${t('unit')} ${job.unit ?? ''} · PO ${job.po ?? ''}`);
  return (
    <>
      <div className="topbar no-print">
        <Link className="btn ghost sm" to={`/jobs/${job.id}`}><Icon d={I.back} />{t('back')}</Link>
        <div className="row">
          {fleet?.apEmail && <a className="btn" href={`mailto:${fleet.apEmail}?subject=${subject}`}>{t('emailFleet')}</a>}
          <button className="btn primary" onClick={() => window.print()}><Icon d={I.print} />{t('print')}</button>
        </div>
      </div>
      <div className="invoice">
        <div className="hdr">
          <div><h1>{company.name}</h1><div>{company.address}</div><div>{company.phone}</div>{company.gstNumber && <div>{t('gstReg')} {company.gstNumber}</div>}{company.qstNumber && <div>TVQ/QST {company.qstNumber}</div>}</div>
          <div style={{ textAlign: 'right' }}><h1 style={{ fontSize: 22 }}>{t('invoice')} {job.invoiceNo ?? '(draft)'}</h1><div>{t('date')}: {date}</div><div>{t('jobNo')}: {job.number}</div></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
          <div><b>{t('billTo')}</b><div>{fleet?.name ?? '—'}</div><div>{fleet?.apEmail}</div></div>
          <div style={{ textAlign: 'right' }}><div><b>{t('unit')}:</b> {job.unit}</div><div><b>PO:</b> {job.po || '—'}</div><div><b>{t('location')}:</b> {job.location || '—'}</div></div>
        </div>
        <table>
          <thead><tr><th>{t('item')}</th><th className="num">{t('qty')}</th><th className="num">{t('price')}</th><th className="num">{t('amount')}</th></tr></thead>
          <tbody>{job.lines.map(l => <tr key={l.id}><td>{l.description}</td><td className="num">{l.qty}</td><td className="num">{formatMoney(l.unitPriceCents, lang)}</td><td className="num">{formatMoney(lineTotal(l.qty, l.unitPriceCents), lang)}</td></tr>)}</tbody>
        </table>
        <div className="totals" style={{ marginLeft: 'auto' }}>
          <span>{t('subtotal')}</span><b>{formatMoney(tot.subtotalCents, lang)}</b>
          {tot.taxes.map(x => <Fragment key={x.code}><span>{x.label}</span><b>{formatMoney(x.amountCents, lang)}</b></Fragment>)}
          <span className="g">{t('total')}</span><b className="g">{formatMoney(tot.totalCents, lang)}</b>
        </div>
        {job.torque.length > 0 && (
          <div className="tq" style={{ marginTop: 26 }}>
            <b>{t('torque')}</b>
            <table><thead><tr><th>{t('position')}</th><th className="num">{t('value')}</th><th>{t('pattern')}</th><th>{t('techL')}</th><th>{t('retorque')}</th></tr></thead>
              <tbody>{job.torque.map((r, i) => <tr key={i}><td>{positionLabel(r.position, lang)}</td><td className="num">{r.valueFtLb} ft-lb</td><td>{r.pattern}</td><td>{r.techName}</td><td>{t('atKm', { n: r.retorqueDueKm })}</td></tr>)}</tbody></table>
          </div>
        )}
        <div className="foot">{t('attached')}<br />{t('thanks')}</div>
      </div>
    </>
  );
}
