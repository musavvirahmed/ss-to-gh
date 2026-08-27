# Handoff — 2026-08-27 Apex canonical hostname

## Where things stand

Resolved [Apex vs www, HTTPS, and redirects on Cloudflare Pages?](https://github.com/musavvirahmed/ss-to-gh/issues/13) on map [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1).

- **Canonical hostname:** `https://musavvir.info` (apex)
- Always Use HTTPS; www→apex **301** (path+query via Bulk Redirects); HSTS ~6 months, no preload / no `includeSubDomains`
- `*.pages.dev` left reachable for checks
- Glossary **Canonical hostname** in `CONTEXT.md`; ADR `docs/adr/0004-apex-canonical-hostname.md`
- Cutover fog sharpened: Cloudflare zone + nameservers, Pages custom domain, Bulk Redirects, Always Use HTTPS, HSTS

## Do next

Load the map. Claim **one** unblocked, unassigned frontier ticket. Plan, don't ship production site code.

Likely takeable (verify assignees / blockers):

- [Pixel-identical clone, or content-and-layout equivalent?](https://github.com/musavvirahmed/ss-to-gh/issues/2) — often already claimed
- [Throwaway HTML clone: does this look like musavvir.info?](https://github.com/musavvirahmed/ss-to-gh/issues/6) — prototype; depends on fidelity decision

## Suggested skills

- `/wayfinder`
- `/grilling` + `/domain-modeling` for grilling tickets
- `/prototype` for the HTML clone ticket
- `/wizard` for Squarespace / Porkbun / Cloudflare dashboards
- `/handoff` at session end into `docs/handoffs/`
