# Handoff — 2026-08-27 cutover go-live (#26 blocked)

## Where things stand

Map: [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1).

Session target: [Execute cutover go-live](https://github.com/musavvirahmed/ss-to-gh/issues/26) — **not takeable yet** (2 open blockers).

| Ticket | Status | Blocks #26? |
|--------|--------|-------------|
| [Pre-cutover DNS and domain staging](https://github.com/musavvirahmed/ss-to-gh/issues/25) | Open, unblocked (`#24` closed) | Yes |
| [Commit updated résumé PDF at /s/musa-resume-2025.pdf](https://github.com/musavvirahmed/ss-to-gh/issues/21) | Open, claimed by musavvirahmed | Yes |
| [Cloudflare Pages production deploy](https://github.com/musavvirahmed/ss-to-gh/issues/24) | Closed — Git deploy + smoke 3/3 on `https://ss-to-gh.pages.dev` | — |

Repo has a placeholder PDF at `public/s/musa-resume-2025.pdf` (673 KB); `#21` needs Musa's **current** résumé committed before NS flip (ADR-0005 go/no-go).

## Path to #26

1. **Close #21** — provide updated résumé PDF; agent commits to `public/s/musa-resume-2025.pdf`.
2. **Close #25** — human runs `./scripts/cutover-wizard.sh` stages 1–6 (DNS backup → CF zone → Jellyfish mail → Pages custom domains → Bulk Redirect → pre-NS go/no-go on `*.pages.dev`).
3. **Execute #26** — same wizard, stages 7–12 (NS cutover = go-live → verify TLS → cancel SS website → unlock + Porkbun transfer → Tucows confirm).

Runbook: `docs/adr/0005-cutover-runbook.md`. Fix-forward only; no NS rollback.

## Do next

1. Confirm or replace résumé PDF for `#21`.
2. Run cutover wizard through stage 6; close `#25` when acceptance criteria pass.
3. Re-run `/wayfinder` on `#26` (or claim and execute stages 7–12).

## Suggested skills

- `/wizard` (cutover wizard already at `scripts/cutover-wizard.sh`)
- `/wayfinder` (after blockers close)
- `/handoff`
