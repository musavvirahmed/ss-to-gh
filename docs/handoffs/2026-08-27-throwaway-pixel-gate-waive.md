# Handoff — 2026-08-27 Throwaway clone pixel gate (Visual waive)

## Where things stand

Resolved [Freeze baselines and run Playwright pixel gate on the throwaway clone](https://github.com/musavvirahmed/ss-to-gh/issues/15) on map [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1).

- Re-froze 21 baselines from live (`npm run visual:capture`); smoke pass 21/21.
- Playwright gate vs throwaway: **FAIL 21/21** (height drift narrow widths; ~5–7% pixel diff mid/desktop). Details: `docs/research/throwaway-clone-pixel-gate.md`.
- **Visual waive** (Musa): flip-book / overlay / eyeball pass holds after per-line highlight fix in `prototypes/throwaway-html-clone/highlights.js` (branch `prototype/throwaway-html-clone`).
- Frontier on map is **empty** — fog only: cutover runbook; case-study map; promote throwaway → production Site content → `/to-spec`.

## Do next

Load the map. No open frontier tickets. When ready to leave planning:

- `/to-spec` once production Site content layout is ticketed from fog
- `/wizard` for Squarespace / Porkbun / Cloudflare cutover when runbook is charted

## Suggested skills

- `/wayfinder` (chart fog into tickets or redraw destination)
- `/prototype` only if visual fidelity regresses
- `/wizard` for registrar/host dashboards
- `/handoff` at session end into `docs/handoffs/`
