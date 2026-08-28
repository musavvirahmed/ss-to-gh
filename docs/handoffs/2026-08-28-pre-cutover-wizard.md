# Handoff — 2026-08-28 Pre-cutover wizard (#25)

## Where things stand

Map: [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1).

Session target: [Pre-cutover DNS and domain staging](https://github.com/musavvirahmed/ss-to-gh/issues/25) — **claimed**, wizard authored, **not closable** until human runs it.

| Artifact | Status |
|----------|--------|
| `scripts/pre-cutover-wizard.sh` | **New** — 6-stage wizard scoped to ADR-0005 pre-NS gate |
| `scripts/cutover-wizard.sh` | Unchanged stages 1–12; stage 6 notes pre-cutover wizard for #25-only |
| Blocker [#24 Cloudflare Pages production deploy](https://github.com/musavvirahmed/ss-to-gh/issues/24) | Closed — `https://ss-to-gh.pages.dev` smoke 3/3 |

## Stages (pre-cutover-wizard.sh)

| # | Stage | Writes to `.env` |
|---|-------|------------------|
| 1 | Squarespace: backup DNS | `CUTOVER_DNS_BACKED_UP=yes` |
| 2 | Cloudflare: add zone | `CF_NS_1`, `CF_NS_2` |
| 3 | Cloudflare: Jellyfish mail DNS (grey cloud) | `CUTOVER_MAIL_DNS=yes` |
| 4 | Cloudflare Pages: custom domains | `PAGES_DEV_URL` |
| 5 | Cloudflare: Bulk Redirect www→apex | `CUTOVER_WWW_REDIRECT=yes` |
| 6 | Go/no-go: pre-NS | runs `pages:smoke`, `dig MX @CF_NS_1`, flip-book gate → `CUTOVER_PRE_NS_GATE=passed` |

Stage 6 does **not** prompt for nameserver cutover. Go-live is [#26](https://github.com/musavvirahmed/ss-to-gh/issues/26) via `cutover-wizard.sh` stage 7+.

## Do next

1. Human: `./scripts/pre-cutover-wizard.sh` from repo root.
2. Close #25 when all acceptance boxes pass.
3. `/wayfinder` on [Execute cutover go-live](https://github.com/musavvirahmed/ss-to-gh/issues/26).

## Suggested skills

- `/wizard` — already done for #25
- `/wayfinder` — after #25 closes
