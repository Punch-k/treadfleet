# TreadFleet app

Office software for commercial tire crews in Canada. A technician records a voice note at the truck; TreadFleet turns it into
priced invoice lines (from the company's own price list), torque records and a fleet-ready invoice that the owner approves.

**Status:** Version 1 in development. Runs today in **demo mode** (everything stays in the browser). The hosted backend
(Supabase, Canada Central) and the AI voice reader are written but not deployed yet.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # business-logic tests (tax, pricing, extraction, approval checks)
node scripts/test-db.mjs   # database schema + row-level security tests (Postgres via PGlite, no Docker)
npm run build        # static build in dist/
```

Demo shortcuts (demo mode only): `?seed=sample`, `?seed=recorded`, `?seed=approved`, plus `&role=tech` and `&lang=fr`.
Example: `http://localhost:5173/?seed=recorded#/jobs/1187`.

## What's in v1

| Area | What it does | Where |
|---|---|---|
| Company setup | Name, province, GST/QST numbers, invoice numbering, re-torque interval | `src/ui/Setup.tsx`, Settings |
| Price list | The company's own items, sizes and the words techs use; CSV import | `src/ui/Admin.tsx`, `src/sample.ts` |
| Fleets | AP email, PO required, PO format check | `src/ui/Admin.tsx` |
| Technician view | Today's jobs, press-and-talk, photos per job, send to office | `src/ui/Tech.tsx`, `src/services.ts` |
| Voice note reader | Demo: built-in rule-based reader (EN/FR). Hosted: speech-to-text + Claude filling a strict schema with the exact quote behind every field | `src/domain/localExtract.ts`, `supabase/functions/extract-job` |
| Job review | Lines priced only from the list, the words each came from, torque per wheel, approval checks | `src/ui/JobPage.tsx`, `src/domain/*` |
| Approval | Owner only; blocked until PO, unit, prices and torque are in place; invoice numbers assigned once | `src/domain/invoice.ts`, `approve_job()` in the migration |
| Invoice | Printable/PDF with provincial tax and the torque record attached; email to the fleet's AP | `src/ui/Invoice.tsx` |
| Export | Invoice CSV for the bookkeeper | Settings |

## Design rules

- **Nothing goes out without the owner's approval.** Enforced in the UI and in the database (`jobs_guard` trigger, `approve_job()`).
- **A record, not a guess.** Prices come only from the company's list; torque is stored as recorded; unusual values are flagged, never changed.
- **Every company's data is separate.** Row-level security on every table; technicians only see jobs assigned to them; the audit log is append-only.
- **English and French** throughout.

## Going live (next)

1. Apply `supabase/migrations/20261122000000_core.sql` to the Canada (Central) project.
2. Set secrets and deploy the function:
   `supabase secrets set ANTHROPIC_API_KEY=... DEEPGRAM_API_KEY=...` then `supabase functions deploy extract-job`.
3. Add the Supabase-backed store (same shape as `src/store.ts`) with email sign-in, storage for audio/photos, and invite links for techs.
4. Server-side email of approved invoices (Resend) and re-torque reminder texts to drivers (SMS, with CASL consent).

Tax rates in `src/domain/tax.ts` are the defaults as of November 2026; each company should confirm them with its accountant.
