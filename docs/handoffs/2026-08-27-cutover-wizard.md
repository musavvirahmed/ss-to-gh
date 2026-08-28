# Handoff — 2026-08-27 cutover wizard

## Where things stand

[Generate cutover wizard (Cloudflare, Porkbun, Squarespace dashboards)](https://github.com/musavvirahmed/ss-to-gh/issues/19) **closed** on map [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1).

- Wizard: `scripts/cutover-wizard.sh` (12 stages; run `./scripts/cutover-wizard.sh`)
- Runbook locked in ADR `docs/adr/0005-cutover-runbook.md` per Musa's Q1–Q6 (supersedes prior parallel-transfer / rollback wording)
- Glossary **Cutover**, **Go/no-go gate** updated in `CONTEXT.md`

**Runbook summary:** pre-stage CF zone + Jellyfish mail + Pages + Bulk Redirect → go/no-go on `*.pages.dev` (no production Playwright) → NS cutover (go-live) → verify + TLS → cancel SS website immediately → same-day Porkbun transfer + Tucows confirm → fix-forward only (no NS rollback).

Cutover decision fog is cleared. Frontier for decisions is empty.

**Remaining fog:** production Site content layout in-repo → `/to-spec`; Case study task after cutover + 15d stable.

Still plan-only until `/to-spec` → `/to-tickets` → `/implement` — wizard is for execute time, not run now.

## Do next

Load the map. Run `/to-spec` on production Site content layout (promote throwaway clone vs rewrite), then `/to-tickets` → `/implement`. Run `./scripts/cutover-wizard.sh` only at cutover execute time.

## Suggested skills

- `/to-spec`
- `/to-tickets`
- `/implement`
- `/wizard` (wizard already authored; re-run skill only if runbook changes)
