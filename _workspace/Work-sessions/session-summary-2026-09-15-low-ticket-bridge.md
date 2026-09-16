# Session Summary — 2026-09-15 — Ponte do teste gratuito para o low ticket

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

## Not deployed

Changes are uncommitted on `main`. Pushing to `main` triggers the Hostinger FTP deploy via GitHub
Actions, so the push is Lucas's call.
