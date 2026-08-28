# Throwaway clone Playwright pixel gate (2026-08-27)

Ticket: [Freeze baselines and run Playwright pixel gate on the throwaway clone](https://github.com/musavvirahmed/ss-to-gh/issues/15)

## What ran

1. Re-froze 21 baselines from `https://musavvir.info/` via `npm run visual:capture` into `visual/baselines/` (widths from `visual/breakpoints.json`).
2. Smoke: `npm run visual:smoke` → **pass 21/21** (live vs fresh baselines; max noise ~0.002%).
3. Gate: `CLONE_URL=http://127.0.0.1:4173 npm run visual:gate` against `prototypes/throwaway-html-clone` (branch `prototype/throwaway-html-clone`, `npm run prototype:clone`).

## Result: **FAIL 21/21** (Playwright) — **Visual waive** (human)

| Width | Outcome |
|------:|---------|
| 320–767 | size mismatch (page height ±1–48px; clone often shorter) |
| 768–1200 | pixel ratio **5.4–7.3%** (limit 0.5%) |
| 1440 | size mismatch (942 vs 941) |

Post-session: per-line highlight fix in `highlights.js` (`getClientRects` → one TextShape per wrapped line). Musa **Visual waive** 2026-08-27 — flip-book/overlay/eyeball pass holds; automated gate residual accepted for throwaway prototype.

Diff/actual PNGs (local, not committed): `visual/diffs/{width}w-{diff,actual}.png`.

## Likely causes (eyeball of 768w)

- Hand-drawn highlight / underlineCurve path templates still approximate vs live TextShape (scribble, say-hello span).
- Minor full-page height drift at narrow widths (font metrics / spacing), which trips the gate before pixelmatch.
- ~~Wrapped “growth hacking” underline used union rect (fixed: per-line fragments).~~

## Waive

Human flip-book + overlay + eyeball **Pass** on [Throwaway HTML clone: does this look like musavvir.info?](https://github.com/musavvirahmed/ss-to-gh/issues/6). Musa confirmed visual pass 2026-08-27 after per-line underline fix. ADR `docs/adr/0003-pixel-identical-clone.md` Visual waive recorded on ticket #15.
