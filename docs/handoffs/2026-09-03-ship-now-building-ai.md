# Handoff — 2026-09-03 Ship Now-building /ai (shell + geometry)

Map: [Building with AI (Now-building index on musavvir.info)](https://github.com/musavvirahmed/ss-to-gh/issues/44)

**Ticket:** [Ship Now-building index at /ai + homepage entry + first card](https://github.com/musavvirahmed/ss-to-gh/issues/49)

## Branch

`ship/now-building-ai-49` (not pushed unless you ask)

| Commit | What |
|--------|------|
| `5d3379f` | Initial ship: `/ai`, bio entry, first card, Sveltia |
| `08f8216` | Earlier handoff note |
| `e03985a` | Reuse homepage/404 header + footer shell on `/ai` |
| `f782b6f` | Match avatar size/inset to homepage fluid metrics |
| `e16bb7b` | Stop cards stretching with viewport (`min-height:100%` removed) |

## Delivered

1. Public ungated `/ai` (Building with AI) from `content/now-building.yaml` via `apply-content`
2. Homepage bio: `building with AI` → `/ai` (scribble + bold, same tab); `designOps` removed
3. First cost card; empty `cta_href` → no button; `cta_label` retained
4. Sveltia: Site content → **Building with AI** (`content/admin/config.yml` → `public/admin/`)
5. `/ai` uses shared Squarespace header + footer shell; Variant A main only (avatar stack + two-up cards)
6. Card border hugs copy (no viewport-stretch bug)

## Verify

```bash
npm test
npm run serve:public
```

Open http://127.0.0.1:4173/ and `/ai/` (hard-refresh). Check: header/footer match, avatar size/axis, card height stable on resize.

## Human next

1. Eyeball pass on `serve:public` (and pages.dev after push/PR if desired)
2. Close #49; gist onto map #44 / close map if destination met
3. Optional: open PR from `ship/now-building-ai-49`

## Not committed

- `prototypes/bio-ai-entry/`, `.cursor/`, `.playwright-cli/`

/handoff
