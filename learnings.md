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
