# Agent instructions

Private working repo for replacing Squarespace-hosted [musavvir.info](https://musavvir.info/) with an identical cheap static site. The live site is the destination; this repo is the harness.

Skills live in [`.agents/skills/`](.agents/skills/). Claude Code also sees them via [`.claude/skills`](.claude/skills) (symlink). Cursor, Codex, Copilot, and Gemini CLI load `.agents/skills/` at project level. Source and update notes: [`.agents/SKILLS-SOURCE.md`](.agents/SKILLS-SOURCE.md).

## Session protocol

Until the Wayfinder map is clear, **plan, don't do**: resolve decisions, not production site code.

1. Load the open issue labelled `wayfinder:map` (low resolution: Destination, Notes, Decisions so far, Not yet specified, Out of scope).
2. Claim **one** frontier ticket (`gh issue edit <n> --add-assignee @me`) before any work. Research tickets may run in parallel; grilling, prototype, and task tickets do not share a session.
3. Refer to every ticket **by its title**, with the number inside the name, never as a bare `#42`.
4. Resolve with the skill named by the ticket's `wayfinder:<type>` label. On close, gist the answer onto the map's Decisions so far.
5. End the session with `/handoff`. Also write that handoff into [`docs/handoffs/`](docs/handoffs/) and commit it (this repo overrides the skill's OS-temp default so another IDE can continue).

When the frontier is empty and fog is gone: `/to-spec` → `/to-tickets` → `/implement`. Registrar dashboards (Squarespace, Porkbun) use `/wizard`.

## Agent skills

### Issue tracker

GitHub Issues on `musavvirahmed/musavvir-info` via `gh`. See [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).

### Triage labels

Default five roles: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md).

### Domain docs

Single-context: `CONTEXT.md` at the repo root and `docs/adr/`. See [`docs/agents/domain.md`](docs/agents/domain.md). Create those files lazily when `/domain-modeling` resolves a term or decision.

## Suggested skills

- Unsure which skill: `/ask-matt`
- Chart or work the map: `/wayfinder`
- HITL decision: `/grill-with-docs` (pulls `/grilling` and `/domain-modeling`)
- Visual or behavioural question: `/prototype`
- External fact: `/research`
- Human-only dashboard steps: `/wizard`
- Continue in a new session: `/handoff`
