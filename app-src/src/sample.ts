// Sample data for demo mode. Names and prices are made up.
import type { Company, Fleet, PriceItem } from './domain/types';
import type { State } from './store';
import { uid } from './domain/lines';

export const SAMPLE_PRICES = (): PriceItem[] => [
  { id: uid('p'), kind: 'tire', code: 'ST-11225-16', description: '11R22.5 16-ply steer', size: '11R22.5', unit: 'each', priceCents: 61200, aliases: ['steer tire', 'pneu directeur'], taxable: true },
  { id: uid('p'), kind: 'tire', code: 'DR-11225-16', description: '11R22.5 16-ply drive', size: '11R22.5', unit: 'each', priceCents: 58900, aliases: ['drive tire', 'pneu moteur'], taxable: true },
  { id: uid('p'), kind: 'tire', code: 'ST-29575-14', description: '295/75R22.5 14-ply all-position', size: '295/75R22.5', unit: 'each', priceCents: 54500, aliases: [], taxable: true },
  { id: uid('p'), kind: 'tire', code: 'TR-11R245', description: '11R24.5 trailer', size: '11R24.5', unit: 'each', priceCents: 49800, aliases: ['trailer tire'], taxable: true },
  { id: uid('p'), kind: 'service', code: 'RC', description: 'Road call', unit: 'job', priceCents: 9500, aliases: ['road call', 'service call', 'appel de service'], taxable: true },
  { id: uid('p'), kind: 'labour', code: 'LAB', description: 'Labour', unit: 'hour', priceCents: 12667, aliases: ['labour', 'labor', "main-d'œuvre"], taxable: true },
  { id: uid('p'), kind: 'service', code: 'MNT', description: 'Mount and torque', unit: 'each', priceCents: 0, aliases: ['mount'], taxable: true },
  { id: uid('p'), kind: 'service', code: 'REP', description: 'Flat repair (patch/plug)', unit: 'each', priceCents: 4500, aliases: ['repair', 'flat repair', 'réparation'], taxable: true },
  { id: uid('p'), kind: 'credit', code: 'CASING', description: 'Casing credit', size: '11R22.5', unit: 'each', priceCents: 4000, aliases: ['casing'], taxable: true },
];

export const SAMPLE_FLEETS = (): Fleet[] => [
  { id: uid('f'), name: 'Northline Freight', apEmail: 'ap@northline.example', poRequired: true, poPattern: '^\\d{5}$', notes: 'PO is 5 digits' },
  { id: uid('f'), name: 'Prairie Haul', apEmail: 'billing@prairiehaul.example', poRequired: false },
  { id: uid('f'), name: 'Westbound Logistics', apEmail: 'invoices@westbound.example', poRequired: true, poPattern: '^WB-\\d+$', notes: 'PO starts with WB-' },
];

export const SAMPLE_COMPANY = (): Company => ({ id: uid('c'), name: 'Prairie Tire Service', province: 'ON', gstNumber: '123456789 RT0001', invoicePrefix: 'INV-', nextInvoiceNo: 1187, defaultLang: 'en', phone: '(555) 010-0199', address: 'Mississauga, ON' });

export const SAMPLE_NOTE = {
  en: 'Unit 4521, steer left. Came off at 6/32, casing looks good. Put on a new 11R22.5, torqued to 450. Road call, hour and a half.',
  fr: 'Unité 4521, directrice gauche. Retiré à 6/32, carcasse correcte. Posé un 11R22.5 neuf, serré à 450. Appel de service, une heure et demie.',
};

export function sampleState(): Partial<State> {
  const fleets = SAMPLE_FLEETS();
  const now = Date.now();
  return {
    company: SAMPLE_COMPANY(), fleets, prices: SAMPLE_PRICES(),
    jobs: [
      { id: uid('job'), number: 1187, fleetId: fleets[0].id, unit: '4521', po: '', location: 'Hwy 401 EB · km 362', description: 'Steer blowout', type: 'road_call', status: 'dispatched', techName: 'Marc T.', province: 'ON', createdAt: new Date(now - 3600e3).toISOString(), photos: [], lines: [], torque: [], history: [{ at: new Date(now - 3600e3).toISOString(), who: 'Owner', what: 'created from SMS' }] },
      { id: uid('job'), number: 1188, fleetId: fleets[1].id, unit: '', location: 'Prairie Haul yard', description: 'Yard check · 12 units', type: 'yard_check', status: 'dispatched', techName: 'Marc T.', province: 'ON', createdAt: new Date(now - 1800e3).toISOString(), photos: [], lines: [], torque: [], history: [] },
      { id: uid('job'), number: 1189, fleetId: fleets[2].id, unit: '77', po: 'WB-505', location: 'Westbound shop', description: 'Drives on unit 77', type: 'shop', status: 'new', province: 'ON', createdAt: new Date(now - 600e3).toISOString(), photos: [], lines: [], torque: [], history: [] },
    ],
  };
}

/** CSV columns: code,kind,description,size,unit,price,aliases (aliases separated by |). Price in dollars. */
export function parsePriceCsv(text: string): { items: PriceItem[]; errors: string[] } {
  const rows = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
  const errors: string[] = []; const items: PriceItem[] = [];
  const cells = (r: string) => (r.match(/("([^"]|"")*"|[^,]*)(,|$)/g) ?? []).map(c => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"').trim()).slice(0, 7);
  rows.forEach((r, i) => {
    const c = cells(r);
    if (i === 0 && /code/i.test(c[0])) return;
    const [code, kind, description, size, unit, price, aliases] = c;
    const cents = Math.round(parseFloat((price ?? '').replace(/[$\s]/g, '')) * 100);
    if (!code || !description || !['tire', 'labour', 'service', 'fee', 'credit'].includes(kind) || !Number.isFinite(cents) || cents < 0) { errors.push(`Row ${i + 1}: ${r.slice(0, 60)}`); return; }
    items.push({ id: uid('p'), code, kind: kind as PriceItem['kind'], description, size: size || undefined, unit: (['each', 'hour', 'job'].includes(unit) ? unit : 'each') as PriceItem['unit'], priceCents: cents, aliases: (aliases ?? '').split('|').map(a => a.trim()).filter(Boolean), taxable: true });
  });
  return { items, errors };
}
