#!/usr/bin/env node
/**
 * Init-seam tests for public/interactive-profile-photo.js (#37).
 * Asserts external behaviour only — no canvas pixel gates.
 */
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test } from "node:test";
import { Window } from "happy-dom";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODULE_URL = pathToFileURL(path.join(ROOT, "public/interactive-profile-photo.js")).href;

const SAMPLE_EYES_CONFIG = {
  size: 216,
  sclera: [136, 94, 75],
  eyes: {
    left: {
      cx: 103.2,
      cy: 85.8,
      rx: 4.6,
      ry: 4.0,
      irisR: 4.6,
      restDx: 0,
      restDy: 0,
      irisColor: [77, 60, 57],
      lim: 0.55,
    },
    right: {
      cx: 140.2,
      cy: 86.6,
      rx: 4.4,
      ry: 3.9,
      irisR: 4.4,
      restDx: 0,
      restDy: 0,
      irisColor: [89, 69, 62],
      lim: 0.55,
    },
  },
};

function installDom() {
  const window = new Window({
    url: "https://musavvir.info/",
    width: 1280,
    height: 800,
  });
  let rafId = 0;
  window.requestAnimationFrame = () => {
    rafId += 1;
    return rafId;
  };
  window.cancelAnimationFrame = () => {};
  const globals = {
    window,
    document: window.document,
    HTMLElement: window.HTMLElement,
    HTMLCanvasElement: window.HTMLCanvasElement,
    HTMLImageElement: window.HTMLImageElement,
    Image: window.Image,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
    fetch: window.fetch.bind(window),
  };
  for (const [key, value] of Object.entries(globals)) {
    globalThis[key] = value;
  }
  return window;
}

function makeSlot(window) {
  const slot = window.document.createElement("div");
  slot.className = "portrait-slot";
  slot.getBoundingClientRect = () => ({
    left: 100,
    top: 200,
    width: 216,
    height: 216,
    right: 316,
    bottom: 416,
  });
  const img = window.document.createElement("img");
  img.src = "assets/pro-pic-circular-musa.png";
  img.width = 216;
  img.height = 216;
  img.dataset.profilePhoto = "true";
  slot.appendChild(img);
  window.document.body.appendChild(slot);
  return { slot, img };
}

async function loadModule() {
  return import(`${MODULE_URL}?t=${Date.now()}`);
}

test("prefersReducedMotion keeps static img and returns static mode", async () => {
  const window = installDom();
  const { slot, img } = makeSlot(window);
  const { initInteractiveProfilePhoto } = await loadModule();

  const result = await initInteractiveProfilePhoto(slot, {
    prefersReducedMotion: true,
    hasFinePointer: true,
  });

  assert.equal(result.mode, "static");
  assert.equal(img.style.display, "");
  assert.equal(slot.querySelector("canvas[data-tier-c-portrait]"), null);
});

function mockCanvas2d(window) {
  const proto = window.HTMLCanvasElement.prototype;
  const original = proto.getContext;
  proto.getContext = function getContext(type) {
    if (type !== "2d") return original.call(this, type);
    return {
      setTransform() {},
      clearRect() {},
      fillRect() {},
      beginPath() {},
      arc() {},
      ellipse() {},
      clip() {},
      save() {},
      restore() {},
      drawImage() {},
      createRadialGradient() {
        return { addColorStop() {} };
      },
      createLinearGradient() {
        return { addColorStop() {} };
      },
      fill() {},
      set fillStyle(_v) {},
      set imageSmoothingEnabled(_v) {},
      set imageSmoothingQuality(_v) {},
    };
  };
  return () => {
    proto.getContext = original;
  };
}

test("fine pointer happy path shows canvas and returns interactive mode", async () => {
  const window = installDom();
  const restoreCanvas = mockCanvas2d(window);
  const { slot, img } = makeSlot(window);
  const { initInteractiveProfilePhoto } = await loadModule();

  const fakeImg = new window.Image();
  fakeImg.src = "data:image/png;base64,iVBORw0KGgo=";

  try {
    const result = await initInteractiveProfilePhoto(slot, {
      prefersReducedMotion: false,
      hasFinePointer: true,
      isDesktopViewport: true,
      eyesConfig: SAMPLE_EYES_CONFIG,
      loadImage: async () => fakeImg,
      devicePixelRatio: 2,
    });

    assert.equal(result.mode, "interactive");
    const canvas = slot.querySelector("canvas[data-tier-c-portrait]");
    assert.ok(canvas);
    assert.equal(canvas.hidden, false);
    assert.equal(canvas.style.display, "block");
    assert.equal(canvas.style.width, "100%");
    assert.equal(canvas.style.height, "100%");
    assert.equal(canvas.width, 216 * 2);
    assert.equal(canvas.height, 216 * 2);
    assert.equal(img.style.visibility, "hidden");
    assert.ok(slot.classList.contains("is-live"));
    const shades = slot.querySelector("img[data-pixel-shades]");
    assert.ok(shades, "pixel shades overlay should mount in interactive mode");
  } finally {
    restoreCanvas();
  }
});

test("enableShades false skips shades overlay", async () => {
  const window = installDom();
  const restoreCanvas = mockCanvas2d(window);
  const { slot } = makeSlot(window);
  const { initInteractiveProfilePhoto } = await loadModule();
  const fakeImg = new window.Image();
  fakeImg.src = "data:image/png;base64,iVBORw0KGgo=";

  try {
    const result = await initInteractiveProfilePhoto(slot, {
      prefersReducedMotion: false,
      hasFinePointer: true,
      isDesktopViewport: true,
      eyesConfig: SAMPLE_EYES_CONFIG,
      loadImage: async () => fakeImg,
      enableShades: false,
      devicePixelRatio: 2,
    });
    assert.equal(result.mode, "interactive");
    assert.equal(slot.querySelector("img[data-pixel-shades]"), null);
  } finally {
    restoreCanvas();
  }
});

test("init failure keeps static img and returns static mode", async () => {
  const window = installDom();
  const { slot, img } = makeSlot(window);
  const { initInteractiveProfilePhoto } = await loadModule();

  const result = await initInteractiveProfilePhoto(slot, {
    prefersReducedMotion: false,
    hasFinePointer: true,
    isDesktopViewport: true,
    fetchConfig: async () => {
      throw new Error("network down");
    },
  });

  assert.equal(result.mode, "static");
  assert.equal(img.style.display, "");
  const canvas = slot.querySelector("canvas[data-tier-c-portrait]");
  assert.ok(!canvas || canvas.hidden !== false);
});

test("coarse pointer keeps static img and returns static mode", async () => {
  const window = installDom();
  const { slot, img } = makeSlot(window);
  const { initInteractiveProfilePhoto } = await loadModule();

  const result = await initInteractiveProfilePhoto(slot, {
    prefersReducedMotion: false,
    hasFinePointer: false,
  });

  assert.equal(result.mode, "static");
  assert.equal(img.style.display, "");
  assert.equal(slot.querySelector("canvas[data-tier-c-portrait]"), null);
});

test("mobile viewport keeps static img even with fine pointer", async () => {
  const window = installDom();
  const { slot, img } = makeSlot(window);
  const { initInteractiveProfilePhoto } = await loadModule();

  const result = await initInteractiveProfilePhoto(slot, {
    prefersReducedMotion: false,
    hasFinePointer: true,
    isDesktopViewport: false,
  });

  assert.equal(result.mode, "static");
  assert.equal(img.style.display, "");
  assert.equal(slot.querySelector("canvas[data-tier-c-portrait]"), null);
});
