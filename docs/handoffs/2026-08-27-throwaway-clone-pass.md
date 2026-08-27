# Handoff — 2026-08-27 Throwaway HTML clone pass

## Where things stand

Resolved [Throwaway HTML clone: does this look like musavvir.info?](https://github.com/musavvirahmed/ss-to-gh/issues/6) on map [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1).

- **Human visual gate: Pass** (Musa). Flip-book + overlay + eyeball.
- Throwaway artifact: `prototypes/throwaway-html-clone/` — `npm run prototype:clone` (custom server: `/`, `/compare.html`, custom 404, `/visual/baselines/`)
- Capture branch: `prototype/throwaway-html-clone` (keep off main except handoff/docs)
- Graduated: [Freeze baselines and run Playwright pixel gate on the throwaway clone](https://github.com/musavvirahmed/ss-to-gh/issues/15)

## Do next

Load the map. Claim **one** unblocked, unassigned frontier ticket.

Likely: [Freeze baselines and run Playwright pixel gate on the throwaway clone](https://github.com/musavvirahmed/ss-to-gh/issues/15) (`wayfinder:task`).

Still fog: cutover runbook; case-study map; how to promote throwaway → production Site content (then `/to-spec` when fog is gone).

## Suggested skills

- `/wayfinder`
- `/prototype` only if visual fidelity regresses
- `/wizard` for Squarespace / Porkbun / Cloudflare dashboards
- `/handoff` at session end into `docs/handoffs/`
