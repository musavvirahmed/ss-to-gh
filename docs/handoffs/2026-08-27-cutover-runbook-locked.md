# Handoff — 2026-08-27 cutover runbook locked

## Where things stand

Resolved [Cutover runbook — ordering, go/no-go, and when to cancel Squarespace?](https://github.com/musavvirahmed/ss-to-gh/issues/17) on map [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1).

- ADR `docs/adr/0005-cutover-runbook.md`; glossary **Cutover**, **Go/no-go gate** in `CONTEXT.md`
- Research checklist aligned to Bulk Redirects in `docs/research/cutover-mechanics.md`
- **Sequence:** pre-stage CF → NS cutover (go-live) → smoke-test → cancel SS website immediately → pixel gate → Porkbun transfer (Tucows link) → disable SS domain auto-renew

Cutover fog is cleared. Frontier is **[Generate cutover wizard (Cloudflare, Porkbun, Squarespace dashboards)](https://github.com/musavvirahmed/ss-to-gh/issues/19)** — unblocked, unclaimed. Still a `wayfinder:task`; generate at execute time via `/wizard`, not before production Site exists.

Remaining fog: production Site content layout → `/to-spec`; Case study task after cutover + 15d stable.

Still plan-only: no production cutover execution.

## Do next

Load the map. Either:

1. Claim **#19** and run `/wizard` when ready to execute cutover (likely after `/to-spec` + implement), or
2. If map frontier is effectively empty for decisions, consider `/to-spec` on production Site content layout.

Local branch `research/cutover-mechanics` has uncommitted `docs/research/cutover-mechanics.md`, ADR-0005, CONTEXT updates — commit/push when ready.

## Suggested skills

- `/wayfinder` (work the map)
- `/wizard` for #19 (at execute time)
- `/to-spec` when Site content layout is the frontier
