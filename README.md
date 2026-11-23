# TreadFleet

Office software for commercial tire crews in Canada. Technicians talk through the job at the truck; TreadFleet prepares
the work order, the torque record and the fleet invoice for the owner's approval. English and French.

**Website:** https://punch-k.github.io/treadfleet/ · **App demo:** https://punch-k.github.io/treadfleet/app/?seed=sample

## What's in this repository

| Path | What it is |
|---|---|
| `/` | The website: home, product, who it's for, about, pilot program, privacy, terms |
| `app/` | The TreadFleet app (version 1), built. Runs in demo mode: data stays in your browser |
| `app-src/` | App source: React + TypeScript, business-logic tests, Supabase database schema with row-level security, and the voice-note reader function |

## App, version 1

- **Technician view:** today's jobs, press-and-talk voice notes, photos, send to office.
- **Voice note reader:** picks out unit, wheel position, tread depth, tire size, torque and hours (English and French) and shows the words each line came from.
- **Pricing:** only from the company's own price list; GST, HST, PST and QST by province.
- **Approval:** owner only, blocked until the fleet's PO, the unit number, prices and torque records are in place; approved invoices can't change.
- **Invoice:** printable/PDF with the torque record attached.

The hosted version (sign-in, shared data in Canada, AI voice reading) is in progress; see `app-src/README.md`.

Pilot applications from the website are stored in Canada (Supabase, Canada Central region), insert-only.
Photos on the website are from Pexels.
