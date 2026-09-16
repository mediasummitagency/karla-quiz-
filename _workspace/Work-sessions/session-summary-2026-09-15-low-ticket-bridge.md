# Session Summary — 2026-09-15 — Ponte do teste gratuito para o low ticket

**Session ended:** 2026-09-15 20:58 EDT

## What Karla asked for

Source: WhatsApp voice note `WhatsApp Ptt 2026-09-15 at 19.04.07.ogg` (93s, pt-BR), plus her
written messages of 2026-09-03 and 2026-09-04.

Transcript of the voice note (verbatim, Gemini + hand check):

> Ô, vamos lá. Fiz um low ticket, que eu vou pôr 37 ou 47 reais, sei lá. Enfim, ele é a
> continuidade daquele teste gratuito que a gente tem. A pessoa respondendo o teste gratuito, eu
> vi lá que tem o resultado, a escrita, tem o vídeo e a pessoa vai ter lá no final para poder me
> chamar. Só que agora a gente vai entrar aqui, em vez de me chamar, a pessoa vai clicar no botão
> para adquirir o low ticket, que é esse "Raiz da Sobrecarga". Então, eu te mandei algumas
> mensagens aqui que é o que você vai colocar na mensagem depois do vídeo. Porque, vamos supor, a
> pessoa fez o teste gratuito, ela teve o resultado dela, aí tem o vídeo, e embaixo, depois do
> vídeo, você vai colocar esse: "Você já descobriu o quanto está sobrecarregada, mas o seu nível
> de sobrecarga responde apenas uma parte da pergunta". E aí lá embaixo, em vez da pessoa ter o
> botão de estar escrito "quero falar com a Karla", vai estar escrito "Quero descobrir minha
> raiz". Aí vai entrar a página aqui da Kiwify, que é o checkout para poder fazer a compra do low
> ticket, entendeu? Eu acho que é isso que eu te falei, que eu preciso de você. E aí, dentro do...
> Não, o low ticket já está prontíssimo, pronto para rodar, só que eu vou regravar a aula dele,
> porque eu gravei de teste, subi lá e esqueci que eu tenho que regravar ela só para poder ficar
> mais profissional, vamos falar assim.

Funnel context (her "esteira de produtos"): Conteúdo → Teste gratuito → **Raiz da Sobrecarga®
(low ticket)** → Método Mulher 80/20 (médio) → Psicoterapia individual (high). The quiz result
page was ending at the high-ticket step; it now ends at the low-ticket step.

## What changed

`src/App.jsx`
- Removed `WHATSAPP_PHONE` and `handleWhatsAppClick`; added `CHECKOUT_URL`
  (`https://pay.kiwify.com.br/zftB1uv`), `CHECKOUT_PRICE` and `handleCheckoutClick`.
- Replaced the `cta-nudge` + "Quero conversar com a Karla" block with an `offer-bridge` section
  carrying Karla's copy verbatim from her 2026-09-04 message, the button "Quero descobrir minha
  raiz", and the price line.
- Position: after the video and the Karla signature, as the last block on the result page. Applies
  to all four result levels (Leve / Alerta / Elevada / and the fourth), since the block sits
  outside the level-specific branches.

`src/index.css`
- Added an `.offer-bridge` group reusing the existing tokens: uppercase letterspaced heading,
  body paras matched to `.devolutiva-para`, and the "por que eu continuo funcionando" line as a
  display-italic pull quote with an accent left rule. Kept the existing `cta-button`/`cta-result`
  and the bouncing arrow untouched.

## Verified

- `npm run build` passes.
- Drove the full quiz headless (18 answers → lead form → result), screenshotted the new block, and
  confirmed the button opens `https://pay.kiwify.com.br/zftB1uv`.
- The lead webhook was route-blocked during the test, so no fake lead hit Karla's sheet or the
  WhatsApp Zap.

## Open / needs Karla

- **Price is no longer shown on the page.** Built at R$47 first, then Lucas asked for the
  "R$47 • Acesso digital" line to be removed, so `CHECKOUT_PRICE` and `.offer-bridge-price` are
  gone and the button is the last element. Sidesteps the 37-vs-47 question entirely — the price
  now only appears on the Kiwify checkout. If Karla wants it back on the page, it is a new line
  under the button.
- **The WhatsApp button is gone from the quiz entirely**, which is what she asked for. There is now
  no direct path from the free test to psicoterapia; it routes through the low ticket. Consistent
  with her own esteira, but worth confirming she means it.
- She is re-recording the low-ticket aula. Doesn't block this page.

## Spacing fix in the same pass

`.result-video-wrapper` had `margin: 0 auto 32px` and `.devolutiva-para:last-child` has
`margin-bottom: 0`, so the video sat flush against the paragraph above it with a zero gap. Set to
`margin: 40px auto 32px`. One shared class, so it lands on all four levels at once — measured at
40px on Leve, Alerta, Elevada and Crítica.

## Second pass — the four display changes (commit `979d3db`)

Lucas reviewed a CRO preview (https://claude.ai/artifact/38BL3uf5rZ1ZHvS1Cwk1B4) and approved all
four, with one change to the first: the sticky offer bar appears only after **3 minutes of
watched video**, not on scroll position.

- **Sticky bar**, gated on playback. Counts only ticks while the YT player reports `PLAYING`, so
  seeking ahead does not buy it. Hides again when the real offer block is in view.
- **Click-to-play poster** replacing the iframe. Posters live in `public/posters/<videoId>.jpg`;
  nothing third-party loads until she taps, verified on all four levels. The old embed fired 13
  requests on load including `googleads.g.doubleclick.net`.
- **Video 280 → 330 px**, **score de-duplicated**.

Two things worth remembering. The bar had to be **portalled to `document.body`** — the result
section carries a transform from its entry animation, and a transformed ancestor becomes the
containing block for `position: fixed`, which parked the bar 1587px down its own section. And
YouTube's thumbnails for these vertical videos come back 1280×720 with the real frame
pillarboxed in a blurred strip, so each poster is the centre `H*9/16` crop.

Verified end-to-end against a real YouTube player with the threshold temporarily at 5s, then
restored to 180.

## Third pass — the poster revert (commit `dd86c1c`)

Lucas tested on a phone: the click-to-play poster cost **two taps**. iOS blocks autoplay with
sound, so tapping the poster swapped in the iframe and YouTube then showed its own play button —
worse on a slow connection. Reverted to the embed loading directly.

Kept the two parts that cost nothing: `youtube-nocookie` (measured 19 requests incl.
`googleads.g.doubleclick.net` vs 16 and no ad hosts) and `enablejsapi`, which is what the
3-minute gate counts through. `public/posters/` and its CSS removed.

**My test was at fault, and that is the lesson:** the first pass launched Chrome with
`--autoplay-policy=no-user-gesture-required`, which hid the bug completely.

## Files changed — all committed

| File | What |
|---|---|
| `src/App.jsx` | Offer bridge, checkout handler, reveal-on-scroll, watch-time gate, sticky bar (portalled), video embed |
| `src/index.css` | `.offer-bridge`, `.offer-sticky`, `.reveal-now`, video width 330px, score scale |
| `TODO.md` | New — analytics gap first, display changes done, poster revert noted |
| `learnings.md` | Three project lessons |
| `_workspace/Work-sessions/` | This file |
| `upload-hostinger-2026-09-15/` | Upload bundle — gitignored, regenerable from HEAD |

Nine commits, `bec3eb2` → `7e66d60`. **Unpushed** — pushing `main` fires the Hostinger deploy.

## Verified how

Headless Chromium driving the real quiz — 18 answers, lead form, result page — with the lead
webhook route-blocked every run, so **no test lead ever reached Karla's sheet or WhatsApp Zap**
(abort count asserted non-zero, not assumed).

- **All four levels** (Leve 0, Alerta 36, Elevada 54, Crítica 72), run against the built upload
  bundle, not the dev server: correct video per level, video 330px, score reads "de 72 pontos",
  no poster element, no ad/tracking hosts, CTA text correct.
- **Blank-page fix:** impatient path (scroll at 400ms) now shows the offer at opacity 1; patient
  path still staggers video 2.5s / offer 3.7s. Both asserted.
- **Watch-time gate:** end-to-end against a real YouTube player with the threshold temporarily at
  5s — bar absent before play, appears after playback, hides when the real offer scrolls in —
  then restored to 180 and rebuilt.
- **Video durations** pulled from YouTube (8:13–9:59) to confirm a 3-min gate is reachable.
- `npm run build` clean; every file in the upload bundle served over HTTP and returned 200.

**Not verified:** nothing has been tested on a real iOS/Android device by me — the two-tap bug
was found by Lucas on a phone, not by my tests. Anything autoplay- or touch-related should be
checked on hardware before trusting it.

## Open / not done

- **No analytics of any kind** — no GA4, no Meta Pixel, no Clarity. Confirmed by grepping `src/`
  and the built bundle. Every CRO change this session is therefore unmeasurable. This is item 1
  in `TODO.md` and the single most valuable next thing.
- **Not deployed.** Nine commits sit unpushed on `main`; the upload bundle is built and waiting.
- **Karla:** re-recording the Raiz da Sobrecarga aula; price (37 vs 47) is now only a Kiwify
  setting since the page shows no price.

## Next session starts here

`websites/karla-quiz/TODO.md` — item 1: add GA4, Meta Pixel and Clarity, with custom events
(`quiz_start`, `quiz_complete`, `lead_submit`, `offer_viewed`, `checkout_click`). The result page
never changes URL, so pageview-only tracking records one hit and nothing else; and
`checkout_click` must distinguish the sticky bar from the bottom button or the 3-minute gate's
effect stays invisible.

**State as of 2026-09-15 20:58 EDT**
