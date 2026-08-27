# Handoff — 2026-08-27 Porkbun renewal research

## Where things stand

Resolved [Porkbun .info renewal vs current Squarespace spend](https://github.com/musavvirahmed/ss-to-gh/issues/9) on map [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1).

- Porkbun `.info` renewal/transfer: **USD 22.14/yr** (first-year reg sale $3.60 does not apply to transfer).
- Squarespace website **€132/yr + tax** (renews 16 Sep 2026) is the material saving vs free hosting + Porkbun domain.
- Domain expires **21 Apr 2027**. Details: `docs/research/porkbun-info-renewal.md` on `research/porkbun-info-renewal` (parallel write-up also on `research/porkbun-vs-squarespace-cost`).

Also gisted onto the map (was closed earlier, map lagging): [Squarespace transfer lock, auth code, and DNS/email records to copy](https://github.com/musavvirahmed/ss-to-gh/issues/8).

[Transfer musavvir.info to Porkbun, or DNS-only at Squarespace?](https://github.com/musavvirahmed/ss-to-gh/issues/5) is now **unblocked** (blockers #8 and #9 closed).

## Do next

Load the map. Claim **one** unblocked, unassigned frontier ticket. Still plan-don’t-do: no production site code.

Unblocked frontier examples:

- [Pixel-identical clone, or content-and-layout equivalent?](https://github.com/musavvirahmed/ss-to-gh/issues/2) (`wayfinder:grilling`) — may already be assigned
- [Transfer musavvir.info to Porkbun, or DNS-only at Squarespace?](https://github.com/musavvirahmed/ss-to-gh/issues/5) (`wayfinder:grilling`) — newly unblocked
- [Cloudflare Pages vs GitHub Pages vs GitLab Pages from a private repo?](https://github.com/musavvirahmed/ss-to-gh/issues/4) — check blockers (#11 closed)
- [Export avatar and resume from Squarespace assets](https://github.com/musavvirahmed/ss-to-gh/issues/10) (`wayfinder:task`, HITL)

Untracked `CONTEXT.md` may be sitting in the working tree from the Git-as-CMS grilling; confirm it belongs on `main` before committing it.

## Suggested skills

- `/wayfinder` (work the map)
- `/grilling` + `/domain-modeling` for grilling tickets (#2, #5, #4)
- `/wizard` for Squarespace / Porkbun dashboard steps when a task needs HITL
- `/handoff` at session end into `docs/handoffs/`
