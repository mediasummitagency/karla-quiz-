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
