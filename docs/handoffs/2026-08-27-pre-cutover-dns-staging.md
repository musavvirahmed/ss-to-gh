# Handoff — 2026-08-27 Pre-cutover DNS and domain staging (#25)

## Where things stand

Map: [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1).

Session target: [Pre-cutover DNS and domain staging](https://github.com/musavvirahmed/ss-to-gh/issues/25) — **claimed**, **not closable** until human completes wizard stages 1–6.

| Check | Result |
|-------|--------|
| Blocker [Cloudflare Pages production deploy](https://github.com/musavvirahmed/ss-to-gh/issues/24) | Closed — Git deploy + smoke 3/3 on `https://ss-to-gh.pages.dev` |
| `npm run pages:smoke` | **3/3 pass** (homepage, résumé PDF, custom 404) |
| `CLONE_URL=https://ss-to-gh.pages.dev npm run visual:gate` | **FAIL 21/21** — not a pre-NS gate per ADR-0005; Visual waive already recorded on publish tree (#23) |
| Public `dig MX musavvir.info` | Still resolves via **Squarespace NS** (Jellyfish hosts) — expected until CF zone is Pending/Active |
| `.env` cutover flags (`CUTOVER_*`, `CF_NS_*`) | **Absent** — `./scripts/cutover-wizard.sh` not yet run for this effort |
| Repo-side config for #25 | **Complete** — wizard, smoke script, ADR-0005 checklist all in place |

## What closes #25

Human runs `./scripts/cutover-wizard.sh` **stages 1–6 only** (stop before NS cutover):

1. **Squarespace: backup DNS** — screenshot full record list
2. **Cloudflare: add zone** — Free plan; capture two CF nameservers to `.env`
3. **Cloudflare: Jellyfish mail DNS** — MX×3, SPF TXT, mail/webmail/autodiscover/smtp/imap A — all **grey cloud**
4. **Cloudflare Pages: custom domains** — attach `musavvir.info` + `www.musavvir.info` (Pending OK)
5. **Cloudflare: Bulk Redirect** — `https://www.musavvir.info/*` → `https://musavvir.info/${1}` 301 (defer to post-NS if Pending blocks save)
6. **Go/no-go: pre-NS** — flip-book + overlay on `*.pages.dev`; confirm Jellyfish records in CF dashboard; confirm ready for NS flip

Acceptance criteria on the ticket map 1:1 to those stages. ADR: `docs/adr/0005-cutover-runbook.md`.

## Parallel track (blocks #26, not #25)

[Commit updated résumé PDF at /s/musa-resume-2025.pdf](https://github.com/musavvirahmed/ss-to-gh/issues/21) — placeholder PDF ships today; Musa's current résumé needed before [Execute cutover go-live](https://github.com/musavvirahmed/ss-to-gh/issues/26).

## Do next

1. Run `./scripts/cutover-wizard.sh` through stage 6; close #25 when all acceptance boxes pass.
2. Provide updated résumé for #21 (can run in parallel).
3. `/wayfinder` on [Execute cutover go-live](https://github.com/musavvirahmed/ss-to-gh/issues/26) for stages 7–12 (NS flip = go-live).

## Suggested skills

- `/wizard` — cutover wizard already at `scripts/cutover-wizard.sh`
- `/wayfinder` — after #25 closes
