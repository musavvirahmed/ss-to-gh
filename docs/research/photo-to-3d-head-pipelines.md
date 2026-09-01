# Photo-to-3D head pipelines and static-site weight budget (2026-08-29)

Ticket: [Photo-to-3D head pipelines and static-site weight budget](https://github.com/musavvirahmed/ss-to-gh/issues/29) · parent [#28 Interactive profile photo (cursor-tracking mugshot)](https://github.com/musavvirahmed/ss-to-gh/issues/28)

## Question

What pipelines turn a single mugshot into a cursor-trackable 3D head (GLB/glTF)? What are realistic asset sizes, JS runtime weight, and performance on Cloudflare Pages? Is tier **D** (3D, Copilot energy) viable on a personal-site budget?

Current avatar: `assets/pro-pic-circular-musa.png` — 216×216 RGBA PNG, ~51 KB ([handoff note](../handoffs/2026-08-27-export-assets.md)).

---

## Recommendation (short)

**Tier D is viable on a $0 Cloudflare Pages budget**, but only as an **offline bake + lazy-loaded WebGL widget** — not as runtime photo-to-3D in the browser. Ship a pre-built, rigged GLB; load Three.js only on desktop when `prefers-reduced-motion` is off.

Best-fit pipeline for cursor tracking: **parametric face (FLAME + MICA or DECA) → bake textured, rigged GLB → `gltf-transform meshopt`**. Generic AI mesh generators (TripoSR, Hunyuan3D, TRELLIS.2) produce static meshes with no neck rig; they need Blender rigging or whole-mesh rotation (less natural).

Realistic homepage budget after optimization: **~170–280 KB gzipped JS** + **~0.3–2 MB GLB** (lazy). Well inside Cloudflare Pages limits (25 MiB/file, free tier). Main risk is **likeness / uncanny valley from a 216×216 source**, not hosting cost — address in [#32 Asset source for the interactive portrait?](https://github.com/musavvirahmed/ss-to-gh/issues/32) and prototype [#33](https://github.com/musavvirahmed/ss-to-gh/issues/33).

---

## Pipeline taxonomy

| Pipeline | Input | Output | Rig for gaze? | Offline GPU | License | Fit for tier D |
|----------|-------|--------|---------------|-------------|---------|----------------|
| **FLAME + MICA** | Single face photo | `.obj`/`.ply` + FLAME params; export GLB manually | **Yes** — neck, jaw, eyes (4 joints, 5023 verts) | Moderate (conda env) | FLAME non-commercial research license; MICA code on GitHub | **Best** for cursor tracking |
| **FLAME + DECA** | Single face photo | Textured `.obj`, animatable FLAME mesh | **Yes** (same topology) | Moderate | Same FLAME terms + DECA MIT | **Best** if texture-from-photo (`--extractTex`) needed |
| **TripoSR** | Single image | GLB/OBJ, ~30k–130k tris | **No** (static mesh) | ~6 GB VRAM | MIT | Good mesh; needs rig or whole-mesh spin |
| **Hunyuan3D-2** | Single image | GLB with PBR textures | **No** | 10 GB shape / 29 GB shape+texture | Tencent open weights; check repo terms | High quality; heavy export; manual rig |
| **TRELLIS.2** | Single image | PBR GLB (defaults: up to 1M faces, 4096 tex) | **No** | ≥24 GB VRAM (Microsoft model card) | MIT (check nvdiffrast deps) | Overkill raw size; must decimate hard |
| **InstantMesh** | Single image | Mesh (LRM family) | **No** | GPU (see model card) | Apache-2.0 | Same rigging gap as TripoSR |
| **Ready Player Me** | Selfie | Rigged GLB avatars | **Yes** | SaaS (was) | — | **Discontinued 2026-01-31** — no new avatars |
| **Manual** | Photo + AI mesh | Blender-rigged GLB | **Yes** (artist time) | Variable | N/A | Highest control; highest effort |

---

## 1. Parametric face pipelines (preferred for cursor tracking)

### FLAME topology and joints

FLAME models the face, full head, and neck with **N = 5023 vertices** and **K = 4 joints** (neck, jaw, left/right eyeballs), using linear blend skinning ([FLAME paper PDF](https://download.is.tue.mpg.de/flame/flame_paper.pdf)). Pose is axis-angle per joint — exactly what cursor tracking needs (neck/global rotation toward cursor, optional eye joints).

### MICA (metrical shape from one photo)

[MICA README](https://github.com/Zielon/MICA/blob/master/README.md): run `demo.py` on images → per-subject folder with `.ply` mesh, rendered image, and `.npy` FLAME parameters. Requires FLAME2020 account download. Demo exports `.obj`/`.ply` via trimesh ([demo.py](https://github.com/Zielon/MICA/blob/master/demo.py)); **no native GLB export** — bake in Blender or trimesh + skeleton export step.

Mesh scale: **5023 vertices, ~9976 faces** ([MICA usage docs](https://context7.com/zielon/mica/llms.txt)).

### DECA (detailed geometry + texture from photo)

[DECA README](https://github.com/yfeng95/DECA): single image → animatable 3D head; `--extractTex True` pulls UV texture from the input photo; `--saveObj True` for mesh export ([demo_reconstruct.py flags](https://github.com/yfeng95/DECA/blob/master/demos/demo_reconstruct.py)). Outputs `.obj`, not GLB — same manual GLB/rig bake step.

### Why this beats generic image-to-3D for tier D

Generic generators output **unrigged** triangle soups. Cursor tracking in Three.js expects either:

1. **Skinned mesh** — select neck/head bone, `lookAt` cursor point; remove conflicting animation tracks if present ([three.js forum — head follow mouse](https://discourse.threejs.org/t/specific-part-of-3d-model-to-follow-mouse/59229), [sbcode.net earings tutorial](https://sbcode.net/threejs/earings/)).
2. **Whole-mesh rotation** — rotate the root `Object3D`; works but reads stiff for a portrait bust.

FLAME gives (1) without manual rigging. AI meshes need Blender bones or accept (2).

---

## 2. Feedforward image-to-3D mesh pipelines

Useful for **visual fidelity experiments** or bust geometry; treat as mesh **source**, not final runtime asset.

### TripoSR

- [TripoSR README](https://github.com/VAST-AI-Research/TripoSR): MIT; **~6 GB VRAM**; **<0.5 s** on A100; exports GLB/OBJ via `run.py` / Gradio.
- Triangle count **varies ~30k–130k** with no single fixed parameter ([issue #22](https://github.com/VAST-AI-Research/TripoSR/issues/22)); marching-cubes resolution capped at **320** in Gradio ([issue #44](https://github.com/VAST-AI-Research/TripoSR/issues/44)).
- `--bake-texture` + `--texture-resolution` for UV texture instead of vertex colors.

### Hunyuan3D-2 / 2.1

- [Hunyuan3D-2 README](https://github.com/Tencent/Hunyuan3D-2): two-stage shape (DiT) + paint; `mesh.export('output.glb')` on trimesh output.
- [Hunyuan3D-2.1 README](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1): **10 GB VRAM** shape only, **29 GB** shape + PBR texture.
- [Hy3dgen docs](https://hunyuan3d-2.readthedocs.io/en/latest/started/code.html): diffusers-like API; Turbo/FlashVDM variants for faster shape.

### TRELLIS.2

- [TRELLIS.2 README](https://github.com/microsoft/TRELLIS.2) / [Hugging Face model card](https://huggingface.co/microsoft/TRELLIS.2-4B): 4B-param image-to-3D; export via `o_voxel.postprocess.to_glb()` with defaults **`decimation_target=1000000`**, **`texture_size=4096`**, **`extension_webp=True`** — **far too heavy for a 216 px homepage slot without aggressive post-process**.
- Microsoft cites **≥24 GB VRAM** floor ([community summaries of model card](https://builderai.tools/blog/single-image-to-3d-model-pipeline-2026)); H100 timings ~3 s at 512³ ([HF model card](https://huggingface.co/microsoft/TRELLIS.2-4B)).

### InstantMesh

- [InstantMesh README](https://github.com/TencentARC/InstantMesh): Apache-2.0; LRM/Instant3D feedforward mesh from one image. Same static-mesh / rigging gap.

---

## 3. Commercial avatar pipelines

[Ready Player Me](https://readyplayer.me/) public creator and APIs **went offline 2026-01-31** (Netflix acquisition); exported GLB files still load, but **no new photo-to-avatar generation** ([migration note citing RPM shutdown](https://avatarsdk.com/blog/2026/01/15/switch-from-ready-player-me-to-avatar-sdk-fast-familiar-production-ready/)). Not a greenfield option for this project.

Replacements (MetaPerson / Avatar SDK, etc.) are SaaS with iframe embeds — **ongoing vendor dependency**, contrary to the repo’s Git-as-CMS / static Pages posture ([content-edit-workflow](content-edit-workflow.md)). Mentioned for completeness; not recommended unless grill revises #28 scope.

---

## 4. Realistic asset sizes (GLB)

### Raw generator output (before optimization)

| Source | Typical raw GLB | Notes |
|--------|-----------------|-------|
| FLAME/MICA/DECA | ~0.5–3 MB (OBJ + 1–2× 512–1024 textures) | Fixed low-poly topology |
| TripoSR | ~2–15 MB | Tris + baked texture resolution |
| Hunyuan3D PBR | ~5–30 MB | PBR maps at 512–1024 |
| TRELLIS.2 defaults | **Very large** (up to 1M faces, 4K tex) | Must decimate/remesh |

### Web portrait target (216 px display, “wink” tone)

For a circular ~216 px viewport, **visual return diminishes above ~10k triangles and 1024² textures** (display size + distance). Suggested bake targets:

- **5k–15k triangles** (FLAME is already ~10k faces)
- **512×512 or 1024×1024** baseColor (WebP or KTX2)
- **No hair/cloth simulation** — bust crop matches current circular avatar

### Optimization pipeline

Use [glTF-Transform](https://github.com/donmccurdy/glTF-Transform) as final step:

```bash
gltf-transform meshopt input.glb output.glb --level medium
```

Meshopt compresses geometry, morph targets, and animation ([glTF-Transform README](https://github.com/donmccurdy/glTF-Transform)). [Cinevva GLB optimizer docs](https://app.cinevva.com/tools/glb-optimizer) report a sample character **4.0 MB → 676 KB (~84%)** with weld + Meshopt; notes Meshopt decodes faster than Draco for web loading.

Three.js loads Meshopt via `GLTFLoader.setMeshoptDecoder(MeshoptDecoder)` ([GLTFLoader docs](https://threejs.org/docs/pages/GLTFLoader.html)). Decoder **~20 KB before gzip** vs Draco WASM **~85–131 KB gzipped** ([three.js forum — DRACOLoader vs MeshoptDecoder](https://discourse.threejs.org/t/how-to-use-dracoloader-with-gltfloader-with-bare-module-imports/16748)).

**Realistic shipped GLB for homepage: ~300 KB – 2 MB** after meshopt + WebP textures. Raw TRELLIS/Hunyuan exports need explicit decimation (Blender or `gltfpack`) before this range.

---

## 5. JS runtime weight (Three.js + loaders)

All figures **gzipped**, production build — the metric Pages visitors actually download.

| Component | Size | Source |
|-----------|------|--------|
| Three.js core (minimal WebGL scene) | **~150 KB** | [three.js #19148 — Mugen87](https://github.com/mrdoob/three.js/issues/19148) |
| + GLTFLoader addon | +~20–40 KB (tree-shaken) | [three.js forum — tree shaking](https://discourse.threejs.org/t/tree-shaking-three-js/1349) |
| + MeshoptDecoder | +~20 KB pre-gzip (~8 KB gz) | [three.js forum](https://discourse.threejs.org/t/how-to-use-dracoloader-with-gltfloader-with-bare-module-imports/16748) |
| Portrait interaction code | ~5–15 KB | Estimate (raycaster + bone `lookAt` + rAF loop) |
| **Total tier-D chunk (lazy)** | **~170–280 KB gz** | Sum |

Notes:

- Full `three` entrypoint is ~600 KB minified / ~150 KB gz without tree-shaking ([three.js forum — Angular builds](https://discourse.threejs.org/t/angular-builds-three-js-lib/41400)).
- `@google/model-viewer` bundles ~**1 MB** of Three.js if used standalone ([model-viewer issue #2747](https://github.com/google/model-viewer/issues/2747)) — **avoid** for this use case; custom minimal Three.js is lighter.
- Load via **dynamic `import()`** on desktop only; mobile keeps static PNG per #28.

Compare to current avatar: **51 KB PNG**. Tier D adds ~**120–230 KB JS** + **0.3–2 MB GLB** on first interaction — acceptable for post-cutover delight if lazy and gated.

---

## 6. Performance on Cloudflare Pages

### Hosting constraints

- **Max single asset: 25 MiB** ([Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)).
- Free plan: **20,000 files** per site (same doc).
- Optimized portrait GLB + JS are **orders of magnitude** below these caps. R2 only needed if shipping unoptimized 4K PBR heroes ([R2 + Pages tutorial](https://developers.cloudflare.com/pages/tutorials/use-r2-as-static-asset-storage-for-pages/)).

### Runtime (visitor browser)

- **No server-side inference** — Cloudflare Pages serves static files; all photo-to-3D runs **offline at build/content time** (aligns with ADR-0007 Git-as-CMS).
- **One small WebGL canvas** (~216×216): trivial GPU load vs full-page 3D.
- **Single draw call** bust + one directional light: 60 fps on modern laptops expected.
- **Decode cost**: Meshopt decode at load is faster than Draco ([Cinevva optimizer docs](https://app.cinevva.com/tools/glb-optimizer)); still defer load until avatar enters viewport or first mousemove.
- **`prefers-reduced-motion`**: skip WebGL init; keep PNG ([#28 seeded defaults](https://github.com/musavvirahmed/ss-to-gh/issues/28)).

### Loading strategy (recommended)

1. Page loads with static PNG (current behaviour).
2. `matchMedia('(prefers-reduced-motion: no-preference')` && desktop width → `import('./portrait-3d.js')`.
3. Fetch GLB; swap PNG for canvas when ready (progressive enhancement).
4. Cloudflare CDN caches GLB/JS at edge — no origin compute.

---

## 7. Source photo quality risk

The live asset is **216×216**. Face reconstruction models typically expect **≥512 px** short edge after crop (TripoSR/Hunyuan demos use full-resolution inputs; MICA/DECA crop via face detector to ~224×224 for identity, but **texture detail comes from upscaled alignment**).

From 216×216 alone:

- **Identity/shape** may still work (MICA/DECA).
- **Skin detail / uncanny valley** may fail — likely driver for tier **C** fallback ([#31](https://github.com/musavvirahmed/ss-to-gh/issues/31), [#32](https://github.com/musavvirahmed/ss-to-gh/issues/32)).

Recommendation: prototype with existing PNG, but plan a **higher-res source shoot or upscale** before calling tier D shippable.

---

## 8. Suggested workflow for prototype #33

1. **Generate** — DECA or MICA on best available portrait (upgrade source if uncanny).
2. **Texture** — DECA `--extractTex` or manual projection in Blender.
3. **Rig** — use FLAME neck/eye joints (native) or add 1-bone neck in Blender for AI meshes.
4. **Optimize** — decimate to ~10k tris; 1024 WebP baseColor; `gltf-transform meshopt`.
5. **Integrate** — lazy Three.js chunk; neck `lookAt` with clamped angles; PNG fallback.
6. **Measure** — Network tab: JS chunk + GLB transfer; Lighthouse performance delta; eyeball likeness.

Cursor-tracking behaviour reference: [#30 How does github.com/features/copilot implement cursor-following mascot?](https://github.com/musavvirahmed/ss-to-gh/issues/30) (separate research).

---

## 9. Tier D viability verdict

| Criterion | Verdict |
|-----------|---------|
| **Money** | ✅ $0 incremental (Pages free tier + offline OSS tools) |
| **Pages limits** | ✅ Optimized assets ≪ 25 MiB |
| **JS weight** | ✅ ~170–280 KB gz lazy chunk — comparable to one extra hero image |
| **GPU perf** | ✅ Small canvas, one mesh |
| **Cursor tracking** | ✅ With FLAME/rigged GLB; ⚠️ with raw AI mesh unless rigged |
| **Likeness from 216 px** | ⚠️ **Main unknown** — may force tier C |
| **Maintenance** | ⚠️ One-time pipeline skill-up; not CMS-clickable today ([#28 Not yet specified](https://github.com/musavvirahmed/ss-to-gh/issues/28)) |

**Bottom line:** Tier D is **technically and budget-viable** on Cloudflare Pages as a lazy-loaded, pre-baked GLB. The gating risks are **art quality and rigging**, not hosting cost. Proceed to prototype #33 on the FLAME/DECA path; keep tier C atlas in reserve per #28.

---

## References (primary sources)

- [FLAME paper (PDF)](https://download.is.tue.mpg.de/flame/flame_paper.pdf)
- [MICA — GitHub](https://github.com/Zielon/MICA)
- [DECA — GitHub](https://github.com/yfeng95/DECA)
- [TripoSR — GitHub](https://github.com/VAST-AI-Research/TripoSR)
- [Hunyuan3D-2 — GitHub](https://github.com/Tencent/Hunyuan3D-2)
- [Hunyuan3D-2.1 — GitHub](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1)
- [Hy3dgen documentation](https://hunyuan3d-2.readthedocs.io/en/latest/started/code.html)
- [TRELLIS.2 — GitHub](https://github.com/microsoft/TRELLIS.2)
- [TRELLIS.2-4B — Hugging Face model card](https://huggingface.co/microsoft/TRELLIS.2-4B)
- [InstantMesh — GitHub](https://github.com/TencentARC/InstantMesh)
- [glTF-Transform — GitHub](https://github.com/donmccurdy/glTF-Transform)
- [meshoptimizer / gltfpack](https://meshoptimizer.org/)
- [Three.js — GLTFLoader docs](https://threejs.org/docs/pages/GLTFLoader.html)
- [Three.js bundle size (#19148)](https://github.com/mrdoob/three.js/issues/19148)
- [Three.js forum — tree shaking / ~150 KB gz](https://discourse.threejs.org/t/angular-builds-three-js-lib/41400)
- [Three.js forum — MeshoptDecoder ~20 KB](https://discourse.threejs.org/t/how-to-use-dracoloader-with-gltfloader-with-bare-module-imports/16748)
- [Three.js forum — head bone mouse tracking](https://discourse.threejs.org/t/specific-part-of-3d-model-to-follow-mouse/59229)
- [Cloudflare Pages — limits](https://developers.cloudflare.com/pages/platform/limits/)
- [@google/model-viewer — npm](https://www.npmjs.com/package/@google/model-viewer) (peer Three.js; bundle size caution)
