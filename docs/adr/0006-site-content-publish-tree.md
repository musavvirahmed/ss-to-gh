# Site content: promote-and-strip to `public/`

Grilling ([#16](https://github.com/musavvirahmed/ss-to-gh/issues/16)) chose how v1 **Site content** lands in-repo before `/to-spec`.

## Decision

**Promote-and-strip** from `prototypes/throwaway-html-clone/` into **`public/`** (Cloudflare Pages publish root). Not a rewrite.

**Ship in `public/`:** stripped `index.html`, `404.html`, `highlights.js`/`highlights.css`, `assets/`, minimal `public/_capture/` (only `site.css`, `static.css`, `html-component.css`, `image-component.css`). Strip `SQUARESPACE_CONTEXT`, `sqspcdn` script refs, and inert `data-block-*` attributes. **Do not ship** `menu.js` — header nav wrapper is empty; burger chrome stays, open/close interaction is an intentional carve-out from strict interaction chrome.

**Fonts:** Aktiv Grotesk via Typekit (live parity). Libre Baskerville via [Google Fonts](https://fonts.google.com/specimen/Libre+Baskerville) CSS2 (`ital,wght@0,700;1,400`); re-eyeball italic headings after swap.

**Résumé:** serve at `public/s/musa-resume-2026.pdf`; footer links to `/s/musa-resume-2026.pdf`. `npm run promote:public` preserves an existing `public/s/musa-resume-2026.pdf` if present; otherwise copies the throwaway placeholder from `assets/musa-resume-2025.pdf`. Live Squarespace path was `/s/musa-resume-2025.pdf`; year bumped at cutover ([#21](https://github.com/musavvirahmed/ss-to-gh/issues/21)).

**Harness:** `npm run serve:public` — custom 404 + `/visual/baselines/` mount for flip-book; `visual:gate` runs against promoted `public/` (fresh **Visual waive** only if still failing). `public/_redirects`: `/home` → `/`.

**Prototype:** remove `prototypes/throwaway-html-clone/` from `main`; preserve on `prototype/throwaway-html-clone` branch.

**404:** promote custom `404.html`; no Playwright baselines for 404 in v1.

## Rejected

- Full rewrite from scratch.
- Wholesale promote of `_capture/` research artifacts (~3 MB).
- Self-hosted Aktiv Grotesk in production (localhost gate workaround only).
- Squarespace CDN for Libre Baskerville long-term.
- Shipping `menu.js` for an empty mobile nav.
