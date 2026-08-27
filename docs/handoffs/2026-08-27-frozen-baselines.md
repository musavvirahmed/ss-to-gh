# Handoff — 2026-08-27 Frozen baselines + pixel gate

## Where things stand

Resolved [Frozen baselines + Playwright pixel gate (≤0.5%)](https://github.com/musavvirahmed/ss-to-gh/issues/14) on map [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1).

- 21 frozen baselines in `visual/baselines/{width}w.png` from live `site.css` `@media` widths (≥320px) + 1440
- Gate: `npm run visual:gate` with `CLONE_URL`; fail if differing pixels > 0.5%
- Smoke (live vs baselines) passed after capture
- Docs: `visual/README.md`, `visual/breakpoints.json`

## Do next

Load the map. Claim **one** unblocked, unassigned frontier ticket.

Likely takeable:

- [Throwaway HTML clone: does this look like musavvir.info?](https://github.com/musavvirahmed/ss-to-gh/issues/6) — prototype; may already be in progress under `prototypes/throwaway-html-clone/` (uncommitted as of this handoff). When ready: `CLONE_URL=… npm run visual:gate`.

Fog still open on the map: cutover runbook; later public case-study map.

## Suggested skills

- `/wayfinder`
- `/prototype` for the HTML clone ticket
- `/wizard` for Squarespace / Porkbun / Cloudflare dashboards
- `/handoff` at session end into `docs/handoffs/`
