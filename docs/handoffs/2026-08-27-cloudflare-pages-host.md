# Handoff — 2026-08-27 Cloudflare Pages host

## Where things stand

Resolved [Cloudflare Pages vs GitHub Pages vs GitLab Pages from a private repo?](https://github.com/musavvirahmed/ss-to-gh/issues/4) on map [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1).

- **Host:** Cloudflare Pages ← private `musavvirahmed/ss-to-gh`
- Not GitHub Pages (Free / 422) or GitLab Pages
- Glossary **Host** in `CONTEXT.md`; ADR `docs/adr/0001-cloudflare-pages-host.md`
- Fog graduated: [Apex vs www, HTTPS, and redirects on Cloudflare Pages?](https://github.com/musavvirahmed/ss-to-gh/issues/13)

## Do next

Load the map. Claim **one** unblocked, unassigned frontier ticket. Plan, don't ship production site code.

Likely takeable (check assignees / blockers first):

- [Pixel-identical clone, or content-and-layout equivalent?](https://github.com/musavvirahmed/ss-to-gh/issues/2) — may already be claimed
- [Apex vs www, HTTPS, and redirects on Cloudflare Pages?](https://github.com/musavvirahmed/ss-to-gh/issues/13) — new, unclaimed grilling
- [Throwaway HTML clone: does this look like musavvir.info?](https://github.com/musavvirahmed/ss-to-gh/issues/6) — prototype; check blockers (#2 etc.)
- [Transfer musavvir.info to Porkbun, or DNS-only at Squarespace?](https://github.com/musavvirahmed/ss-to-gh/issues/5) — may already be claimed; depends on unlock task

## Suggested skills

- `/wayfinder`
- `/grilling` + `/domain-modeling` for grilling tickets
- `/prototype` for the HTML clone ticket
- `/wizard` for Squarespace / Porkbun / Cloudflare dashboards
- `/handoff` at session end into `docs/handoffs/`
