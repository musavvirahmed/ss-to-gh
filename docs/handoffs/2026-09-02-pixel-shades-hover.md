# Handoff — 2026-09-02 Pixel shades hover on tier-C portrait

**Map:** [Interactive profile photo (cursor-tracking mugshot)](https://github.com/musavvirahmed/ss-to-gh/issues/28) (closed) · parent [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1)  
**Live:** https://musavvir.info/ · preview https://ss-to-gh.pages.dev/

## Done this session

Shipped kevin.ie-style **instant pixel sunglasses** on hover over the live tier-C eyes:

| Decision | Choice |
|----------|--------|
| Layer | Overlay PNG on live canvas (not full photo swap) |
| Motion | Instant show/hide |
| Eyes | Keep tracking under shades |
| Gates | Interactive desktop only (same as eyes) |
| Asset | Winner **C** front-facing pixelated; opaque white 2×2 glints; no AA; +8px right |

### Production

| Path | Role |
|------|------|
| `public/assets/pixel-shades.png` | Overlay asset |
| `public/interactive-profile-photo.js` | Mounts `img[data-pixel-shades]` after interactive init |
| `public/site-chrome.css` | `:hover` visibility on `.is-live` |
| Tests | content-smoke + init tests (incl. `enableShades: false`) |
| Deploy smoke | `pages-tier-c-smoke` asserts `/assets/pixel-shades.png` |

### Prototype (primary source)

`prototypes/pixel-sunglasses/` · `npm run prototype:pixel-sunglasses` → http://127.0.0.1:4190/  
Regen: `python3 prototypes/pixel-sunglasses/gen-shades.py`

## No open ticket to close

Feature was grilled + prototyped without a new Wayfinder ticket (map #28 already resolved). Cutover #25/#26 stay `ready-for-human`. Do not close map #1.

## Verify after deploy

```bash
npm test
PAGES_DEV_URL=https://ss-to-gh.pages.dev npm run pages:tier-c-smoke
# Desktop ≥768 + fine pointer: hover avatar → shades appear; eyes still track
```

Apex may lag (`max-age=14400`); pages.dev is fresher.

## Suggested skills

- Continue polish: `/prototype` then fold into `public/`
- Cutover: `/wizard`
- Unsure: `/wayfinder` · `/ask-matt`
