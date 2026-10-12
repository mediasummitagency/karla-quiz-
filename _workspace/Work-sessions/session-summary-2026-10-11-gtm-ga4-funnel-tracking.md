# Session summary — 2026-10-11

**Session ended:** 2026-10-11 20:10 EDT

## What happened
The quiz had no analytics at all. Created a GA4 property and a GTM container, both under Lucas's
own Summit Media logins (his instruction: not G360, a solo project for his sister; only
lucas@summitmedia.co has access to either account). Moved GA4 behind GTM and added a per-screen
`quiz_step` event so drop-off can be seen question by question. Mid-session Lucas connected
Hostinger's Git panel, which copied raw source over `public_html` and blanked the live site; restored
by re-running the GitHub Action, and Lucas disconnected the Hostinger Git connection.

- **GA4:** property `558470602` in Summit Media Analytics (384187979), stream "Escala quiz -
  expectingwonders.com", measurement ID **`G-NS9PT60FWG`** (zero, not O; GTM matched it to the
  stream). São Paulo time, BRL, Health category, event retention 14 months. Custom dimensions:
  Quiz step (`step`), Checkout button (`button`).
- **GTM:** `GTM-524JZKF7` in the Summit Media account, imported via JSON (Merge, not Overwrite):
  Google tag on Initialization, one GA4 event tag `{{Event}}` on a regex custom-event trigger, three
  Data Layer Variables. Published as version 2.
- **`quiz_step` names:** `01_name`, `02_context`, `03_duration`, `04_part1_intro`, `05_q01`…`10_q06`,
  `11_part2_intro`, `12_q07`…`17_q12`, `18_part3_intro`, `19_q13`…`24_q18`, `25_open_question`,
  `26_lead_form`, `27_result`. Which screen only, never an answer (health-data rule).

## Files changed
All committed and pushed (`karla-quiz` main is in sync with origin):
- `src/tracking.js`: `GTM_ID`, canonical Summit GTM loader (gesture or 1s after first paint), `track()` pushes to dataLayer with `step`/`step_number`/`button` reset each push; direct gtag loader removed.
- `src/App.jsx`: `funnelStep()` + effect firing `quiz_step` once per screen.
- `TODO.md`: item 1 rewritten with the IDs, events and what's left.
- `README.md`: new "Deploy" section warning never to connect Hostinger Git.
- `learnings.md`: 09-25 deploy lesson updated with the 10-11 recurrence.
- Vault: `STATUS.md` row 29, `divisions/software/learnings.md` (GTM import Overwrite deletes built-ins), `learnings/patterns.md`, `progress.md`.

## Verified how
- `npm run build` clean.
- Local `vite preview` in Chrome, intro → Q7: dataLayer showed `quiz_start` then steps 01–12 in order; `performance` entries showed page_view, scroll, form_start and quiz_step hits to `google-analytics.com/g/collect` with `tid=G-NS9PT60FWG`; GA4 Realtime showed the visit.
- Live: after the deploy, `expectingwonders.com` serves `/assets/index-Cg_1FxH_.js`, loads `GTM-524JZKF7` + `G-NS9PT60FWG`, and sent a page_view.
- After the Hostinger blank-out: re-ran Action 38184160207, then pushed once more after Lucas disconnected Hostinger Git; both deploys succeeded and the live page renders with tags.
- **Not verified:** `lead_submit`, `offer_viewed`, `checkout_click` firing on the live site (stopped before the lead form to keep test rows out of Karla's sheet). A handful of localhost test events sit in the property.

## Open / not done
- Mark `lead_submit` as a key event in GA4 (Admin → Events → star). GA4 can't list it until it has arrived once, so it waits on Lucas's test lead.
- Build the drop-off report (Explore → Funnel exploration on Quiz step 01–27) once a few days of real traffic exist.
- Meta Pixel + Clarity IDs from Karla (can now go in as GTM tags), Kiwify attribution, LGPD consent decision. See `TODO.md` item 1.

## Next session starts here
After Lucas's test lead lands: GA4 property 558470602 → Admin → Events → star `lead_submit`, and confirm the sheet columns in Karla's spreadsheet.

**State as of 2026-10-11 20:10 EDT**
