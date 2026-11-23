import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { actions, useStore } from '../store';
import { useT, type Key } from '../i18n';
import { totals } from '../domain/invoice';
import { formatMoney } from '../domain/tax';
import type { Job } from '../domain/types';
import { Icon, I } from './Shell';

export const StatusPill = ({ s }: { s: Job['status'] }) => { const { t } = useT(); return <span className={`pill ${s}`}>{t(`st_${s}` as Key)}</span>; };

export function JobsPage() {
  const { t, lang } = useT(); const nav = useNavigate();
  const jobs = useStore(s => s.jobs); const fleets = useStore(s => s.fleets); const techs = useStore(s => s.techs);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ fleetId: '', unit: '', po: '', location: '', description: '', type: 'road_call' as Job['type'], techName: '' });
  const fleetName = (id?: string) => fleets.find(x => x.id === id)?.name ?? '—';
  const order: Job['status'][] = ['review', 'recorded', 'dispatched', 'new', 'approved', 'sent', 'closed'];
  const sorted = [...jobs].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || b.number - a.number);
  return (
    <>
      <div className="topbar"><h1>{t('jobs')}</h1><button className="btn primary" onClick={() => setOpen(o => !o)}><Icon d={I.plus} />{t('newJob')}</button></div>
      {open && (
        <form className="card stack" style={{ marginBottom: 16 }} onSubmit={e => { e.preventDefault(); const id = actions.createJob({ ...f, fleetId: f.fleetId || undefined, techName: f.techName || undefined }); setOpen(false); nav(`/jobs/${id}`); }}>
          <div className="grid3">
            <label className="f">{t('fleet')}<select value={f.fleetId} onChange={e => setF({ ...f, fleetId: e.target.value })}><option value="">{t('choose')}</option>{fleets.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
            <label className="f">{t('type')}<select value={f.type} onChange={e => setF({ ...f, type: e.target.value as Job['type'] })}>{(['road_call', 'yard_check', 'shop'] as const).map(x => <option key={x} value={x}>{t(x)}</option>)}</select></label>
            <label className="f">{t('techL')}<select value={f.techName} onChange={e => setF({ ...f, techName: e.target.value })}><option value="">{t('unassigned')}</option>{techs.map(x => <option key={x}>{x}</option>)}</select></label>
            <label className="f">{t('unit')}<input value={f.unit} onChange={e => setF({ ...f, unit: e.target.value })} /></label>
            <label className="f">{t('po')}<input value={f.po} onChange={e => setF({ ...f, po: e.target.value })} /></label>
            <label className="f">{t('location')}<input value={f.location} onChange={e => setF({ ...f, location: e.target.value })} /></label>
          </div>
          <label className="f">{t('description')}<input value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></label>
          <div className="row"><button className="btn primary" type="submit">{t('create')}</button><button className="btn ghost" type="button" onClick={() => setOpen(false)}>{t('cancel')}</button></div>
        </form>
      )}
      <div className="card" style={{ padding: 0 }}>
        {!jobs.length ? <div className="empty">{t('noJobs')}</div> : (
          <div className="tscroll"><table className="t">
            <thead><tr><th>#</th><th>{t('status')}</th><th>{t('fleet')}</th><th>{t('unit')}</th><th>{t('type')}</th><th>{t('techL')}</th><th className="num">{t('total')}</th></tr></thead>
            <tbody>{sorted.map(j => (
              <tr key={j.id} className="click" onClick={() => nav(`/jobs/${j.id}`)}>
                <td className="mono">{j.number}</td><td><StatusPill s={j.status} /></td><td>{fleetName(j.fleetId)}<div className="muted small">{j.location}</div></td>
                <td>{j.unit || '—'}</td><td>{t(j.type)}</td><td>{j.techName ?? <span className="muted">{t('unassigned')}</span>}</td>
                <td className="num">{j.lines.length ? formatMoney(totals(j).totalCents, lang) : '—'}</td>
              </tr>))}</tbody>
          </table></div>
        )}
      </div>
    </>
  );
}
