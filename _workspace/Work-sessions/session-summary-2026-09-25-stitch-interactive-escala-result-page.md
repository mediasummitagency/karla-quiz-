# Session summary — 2026-09-25

**Session ended:** 2026-09-25 14:29 EDT

## What happened
The interactive Escala (name, "what fills your days", duration, 18 items in 3 parts with check-ins, optional open question) was stitched in front of Karla's 21-block result + offer page and is now **live on expectingwonders.com**. The free root reveal from the preview was left out, because Karla's brief (rule 41) keeps the Escala on "how much" and the paid Raiz on "why" (`decisions.md` 2026-09-25). Two rounds of Lucas's feedback went in: the context step became equal-sized stacked rows with real checkboxes, and Block 1 of the result was centered with no one-word last lines. A script now rebuilds the manual upload folder, and the Apps Script was updated to save the 3 new answers.

## Files changed
All committed and pushed to `origin/main` (public repo `mediasummitagency/karla-quiz-`):
- `src/App.jsx`, `src/index.css`: the stitch (`09128d1`), checkbox rows (`16e9106`), Block 1 centering + widow fix (`9384fdd`). Under the score there's a portrait card: context and duration, the top 3 statements, her open answer, and the CVV 188 note when item 18 is ≥ Frequentemente. The lead form no longer asks for the name twice.
- `scripts/build-upload.sh` (new): "rebuild the upload folder" recreates `upload-ready/to-upload/` + `to-upload.zip` (gitignored) with only the `public_html` files.
- `scripts/Code.gs`: now matches the **live** sheet. G "Última ação realizada" and H "Observação" are Karla's manual columns, left blank; Q1–Q18 go in I–Z; Contexto/Tempo/Resposta aberta in AA–AC. `OWNER_EMAIL = ''` (owner lead email off; Lucas's call, since WhatsApp covers it) (`af9a040`, `4548c65`).
- **Uncommitted, on purpose:** `_workspace/inputs/`, `_workspace/review/`. The repo is public and they hold Karla's brief and paid-product copy verbatim.

## Verified how
- `npm run build` passes. Playwright ran against `vite preview` with the webhook intercepted, driving intro → result at Leve/Crítica (390px) and Elevada (1280px): no page errors, 3 part breaks, correct badge, 4 CTAs, no horizontal scroll, CVV note only when expected, payload carries the 3 new fields. The checkbox rows are all 342×60 / 480×60 and toggle correctly. The orphan-word scan is clean apart from one false positive (the raised ® sign).
- Live: expectingwonders.com serves `index-DK0zEgl5.js` (the latest build, uploaded by hand by Lucas).
- `Code.gs`: a mock `doPost` run put every value under the right column of the live layout (A–F, G/H blank, I–Z, AA–AC).
- ⚠️ First Apps Script paste had the wrong column layout (the repo copy didn't know about G/H). Lucas rolled back to the previous deployment version before any lead arrived, then deployed the fixed script.
- **Not verified:** a real lead landing in the sheet after the fixed deploy (Lucas hasn't reported a test yet), a real phone, YouTube playback.

## Open / not done
- Lucas: one live test lead ("TESTE Lucas"), check G/H blank, I–Z aligned, AA–AC filled, then delete the row. The AC header reads "Resporta Aberta" (typo, cosmetic).
- The result email the script sends to the quiz taker is unchanged; confirm Karla's old script sent it too.
- Owed by Karla: sign-off on the combined version, GA4/Pixel/Clarity IDs (tracking is wired but off), LGPD consent call, real testimonials, product screenshots, Kiwify Pix/3x, and renaming the intro/`<title>` to "Escala de Sobrecarga Emocional" (her rule 2 bans "teste"; the intro still says "DIAGNÓSTICO GRATUITO" / "Quero fazer o teste").
- The root reveal lives on `preview/escala-interativa` (`4fcd51d`) if Karla ever wants it.
- **Confirmed: a push to `main` deploys to expectingwonders.com.** Today's Action runs uploaded 5 files each (~224 kB) ~20s after each push, and `/.ftp-deploy-sync-state.json` now returns 200 on the live domain (404 this morning). Lucas's manual uploads duplicated them. Decide with Lucas: rely on push, or keep uploading by hand (then the Action is redundant but harmless).

## Next session starts here
Ask Lucas whether the test lead landed correctly in Karla's sheet (columns I–Z and AA–AC), then send Karla the live link for sign-off along with the intro-rename question.
**State as of 2026-09-25 14:29 EDT**
