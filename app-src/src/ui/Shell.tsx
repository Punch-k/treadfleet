import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { actions, useStore } from '../store';
import { useT, type Key } from '../i18n';
import { HOSTED } from '../services';

export const Icon = ({ d }: { d: string }) => <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>;
export const I = {
  jobs: 'M5 3h14v18H5zM9 8h6M9 12h6M9 16h3',
  today: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4',
  fleets: 'M3 17h2l2-6h9l2 6h3M7.5 17.5a2 2 0 1 0 0 .01M17.5 17.5a2 2 0 1 0 0 .01',
  prices: 'M3 12l9-9h9v9l-9 9zM16 8h.01',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 15H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 4.6V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z',
  mic: 'M9 3h6v11H9zM5 11a7 7 0 0 0 14 0M12 18v3',
  cam: 'M3 7h4l2-3h6l2 3h4v13H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  back: 'M15 18l-6-6 6-6',
  check: 'M5 12.5l4 4 10-10',
  plus: 'M12 5v14M5 12h14',
  print: 'M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z',
};

const Logo = () => <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="5 2.4" /><circle cx="16" cy="16" r="4.5" fill="#ffc21a" /></svg>;

export function Toggles({ compact }: { compact?: boolean }) {
  const { t, lang } = useT(); const role = useStore(s => s.role);
  return (
    <div className="row" style={{ gap: 8 }}>
      <div className="seg" role="group" aria-label="View">
        <button className={role === 'owner' ? 'on' : ''} onClick={() => actions.setRole('owner')}>{t('owner')}</button>
        <button className={role === 'tech' ? 'on' : ''} onClick={() => actions.setRole('tech')}>{compact ? 'Tech' : t('tech')}</button>
      </div>
      <div className="seg" role="group" aria-label="Language">
        <button className={lang === 'en' ? 'on' : ''} onClick={() => actions.setLang('en')}>EN</button>
        <button className={lang === 'fr' ? 'on' : ''} onClick={() => actions.setLang('fr')}>FR</button>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { t } = useT(); const role = useStore(s => s.role);
  const links: Array<[string, Key, string]> = role === 'owner'
    ? [['/', 'navJobs', I.jobs], ['/fleets', 'navFleets', I.fleets], ['/prices', 'navPrices', I.prices], ['/settings', 'navSettings', I.settings]]
    : [['/', 'navToday', I.today], ['/settings', 'navSettings', I.settings]];
  return (
    <div className="shell">
      <aside className="side">
        <NavLink to="/" className="brand"><Logo />TreadFleet</NavLink>
        {links.map(([to, k, d]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav${isActive ? ' active' : ''}`}><Icon d={d} />{t(k)}</NavLink>)}
        <div className="foot"><Toggles />{!HOSTED && <span style={{ color: '#8f9aa3' }}>{t('demo')}</span>}</div>
      </aside>
      <main className="page">
        <div className="mob-top no-print"><span className="brand" style={{ color: 'var(--ink)', margin: 0 }}><Logo />TreadFleet</span><Toggles compact /></div>
        {children}
      </main>
      <nav className="tabs no-print">
        {links.map(([to, k, d]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}><Icon d={d} />{t(k)}</NavLink>)}
      </nav>
    </div>
  );
}
