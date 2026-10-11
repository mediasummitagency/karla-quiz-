# Session summary — 2026-10-11 19:25 EDT — GTM + GA4 live, per-screen funnel tracking

## Why

The quiz had no analytics at all. Lucas: "we've just been optimizing semi-blindly." He wants to
see how many people land, and where in the quiz they drop off.

## What was created (Lucas's own Summit Media logins, not G360)

Lucas's instruction, mid-session: create both under **Summit Media**, not G360, because this is a
solo project for his sister and should not involve G360 or Daniel. Checked: lucas@summitmedia.co
is the only person on both the Summit Media GTM account and the Summit Media Analytics account.
(The Google Ads 943-374-8086 rows on the GA account have no account-level access.)

- **GA4 property** `558470602`, stream "Escala quiz - expectingwonders.com", measurement ID
  **`G-NS9PT60FWG`** (zero, not letter O; GTM's tag screen confirmed it matched the stream).
  São Paulo time, BRL, Health category, event retention raised 2 → 14 months. Custom dimensions:
  Quiz step (`step`), Checkout button (`button`).
- **GTM container** `GTM-524JZKF7` in the Summit Media account. Imported via JSON (merge):
  Google tag G-NS9PT60FWG on Initialization, one GA4 event tag `{{Event}}` on a custom-event
  regex trigger, three Data Layer Variables. Published as version 2.

## Code (`src/tracking.js`, `src/App.jsx`)

- GA4's direct gtag loader removed; GA4 now runs inside GTM. GTM loads with the canonical Summit
  loader (first gesture, or 1s after first paint), copied from `tcg-nextjs` GtmLoader.
- `track()` pushes to `dataLayer`, resetting `step`/`step_number`/`button` on every push so a
  stale value never rides along on the next event.
- New `quiz_step` event, one per screen reached: `01_name`, `02_context`, `03_duration`,
  `04_part1_intro`, `05_q01`…`10_q06`, `11_part2_intro`, `12_q07`…`17_q12`, `18_part3_intro`,
  `19_q13`…`24_q18`, `25_open_question`, `26_lead_form`, `27_result`. Only which screen, never
  the answer (health-data rule).

## Verified

Local `vite preview`, walked intro → Q7 in Chrome: dataLayer showed `quiz_start` then steps
01–12 in order; `performance` entries showed page_view, scroll, form_start and quiz_step hits to
`google-analytics.com/g/collect` with `tid=G-NS9PT60FWG`; GA4 Realtime showed the visit. Stopped
before the lead form so no test row went into Karla's sheet. A handful of localhost test events
are in the property.

## Open

- Star `lead_submit` as a key event once it has arrived once (GA4 cannot list it before).
- Funnel exploration report on Quiz step.
- Meta Pixel / Clarity / LGPD as before (TODO.md item 1).
