# Handoff — 2026-09-01 Tier D → C fallback bar

## Where things stand

Resolved [When is tier D impossible — define fallback to tier C?](https://github.com/musavvirahmed/ss-to-gh/issues/31) on map [Interactive profile photo (cursor-tracking mugshot)](https://github.com/musavvirahmed/ss-to-gh/issues/28).

- Glossary: `CONTEXT.md` (Tier D, Tier C, Wink tone, Static PNG fallback)
- ADR: `docs/adr/0009-tier-d-fallback-bar.md`
- Pass/fail bars for prototype [#33](https://github.com/musavvirahmed/ss-to-gh/issues/33) are defined; [#34](https://github.com/musavvirahmed/ss-to-gh/issues/34) runs only if #33 fails after at most one #32 source upgrade

## Do next

Load map [#28](https://github.com/musavvirahmed/ss-to-gh/issues/28). Claim **one** unblocked frontier ticket.

Likely takeable:

- [Prototype: tier D 3D cursor-tracking portrait at homepage scale](https://github.com/musavvirahmed/ss-to-gh/issues/33) — unblocked; use `/prototype`
- [Asset source for the interactive portrait?](https://github.com/musavvirahmed/ss-to-gh/issues/32) — defer until #33 likeness fails on current PNG

Plan, don't ship production site code (parent map [#1](https://github.com/musavvirahmed/ss-to-gh/issues/1) cutover still owns v1).

## Suggested skills

- `/wayfinder`
- `/prototype` for #33
- `/grilling` + `/domain-modeling` for #32 (only if #33 likeness fails)
- `/handoff` at session end into `docs/handoffs/`
