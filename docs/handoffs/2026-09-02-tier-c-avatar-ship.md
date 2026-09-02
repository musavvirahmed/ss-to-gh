# Handoff — 2026-09-02 Tier C avatar ship + layout fixes (#35)

**Map:** [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1)  
**Ticket:** [Spec: tier C interactive profile photo (eyes-only, A3)](https://github.com/musavvirahmed/ss-to-gh/issues/35) — **CLOSED** (implementation + post-close layout fixes landed)  
**Live:** https://musavvir.info/ · preview https://ss-to-gh.pages.dev/  
**HEAD:** `94bbaa9` on `main` (synced with `origin/main`)

Mirror of the agent-resume comment on #35.

## Done this session

Post-close production bugs on the tier-C portrait (after #36–#38) fixed and deployed:

| Bug | Fix commit | What changed |
|-----|------------|--------------|
| Beige square behind circular avatar | `d9834ab` | `drawEyes` paints sclera only in eye ellipses (not full canvas `fillRect`) |
| Avatar too large vs Squarespace (desktop) | `d9834ab` | Cap img to fluid-engine 3-row span |
| Canvas stretched (ellipse) | `002fe07` | `.content-fit { width/height: fit-content }` so overlay matches square img |
| Mobile avatar tiny (~25–30px) | `94bbaa9` | Mobile uses `max-height: calc(24px * 3)` — desktop CSS vars unset below 768px |
| 404 avatar oversized vs homepage | `94bbaa9` | Selectors use `.fe-block:has(img[src*="pro-pic-circular-musa"])` (404 has different fe-block id) |
| 404 copy drift | `20a87a8` | Baked `No such page exists.` from `content/not-found.yaml` |

Also: human confirmed pages.dev look OK; thorough Playwright re-test on **musavvir.info** confirmed interactive eyes move on desktop and gates hold.

## Verified on production (2026-09-02)

```bash
PAGES_DEV_URL=https://musavvir.info npm run pages:tier-c-smoke  # PASS incl. canvas visible
```

| Scenario | Result |
|----------|--------|
| Desktop ≥768px, fine pointer, no reduced-motion | `is-live`, canvas visible, iris pixels change on mousemove (subtle) |
| Mobile 390/458px | Static img only, **72px** (matches SS) |
| Viewport 767px | Static (desktop gate) |
| `prefers-reduced-motion: reduce` | Static |
| `/` and `/poop` avatar width @458px | Both **72px** |
| Assets bootstrap/module/eyes-config/cutout | HTTP 200 |

**Caveat:** custom domain caches CSS/JS `max-age=14400` (4h); `*.pages.dev` is `max-age=0`. Hard-refresh if apex looks stale.

## Key paths

| Layer | Path |
|-------|------|
| Sizing CSS | `public/site-chrome.css` — profile photo block rules |
| Draw / init | `public/interactive-profile-photo.js` |
| Bootstrap gates | `public/interactive-profile-photo-bootstrap.js` |
| Smoke | `scripts/pages-tier-c-smoke.mjs`, `scripts/content-smoke.mjs` |
| Prior handoff | `docs/handoffs/2026-09-01-tier-c-eyes.md` |

## Do not reopen / out of scope

- Tier D WebGL, gaze atlas, blink, interactive on 404
- Sveltia fields for eyes-config geometry
- Making gaze more dramatic without a new ticket (ADR-0009 / #35 intentional wink-tone)

## Likely next work (not claimed)

1. **Sveltia CMS UX** — plan at `.cursor/plans/fix_sveltia_cms_ux_4b9c54ed.plan.md` (YAML list shape vs Sveltia plain string arrays; `editor.preview: false`). Not started this session.
2. **Map #1** — cutover tickets [#25](https://github.com/musavvirahmed/ss-to-gh/issues/25) / [#26](https://github.com/musavvirahmed/ss-to-gh/issues/26) are `ready-for-human` (wizard/HITL).
3. Claim one frontier ticket via `/wayfinder` before coding.

## Suggested skills

- Unsure what to pick up: `/wayfinder` then `/ask-matt`
- Sveltia CMS plan: implement from plan file; `/tdd` if extending content-smoke
- Cutover dashboards: `/wizard`
- Continue session protocol: `/handoff`

## Local repo notes

- Branch: `main` @ `94bbaa9`
- Untracked only: `.cursor/` (plans) — do not commit unless asked
- Working tree otherwise clean after this handoff commit
