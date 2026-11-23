// Rule-based extractor used in demo mode and as a fallback when the AI service is unavailable.
// It is deliberately conservative: anything it can't read is left empty and flagged for review.
import type { Axle, ExtractedJob, Side, WheelPosition } from './types';

const AXLE: Array<[RegExp, Axle]> = [
  [/\b(steer|directrice|direction)\b/i, 'steer'],
  [/\b(drive|drives|motrice|motrices|traction)\b/i, 'drive'],
  [/\b(trailer|remorque)\b/i, 'trailer'],
];
const SIDE: Array<[RegExp, Side]> = [
  [/\b(left|gauche|driver side|côté conducteur)\b/i, 'left'],
  [/\b(right|droite|passenger side|côté passager)\b/i, 'right'],
];
const NUM_WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, un: 1, une: 1, deux: 2, trois: 3, quatre: 4 };

function sentenceSplit(t: string) { return t.split(/(?<=[.!?])\s+/).filter(Boolean); }

function hoursFrom(t: string): { h?: number; quote?: string } {
  const m1 = t.match(/(an? |une )?(hour|heure) and a half|(une )?heure et demie/i);
  if (m1) return { h: 1.5, quote: m1[0] };
  const m2 = t.match(/(\d+(?:[.,]\d+)?)\s*(h|hrs?|hours?|heures?)\b/i);
  if (m2) return { h: parseFloat(m2[1].replace(',', '.')), quote: m2[0] };
  const m3 = t.match(/\b(one|two|three|four|une|deux|trois|quatre)\s+(hours?|heures?)\b/i);
  if (m3) return { h: NUM_WORDS[m3[1].toLowerCase()], quote: m3[0] };
  const m4 = t.match(/\b(half an hour|une demi-heure)\b/i);
  if (m4) return { h: 0.5, quote: m4[0] };
  return {};
}

export function localExtract(transcript: string): ExtractedJob {
  const t = transcript.replace(/\s+/g, ' ').trim();
  const x: ExtractedJob = { wheels: [], evidence: {}, uncertain: [] };
  const unit = t.match(/\b(?:unit|unité|truck|camion|tractor|tracteur)\s*#?\s*([A-Z]{0,3}-?\d{2,6})\b/i);
  if (unit) { x.unit = unit[1]; x.evidence.unit = unit[0]; }
  const rc = t.match(/\b(road ?call|service call|roadside|appel de service|dépannage)\b/i);
  if (rc) { x.roadCall = true; x.evidence.roadCall = rc[0]; }
  const hrs = hoursFrom(t);
  if (hrs.h) { x.labourHours = hrs.h; x.evidence.labourHours = hrs.quote!; }

  // One wheel per sentence group that names a position; carry the position forward to following sentences.
  let cur: ExtractedJob['wheels'][number] | null = null;
  for (const s of sentenceSplit(t)) {
    const axle = AXLE.find(([r]) => r.test(s))?.[1];
    const side = SIDE.find(([r]) => r.test(s))?.[1];
    if (axle && side) {
      const pos: WheelPosition = { axle, side };
      if (/\b(inner|intérieur(e)?)\b/i.test(s)) pos.pos = 'inner';
      if (/\b(outer|extérieur(e)?)\b/i.test(s)) pos.pos = 'outer';
      cur = { position: pos };
      x.wheels.push(cur);
      x.evidence[`wheels.${x.wheels.length - 1}.position`] = s.match(new RegExp(`.{0,20}(${AXLE.find(a => a[1] === axle)![0].source.replace(/\\b/g, '')}).{0,20}`, 'i'))?.[0]?.trim() ?? s;
    }
    if (!cur && /\d{2}R\d{2}|torqu|serr/i.test(s)) { cur = {}; x.wheels.push(cur); x.uncertain.push(`wheels.${x.wheels.length - 1}.position`); }
    if (!cur) continue;
    const i = x.wheels.length - 1;
    const tread = s.match(/(\d{1,2})\s*\/\s*32/);
    if (tread) { cur.removedTread32 = +tread[1]; x.evidence[`wheels.${i}.removedTread32`] = tread[0]; }
    const casing = s.match(/casing (looks )?(good|ok|fine)|carcasse (est )?(correcte|bonne|ok)/i);
    if (casing) { cur.casingOk = true; x.evidence[`wheels.${i}.casingOk`] = casing[0]; }
    const size = s.match(/\b(\d{2,3}(?:\/\d{2})?R\d{2}(?:[.,]5)?)\b/i);
    if (size) {
      cur.installedSize = size[1].toUpperCase().replace(',', '.');
      cur.action = cur.action ?? 'replace';
      x.evidence[`wheels.${i}.installedSize`] = s.match(new RegExp(`[^,.]{0,24}${size[1].replace('.', '\\.')}[^,]*`, 'i'))?.[0]?.trim() ?? size[0];
    }
    if (/\b(repair|patch|plug|réparé|réparation|réparer)\b/i.test(s)) { cur.action = 'repair'; x.evidence[`wheels.${i}.action`] = s; }
    const tq = s.match(/(torqu\p{L}*|serr\p{L}*)\s*(?:to|at|à)?\s*(\d{3})/iu);
    if (tq) { cur.torqueFtLb = +tq[2]; x.evidence[`wheels.${i}.torqueFtLb`] = tq[0]; }
    if (/star|étoile/i.test(s)) cur.pattern = 'star';
  }
  if (!x.unit) x.uncertain.push('unit');
  return x;
}
