# Handoff — 2026-09-03 Ship Now-building /ai

Map: [Building with AI (Now-building index on musavvir.info)](https://github.com/musavvirahmed/ss-to-gh/issues/44)

## Done this session

- Claimed and implemented [Ship Now-building index at /ai + homepage entry + first card](https://github.com/musavvirahmed/ss-to-gh/issues/49) on branch `ship/now-building-ai-49` (`5d3379f`).
- `content/now-building.yaml` + schema + Sveltia “Building with AI”; `apply-content` bakes `public/ai/` (Variant A).
- Homepage bio: `building with AI` scribble link → `/ai` (same tab); `designOps` removed.
- First card cost copy; empty `cta_href` → no button.
- Tests: `content:smoke` + `scripts/site-content.test.mjs`; full `npm test` green.
- Agent eyeball via `serve:public` screenshots (home + `/ai`).

## Human next

1. Eyeball http://127.0.0.1:4173/ and `/ai/` (or push branch → pages.dev).
2. Close #49 and mark map #44 tickets complete / close map if destination met.
3. Optional: PR from `ship/now-building-ai-49`.

## Not committed (unrelated leftovers)

- `prototypes/bio-ai-entry/` (earlier grilling throwaway)
- `.cursor/`, `.playwright-cli/`

/handoff
