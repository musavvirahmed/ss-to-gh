# Handoff — 2026-08-27 Porkbun registrar

## Where things stand

Resolved [Transfer musavvir.info to Porkbun, or DNS-only at Squarespace?](https://github.com/musavvirahmed/ss-to-gh/issues/5) on map [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1).

- **Registrar:** Porkbun (transfer). Not DNS-only at Squarespace.
- Mail on the name: nice-to-have; brief breakage OK.
- Glossary **Registrar** in `CONTEXT.md`; ADR `docs/adr/0002-porkbun-registrar.md`.

## Do next

Load the map. Claim **one** unblocked, unassigned frontier ticket. Plan, don't ship production site code.

Likely takeable (check assignees / blockers first):

- [Pixel-identical clone, or content-and-layout equivalent?](https://github.com/musavvirahmed/ss-to-gh/issues/2) — may already be claimed
- [Apex vs www, HTTPS, and redirects on Cloudflare Pages?](https://github.com/musavvirahmed/ss-to-gh/issues/13) — grilling, unclaimed
- [Throwaway HTML clone: does this look like musavvir.info?](https://github.com/musavvirahmed/ss-to-gh/issues/6) — prototype; check blockers
- [Confirm Domain Lock is unlockable (no CoR / Can’t unlock) for musavvir.info](https://github.com/musavvirahmed/ss-to-gh/issues/12) — may already be claimed; unlock is HITL/wizard material

## Suggested skills

- `/wayfinder`
- `/grilling` + `/domain-modeling` for grilling tickets
- `/prototype` for the HTML clone ticket
- `/wizard` for Squarespace / Porkbun / Cloudflare dashboards
- `/handoff` at session end into `docs/handoffs/`
