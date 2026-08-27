# Frozen baselines + Playwright pixel gate

Agentic QA for the [Pixel-identical clone](../adr/0003-pixel-identical-clone.md) bar. Human flip-book / overlay / eyeball still required; this gate does not replace them.

## Breakpoints

Viewport widths live in [`breakpoints.json`](./breakpoints.json): every unique `@media` `(min|max)-width` in live `site.css` at or above 320px, plus 1440px desktop. Baselines are PNGs in [`baselines/`](./baselines/) named `{width}w.png`.

## Commands

```bash
npm install
npx playwright install chromium

# Re-freeze from live (only when the live site is still the oracle)
npm run visual:capture

# Compare clone against frozen baselines (≤0.5% differing pixels)
CLONE_URL=http://127.0.0.1:4173 npm run visual:gate

# Sanity: live vs baselines (should pass right after capture)
npm run visual:smoke
```

`CLONE_URL` is required for `visual:gate`. Point it at the throwaway / static clone once [Throwaway HTML clone: does this look like musavvir.info?](https://github.com/musavvirahmed/ss-to-gh/issues/6) exists.

## Platform injects

Capture and gate strip Squarespace platform chrome (cookie banner, commerce cart control, etc.) so baselines match the clone scope: site chrome in, SS injects out.
