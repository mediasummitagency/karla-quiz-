# Session Summary - 2026-07-26: WhatsApp Lead Notification via Zapier

Dev-only notes. Not user-facing, not linked from README.

## What prompted this

Lucas asked whether Karla could get a lead notification/confirmation via WhatsApp instead of
(or alongside) the email `scripts/Code.gs` already sends her on every quiz submission
(`doPost`'s "Notify owner of new submission" block, `Code.gs:102-120`). Wanted to know if
CallMeBot was the only option, or if his existing Zapier Pro plan could do it.

## What was found

- Zapier has two distinct WhatsApp apps, easy to conflate:
  - **WhatsApp Business** — official Meta Cloud API, needs a Meta Business Manager account +
    a registered WhatsApp Business phone number. Only needed for messaging *other* people
    (clients). Not needed here.
  - **WhatsApp Notifications** — a premium Zapier app (covered by the Pro plan already paid
    for) that sends messages only to the account holder's own verified WhatsApp number. Exact
    fit for "notify Karla when a lead comes in" — no Meta Business setup required.
- Connecting WhatsApp Notifications: the phone number entered during connection/OTP
  verification is whoever receives the messages — doesn't have to be the Zapier login
  owner's own number, so Karla's number can be verified directly even though it's Lucas's
  Zapier account.
- Planned Zap: Trigger = Google Sheets "New Spreadsheet Row" watching the same sheet
  `Code.gs` already appends to; Action = WhatsApp Notifications "Send Message."
- Hit a real error while testing the Send Message action: `Failed to create a message in
  WhatsApp Notifications — Cannot read properties of undefined (reading 'map')`. Root cause
  (confirmed via Zapier's own help docs/community threads): the WhatsApp Notifications action
  does **not** accept freeform custom message text in its "Template" field — only one of 7
  fixed pre-built templates (New Lead, New Message, Payment Confirmation, New Order, Shipping
  Confirmation, Calendar Reminder, Zap Error). Typing a custom sentence directly into that
  field (what had been done) crashes with this exact error.
- Fix given: clear the Template field, select the **"New Lead"** pre-built template from the
  dropdown, then map the sheet's columns (Nome, WhatsApp, Nível, Pontuação) into that
  template's own sub-fields instead of writing one block of custom text. Message wording will
  follow whatever the "New Lead" template itself uses — Zapier gives no way to customize the
  sentence itself, only which values fill its blanks.

## What was NOT the problem

- Not a Google Sheets trigger issue — "1. New Spreadsheet Row" tested clean (green check),
  pulling real sample data (Caroline Lira / phone / email / Nível / Pontuação) correctly.
- Not a wrong-number/connection issue — the WhatsApp Notifications account connection itself
  wasn't the failure point; the crash was isolated to the Send Message action's Template field.

## What changed

No code changes in this repo — `scripts/Code.gs`'s existing email notification to
`OWNER_EMAIL` was left untouched. All changes are in Lucas's Zapier account (a Zap being
built there), external to this codebase.

## Still open / blocked on

Lucas was mid-fix (about to clear the Template field and pick "New Lead") when the session
ended — no confirmation yet that the corrected test run actually sent a WhatsApp message to
Karla. Next session should confirm: test passes, Karla actually receives the message, then
turn the Zap on. Also flagged but not yet decided: Zapier's Google Sheets trigger polls on an
interval (not instant) — Code.gs could be modified later to hit a Zapier webhook directly the
moment the quiz submits, if the polling delay ever bothers Karla.
