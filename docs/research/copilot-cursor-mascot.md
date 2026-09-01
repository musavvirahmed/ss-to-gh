# GitHub Copilot cursor mascot (2026-08-29)

Ticket: [How does github.com/features/copilot implement cursor-following mascot?](https://github.com/musavvirahmed/ss-to-gh/issues/30) (part of [#28 Interactive profile photo](https://github.com/musavvirahmed/ss-to-gh/issues/28))

## Summary

The Copilot hero head on [github.com/features/copilot](https://github.com/features/copilot) is a **Three.js r148 WebGL** scene, not CSS or a 2D sprite. A **single shared full-page `<canvas>`** (`WebGLPage`) renders the head plus other page effects (dither backgrounds, branded dividers). The head is **anchored to the hero image DOM rect** and **rotates to look at the cursor**; it does **not** travel across the viewport. Mouse/touch listeners are on **`window`**, but pointer coordinates are **normalized to the hero container bounds**. Materials use a **matcap texture + custom fresnel/specular GLSL shaders** (fake reflections, not ray tracing). Tier D on #28 can treat this as the reference weight class: **~173 KB gzip JS** (Three + GSAP + engine, excl. the 1.5 MB landing-pages shell) and **~584 KB** hero-specific assets.

## Stack

| Layer | Technology | Source |
|-------|------------|--------|
| Renderer | Three.js **r148**, WebGL2 with WebGL1 fallback | `47166-d242b71989402d84.js` (`revision:"148"`) |
| Scene host | Shared orthographic camera + `WebGLRenderer` in lazy chunk | `chunk-74994-2f69e18acf87892c.js` (module `686799`) |
| React glue | `WebGLPage` provider, `HeroCopilotHead` lazy component | `38131-7d6a21708b72172a.js`, `chunk-20380-5a06d55aa208ebc9.js` |
| Head logic | Class exported as `Pt` (source name `copilotHead`) | `38131-7d6a21708b72172a.js` |
| Animation | GSAP timelines (intro elastic bounce, blink) | `70666-cd50f3399ec2b96d.js`; `prefers-reduced-motion` sets `globalTimeline.timeScale(0)` |
| Page shell | Rspack/webpack marketing app | `landing-pages-c9e451eb5b67bf00.js` (not mascot-specific) |

Confirmed independently by a 2024 Stack Exchange answer citing the same source filenames (`copilotHead.ts`, `shader/matcap.ts`, `shader/mesh.ts`) and Three r148: [Computer Graphics SE #14205](https://computergraphics.stackexchange.com/questions/14205/is-the-mascot-on-github-copilot-enterprises-website-ray-traced).

GitHub’s broader illustration pipeline (3D mascots, WebGL interactives, artist-built assets) is described in [How we illustrate at GitHub](https://github.blog/engineering/user-experience/how-we-illustrate-at-github/). Copilot brand usage: [Brand Toolkit — Mascots](https://brand.github.com/graphic-elements/mascots). No public first-party repo for this specific hero implementation was found; inspection is via live bundles on `github.githubassets.com`.

## Asset format

Hero Copilot head assets (webpack public path `https://github.githubassets.com/assets/`):

| File | Size | Role |
|------|-----:|------|
| `copilot_head-e5051da1a2302051.glb` | 416 KB | glTF binary; named meshes (`Head`, `Eyes`, `Ears`, `Goggle`, `Glass`, `Screen`, `Vents`) |
| `matcap-e3d5ea725297708f.webp` | 74 KB | Matcap environment (fake specular/reflection) |
| `head-9f9717fa05af369d.webp` | 62 KB | Head diffuse/SSS map |
| `ear-…`, `eyes-…`, `glass-…`, `goggle-…`, `screen-…`, `vento-…` | 3–10 KB each | Per-part texture maps |
| **Hero head total** | **~584 KB** | |

The same page also loads a separate `copilot-2addefe0e666acf2.glb` (247 KB) and `mascot-7c495cf9822e0d5c.jpg` (43 KB) for other WebGL “branded divider” artwork elsewhere on the page (`landing-pages` asset loader class `sA`).

## Tracking behaviour

### Architecture

1. **`FlexSuiteHero`** renders the hero with `showCopilotHead: true` (Contentful-driven options).
2. **`HeroCopilotHead`** (lazy, `ssr: false`) **portals** a container `div` into the hero image wrapper (`containerEl` from `useRef` on the hero asset box).
3. On mount it constructs `new Pt(canvasDiv, windowSize)` and registers `{ group, onResize, onUpdate }` with the shared artwork via `addWebGLObject`.
4. The shared **`WebGLPage`** canvas is `position: absolute; left: 0; pointer-events: none` — it covers the page; the head’s 3D group is positioned each frame to match the hero element’s `getBoundingClientRect()`.

### Pointer → rotation (not translation)

From class `Pt` (`38131` bundle):

- **`window.addEventListener("mousemove")`** and **`touchstart`** (passive) call `onMousemove` / `onTouchstart`.
- Pointer is converted to hero-local normalized coords:  
  `x = ((clientX - rect.left) / rect.width - 0.5) * 2` (similar for y, y flipped).
- Mouse position is **double-lerped** (`lerp` factors 2× and 1.5× delta) for smoothing.
- **`lookAt` target** blends between default forward `(0,0,1)` and `(0.2 * mouseX, 0.2 * max(mouseY,0), 1)` based on `lookatProgress` (ramps with pointer distance from center, clamped 0–1).
- When the user is not moving the mouse, `lookatProgress` decays to 0 → head returns to default orientation.
- **Group position** tracks hero center; **scale** = `0.25 * heroWidth`. Head stays in the hero slot; only **`animationGroup_2.lookAt(lookatTarget)`** rotates the face/goggles.
- Intro plays when hero intersects viewport; includes GSAP elastic entry and random blink cycles (`uWink` vertex shader on eye meshes).

### Viewport-wide vs local

| Aspect | Behaviour |
|--------|-----------|
| **DOM placement** | Local — portal into hero container only |
| **3D position** | Local — synced to hero bounding rect each frame |
| **Pointer listeners** | Viewport-wide — `window` mousemove/touch |
| **Coordinate space** | Local — normalized against hero width/height |
| **Visual effect** | Gaze/head **rotation** toward cursor anywhere on screen, not the mesh sliding around the page |

This is **“look at cursor”**, not Copilot-cam-style orbital drag ([leereilly/copilot-cam](https://github.com/leereilly/copilot-cam) — community demo, GLB + PBR, not the marketing page).

### Accessibility

- `aria-hidden="true"` on head container and canvas.
- `prefers-reduced-motion: reduce` → GSAP `globalTimeline.timeScale(0)` in the WebGL engine constructor.
- WebGL init failure → `WebGLStatusContext` becomes `"unavailable"`; dither/hero fall back to CSS gradients + static mask images.

## Bundle weight

Measured from live `HEAD` / download on 2026-08-29:

### JS (mascot stack, excluding 1.5 MB `landing-pages` shell)

| Chunk | Raw | Est. gzip | Loaded |
|-------|----:|----------:|--------|
| `47166-…` (Three r148) | 458 KB | 115 KB | `modulepreload` on page |
| `70666-…` (GSAP) | 68 KB | 26 KB | `modulepreload` on page |
| `38131-…` (artwork + `Pt` head) | 34 KB | 11 KB | `modulepreload` on page |
| `chunk-74994-…` (WebGL engine) | 111 KB | 20 KB | dynamic `import()` when canvas inits |
| `chunk-20380-…` (`HeroCopilotHead`) | 1 KB | 1 KB | dynamic `import()` when hero mounts |
| **Total** | **672 KB** | **~173 KB** | |

The **`landing-pages-c9e451eb5b67bf00.js`** bundle (1.5 MB raw) is the full marketing React app and is not attributable to the mascot alone.

### Assets (hero head only)

**~584 KB** transfer (see table above). Fits the [#29](https://github.com/musavvirahmed/ss-to-gh/issues/29) tier-D budget band (~170–280 KB gzip JS + ~0.3–2 MB assets) at the **light end**.

## Implications for tier D (#28)

- **Match Copilot “energy”** with: GLB head + matcap/custom shaders + GSAP micro-motion (blink, intro) + lazy Three chunk — not a CSS sprite or Lottie.
- **Do not copy hero takeover scope** — GitHub anchors the head in the hero; #28 wants **wink-tone delight** on a 216×216 profile photo, viewport-wide **gaze** but not a full-page WebGL canvas unless willing to pay the shared-engine cost.
- **Lighter path for musavvir.info**: skip shared-page dither/branded-divider engine; mount a **single small canvas** on the avatar only → drop `74994`-sized scene manager overhead while keeping the same GLB + matcap + lookAt pattern.
- **Likeness risk** remains the hard part (GitHub uses a hand-modelled Copilot asset); pipeline research is in `docs/research/photo-to-3d-head-pipelines.md`.

## Primary sources

1. Live page HTML: https://github.com/features/copilot (2026-08-29)
2. Bundles: `https://github.githubassets.com/assets/{47166-d242b71989402d84,38131-7d6a21708b72172a,70666-cd50f3399ec2b96d,landing-pages-c9e451eb5b67bf00,chunk-74994-2f69e18acf87892c,chunk-20380-5a06d55aa208ebc9}.js`
3. Assets: `https://github.githubassets.com/assets/copilot_head-e5051da1a2302051.glb` (and sibling `.webp` maps)
4. [Computer Graphics SE — ray-traced?](https://computergraphics.stackexchange.com/questions/14205/is-the-mascot-on-github-copilot-enterprises-website-ray-traced) (2024-09)
5. [GitHub Blog — How we illustrate at GitHub](https://github.blog/engineering/user-experience/how-we-illustrate-at-github/)
6. [GitHub Brand Toolkit — Mascots](https://brand.github.com/graphic-elements/mascots)
