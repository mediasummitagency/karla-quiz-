# Karla Quiz — To Do

Open work for this project. Finished items move to a session summary in
`_workspace/Work-sessions/` and come off this list.

---

## 0. Sales page on the result screen

**Status:** drafts with Karla for review · **Added:** 2026-09-23

Karla wants a real sales page between the result video and Kiwify. We agreed it goes **on the
result screen itself**, with no new page or domain. The two review drafts (Version A follows her
doc, Version B is our CRO take) are in
`_workspace/review/2026-09-23/*-v3.html`. Details in
`_workspace/Work-sessions/session-summary-2026-09-23-sales-page-drafts.md`.

- [ ] Karla picks a version and sends back the missing inputs: price, quiz-taker count,
      testimonials (check CFP rules first), 3 product screenshots, product format, a larger photo
- [ ] Build it into `src/App.jsx` in place of the `offer-bridge` section, **together with item 1**

---

## 1. Set up Meta Pixel, Microsoft Clarity and GA4

**Status:** code wired 2026-09-24, switched off until real IDs exist · **Added:** 2026-09-15 ·
**Blocks:** every CRO change below

`GA4_ID` / `META_PIXEL_ID` / `CLARITY_ID` in `src/tracking.js` are all `''` — each tool only
loads once its ID is filled in, so nothing fires and no network request goes out yet. `track()`
fans `quiz_start`, `quiz_complete`, `lead_submit` (Meta `Lead`), `offer_viewed` (fires once,
independent of the sticky-bar video gate), and `checkout_click` (Meta `InitiateCheckout`, param
`button: 'bridge'|'sticky'`) out to whichever tools are loaded. Verified end-to-end with test IDs
in a headless browser (Apps Script route-blocked first) — event order and Meta standard-event
mapping both confirmed; confirmed zero requests with IDs empty (see commit for details).

**Still needed:**
- [ ] The three real IDs (GA4 property, Meta Pixel, Clarity project — Karla's own, not Summit's)
- [ ] Once IDs are in, confirm the Kiwify side: does its own pixel/checkout page pick up the
      `utm_source`/`utm_medium`/`utm_content` now appended to `CHECKOUT_URL`, or does Kiwify need
      its own pixel configured separately for the purchase event to attribute back
- [ ] LGPD consent decision (see Watch out, below) — `trackingAllowed()` in `src/tracking.js`
      returns `true` unconditionally right now and is the single gate to change later

Right now the quiz has **no tracking of any kind** — no GA4, no Meta Pixel, no Clarity.
Confirmed 2026-09-15 by grepping both `src/` and the built bundle; the only Facebook strings
in there are React's license comments.

So nobody can currently answer:

- how many women start the test
- how many finish all 18 questions
- how many reach the offer block at the bottom of the result page
- how many click through to the Kiwify checkout

**Why it comes first:** if the low ticket sells badly, there is no way to tell a weak pitch
from a page nobody scrolled far enough to see. Until this exists, every CRO change is
unfalsifiable — including the ones proposed below.

### What needs doing

- [ ] **GA4** — property + `gtag` in `index.html`. Events worth having, given the funnel is
      one page with no URL changes: `quiz_start`, `quiz_complete`, `lead_submit`,
      `offer_viewed` (fires when the offer block scrolls into view), `checkout_click`.
- [ ] **Meta Pixel** — PageView plus a `Lead` event on form submit and `InitiateCheckout` on
      the Kiwify click. Needed before any paid traffic is pointed at this quiz.
- [ ] **Microsoft Clarity** — session recordings and heatmaps. The most useful of the three
      here, because the open question is *where on a 2,469 px result page she stops scrolling*,
      and a heatmap answers that directly. Keys for the Summit project already exist in the
      vault `.env` (`CLARITY_TOKEN_SUMMIT`, `CLARITY_PROJECT_SUMMIT`) — Karla's quiz needs its
      **own** Clarity project, not those.
- [ ] Confirm each one actually fires before calling this done. Per
      `.claude/rules/seo-scope.md`, an unverified tag is the finding, not the fix — BDF had a
      conversion tag pointed at a dead URL that never fired once while the account looked fine.

### Watch out

- The result page never changes URL, so **page-view-only tracking will record a single
  pageview and nothing else.** All four funnel steps have to be custom events.
- The Kiwify checkout is a different domain, so the purchase itself won't attribute back
  without either Kiwify's own pixel settings or a UTM on the checkout URL. Decide which.
- LGPD: this is Brazilian traffic and the quiz collects name, email and WhatsApp on a page
  about mental health. Consent handling is a real question here, not a formality.

---

## Done 2026-09-15 — all four display changes

Approved by Lucas and shipped in commit `979d3db`. Preview of the original proposals:
https://claude.ai/artifact/38BL3uf5rZ1ZHvS1Cwk1B4

- [x] **Sticky offer bar**, gated on **3 minutes of watched video** (Lucas's call — engagement
      gate, not a timer on the page). Hides again when the real offer block is on screen.
- [x] ~~Click-to-play poster~~ — **built then reverted** the same day (`dd86c1c`). iOS blocks
      autoplay with sound, so it cost two taps and felt worse on slow connections. The embed
      loads directly again. Kept `youtube-nocookie`, which removes every doubleclick/ad request
      at no UX cost (measured: 19 requests with ad hosts vs 16 with none).
- [x] **Video widened** 280 → 330 px.
- [x] **Score de-duplicated** — "36" over "de 72 pontos".

Still unmeasurable until item 1 above is done: there is no analytics, so none of this can be
graded. `offer_viewed` and `checkout_click` should also distinguish the sticky bar from the
bottom button, otherwise the gate's effect is invisible.

## Waiting on Karla

- [ ] Re-recording the Raiz da Sobrecarga lesson — she uploaded a test take. Doesn't block
      anything on this site.
- [ ] Price: the page deliberately shows no price now, so 37 vs 47 is only a Kiwify setting.
      If she wants it back on the page, it's one line under the button.
