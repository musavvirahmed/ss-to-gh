/**
 * PROTOTYPE — pixel sunglasses hover over live tier-C interactive portrait.
 * Winner: C front-facing solid black (A/B scrapped).
 */

import { initInteractiveProfilePhoto } from "/site/interactive-profile-photo.js";

const VARIANTS = [
  { key: "C", name: "front-facing solid", file: "assets/shades-C.png" },
];

const slot = document.getElementById("portrait-slot");
const shadesImg = document.getElementById("shades-overlay");
const labelEl = document.getElementById("variant-label");
const statusEl = document.getElementById("runtime-status");
const forceEl = document.getElementById("force-shades");
const previewsEl = document.getElementById("static-previews");

function setVariant() {
  const v = VARIANTS[0];
  shadesImg.src = `${v.file}?v=pixel-v2`;
  labelEl.innerHTML = `${v.key} (<span>${v.name}</span>)`;
  const url = new URL(location.href);
  url.searchParams.set("variant", v.key);
  history.replaceState(null, "", url);
}

function paintStaticPreviews() {
  previewsEl.innerHTML = "";
  const v = VARIANTS[0];
  const card = document.createElement("div");
  card.className = "preview-card";
  card.innerHTML = `
    <img src="assets/preview-C.png?v=pixel-v2" width="108" height="108" alt="Variant C preview" />
    ${v.key} — ${v.name}
  `;
  previewsEl.appendChild(card);
}

forceEl.addEventListener("change", () => {
  slot.classList.toggle("shades-forced", forceEl.checked);
});

paintStaticPreviews();
setVariant();

const result = await initInteractiveProfilePhoto(slot, {
  configUrl: "/site/assets/eyes-config.json",
  cutoutUrl: "/site/assets/musa-no-eyes.png",
  prefersReducedMotion: false,
  hasFinePointer: true,
  isDesktopViewport: true,
});

statusEl.textContent =
  result.mode === "interactive"
    ? `mode=${result.mode} · hover avatar for shades · C black frames + opaque white gaps, +8px right`
    : `mode=${result.mode} · unexpected static in this prototype`;
