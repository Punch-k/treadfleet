// Data store. Demo mode keeps everything in this browser (localStorage). The hosted app swaps in a Supabase-backed
// store with the same shape (see supabase/migrations for the tables).
import { useSyncExternalStore } from 'react';
import type { Company, Fleet, Job, JobLine, Lang, PriceItem, TorqueRecord } from './domain/types';
import { uid } from './domain/lines';

export type Role = 'owner' | 'tech';

export interface State {
  company?: Company;
  fleets: Fleet[];
  prices: PriceItem[];
  jobs: Job[];
  techs: string[];
  lang: Lang;
  role: Role;
  techName: string;     // who is using the tech view in demo mode
}

const KEY = 'treadfleet-demo-v1';
const empty: State = { fleets: [], prices: [], jobs: [], techs: ['Marc T.', 'Luc B.'], lang: 'en', role: 'owner', techName: 'Marc T.' };

function load(): State {
  try { const s = localStorage.getItem(KEY); if (s) return { ...empty, ...JSON.parse(s) }; } catch { /* private mode */ }
  return empty;
}

let state: State = load();
const subs = new Set<() => void>();
function emit() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota or private mode */ } subs.forEach(f => f()); }
export function set(fn: (s: State) => State) { state = fn(state); emit(); }
export function get() { return state; }
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb); }, () => sel(state));
}

const now = () => new Date().toISOString();
const who = () => (state.role === 'owner' ? 'Owner' : state.techName);
const log = (j: Job, what: string): Job => ({ ...j, history: [...j.history, { at: now(), who: who(), what }] });

export const actions = {
  setLang: (lang: Lang) => set(s => ({ ...s, lang })),
  setRole: (role: Role) => set(s => ({ ...s, role })),
  setTechName: (techName: string) => set(s => ({ ...s, techName })),
  saveCompany: (c: Company) => set(s => ({ ...s, company: c })),
  reset: () => { state = { ...empty, lang: state.lang }; emit(); },
  load: (patch: Partial<State>) => set(s => ({ ...s, ...patch })),

  upsertFleet: (f: Fleet) => set(s => ({ ...s, fleets: s.fleets.some(x => x.id === f.id) ? s.fleets.map(x => (x.id === f.id ? f : x)) : [...s.fleets, f] })),
  deleteFleet: (id: string) => set(s => ({ ...s, fleets: s.fleets.filter(x => x.id !== id) })),
  upsertPrice: (p: PriceItem) => set(s => ({ ...s, prices: s.prices.some(x => x.id === p.id) ? s.prices.map(x => (x.id === p.id ? p : x)) : [...s.prices, p] })),
  deletePrice: (id: string) => set(s => ({ ...s, prices: s.prices.filter(x => x.id !== id) })),
  replacePrices: (prices: PriceItem[]) => set(s => ({ ...s, prices })),

  createJob: (j: Partial<Job>): string => {
    const id = uid('job');
    set(s => {
      const number = Math.max(1000, ...s.jobs.map(x => x.number)) + 1;
      const job: Job = { id, number, type: 'road_call', status: j.techName ? 'dispatched' : 'new', province: s.company?.province ?? 'ON', createdAt: now(), photos: [], lines: [], torque: [], history: [], ...j };
      return { ...s, jobs: [log(job, 'created'), ...s.jobs] };
    });
    return id;
  },
  updateJob: (id: string, patch: Partial<Job>, what?: string) => set(s => ({ ...s, jobs: s.jobs.map(j => (j.id === id ? (what ? log({ ...j, ...patch }, what) : { ...j, ...patch }) : j)) })),
  setLines: (id: string, lines: JobLine[]) => set(s => ({ ...s, jobs: s.jobs.map(j => (j.id === id && !['approved', 'sent', 'closed'].includes(j.status) ? { ...j, lines } : j)) })),
  setTorque: (id: string, torque: TorqueRecord[]) => set(s => ({ ...s, jobs: s.jobs.map(j => (j.id === id ? { ...j, torque } : j)) })),
  approve: (id: string) => set(s => {
    if (!s.company) return s;
    const c = s.company; const invoiceNo = `${c.invoicePrefix}${c.nextInvoiceNo}`;
    return {
      ...s,
      company: { ...c, nextInvoiceNo: c.nextInvoiceNo + 1 },
      jobs: s.jobs.map(j => (j.id === id ? log({ ...j, status: 'approved', invoiceNo, approvedAt: now() }, `approved ${invoiceNo}`) : j)),
    };
  }),
  markSent: (id: string) => set(s => ({ ...s, jobs: s.jobs.map(j => (j.id === id ? log({ ...j, status: 'sent', sentAt: now() }, 'sent to fleet') : j)) })),
};
