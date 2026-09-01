# Tier D cursor portrait prototype (#33)

Throwaway artifact for [Prototype: tier D 3D cursor-tracking portrait at homepage scale](https://github.com/musavvirahmed/ss-to-gh/issues/33).

**Question:** Does tier D feel like a wink or a showpiece? Good enough to ship, or trigger tier C fallback?

## Run

1. **Bake GLB** from portrait bake source (Drive `profile-picture-i-facebook.jpg` — not the 216 PNG):

   ```bash
   cp /path/to/profile-picture-i-facebook.jpg prototypes/tier-d-portrait/_private/bake-source.jpg
   npm run bake:tier-d -- --source prototypes/tier-d-portrait/_private/bake-source.jpg
   ```

2. **Start prototype:**

   ```bash
   npm run prototype:tier-d
   ```

   Open http://127.0.0.1:4174/

3. **Review** (ADR-0009): flip-book (rest / ±gaze) + PNG overlay toggle + live cursor + metrics panel.

## What this is / isn't

| Included | Not included |
|----------|----------------|
| Real homepage bio layout at 216×216 | Production site integration |
| Viewport-wide cursor gaze (seeded #28 default) | MICA/DECA/TripoSR mesh (bake script uses textured ellipsoid placeholder) |
| Lazy Three.js r148 + GLB load | CMS / `content/site.yaml` paths |
| Weight metrics (JS est. gzip + GLB bytes) | Mobile / reduced-motion (shows static PNG path) |

The ellipsoid bake is **geometry placeholder** so weight and runtime bars can be measured. Likeness pass/fail needs a photo-to-3D pipeline run on the portrait bake source; record effort when upgrading mesh.

## Pass/fail (from #31)

- **Ship tier D** when likeness, weight, and build effort all pass.
- **Fail → tier C** when any likeness, weight, or effort bar fails.
- WebGL fail → static PNG only (not a C trigger).

Branch: `prototype/tier-d-portrait` (context pointer for #33).
