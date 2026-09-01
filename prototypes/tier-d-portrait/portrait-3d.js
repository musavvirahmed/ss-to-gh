/**
 * PROTOTYPE — tier D cursor-tracking portrait (#33).
 * Lazy Three.js r148 + GLB; viewport-wide gaze; wink-tone rotation clamps.
 */

const MAX_YAW = 0.55; // ~31° — visible in prototype; tune down for ship
const MAX_PITCH = 0.38;
const MOUSE_LERP = 0.14;

// Cutout-puppet setup: the full photo is a static backdrop (shoulders and red
// stay put, matching the static PNG), and an unlit head ellipsoid rotates over
// it. Decal UVs are camera-projected so the rest pose renders pixel-identical
// to the flat photo — the 3D only shows itself when the head turns.

// Ellipsoid radii — sized ~15% over the photo head so its silhouette keeps
// covering the backdrop's head while rotating.
const RX = 0.3;
const RY = 0.37;
const RZ = 0.26;

// Where the head centre sits in the square photo (fractions; V from the top).
const HEAD_U_CENTER = 0.515;
const HEAD_V_CENTER = 0.4;

const CAM_Y = 0.05;
const CAM_Z = 2.15;
const FOV = 28;
const TAN_HALF_FOV = Math.tan((FOV * Math.PI) / 360);

/** World-space head centre such that it overlays the head in the backdrop. */
function headWorldPosition() {
  const halfExtentAtZ0 = CAM_Z * TAN_HALF_FOV;
  return {
    x: (HEAD_U_CENTER - 0.5) * 2 * halfExtentAtZ0,
    y: CAM_Y + (0.5 - HEAD_V_CENTER) * 2 * halfExtentAtZ0,
  };
}

/**
 * Project the photo onto the ellipsoid through the rest camera, so every
 * vertex samples exactly the photo pixel it covers on screen at rest.
 */
function applyCameraProjectedUvs(geometry, headX, headY) {
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const wx = pos.getX(i) + headX;
    const wy = pos.getY(i) + headY;
    const wz = pos.getZ(i);
    const halfExtent = (CAM_Z - wz) * TAN_HALF_FOV;
    uv.setXY(i, 0.5 + (0.5 * wx) / halfExtent, 0.5 + (0.5 * (wy - CAM_Y)) / halfExtent);
  }
  uv.needsUpdate = true;
}

const state = {
  webgl: "pending",
  mouse: { x: 0, y: 0 },
  smooth: { x: 0, y: 0 },
  lookProgress: 0,
  metrics: { jsBytes: 0, glbBytes: 0, jsGzEst: 0, glbBytesActual: 0 },
  yawDeg: 0,
  pitchDeg: 0,
};

const canvas = document.getElementById("portrait-canvas");
canvas.classList.add("is-loading");
const statusEl = document.getElementById("webgl-status");
const metricsEl = document.getElementById("metrics-panel");
const fallbackImg = document.getElementById("portrait-fallback");

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function setStatus(text, ok) {
  if (statusEl) {
    statusEl.textContent = text;
    statusEl.dataset.ok = ok ? "1" : "0";
  }
}

function updateMetricsPanel() {
  if (!metricsEl) return;
  const m = state.metrics;
  const jsOk = m.jsGzEst <= 280 * 1024;
  const glbOk = m.glbBytesActual <= 2 * 1024 * 1024;
  metricsEl.innerHTML = `
    <dl>
      <dt>JS (loaded modules, est. gzip)</dt>
      <dd class="${jsOk ? "pass" : "fail"}">${formatKb(m.jsGzEst)} / 280 KB cap</dd>
      <dt>GLB (transfer)</dt>
      <dd class="${glbOk ? "pass" : "fail"}">${formatKb(m.glbBytesActual)} / 2 MB cap</dd>
      <dt>Gaze (prototype)</dt>
      <dd>${state.yawDeg.toFixed(1)}° yaw · ${state.pitchDeg.toFixed(1)}° pitch</dd>
      <dt>WebGL</dt>
      <dd class="${state.webgl === "ok" ? "pass" : state.webgl === "fail" ? "fail" : ""}">${state.webgl}</dd>
    </dl>`;
}

function formatKb(n) {
  if (!n) return "—";
  return n >= 1024 * 1024
    ? `${(n / (1024 * 1024)).toFixed(2)} MB`
    : `${(n / 1024).toFixed(1)} KB`;
}

async function measureTransfer(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const buf = await res.arrayBuffer();
    return buf.byteLength;
  } catch {
    return 0;
  }
}

function bindFlipBook(headPivot, camera) {
  const poses = {
    rest: { x: 0, y: 0 },
    left: { x: -0.75, y: 0.05 },
    right: { x: 0.75, y: 0.05 },
  };

  document.querySelectorAll("[data-pose]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.pose;
      const p = poses[key];
      if (!p) return;
      state.smooth.x = p.x;
      state.smooth.y = p.y;
      state.lookProgress = 1;
      state.mouse.x = p.x;
      state.mouse.y = p.y;
    });
  });

  document.getElementById("overlay-toggle")?.addEventListener("change", (e) => {
    document.body.classList.toggle("overlay-mode", e.target.checked);
  });

  document.getElementById("capture-flip")?.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "tier-d-frame.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

async function initPortrait3d() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setStatus("reduced-motion → static PNG", false);
    state.webgl = "skipped";
    updateMetricsPanel();
    return;
  }

  let THREE;
  try {
    THREE = await import("three");
    state.metrics.jsBytes += await measureTransfer(
      "https://unpkg.com/three@0.148.0/build/three.module.js",
    );
    state.metrics.jsGzEst = Math.round(state.metrics.jsBytes * 0.32 + 18 * 1024);
  } catch (err) {
    console.error(err);
    setStatus("module load failed → static PNG", false);
    state.webgl = "fail";
    updateMetricsPanel();
    return;
  }

  const glbUrl = "assets/musa-head.glb";
  state.metrics.glbBytesActual = await measureTransfer(glbUrl);
  if (!state.metrics.glbBytesActual) {
    setStatus("GLB missing — run npm run bake:tier-d", false);
    state.webgl = "fail";
    updateMetricsPanel();
    return;
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(216, 216, false);
  renderer.setClearColor(0xc41e3a, 1);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 10);
  camera.position.set(0, CAM_Y, CAM_Z);

  // No scene lights: the photo carries its own lighting; adding fake 3D
  // shading on top reads as "photo glued on a balloon".
  const headPivot = new THREE.Group();
  const { x: headX, y: headY } = headWorldPosition();
  headPivot.position.set(headX, headY, 0);
  scene.add(headPivot);

  const texUrl = "assets/musa-head.jpg";
  try {
    const texture = await new THREE.TextureLoader().loadAsync(texUrl);
    texture.encoding = THREE.sRGBEncoding;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    scene.background = texture;
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    geometry.scale(RX, RY, RZ);
    applyCameraProjectedUvs(geometry, headX, headY);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
    mesh.frustumCulled = false;
    headPivot.add(mesh);
  } catch (err) {
    console.error(err);
    setStatus("texture load failed → static PNG", false);
    state.webgl = "fail";
    updateMetricsPanel();
    return;
  }

  if (fallbackImg) fallbackImg.style.display = "none";
  canvas.classList.remove("is-loading");
  canvas.removeAttribute("aria-hidden");
  setStatus("WebGL ok", true);
  state.webgl = "ok";
  updateMetricsPanel();
  bindFlipBook(headPivot, camera, renderer, scene);

  window.addEventListener("mousemove", (e) => {
    state.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    state.mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    const dist = Math.hypot(state.mouse.x, state.mouse.y);
    state.lookProgress = clamp(dist / 1.2, 0, 1);
  });

  let lastMove = performance.now();
  window.addEventListener("mousemove", () => {
    lastMove = performance.now();
  });

  function tick(now) {
    requestAnimationFrame(tick);

    if (now - lastMove > 900) {
      state.lookProgress *= 0.96;
    }

    state.smooth.x += (state.mouse.x - state.smooth.x) * MOUSE_LERP;
    state.smooth.y += (state.mouse.y - state.smooth.y) * MOUSE_LERP;

    const yaw = clamp(state.smooth.x * 0.35 * state.lookProgress, -MAX_YAW, MAX_YAW);
    const pitch = clamp(state.smooth.y * 0.28 * state.lookProgress, -MAX_PITCH, MAX_PITCH);

    headPivot.rotation.order = "YXZ";
    headPivot.rotation.y = yaw;
    headPivot.rotation.x = pitch;
    state.yawDeg = (yaw * 180) / Math.PI;
    state.pitchDeg = (pitch * 180) / Math.PI;
    updateMetricsPanel();

    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);
}

initPortrait3d();
