# Karla Quiz — Project Learnings

Lessons specific to this project's own setup/quirks. Cross-cutting lessons also live in root
`learnings/patterns.md` per `.claude/rules/self-improvement.md` — this file is the
karla-quiz-specific complement to those, not a replacement.

Format: `[YYYY-MM-DD] LESSON: [what was learned] | TRIGGER: [what caused it] | FIX: [what solved it]`

---

[2026-07-26] LESSON: Lead notifications to Karla for this quiz have two channels now: the
existing email in `scripts/Code.gs`'s `doPost` (`OWNER_EMAIL`, lines 102-120) and a Zapier
automation (Google Sheets "New Spreadsheet Row" trigger on the same sheet `Code.gs` writes
to → WhatsApp Notifications "Send Message" action) being set up separately in Lucas's Zapier
account — the WhatsApp path lives entirely outside this repo, no code here talks to it. |
TRIGGER: Lucas asked whether Karla could also/instead get lead alerts via WhatsApp. | FIX:
Kept `Code.gs`'s email notification untouched; WhatsApp is a parallel automation, not a
replacement. See `_workspace/Work-sessions/session-summary-2026-07-26-whatsapp-lead-notification-zapier.md`
for the full setup + a Zapier "Template field" gotcha hit along the way (also logged to root
`learnings/patterns.md`, since it applies to any project using Zapier's WhatsApp Notifications
app, not just this one). If the sheet's column layout in `Code.gs:37` (Timestamp/Nome/
Email/WhatsApp/Nível/Pontuação/Q1-Q18) ever changes, the Zap's field mappings need updating
too since they reference those columns by name.

[2026-09-15] LESSON: Driving this quiz end-to-end in a browser submits a REAL lead — `doPost`
writes to Karla's sheet and the Zapier WhatsApp Zap fires off that row. | TRIGGER: Screenshotting
the result page needs all 18 answers plus the lead form. | FIX: Route-block
`**://script.google.com/**` in the test browser before starting; confirm the abort count is
non-zero rather than assuming it worked.

[2026-09-15] LESSON: The result page's CTA block sits outside the per-level branches, so one edit
there changes all four result levels at once; only `devolutiva`/`videoId` are level-specific. |
TRIGGER: Karla asked for the low-ticket bridge on "todos os resultados do teste gratuito". | FIX:
Edit the shared block once; no per-level duplication needed. See
`_workspace/Work-sessions/session-summary-2026-09-15-low-ticket-bridge.md`.

[2026-09-15] LESSON: The result page's four YouTube lessons run 8:13-9:59, so an engagement gate
of 3 min is safely inside all of them — but any new/shorter video would silently make the sticky
offer bar unreachable. | TRIGGER: Karla asked for the offer bar to appear only after 3 min of
watched video. | FIX: `STICKY_AFTER_SECONDS` in `App.jsx`; re-check durations
(`curl` the watch page, grep `lengthSeconds`) whenever a result video is swapped, e.g. when she
re-records the aula.

[2026-09-15] LESSON: A click-to-play poster over the result video was built and reverted the same
day — iOS blocks autoplay with sound, so it cost two taps; `youtube-nocookie` was kept because it
drops all doubleclick calls (19 reqs w/ ads vs 16 w/ none) at no UX cost. | TRIGGER: Lucas tested
on a phone and hit the double tap. | FIX: Plain embed + `-nocookie` + `enablejsapi` for the offer-bar
gate. Don't re-propose a facade here unless the videos go muted.

[2026-09-24] LESSON: The `.offer-bridge` IntersectionObserver only runs once `watchedEnough` is
true, so piggy-backing `offer_viewed` tracking on it skipped anyone who scrolls there without
3 min of video. | TRIGGER: Playwright showed no event fired on scroll. | FIX: Gave
`offer_viewed` its own observer keyed only on `screen === 'result'`.

[2026-09-25] LESSON: This repo already deploys itself: a push to `main` runs a GitHub Action that builds and FTP-syncs `dist/` to Karla's `public_html`. | TRIGGER: Lucas assumed nothing deployed from Git and opened Hostinger's Git panel. | FIX: Push `main` to deploy, and use the manual bundle only as a fallback.

[2026-09-25] LESSON: "Rebuild the upload folder" means run `./scripts/build-upload.sh`, which recreates `upload-ready/to-upload/` and `to-upload.zip` with only the built site for `public_html`. | TRIGGER: Lucas uploads to Hostinger by hand and wanted one repeatable command. | FIX: Run the script, then upload the folder's contents into an emptied `public_html`.

[2026-09-25] LESSON: The repo's `scripts/Code.gs` had drifted from the live Apps Script: Karla's sheet has two manual columns (G "Última ação realizada", H "Observação"), so Q1-Q18 sit in I-Z. | TRIGGER: Pasting the repo copy shifted every answer two columns left. | FIX: Check the live sheet's row 1 before deploying any script change; the repo copy now matches A-AC.
