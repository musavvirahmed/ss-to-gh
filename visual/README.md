# Frozen baselines + Playwright pixel gate

Agentic QA for the [Pixel-identical clone](../docs/adr/0003-pixel-identical-clone.md) bar. Human flip-book / overlay / eyeball still required; this gate does not replace them.

## Breakpoints

Viewport widths live in [`breakpoints.json`](./breakpoints.json): every unique `@media` `(min|max)-width` in live `site.css` at or above 320px, plus 1440px desktop. Baselines are PNGs in [`baselines/`](./baselines/) named `{width}w.png`.

## Publish tree workflow

Site content lives in [`public/`](../public/) (the **Publish tree**). Local preview and gate target the same server:

```bash
npm install
npx playwright install chromium

# Terminal 1 — serve promoted Site content (default port 4173)
npm run serve:public

# Terminal 2 — compare Publish tree vs frozen baselines (≤0.5% differing pixels)
npm run visual:gate
```

`visual:gate` defaults to `http://127.0.0.1:4173` (override with `CLONE_URL=…`). Start `serve:public` first; if the port is busy, use `npm run serve:public -- --port 4174` and `CLONE_URL=http://127.0.0.1:4174 npm run visual:gate`.

Flip-book: baselines are mounted at `http://127.0.0.1:4173/visual/baselines/` while `serve:public` runs. Overlay: compare clone vs baseline PNGs in an image editor or browser tabs.

## Other commands

```bash
# Re-freeze from live (only when the live site is still the oracle)
npm run visual:capture

# Sanity: live vs baselines (should pass right after capture)
npm run visual:smoke
```

## Gate outcomes

Publish tree gate run (2026-08-27): Playwright **FAIL 21/21**; **Visual waive** recorded — see [`docs/research/publish-tree-pixel-gate.md`](../docs/research/publish-tree-pixel-gate.md). Prior throwaway results: [`docs/research/throwaway-clone-pixel-gate.md`](../docs/research/throwaway-clone-pixel-gate.md).

## Platform injects

Capture and gate strip Squarespace platform chrome (cookie banner, commerce cart control, etc.) so baselines match the clone scope: site chrome in, SS injects out.
