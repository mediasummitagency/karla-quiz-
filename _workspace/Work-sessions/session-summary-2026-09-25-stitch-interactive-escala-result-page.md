# Session summary — 2026-09-25

**Session ended:** 2026-09-25 EDT

## What happened
Lucas asked to stitch the two pieces sent to Karla on 09-24 into the final product: the interactive Escala (branch `preview/escala-interativa`) in front of the 21-block result + offer page (`main`). Done in one commit on `main`. The free root reveal was left out (see decision below). Lucas also asked about deploying straight from Git via Hostinger's Git panel; it turned out the repo already auto-deploys from GitHub.

## Files changed
- `src/App.jsx`, `src/index.css`, `scripts/Code.gs`: commit `09128d1` on `main`. The flow is now intro → name → context chips → duration → Part 1/2/3 (6 items each, with a check-in between parts) → optional open question → e-mail + WhatsApp (the name is not asked twice) → result. Under the score card, a portrait card shows her context and duration, the 3 strongest statements, and her open answer, plus the CVV 188 note when item 18 is Frequentemente or Sempre. The root question step, the "Sua raiz mais forte" block and the percentage bars from the preview were **not** brought over; they stay on the preview branch. The webhook is ON and sends `contexto`, `tempo`, `resposta_aberta` too.
- `Code.gs` writes those 3 new fields after Q18, so no older column moves and the Zap (maps by name) is unaffected. **The live Apps Script is not updated.** Until someone pastes the new Code.gs and redeploys it, the 3 extra fields are silently dropped and everything else works as before. The existing sheet also needs the 3 header names typed into row 1 by hand (setupHeaders only runs on an empty sheet).
- `upload-hostinger-2026-09-25/`: manual upload bundle + zip + LEIA-ME (gitignored).

## Deploy path (answers "can we push from Git?")
- It already exists: `.github/workflows/deploy.yml` builds and FTP-syncs `dist/` to `/public_html/` on every push to `main`. It has uploaded real changes before (07-07 run: 5 files changed). expectingwonders.com is Karla's quiz; it currently serves the 09-15 manual bundle (`index-Bwg3RYr_.js`).
- Hostinger's own Git panel is the wrong tool here: it copies the repo as-is with no build step, so it would publish the Vite source, not the built site, and it needs an empty target folder.
- `main` is 14 commits ahead of origin. **Nothing pushed.** `git push` = live in about 30 seconds.

## Verified how
- `npm run build` passes.
- Playwright against `vite preview`, with the Google Script webhook intercepted (no real lead sent) and YouTube blocked. Leve at 390px, Crítica at 390px and Elevada at 1280px were driven from intro to result: zero page errors, 3 part breaks with the right counts, 2 lead inputs, name in headings, correct badge, 4 CTAs, no "teste" in the result, no horizontal scroll, CVV note only on Crítica. The payload carried nome, nivel, pontuacao, contexto, tempo, resposta_aberta and 18 answers.
- **Not verified:** a real phone, the live Apps Script accepting the new fields, YouTube playback.

## Open
- Karla has not explicitly signed off the combined version. Earlier open items still stand: GA4/Pixel/Clarity IDs, LGPD consent, testimonials, product shots, Kiwify Pix/3x, and renaming the intro/`<title>` to "Escala de Sobrecarga Emocional" (her rule 2 bans "teste"; the intro still says "DIAGNÓSTICO GRATUITO" and "Quero fazer o teste").
- If Karla wants the root reveal back, it's on `preview/escala-interativa` (`4fcd51d`).

## Next session starts here
Push `main` (or upload the 09-25 bundle), then run one real test on a phone and delete the test row from the sheet. Paste the new `scripts/Code.gs` into her Apps Script and redeploy.

## Update — same day
- Lucas uploaded `upload-ready/to-upload/` (from the new `scripts/build-upload.sh`) by hand; the live site serves `index-C14_UmUk.js`. `main` pushed to GitHub (`d15a204`), which also ran the FTP auto-deploy with the same build.
- `_workspace/inputs/` and `_workspace/review/` deliberately not committed: the repo is public and they hold Karla's brief and paid-product copy.
- Apps Script: the repo's `Code.gs` has a placeholder `OWNER_EMAIL`, so the live script was NOT replaced wholesale. Lucas got only the 3 new lines to paste under `row = row.concat(respostas);`, plus the instruction to redeploy as a new version of the existing deployment and add the 3 headers in Y1:AA1.
- Changed plan: Lucas asked for the whole script on the clipboard. Her real owner email isn't recorded anywhere, and Lucas chose to turn the owner email off (`OWNER_EMAIL = ''`, `af9a040`) because the WhatsApp Zap already alerts Karla. The full `Code.gs` went to his clipboard.
- ⚠️ First paste went wrong: Karla's live sheet has G "Última ação realizada" and H "Observação" (her manual follow-up), so Q1-Q18 are I-Z. The repo copy wrote answers from G. Caught from Lucas's screenshot before any lead arrived; Lucas rolled the deployment back to the previous version. `Code.gs` fixed (`G`/`H` left blank, new fields AA-AC) and a mock `doPost` run confirmed every value lands under its header. Lucas's AC header reads "Resporta Aberta" (typo, cosmetic).
