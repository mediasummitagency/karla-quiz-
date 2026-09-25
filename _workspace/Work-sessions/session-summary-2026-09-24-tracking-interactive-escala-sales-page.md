# Session summary — 2026-09-24

**Session ended:** 2026-09-24 13:30 EDT

## What happened
A saved reel about quiz funnels ("AI funnel": personal result → instant alert → nurture → retargeting) was applied to Karla first. Tracking went in, switched off until her IDs arrive. An interactive Escala preview was built on a separate branch. The result screen was rebuilt from Karla's 21-block brief (`_workspace/inputs/2026-09-24-karla-comando-pagina-resultado.md`) using the Version B design that she and Lucas picked. Lucas said it looked less polished than B, so it was restyled to B's type scale and components with no copy or block-order changes. Two standalone review files went to Lucas to send to Karla.

## Files changed
- `src/tracking.js` (new), `src/App.jsx`, `src/index.css`: committed on `main`. `9bc4339` adds tracking (GA4, Pixel and Clarity all have empty IDs, so nothing loads). `90379ca` is the 21-block result + offer page. `b448301` is the Version B polish. **Not pushed.** `main` is 12 commits ahead of `origin/main`, and pushing deploys to Hostinger.
- Branch `preview/escala-interativa` (`4fcd51d`): name step, "o que ocupa seus dias" chips, duration, 18 items in 3 parts with check-ins, root question, optional open question, root map on the result. Webhook is off on this branch. Scoring is unchanged. It still ends on the **old** result screen.
- `_workspace/review/2026-09-24/`: `resultado-personalizado-rascunho.md` (the 5 root texts, draft for Karla, in Portuguese), `raiz-da-sobrecarga-pagina-resultado.html` (standalone result page with a 4-level switcher), `escala-quiz-interativo.html` (standalone interactive quiz, webhook off), plus screenshots. Copies of both HTML files are in `~/Downloads`. **Uncommitted** (untracked `_workspace/`).
- `_workspace/inputs/2026-09-24-karla-comando-pagina-resultado.md`: Karla's brief, verbatim. **Uncommitted.**
- `TODO.md`, `learnings.md`: item 1 status updated by the tracking build, plus one lesson about `offer_viewed` needing its own observer. **Uncommitted**, mixed with the 09-23 edits.

## Verified how
- `npm run build` passed after every change.
- Tracking: with test IDs, headless Chromium saw the events fire in order in the GA4 dataLayer, fbq and the Clarity queue. With empty IDs, there were zero requests to googletagmanager, facebook or clarity.
- Result page: all 4 levels were driven in Playwright with `script.google.com` route-blocked. Score, badge and videoId were correct for Leve, Alerta, Elevada and Crítica. There are 4 CTAs, zero "teste" in the result text, and no horizontal scroll at 390px or 1280px. The sticky bar is hidden before block 5 and whenever a CTA block is on screen.
- Standalone files: both were opened from `file://` in Playwright. The result file's level switcher loads the right video per level, and the photo loads as base64. The quiz file was driven from intro to result with no page errors.
- **Not verified:** the YouTube videos actually playing (the sandbox has no YouTube access; iframe src was checked), a real phone, the Kiwify checkout accepting the UTM params, and any tracking against real GA4, Pixel or Clarity accounts.

## Open / not done
- **Waiting on Karla:** approval of the result page · the GA4, Meta Pixel and Clarity IDs (Clarity needs its own project) · the LGPD consent decision (`trackingAllowed()` in `src/tracking.js`) · whether Kiwify reads the UTMs · Pix and 3x on card enabled in Kiwify · real authorised testimonials (`TESTIMONIALS`) · product screenshots (`PRODUCT_SHOTS`) · a second Raiz video if one exists (`RAIZ_VIDEO_ID`) · whether to rename the intro screen and `<title>` to "Escala de Sobrecarga Emocional" · whether to bring back the "Sou Karla Arantes" bio block (Lucas chose to follow the brief) · tap chips or static cards for the 5 roots · approval of the root texts and the interactive steps.
- ⚠️ **Decision for Karla:** the interactive preview reveals her root for free, but the R$47 Raiz sells exactly "descobrir sua raiz", and her FAQ says the paid product starts with its own questionnaire. Recommendation: keep the interactive steps and drop the root reveal, or make it a teaser.
- **Merge:** once both are approved, the interactive steps from `preview/escala-interativa` go onto `main` in front of the new result page. The sheet (`scripts/Code.gs`) and the WhatsApp Zap then need columns for name, context, duration and open answer. The Zap maps columns by name.
- Nurture emails and retargeting (steps 3 and 4 of the reel) have not started. Retargeting needs the Pixel live first.

## Next session starts here
Read Karla's reply to the two HTML files. Put her IDs, testimonials and screenshots into the constants at the top of `src/App.jsx` and `src/tracking.js`, then push `main` once she approves (this deploys to Hostinger).
**State as of 2026-09-24 13:30 EDT**
