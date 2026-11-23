import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';
import { actions, get } from './store';
import { sampleState, SAMPLE_NOTE } from './sample';
import { HOSTED } from './services';
import { localExtract } from './domain/localExtract';
import { linesFromExtraction } from './domain/lines';
import { torqueFromExtraction } from './domain/torque';

// Demo-only URL options for walkthroughs and screenshots: ?seed=sample|recorded&role=owner|tech&lang=en|fr
const q = new URLSearchParams(location.search);
if (!HOSTED && q.get('seed')) {
  actions.reset(); actions.load(sampleState());
  if (q.get('seed') === 'recorded' || q.get('seed') === 'approved') {
    const lang = (q.get('lang') as 'en' | 'fr') ?? 'en';
    const s = get(); const j = s.jobs.find(x => x.number === 1187)!; const x = localExtract(SAMPLE_NOTE[lang]);
    actions.updateJob(j.id, { transcript: SAMPLE_NOTE[lang], extracted: x, lines: linesFromExtraction(x, s.prices, lang), torque: torqueFromExtraction(x, j.techName, new Date().toISOString()), status: 'review' }, 'voice note recorded');
    if (q.get('seed') === 'approved') { actions.updateJob(j.id, { po: '77812' }, 'PO added'); actions.approve(j.id); }
  }
}
if (!HOSTED && q.get('role')) actions.setRole(q.get('role') === 'tech' ? 'tech' : 'owner');
if (q.get('lang')) actions.setLang(q.get('lang') === 'fr' ? 'fr' : 'en');

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
