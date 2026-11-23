// Turns an extracted voice note into priced job lines, using ONLY the company's price list.
import type { ExtractedJob, JobLine, PriceItem, WheelPosition, Lang } from './types';

let seq = 0;
export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

export function positionLabel(p: WheelPosition | undefined, lang: Lang = 'en'): string {
  if (!p) return lang === 'fr' ? 'Position ?' : 'Position ?';
  const ax = lang === 'fr' ? { steer: 'Directrice', drive: 'Motrice', trailer: 'Remorque' }[p.axle] : { steer: 'Steer', drive: 'Drive', trailer: 'Trailer' }[p.axle];
  const side = lang === 'fr' ? (p.side === 'left' ? 'gauche' : 'droite') : (p.side === 'left' ? 'left' : 'right');
  const pos = p.pos ? (lang === 'fr' ? (p.pos === 'inner' ? ' intérieure' : ' extérieure') : (p.pos === 'inner' ? ' inner' : ' outer')) : '';
  const no = p.axleNo && p.axleNo > 1 ? ` ${p.axleNo}` : '';
  return `${ax}${no} ${side}${pos}`;
}

/** Find a tire in the price list by size (and optionally words in its description). */
export function findTire(list: PriceItem[], size?: string, words?: string): PriceItem | undefined {
  if (!size) return undefined;
  const s = norm(size).replace(/\s/g, '');
  const tires = list.filter(i => i.kind === 'tire' && i.size && norm(i.size).replace(/\s/g, '') === s);
  if (tires.length <= 1 || !words) return tires[0];
  const w = norm(words);
  return tires.find(t => t.aliases.some(a => w.includes(norm(a))) || w.includes(norm(t.description))) ?? tires[0];
}

/** Find a non-tire item whose code or alias matches. */
export function findByAlias(list: PriceItem[], ...keys: string[]): PriceItem | undefined {
  const ks = keys.map(norm);
  return list.find(i => i.kind !== 'tire' && (ks.includes(norm(i.code)) || i.aliases.some(a => ks.includes(norm(a)))));
}

export function linesFromExtraction(x: ExtractedJob, list: PriceItem[], lang: Lang = 'en'): JobLine[] {
  const out: JobLine[] = [];
  x.wheels.forEach((w, i) => {
    const where = positionLabel(w.position, lang);
    if (w.action === 'replace' || w.installedSize) {
      const t = findTire(list, w.installedSize, w.installedDescription);
      out.push({
        id: uid('ln'), priceItemId: t?.id,
        description: t ? `${t.description} · ${where}` : `${w.installedSize ?? (lang === 'fr' ? 'Pneu' : 'Tire')} · ${where}`,
        qty: 1, unitPriceCents: t?.priceCents ?? 0, taxable: t?.taxable ?? true,
        evidence: x.evidence[`wheels.${i}.installedSize`], needsReview: !t || x.uncertain.includes(`wheels.${i}.installedSize`),
      });
      const mount = findByAlias(list, 'mount', 'mount and balance', 'tire install');
      if (mount) out.push({ id: uid('ln'), priceItemId: mount.id, description: `${mount.description} · ${where}`, qty: 1, unitPriceCents: mount.priceCents, taxable: mount.taxable });
    }
    if (w.action === 'repair') {
      const rep = findByAlias(list, 'repair', 'flat repair', 'réparation');
      out.push({ id: uid('ln'), priceItemId: rep?.id, description: `${rep?.description ?? (lang === 'fr' ? 'Réparation' : 'Repair')} · ${where}`, qty: 1, unitPriceCents: rep?.priceCents ?? 0, taxable: rep?.taxable ?? true, evidence: x.evidence[`wheels.${i}.action`], needsReview: !rep });
    }
    if (w.casingOk) {
      const sz = (s?: string) => (s ?? '').toUpperCase().replace(/\s/g, '');
      const cr = list.find(p => p.kind === 'credit' && (!p.size || !w.installedSize || sz(p.size) === sz(w.installedSize)));
      if (cr) out.push({ id: uid('ln'), priceItemId: cr.id, description: `${cr.description} · ${where}`, qty: 1, unitPriceCents: -Math.abs(cr.priceCents), taxable: cr.taxable, evidence: x.evidence[`wheels.${i}.casingOk`] });
    }
  });
  if (x.roadCall) {
    const rc = findByAlias(list, 'road call', 'service call', 'appel de service');
    out.push({ id: uid('ln'), priceItemId: rc?.id, description: rc?.description ?? (lang === 'fr' ? 'Appel de service' : 'Road call'), qty: 1, unitPriceCents: rc?.priceCents ?? 0, taxable: rc?.taxable ?? true, evidence: x.evidence['roadCall'], needsReview: !rc });
  }
  if (x.labourHours && x.labourHours > 0) {
    const lab = list.find(p => p.kind === 'labour');
    out.push({ id: uid('ln'), priceItemId: lab?.id, description: lab?.description ?? (lang === 'fr' ? "Main-d'œuvre" : 'Labour'), qty: x.labourHours, unitPriceCents: lab?.priceCents ?? 0, taxable: lab?.taxable ?? true, evidence: x.evidence['labourHours'], needsReview: !lab || x.uncertain.includes('labourHours') });
  }
  return out;
}
