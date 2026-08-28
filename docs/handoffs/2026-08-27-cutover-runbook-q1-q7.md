# Handoff — 2026-08-27 cutover runbook Q1–Q7 locked

## Where things stand

[Cutover runbook — ordering, go/no-go, and when to cancel Squarespace?](https://github.com/musavvirahmed/ss-to-gh/issues/17) was already closed; Musa confirmed Q1–Q7 in chat. Artifacts amended to match (supersedes prior ADR wording that put pixel gate before Porkbun transfer).

**Locked runbook (summary):**

1. Disable SS website auto-renew now.
2. Start Porkbun transfer in parallel with CF zone + mail + Pages prep.
3. Go/no-go: production Pages; apex + www Active in CF; mail in zone; flip-book + overlay on production URL.
4. NS cutover at Squarespace = go-live.
5. Cancel SS website immediately after go/no-go.
6. Rollback: repoint NS + restore [#8](https://github.com/musavvirahmed/ss-to-gh/issues/8) DNS; post-cancel → re-subscribe or `*.pages.dev`.

**Updated:** `docs/adr/0005-cutover-runbook.md`, `CONTEXT.md`, `docs/research/cutover-mechanics.md` checklist + decisions table, map #1 gist, #17 amendment comment.

**Frontier:** [Generate cutover wizard (Cloudflare, Porkbun, Squarespace dashboards)](https://github.com/musavvirahmed/ss-to-gh/issues/19) — blocked only until execute time; still a `wayfinder:task`, not a decision ticket.

**Remaining fog:** production Site content layout → `/to-spec`; Case study task after cutover + 15d stable.

## Do next

Load map. Either `/to-spec` on production Site content layout, or claim **#19** + `/wizard` when ready to execute cutover (after production site exists).

## Suggested skills

- `/wayfinder`
- `/to-spec`
- `/wizard` (for #19 at execute time)
