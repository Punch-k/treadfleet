// Invoice totals and the checks that must pass before an owner can approve.
import { computeTax, roundCents, DEFAULT_TAX, type TaxLine, type Province, type TaxComponent } from './tax';
import type { Fleet, Job } from './types';

export interface InvoiceTotals { subtotalCents: number; taxableCents: number; taxes: TaxLine[]; totalCents: number }

export const lineTotal = (qty: number, unitPriceCents: number) => roundCents(qty * unitPriceCents);

export function totals(job: Pick<Job, 'lines' | 'province'>, rates: Record<Province, TaxComponent[]> = DEFAULT_TAX): InvoiceTotals {
  const subtotalCents = job.lines.reduce((a, l) => a + lineTotal(l.qty, l.unitPriceCents), 0);
  const taxableCents = job.lines.filter(l => l.taxable).reduce((a, l) => a + lineTotal(l.qty, l.unitPriceCents), 0);
  const taxes = computeTax(taxableCents, job.province, rates);
  return { subtotalCents, taxableCents, taxes, totalCents: subtotalCents + taxes.reduce((a, t) => a + t.amountCents, 0) };
}

export type Blocker = 'no_lines' | 'no_unit' | 'no_fleet' | 'po_missing' | 'po_format' | 'unpriced' | 'needs_review' | 'torque_missing';

/** Reasons the invoice can't be approved yet. Empty array = ready. */
export function blockers(job: Job, fleet: Fleet | undefined): Blocker[] {
  const b: Blocker[] = [];
  if (!job.lines.length) b.push('no_lines');
  if (!job.unit?.trim()) b.push('no_unit');
  if (!fleet) b.push('no_fleet');
  if (fleet?.poRequired && !job.po?.trim()) b.push('po_missing');
  if (fleet?.poPattern && job.po?.trim()) {
    try { if (!new RegExp(fleet.poPattern).test(job.po.trim())) b.push('po_format'); } catch { /* bad pattern: ignore */ }
  }
  if (job.lines.some(l => l.unitPriceCents === 0 && l.qty !== 0 && !l.priceItemId)) b.push('unpriced'); // $0 items from the price list are intentional (included)
  if (job.lines.some(l => l.needsReview)) b.push('needs_review');
  const replaced = (job.extracted?.wheels ?? []).filter(w => w.action === 'replace' || w.installedSize).length;
  if (replaced > job.torque.length) b.push('torque_missing');
  return b;
}

export const BLOCKER_TEXT: Record<Blocker, { en: string; fr: string }> = {
  no_lines: { en: 'Add at least one line', fr: 'Ajoutez au moins une ligne' },
  no_unit: { en: 'Unit number missing', fr: "Numéro d'unité manquant" },
  no_fleet: { en: 'Choose the fleet', fr: 'Choisissez la flotte' },
  po_missing: { en: 'This fleet requires a PO number', fr: 'Cette flotte exige un bon de commande' },
  po_format: { en: "PO doesn't match this fleet's format", fr: 'Le bon de commande ne respecte pas le format de la flotte' },
  unpriced: { en: 'Some lines have no price', fr: "Certaines lignes n'ont pas de prix" },
  needs_review: { en: 'Some lines need your review', fr: 'Certaines lignes doivent être vérifiées' },
  torque_missing: { en: 'A replaced wheel has no torque record', fr: "Une roue remplacée n'a pas de registre de couple" },
};
