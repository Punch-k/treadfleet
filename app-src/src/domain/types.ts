// Core records. These mirror the database tables in supabase/migrations.
import type { Province } from './tax';

export type Lang = 'en' | 'fr';

export interface Company {
  id: string;
  name: string;
  province: Province;
  gstNumber?: string;
  qstNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  invoicePrefix: string;
  nextInvoiceNo: number;
  defaultLang: Lang;
  retorqueKm?: number;
}

export interface Fleet {
  id: string;
  name: string;
  apEmail?: string;
  poRequired: boolean;
  /** Optional pattern a PO must match, e.g. "^WB-\\d+$". */
  poPattern?: string;
  notes?: string;
}

export type ItemKind = 'tire' | 'labour' | 'service' | 'fee' | 'credit';

export interface PriceItem {
  id: string;
  kind: ItemKind;
  code: string;            // the company's own SKU or code
  description: string;
  size?: string;           // tire size, e.g. 11R22.5
  unit: 'each' | 'hour' | 'job';
  priceCents: number;      // positive; credits are applied as negative lines
  aliases: string[];       // words techs use for it ("road call", "service call", "appel de service")
  taxable: boolean;
}

export type Axle = 'steer' | 'drive' | 'trailer';
export type Side = 'left' | 'right';
export type Pos = 'outer' | 'inner';

export interface WheelPosition { axle: Axle; axleNo?: number; side: Side; pos?: Pos }

export interface TorqueRecord {
  position: WheelPosition;
  valueFtLb: number;
  pattern?: 'crisscross' | 'star' | 'other';
  techName?: string;
  recordedAt: string;          // ISO
  retorqueDueKm: number;       // reminder point
  retorqueConfirmedAt?: string;
}

/** What the voice-note extractor returns. Every field may be missing; the owner reviews before anything is sent. */
export interface ExtractedJob {
  unit?: string;
  roadCall?: boolean;
  labourHours?: number;
  wheels: Array<{
    position?: WheelPosition;
    action?: 'replace' | 'repair' | 'inspect' | 'rotate';
    removedTread32?: number;
    casingOk?: boolean;
    installedSize?: string;
    installedDescription?: string;
    torqueFtLb?: number;
    pattern?: TorqueRecord['pattern'];
  }>;
  notes?: string;
  /** Exact words from the transcript that each field came from, keyed by a field path like "wheels.0.installedSize". */
  evidence: Record<string, string>;
  /** Field paths the extractor was unsure about. */
  uncertain: string[];
}

export type JobStatus = 'new' | 'dispatched' | 'recorded' | 'review' | 'approved' | 'sent' | 'closed';

export interface JobLine {
  id: string;
  priceItemId?: string;
  description: string;
  qty: number;
  unitPriceCents: number;   // negative for credits
  taxable: boolean;
  evidence?: string;        // transcript words this line came from
  needsReview?: boolean;
}

export interface Job {
  id: string;
  number: number;
  fleetId?: string;
  unit?: string;
  po?: string;
  location?: string;
  description?: string;
  type: 'road_call' | 'yard_check' | 'shop';
  status: JobStatus;
  techName?: string;
  province: Province;
  createdAt: string;
  transcript?: string;
  audioUrl?: string;
  photos: string[];          // data URLs in demo mode, storage paths in the hosted app
  extracted?: ExtractedJob;
  lines: JobLine[];
  torque: TorqueRecord[];
  invoiceNo?: string;
  approvedAt?: string;
  sentAt?: string;
  history: Array<{ at: string; who: string; what: string }>;
}
