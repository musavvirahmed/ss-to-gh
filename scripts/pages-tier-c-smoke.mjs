#!/usr/bin/env node
/**
 * Deploy smoke: tier-C interactive profile photo is live on Pages (#36–#38).
 * Fetch checks catch missing deploy artifacts; Playwright catches init failure.
 */
import { chromium } from "playwright";

const base = (
  process.env.PAGES_DEV_URL ?? "https://ss-to-gh.pages.dev"
).replace(/\/$/, "");

const staticChecks = [
  { name: "bootstrap script", path: "/interactive-profile-photo-bootstrap.js", status: 200 },
  { name: "interactive module", path: "/interactive-profile-photo.js", status: 200 },
  { name: "eyes config", path: "/assets/eyes-config.json", status: 200 },
  { name: "eye cutout PNG", path: "/assets/musa-no-eyes.png", status: 200 },
  { name: "pixel shades PNG", path: "/assets/pixel-shades.png", status: 200 },
];

let failed = 0;

for (const check of staticChecks) {
  const url = `${base}${check.path}`;
  let res;
  try {
    res = await fetch(url, { redirect: "follow" });
  } catch (err) {
    console.error(`FAIL ${check.name}: ${url} — ${err.message}`);
    failed++;
    continue;
  }
  if (res.status !== check.status) {
    console.error(`FAIL ${check.name}: ${url} — expected HTTP ${check.status}, got ${res.status}`);
    failed++;
  } else {
    console.log(`PASS ${check.name}: ${url}`);
  }
}

const homeRes = await fetch(`${base}/`, { redirect: "follow" });
const homeHtml = await homeRes.text();
for (const needle of [
  "data-profile-photo-slot",
  'src="interactive-profile-photo-bootstrap.js"',
]) {
  if (!homeHtml.includes(needle)) {
    console.error(`FAIL homepage HTML missing ${JSON.stringify(needle)}`);
    failed++;
  }
}
if (failed === 0) {
  console.log("PASS homepage HTML wire-up markers");
}

if (failed > 0) {
  console.error(`\nPages tier-C smoke: static checks failed (${base})`);
  process.exit(1);
}

const browser = await chromium
  .launch({ channel: "chrome" })
  .catch(() => chromium.launch())
  .catch((err) => {
    console.warn(`SKIP Playwright canvas check (${err.message})`);
    return null;
  });
if (browser) {
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      hasTouch: false,
    });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`${base}/`, { waitUntil: "networkidle" });

    const canvas = page.locator(
      "[data-profile-photo-slot].is-live canvas[data-tier-c-portrait]",
    );
    try {
      await canvas.waitFor({ state: "visible", timeout: 8000 });
      console.log("PASS interactive canvas visible after init");
    } catch {
      console.error(
        "FAIL interactive canvas never became visible (cursor tracking unavailable)",
      );
      failed++;
    }

    async function assertSlotSquare(label) {
      const geom = await page.evaluate(() => {
        const slot = document.querySelector("[data-profile-photo-slot]");
        if (!slot) return { error: "no slot" };
        const r = slot.getBoundingClientRect();
        const shades = slot.querySelector("img[data-pixel-shades]");
        return {
          w: r.width,
          h: r.height,
          shadesPosition: shades ? getComputedStyle(shades).position : null,
        };
      });
      if (geom.error) {
        console.error(`FAIL ${label}: ${geom.error}`);
        failed++;
        return;
      }
      if (Math.abs(geom.w - geom.h) > 2) {
        console.error(
          `FAIL ${label} not square: ${geom.w}×${geom.h} (shades position=${geom.shadesPosition})`,
        );
        failed++;
        return;
      }
      console.log(
        `PASS ${label} square ${Math.round(geom.w)}×${Math.round(geom.h)} (shades ${geom.shadesPosition})`,
      );
      if (geom.shadesPosition && geom.shadesPosition !== "absolute") {
        console.error(
          `FAIL ${label}: shades must be absolute, got ${geom.shadesPosition}`,
        );
        failed++;
      }
    }

    await assertSlotSquare("desktop slot");

    // DevTools-style shrink: interactive layer stays mounted below 768px.
    await page.setViewportSize({ width: 458, height: 900 });
    await page.waitForTimeout(300);
    await assertSlotSquare("desktop-then-458 slot");
  } finally {
    await browser.close();
  }
}

console.log(
  `\nPages tier-C smoke: ${failed === 0 ? "passed" : "FAILED"} (${base})`,
);
process.exit(failed ? 1 : 0);
