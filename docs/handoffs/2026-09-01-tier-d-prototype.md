# Handoff — 2026-09-01 Tier D prototype (#33)

## Where things stand

Claimed [Prototype: tier D 3D cursor-tracking portrait at homepage scale](https://github.com/musavvirahmed/ss-to-gh/issues/33) on map [Interactive profile photo (cursor-tracking mugshot)](https://github.com/musavvirahmed/ss-to-gh/issues/28).

**Built (throwaway branch `prototype/tier-d-portrait`, uncommitted):**

- `prototypes/tier-d-portrait/` — homepage bio layout at 216×216, viewport-wide cursor gaze, flip-book controls, PNG overlay, metrics HUD
- `scripts/bake-tier-d-glb.mjs` — offline ellipsoid GLB bake from portrait bake source JPG
- `npm run prototype:tier-d` / `npm run bake:tier-d`

**Smoke metrics (ellipsoid placeholder GLB, not photo-to-3D):**

- GLB: ~138 KB (well under 2 MB cap)
- JS: Three r148 via CDN; est. gzip ~170–280 KB band (measure in DevTools Network on review)

**Blocked for likeness verdict:** portrait bake source (`profile-picture-i-facebook.jpg`) is on Drive, not in repo. Current local smoke used circular PNG only to verify pipeline — **not valid for #32/#33 likeness pass**. Re-bake from Drive JPG, then eyeball.

## Do next

1. Copy Drive `profile-picture-i-facebook.jpg` → `prototypes/tier-d-portrait/_private/bake-source.jpg`
2. `npm run bake:tier-d -- --source prototypes/tier-d-portrait/_private/bake-source.jpg`
3. `npm run prototype:tier-d` → http://127.0.0.1:4188/
4. Flip-book + overlay ritual (ADR-0009); answer grilling questions on #33
5. Close #33 with verdict (ship tier D vs fail → #34 tier C); append Decisions so far on #28

Optional: run MICA/DECA/TripoSR for real mesh if ellipsoid fails likeness even with correct JPG.

## Suggested skills

- `/wayfinder` to close #33 after review
- `/prototype` if iteration needed
- `/handoff` after verdict
