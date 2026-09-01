# Tier D → C fallback bar

Post-cutover delight prefers **tier D** (3D cursor-tracking portrait) with **tier C** (gaze sprite atlas) as fallback ([#28](https://github.com/musavvirahmed/ss-to-gh/issues/28)). **Decision:** tier D is “impossible” (ship C instead) only when an art or pipeline bar fails — not when hosting budget or Pages limits block it (research [#29](https://github.com/musavvirahmed/ss-to-gh/issues/29) already cleared those).

**Hard D→C triggers:** (1) **Likeness** — after prototype review, the 3D head is not acceptable side-by-side with the static PNG at 216×216 (flip-book of rest + ±gaze stills plus live cursor demo); human judgment only, no metric override. (2) **Weight** — lazy tier-D chunk exceeds **≤280 KB gzipped JS + ≤2 MB GLB** (prefer under ~1 MB GLB; hard-fail past ceiling). (3) **Build effort** — offline bake/rig pipeline exceeds **~8 hours** without a shippable GLB.

**Not D→C:** WebGL unavailable or init throws → **static PNG fallback** (same as mobile/reduced-motion); do not build tier C just because GPU is missing. FPS/jank during cursor tracking is judged under likeness/wink tone, not a separate automated kill switch.

**Portrait bake source:** Resolved [#32](https://github.com/musavvirahmed/ss-to-gh/issues/32): bake from the Drive-held 2880×2880 rectangular JPG (same look as the static profile photo; red backdrop preserved); PSD master only if layers/cutout are needed; same source for tier C if D fails; static 216 circular PNG stays in Site content; only derived GLB/atlas committed. Prototype [#33](https://github.com/musavvirahmed/ss-to-gh/issues/33) uses this source from the start — not the 216 PNG.

**Verdict process:** Musa eyeball + flip-book/overlay ritual + recorded transfer metrics on the prototype ticket; weight and effort caps are hard even if the look is liked; likeness failure is hard even if under budget.
