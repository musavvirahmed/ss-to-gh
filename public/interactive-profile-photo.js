/**
 * Tier C interactive profile photo — A3 matte dark iris, eyes-only cutout (#37).
 * Lazy-loadable ES module; homepage wire-up is a separate ticket (#38).
 */

const SIZE = 216;
const MOUSE_LERP = 0.18;
const SCLERA_FALLBACK = [214, 201, 191];

const DEFAULT_CONFIG_URL = "assets/eyes-config.json";
const DEFAULT_CUTOUT_URL = "assets/musa-no-eyes.png";

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function prefersReducedMotion(options) {
  if (options.prefersReducedMotion != null) return options.prefersReducedMotion;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasFinePointer(options) {
  if (options.hasFinePointer != null) return options.hasFinePointer;
  return window.matchMedia("(pointer: fine)").matches;
}

function scleraCss(eyesConfig) {
  const s = eyesConfig?.sclera;
  const lum = s ? 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2] : 0;
  const rgb = lum >= 110 ? s : SCLERA_FALLBACK;
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

async function loadImage(url) {
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  await img.decode();
  return img;
}

async function fetchEyesConfig(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`eyes config fetch failed: ${res.status}`);
  return res.json();
}

function findStaticImg(slot) {
  return (
    slot.querySelector("[data-profile-photo]") ||
    slot.querySelector("img:not([data-tier-c-cutout])")
  );
}

function setupHiDpi(canvas, ctx, options) {
  const dpr = Math.min((options.devicePixelRatio ?? window.devicePixelRatio) || 2, 3);
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  canvas.style.width = `${SIZE}px`;
  canvas.style.height = `${SIZE}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return dpr;
}

function eyePos(eye, smooth, lookProgress) {
  const t = lookProgress;
  const lx = smooth.x * t;
  const ly = smooth.y * t;
  const maxDx = eye.rx * eye.lim;
  const maxDy = eye.ry * eye.lim;
  const dx = clamp(eye.restDx + lx * eye.rx * 0.7, -maxDx, maxDx);
  const dy = clamp(eye.restDy - ly * eye.ry * 0.7, -maxDy, maxDy);
  return { x: eye.cx + dx, y: eye.cy + dy };
}

function drawMatteIris(ctx, eye, x, y) {
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

function drawLidShadow(ctx, eye, x, y) {
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

function drawEyes(ctx, eyesConfig, cutoutImg, smooth, lookProgress) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = scleraCss(eyesConfig);
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (const name of Object.keys(eyesConfig.eyes)) {
    const eye = eyesConfig.eyes[name];
    const { x, y } = eyePos(eye, smooth, lookProgress);
    drawMatteIris(ctx, eye, x, y);
    drawLidShadow(ctx, eye, x, y);
  }
  if (cutoutImg) ctx.drawImage(cutoutImg, 0, 0, SIZE, SIZE);
}

function bindPointer(slot, pointerState) {
  window.addEventListener("mousemove", (e) => {
    const rect = slot.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    pointerState.mouse.x = clamp((e.clientX - cx) / (window.innerWidth * 0.42), -1, 1);
    pointerState.mouse.y = clamp(-(e.clientY - cy) / (window.innerHeight * 0.42), -1, 1);
    pointerState.lookProgress = clamp(
      Math.hypot(pointerState.mouse.x, pointerState.mouse.y) / 0.85,
      0,
      1,
    );
  });
}

function startRenderLoop(canvas, ctx, eyesConfig, cutoutImg, pointerState) {
  const smooth = { x: 0, y: 0 };
  function tick() {
    smooth.x += (pointerState.mouse.x - smooth.x) * MOUSE_LERP;
    smooth.y += (pointerState.mouse.y - smooth.y) * MOUSE_LERP;
    drawEyes(ctx, eyesConfig, cutoutImg, smooth, pointerState.lookProgress);
    pointerState.rafId = requestAnimationFrame(tick);
  }
  pointerState.rafId = requestAnimationFrame(tick);
}

function showInteractive(slot, staticImg, canvas) {
  slot.classList.add("is-live");
  canvas.hidden = false;
  canvas.style.display = "block";
  if (staticImg) staticImg.style.display = "none";
}

/**
 * @param {HTMLElement} slot Portrait container (216×216 layout slot).
 * @param {object} [options]
 * @param {boolean} [options.prefersReducedMotion] Test override for reduced-motion media query.
 * @param {boolean} [options.hasFinePointer] Test override for `(pointer: fine)`.
 * @param {object} [options.eyesConfig] Inline eyes config (skips fetch).
 * @param {string} [options.configUrl] URL for eyes-config.json.
 * @param {string} [options.cutoutUrl] URL for musa-no-eyes cutout PNG.
 * @param {number} [options.devicePixelRatio] Hi-DPI backing store multiplier (capped at 3).
 * @param {(url: string) => Promise<HTMLImageElement>} [options.loadImage] Image loader (tests).
 * @param {(url: string) => Promise<object>} [options.fetchConfig] Config fetcher (tests).
 * @returns {Promise<{ mode: 'interactive' | 'static' }>}
 */
export async function initInteractiveProfilePhoto(slot, options = {}) {
  const staticImg = findStaticImg(slot);
  const configUrl = options.configUrl ?? DEFAULT_CONFIG_URL;
  const cutoutUrl = options.cutoutUrl ?? DEFAULT_CUTOUT_URL;
  const loadImageFn = options.loadImage ?? loadImage;
  const fetchConfigFn = options.fetchConfig ?? fetchEyesConfig;

  if (prefersReducedMotion(options)) {
    return { mode: "static" };
  }

  if (!hasFinePointer(options)) {
    return { mode: "static" };
  }

  try {
    const eyesConfig = options.eyesConfig ?? (await fetchConfigFn(configUrl));
    const cutoutImg = await loadImageFn(cutoutUrl);

    let canvas = slot.querySelector("canvas[data-tier-c-portrait]");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.dataset.tierCPortrait = "true";
      canvas.width = SIZE;
      canvas.height = SIZE;
      canvas.setAttribute("aria-hidden", "true");
      canvas.hidden = true;
      slot.prepend(canvas);
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");

    setupHiDpi(canvas, ctx, options);

    const pointerState = {
      mouse: { x: 0, y: 0 },
      lookProgress: 0,
      rafId: 0,
    };
    bindPointer(slot, pointerState);
    startRenderLoop(canvas, ctx, eyesConfig, cutoutImg, pointerState);
    showInteractive(slot, staticImg, canvas);

    return { mode: "interactive" };
  } catch {
    return { mode: "static" };
  }
}
