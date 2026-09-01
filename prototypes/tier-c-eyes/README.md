# Tier C eyes / atlas portrait prototype (#34)

Throwaway artifact for [Prototype: tier C gaze-portrait fallback at homepage scale](https://github.com/musavvirahmed/ss-to-gh/issues/34).

**Question:** Does tier C deliver the wink at 216×216? Eyes-only first; gaze atlas if too subtle.

Two families on one page (`?variant=` + bottom bar):

| Key | Name | Mechanism |
|-----|------|-----------|
| A1 (default) | Photo iris | Extracted circular iris patches from the bake source |
| A2 | Wet cornea | Painted: radial fibers, dark pupil, limbal ring, tiny catchlight |
| A3 | Matte dark | Painted: no specular, larger pupil |
| B | Gaze atlas | 3×3 sprite sheet (squash + shift; not MICA/DECA) |

## Run

```bash
python3 scripts/cut-tier-c-eyes.py
python3 scripts/bake-tier-c-atlas.py
npm run prototype:tier-c-eyes
```

Open http://127.0.0.1:4189/ (`?variant=A` or `?variant=B`). Arrow keys or the bottom bar switch variants.

## Review (ADR-0009 spirit)

- Flip-book: rest / ±gaze / ±pitch buttons
- PNG overlay toggle
- Live cursor on the viewport
- Metrics: JS bytes + PNG bytes (no Three.js)

## What this is / isn't

| Included | Not included |
|----------|----------------|
| Homepage bio layout at 216×216 | Production site integration |
| Eyes-only + photo atlas | TalkingHead / Avaturn / WebGL |
| Reduced-motion → static PNG | MICA/DECA mesh (optional later if atlas likeness fails) |

Cutout and atlas are derived from `public/assets/pro-pic-circular-musa.png` so rest pose can match Site content. Portrait bake source (2880 JPG) remains the offline master if a later 3D atlas is needed.

Branch: `prototype/tier-c-eyes`.
