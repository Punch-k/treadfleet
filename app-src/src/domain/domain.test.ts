import { describe, expect, it } from 'vitest';
import { computeTax, DEFAULT_TAX } from './tax';
import { totals, blockers } from './invoice';
import { localExtract } from './localExtract';
import { linesFromExtraction } from './lines';
import { torqueFromExtraction, torqueWarning } from './torque';
import type { Fleet, Job, PriceItem } from './types';

const LIST: PriceItem[] = [
  { id: 't1', kind: 'tire', code: 'T-11225-16', description: '11R22.5 16-ply steer', size: '11R22.5', unit: 'each', priceCents: 61200, aliases: [], taxable: true },
  { id: 'rc', kind: 'service', code: 'RC', description: 'Road call', unit: 'job', priceCents: 9500, aliases: ['road call', 'appel de service'], taxable: true },
  { id: 'lb', kind: 'labour', code: 'LAB', description: 'Labour', unit: 'hour', priceCents: 12667, aliases: ['labour'], taxable: true },
  { id: 'cc', kind: 'credit', code: 'CASING', description: 'Casing credit', size: '11R22.5', unit: 'each', priceCents: 4000, aliases: ['casing'], taxable: true },
];

describe('tax', () => {
  it('ON HST 13%', () => { expect(computeTax(85700, 'ON').map(t => t.amountCents)).toEqual([11141]); });
  it('QC GST + QST on the same base', () => { expect(computeTax(10000, 'QC').map(t => t.amountCents)).toEqual([500, 998]); });
  it('NS is 14%', () => { expect(DEFAULT_TAX.NS[0].rate).toBe(0.14); });
  it('credits make negative tax', () => { expect(computeTax(-1000, 'AB')[0].amountCents).toBe(-50); });
});

describe('local extractor (English)', () => {
  const x = localExtract('Unit 4521, steer left. Came off at 6/32, casing looks good. Put on a new 11R22.5, torqued to 450. Road call, hour and a half.');
  it('reads unit, road call, hours', () => { expect(x.unit).toBe('4521'); expect(x.roadCall).toBe(true); expect(x.labourHours).toBe(1.5); });
  it('reads the wheel', () => {
    expect(x.wheels).toHaveLength(1);
    expect(x.wheels[0]).toMatchObject({ position: { axle: 'steer', side: 'left' }, removedTread32: 6, casingOk: true, installedSize: '11R22.5', torqueFtLb: 450, action: 'replace' });
    expect(x.evidence['wheels.0.torqueFtLb']).toMatch(/450/);
  });
});

describe('local extractor (French)', () => {
  const x = localExtract('Unité 4521, directrice gauche. Retiré à 6/32, carcasse correcte. Posé un 11R22.5 neuf, serré à 450. Appel de service, une heure et demie.');
  it('reads the same job', () => {
    expect(x.unit).toBe('4521'); expect(x.roadCall).toBe(true); expect(x.labourHours).toBe(1.5);
    expect(x.wheels[0]).toMatchObject({ position: { axle: 'steer', side: 'left' }, removedTread32: 6, casingOk: true, installedSize: '11R22.5', torqueFtLb: 450 });
  });
});

describe('lines, totals and approval checks', () => {
  const x = localExtract('Unit 4521, steer left. Came off at 6/32, casing looks good. Put on a new 11R22.5, torqued to 450. Road call, hour and a half.');
  const lines = linesFromExtraction(x, LIST);
  const job: Job = { id: 'j', number: 1187, unit: '4521', fleetId: 'f', type: 'road_call', status: 'review', province: 'ON', createdAt: '2026-11-22T13:00:00Z', photos: [], extracted: x, lines, torque: torqueFromExtraction(x, 'Marc', '2026-11-22T13:51:00Z'), history: [] };
  it('prices only from the list and totals match the homepage example', () => {
    expect(lines.map(l => l.unitPriceCents)).toEqual([61200, -4000, 9500, 12667]);
    const t = totals(job);
    expect(t.subtotalCents).toBe(61200 - 4000 + 9500 + 19001);
    expect(t.taxes[0].amountCents).toBe(Math.round(t.taxableCents * 0.13));
  });
  it('blocks approval when the fleet requires a PO', () => {
    const fleet: Fleet = { id: 'f', name: 'Northline', poRequired: true, poPattern: '^\\d{5}$' };
    expect(blockers(job, fleet)).toContain('po_missing');
    expect(blockers({ ...job, po: 'ABC' }, fleet)).toContain('po_format');
    expect(blockers({ ...job, po: '77812' }, fleet)).toEqual([]);
  });
  it('blocks when a replaced wheel has no torque record', () => {
    expect(blockers({ ...job, po: '1', torque: [] }, { id: 'f', name: 'n', poRequired: false })).toContain('torque_missing');
  });
  it('flags unusual torque without changing it', () => { expect(torqueWarning(45)).toBe('low'); expect(torqueWarning(450)).toBeNull(); });
});
