// Canadian sales tax by province or territory. Money is integer cents everywhere.
// Rates are the company's to confirm with their accountant; they are stored per company and can be edited.

export type Province = 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT' | 'NU' | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';

export interface TaxComponent { code: 'GST' | 'HST' | 'PST' | 'QST' | 'RST'; rate: number }

// Default rates as of November 2026. NS HST is 14% since 1 April 2025.
export const DEFAULT_TAX: Record<Province, TaxComponent[]> = {
  AB: [{ code: 'GST', rate: 0.05 }],
  BC: [{ code: 'GST', rate: 0.05 }, { code: 'PST', rate: 0.07 }],
  MB: [{ code: 'GST', rate: 0.05 }, { code: 'RST', rate: 0.07 }],
  NB: [{ code: 'HST', rate: 0.15 }],
  NL: [{ code: 'HST', rate: 0.15 }],
  NS: [{ code: 'HST', rate: 0.14 }],
  NT: [{ code: 'GST', rate: 0.05 }],
  NU: [{ code: 'GST', rate: 0.05 }],
  ON: [{ code: 'HST', rate: 0.13 }],
  PE: [{ code: 'HST', rate: 0.15 }],
  QC: [{ code: 'GST', rate: 0.05 }, { code: 'QST', rate: 0.09975 }],
  SK: [{ code: 'GST', rate: 0.05 }, { code: 'PST', rate: 0.06 }],
  YT: [{ code: 'GST', rate: 0.05 }],
};

export const PROVINCES = Object.keys(DEFAULT_TAX) as Province[];

export interface TaxLine { code: TaxComponent['code']; rate: number; label: string; amountCents: number }

/** Round half away from zero to the nearest cent. */
export const roundCents = (x: number) => Math.sign(x) * Math.round(Math.abs(x));

/**
 * Tax on a taxable base. Each component is computed on the same base (Canadian GST/PST/QST are not compounded since 2013).
 * A negative base (e.g. credits larger than charges) produces negative tax, which is what a credit note needs.
 */
export function computeTax(taxableCents: number, province: Province, rates: Record<Province, TaxComponent[]> = DEFAULT_TAX): TaxLine[] {
  return rates[province].map(c => ({
    code: c.code,
    rate: c.rate,
    label: `${c.code} ${formatRate(c.rate)} (${province})`,
    amountCents: roundCents(taxableCents * c.rate),
  }));
}

export function formatRate(rate: number): string {
  const pct = +(rate * 100).toFixed(3);
  return `${pct}%`;
}

export function formatMoney(cents: number, lang: 'en' | 'fr' = 'en'): string {
  const v = cents / 100;
  return lang === 'fr'
    ? v.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })
    : v.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
}
