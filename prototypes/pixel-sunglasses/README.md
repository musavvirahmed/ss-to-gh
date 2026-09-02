# Pixel sunglasses hover prototype

Throwaway artifact: kevin.ie-style instant shades overlay on the live tier-C interactive profile photo.

**Question:** Which yaw / scale / Y overlay sits on Musa’s three-quarter red avatar without looking like flat clipart?

**Winner: C** (A/B scrapped). Front-facing solid black lenses from `assets/refs/yaw-trio.png` bot row.

- Pixelated (nearest-neighbor, **no AA**)
- Stray white dots removed; only intentional 2×2 glints
- Nudged **+8px** right on the 216 slot

Locked decisions (grill):

- Overlay PNG (not full photo swap)
- Instant show/hide on hover
- Eyes keep tracking under shades
- Interactive desktop only when shipped (this prototype forces interactive for review)
- No new Wayfinder map / no eye-geometry bake

## Run

```bash
npm run prototype:pixel-sunglasses
```

Open http://127.0.0.1:4190/ (`?variant=A|B|C`). Arrow keys or the bottom bar switch variants. Hover the red avatar.

## What this is / isn’t

| Included | Not included |
|----------|----------------|
| Live tier-C eyes + hover shades | Production `main` wire-up |
| 3 pre-baked overlay PNGs | Drop animation / 3D projection |
| Homepage bio layout at 216×216 | Mobile / reduced-motion shades |

Regenerate overlays (optional):

```bash
python3 prototypes/pixel-sunglasses/gen-shades.py
```
