# Publish tree Playwright pixel gate (2026-08-27)

Ticket: [Visual gate on Publish tree](https://github.com/musavvirahmed/ss-to-gh/issues/23)

## What ran

1. `npm run serve:public` — Publish tree at `public/` on `http://127.0.0.1:4173/`.
2. Gate: `npm run visual:gate` (defaults to `http://127.0.0.1:4173`, same port as `serve:public`).

## Result: **FAIL 21/21** (Playwright) — **Visual waive** (human)

| Width | Outcome |
|------:|---------|
| 320–767 | size mismatch (page height −1 to −85px; clone shorter than live baseline) |
| 768–1200 | pixel ratio **5.0–6.3%** (limit 0.5%) |
| 1440 | size mismatch (941 vs 942) |

Diff/actual PNGs (local, not committed): `visual/diffs/{width}w-{diff,actual}.png`.

## Likely causes

Same residual class as [throwaway clone gate](throwaway-clone-pixel-gate.md): hand-drawn highlight paths vs live TextShape, font metric drift (narrow widths), full-page height before pixelmatch runs.

Publish-tree-specific: **Libre Baskerville via Google Fonts** (`ital,wght@0,700;1,400`) replaces Squarespace CDN per ADR-0006 — italic heading metrics differ slightly from live Aktiv/Libre stack frozen in baselines.

## Waive

Promoted content is the throwaway clone after strip ([#16](https://github.com/musavvirahmed/ss-to-gh/issues/16)); human flip-book + overlay + eyeball **Pass** from [Throwaway HTML clone: does this look like musavvir.info?](https://github.com/musavvirahmed/ss-to-gh/issues/6) and [Freeze baselines and run Playwright pixel gate on the throwaway clone](https://github.com/musavvirahmed/ss-to-gh/issues/15) still holds on `serve:public`. Musa **Visual waive** 2026-08-27 — automated gate residual accepted for Publish tree; re-eyeball italic headings noted in ADR-0006.
