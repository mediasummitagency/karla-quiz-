# Karla Quiz — To Do

Open work for this project. Finished items move to a session summary in
`_workspace/Work-sessions/` and come off this list.

---

## 1. Set up Meta Pixel, Microsoft Clarity and GA4

**Status:** not started · **Added:** 2026-09-15 · **Blocks:** every CRO change below

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
- [x] **Click-to-play poster** replacing the YouTube iframe. Posters are served from
      `public/posters/`, so nothing third-party loads until she taps.
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
