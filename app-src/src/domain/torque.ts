// Torque records and re-torque reminders.
// Industry practice: re-torque after the first 50-100 miles (80-160 km); fleets can set their own interval (TMC RP 237).
import type { ExtractedJob, TorqueRecord } from './types';

export const DEFAULT_RETORQUE_KM = 80;

export function torqueFromExtraction(x: ExtractedJob, techName: string | undefined, at: string, retorqueKm = DEFAULT_RETORQUE_KM): TorqueRecord[] {
  return x.wheels
    .filter(w => w.position && typeof w.torqueFtLb === 'number' && w.torqueFtLb > 0)
    .map(w => ({ position: w.position!, valueFtLb: w.torqueFtLb!, pattern: w.pattern ?? 'crisscross', techName, recordedAt: at, retorqueDueKm: retorqueKm }));
}

/** Flags values outside the usual range for commercial disc wheels (300-900 ft-lb per TMC RP 237). Never changes the value. */
export function torqueWarning(valueFtLb: number): 'low' | 'high' | null {
  if (valueFtLb < 300) return 'low';
  if (valueFtLb > 900) return 'high';
  return null;
}
