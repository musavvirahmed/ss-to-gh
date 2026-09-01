/**
 * PROTOTYPE — tier C cursor portrait (#34).
 * Three iris rasters of eyes-only (A1–A3) plus gaze atlas (B).
 * Switchable via ?variant= and the floating bar.
 */

const VARIANTS = [
  { id: "photo", key: "A1", name: "Photo iris" },
  { id: "wet", key: "A2", name: "Wet cornea" },
  { id: "matte", key: "A3", name: "Matte dark" },
  { id: "atlas", key: "B", name: "Gaze atlas" },
];

const POSES = {
  rest: { x: 0, y: 0 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
};

const SIZE = 216;
const MOUSE_LERP = 0.18;
const SCLERA_FALLBACK = [214, 201, 191];

const state = {
  variant: "photo",
  mouse: { x: 0, y: 0 },
  smooth: { x: 0, y: 0 },
  lookProgress: 0,
  poseLock: null,
  yawDeg: 0,
  pitchDeg: 0,
  metrics: { jsBytes: 0, pngBytes: 0 },
  eyes: null,
  atlas: null,
  cutoutImg: null,
  irisPatches: { left: null, right: null },
  dpr: 2,
};

const slot = document.getElementById("portrait-slot");
const canvas = document.getElementById("portrait-canvas");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("runtime-status");
const metricsEl = document.getElementById("metrics-panel");
const fallbackImg = document.getElementById("portrait-fallback");

function variantFromUrl() {
  const v = new URLSearchParams(location.search).get("variant");
  if (v === "A1" || v === "photo") return "photo";
  if (v === "A2" || v === "wet") return "wet";
  if (v === "A3" || v === "matte") return "matte";
  if (v === "B" || v === "atlas") return "atlas";
  if (v === "A" || v === "eyes") return "photo";
  return "photo";
}

function setUrlVariant(id) {
  const v = VARIANTS.find((x) => x.id === id);
  const params = new URLSearchParams(location.search);
  params.set("variant", v.key);
  history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function formatKb(n) {
  if (!n) return "—";
  return n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(2)} MB` : `${(n / 1024).toFixed(1)} KB`;
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

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function scleraCss() {
  const s = state.eyes?.sclera;
  const lum = s ? 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2] : 0;
  const rgb = lum >= 110 ? s : SCLERA_FALLBACK;
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

function updateMetricsPanel() {
  if (!metricsEl) return;
  const jsOk = state.metrics.jsBytes <= 280 * 1024;
  const pngOk = state.metrics.pngBytes <= 2 * 1024 * 1024;
  const variant = VARIANTS.find((v) => v.id === state.variant);
  metricsEl.innerHTML = `
    <dl>
      <dt>Variant</dt>
      <dd>${variant.key} (${variant.name})</dd>
      <dt>JS (this module)</dt>
      <dd class="${jsOk ? "pass" : "fail"}">${formatKb(state.metrics.jsBytes)} / 280 KB cap</dd>
      <dt>PNG assets</dt>
      <dd class="${pngOk ? "pass" : "fail"}">${formatKb(state.metrics.pngBytes)}</dd>
      <dt>Gaze (prototype)</dt>
      <dd>${state.yawDeg.toFixed(1)}° yaw · ${state.pitchDeg.toFixed(1)}° pitch</dd>
      <dt>Runtime</dt>
      <dd class="pass">2D canvas</dd>
    </dl>`;
}

function bindControls() {
  document.querySelectorAll("[data-pose]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = POSES[btn.dataset.pose];
      if (!p) return;
      state.poseLock = p;
      state.mouse.x = p.x;
      state.mouse.y = p.y;
      state.smooth.x = p.x;
      state.smooth.y = p.y;
      state.lookProgress = 1;
    });
  });
  document.getElementById("overlay-toggle")?.addEventListener("change", (e) => {
    document.body.classList.toggle("overlay-mode", e.target.checked);
  });
  document.getElementById("capture-flip")?.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `tier-c-${state.variant}-frame.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

function bindSwitcher() {
  const label = document.getElementById("variant-label");
  const apply = () => {
    const v = VARIANTS.find((x) => x.id === state.variant);
    if (label) label.textContent = `${v.key} (${v.name})`;
    slot.classList.toggle("variant-atlas", state.variant === "atlas");
    setUrlVariant(state.variant);
  };
  const cycle = (dir) => {
    const i = VARIANTS.findIndex((v) => v.id === state.variant);
    state.variant = VARIANTS[(i + dir + VARIANTS.length) % VARIANTS.length].id;
    apply();
  };
  document.getElementById("variant-prev")?.addEventListener("click", () => cycle(-1));
  document.getElementById("variant-next")?.addEventListener("click", () => cycle(1));
  window.addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
    if (e.key === "ArrowLeft") cycle(-1);
    if (e.key === "ArrowRight") cycle(1);
  });
  apply();
}

function bindPointer() {
  window.addEventListener("mousemove", (e) => {
    state.poseLock = null;
    const rect = slot.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    state.mouse.x = clamp((e.clientX - cx) / (window.innerWidth * 0.42), -1, 1);
    state.mouse.y = clamp(-(e.clientY - cy) / (window.innerHeight * 0.42), -1, 1);
    state.lookProgress = clamp(Math.hypot(state.mouse.x, state.mouse.y) / 0.85, 0, 1);
  });
}

function mirrorLiveThumb() {
  const wrap = document.getElementById("live-thumb-wrap");
  if (!wrap || wrap.querySelector("canvas")) return;
  const mini = document.createElement("canvas");
  mini.width = 108;
  mini.height = 108;
  wrap.appendChild(mini);
  const mctx = mini.getContext("2d");
  (function draw() {
    if (mctx) mctx.drawImage(canvas, 0, 0, 108, 108);
    requestAnimationFrame(draw);
  })();
}

function setupHiDpi() {
  state.dpr = Math.min(window.devicePixelRatio || 2, 3);
  canvas.width = SIZE * state.dpr;
  canvas.height = SIZE * state.dpr;
  canvas.style.width = `${SIZE}px`;
  canvas.style.height = `${SIZE}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

function eyePos(eye) {
  const t = state.lookProgress;
  const lx = state.smooth.x * t;
  const ly = state.smooth.y * t;
  const maxDx = eye.rx * eye.lim;
  const maxDy = eye.ry * eye.lim;
  const dx = clamp(eye.restDx + lx * eye.rx * 0.7, -maxDx, maxDx);
  const dy = clamp(eye.restDy - ly * eye.ry * 0.7, -maxDy, maxDy);
  return { x: eye.cx + dx, y: eye.cy + dy };
}

function drawPhotoIris(eye, name, x, y) {
  const patch = state.irisPatches[name];
  const R = eye.irisR;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, R, R * 0.96, 0, 0, Math.PI * 2);
  ctx.clip();
  if (patch) {
    const s = R * 2.2;
    ctx.drawImage(patch, x - s / 2, y - s / 2, s, s);
  }
  ctx.restore();
}

function drawWetIris(eye, x, y) {
  const R = eye.irisR;
  const [cr, cg, cb] = eye.irisColor;
  const grd = ctx.createRadialGradient(x - R * 0.12, y - R * 0.18, R * 0.08, x, y, R);
  grd.addColorStop(0, "#1c100c");
  grd.addColorStop(0.28, "#140c08");
  grd.addColorStop(0.34, `rgb(${Math.min(255, cr + 18)},${Math.min(255, cg + 10)},${cb})`);
  grd.addColorStop(0.7, `rgb(${cr},${cg},${cb})`);
  grd.addColorStop(0.9, `rgb(${Math.max(0, cr - 28)},${Math.max(0, cg - 22)},${Math.max(0, cb - 18)})`);
  grd.addColorStop(1, "#24160f");
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.clip();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "rgba(210,180,150,0.9)";
  ctx.lineWidth = 0.35;
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + 0.11;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * R * 0.36, y + Math.sin(a) * R * 0.36);
    ctx.lineTo(x + Math.cos(a) * R * 0.92, y + Math.sin(a) * R * 0.92);
    ctx.stroke();
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(x, y, R * 0.33, 0, Math.PI * 2);
  ctx.fillStyle = "#0a0604";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + R * 0.16, y - R * 0.2, R * 0.11, R * 0.14, 0.35, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fill();
}

function drawMatteIris(eye, x, y) {
  const R = eye.irisR;
  const [cr, cg, cb] = eye.irisColor;
  const grd = ctx.createRadialGradient(x, y, R * 0.2, x, y, R);
  grd.addColorStop(0, "#120c0a");
  grd.addColorStop(0.38, `rgb(${Math.max(0, cr - 12)},${Math.max(0, cg - 10)},${Math.max(0, cb - 8)})`);
  grd.addColorStop(0.86, `rgb(${cr},${cg},${cb})`);
  grd.addColorStop(1, `rgb(${Math.max(0, cr - 24)},${Math.max(0, cg - 20)},${Math.max(0, cb - 16)})`);
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, R * 0.36, 0, Math.PI * 2);
  ctx.fillStyle = "#0c0806";
  ctx.fill();
}

function drawLidShadow(eye, x, y) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(eye.cx, eye.cy, eye.rx * 1.05, eye.ry * 1.15, 0, 0, Math.PI * 2);
  ctx.clip();
  const g = ctx.createLinearGradient(x, y - eye.irisR, x, y + eye.irisR * 0.2);
  g.addColorStop(0, "rgba(40,24,18,0.35)");
  g.addColorStop(1, "rgba(40,24,18,0)");
  ctx.fillStyle = g;
  ctx.fillRect(eye.cx - eye.rx, eye.cy - eye.ry * 1.4, eye.rx * 2, eye.ry * 1.6);
  ctx.restore();
}

function drawEyes() {
  const cfg = state.eyes;
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = scleraCss();
  ctx.fillRect(0, 0, SIZE, SIZE);
  const names = Object.keys(cfg.eyes);
  for (const name of names) {
    const eye = cfg.eyes[name];
    const { x, y } = eyePos(eye);
    if (state.variant === "photo") drawPhotoIris(eye, name, x, y);
    else if (state.variant === "wet") drawWetIris(eye, x, y);
    else drawMatteIris(eye, x, y);
    drawLidShadow(eye, x, y);
  }
  if (state.cutoutImg) ctx.drawImage(state.cutoutImg, 0, 0, SIZE, SIZE);
}

function drawAtlas() {
  const a = state.atlas;
  const t = state.lookProgress;
  const lx = state.smooth.x * t;
  const ly = state.smooth.y * t;
  const col = lx < -0.33 ? 0 : lx > 0.33 ? 2 : 1;
  const row = ly > 0.33 ? 0 : ly < -0.33 ? 2 : 1;
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.drawImage(a.img, col * SIZE, row * SIZE, SIZE, SIZE, 0, 0, SIZE, SIZE);
}

function tick() {
  requestAnimationFrame(tick);
  state.smooth.x += (state.mouse.x - state.smooth.x) * MOUSE_LERP;
  state.smooth.y += (state.mouse.y - state.smooth.y) * MOUSE_LERP;
  const t = state.lookProgress;
  state.yawDeg = state.smooth.x * t * 18;
  state.pitchDeg = state.smooth.y * t * 12;
  if (state.variant === "atlas" && state.atlas) drawAtlas();
  else if (state.eyes) drawEyes();
  updateMetricsPanel();
}

async function loadImage(url) {
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  await img.decode();
  return img;
}

function goLive() {
  slot.classList.add("is-live");
  if (fallbackImg) fallbackImg.style.display = "none";
  setStatus("2D canvas ok");
}

async function init() {
  setupHiDpi();
  state.variant = variantFromUrl();
  bindSwitcher();
  bindControls();
  bindPointer();
  mirrorLiveThumb();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setStatus("reduced-motion → static PNG");
    updateMetricsPanel();
    return;
  }

  state.metrics.jsBytes = await measureTransfer("eyes-portrait.js");
  const [eyesCfg, atlasMeta] = await Promise.all([
    fetch("assets/eyes-config.json").then((r) => r.json()),
    fetch("assets/gaze-atlas.json").then((r) => r.json()),
  ]);
  state.eyes = eyesCfg;
  const [cutoutBytes, atlasBytes, leftBytes, rightBytes, atlasImg, cutoutImg, leftPatch, rightPatch] =
    await Promise.all([
      measureTransfer("assets/musa-no-eyes.png"),
      measureTransfer("assets/gaze-atlas.png"),
      measureTransfer("assets/iris-left.png"),
      measureTransfer("assets/iris-right.png"),
      loadImage("assets/gaze-atlas.png"),
      loadImage("assets/musa-no-eyes.png"),
      loadImage("assets/iris-left.png"),
      loadImage("assets/iris-right.png"),
    ]);
  state.metrics.pngBytes = cutoutBytes + atlasBytes + leftBytes + rightBytes;
  state.atlas = { ...atlasMeta, img: atlasImg };
  state.cutoutImg = cutoutImg;
  state.irisPatches.left = leftPatch;
  state.irisPatches.right = rightPatch;

  goLive();
  updateMetricsPanel();
  requestAnimationFrame(tick);
}

init().catch((err) => {
  console.error(err);
  setStatus("init failed → static PNG");
});
