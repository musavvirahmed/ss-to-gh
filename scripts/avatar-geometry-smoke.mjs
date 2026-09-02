#!/usr/bin/env node
/**
 * Local regression: profile photo slot must stay square after interactive init.
 * Catches in-flow overlays (e.g. pixel shades) that stretch the canvas oval.
 */
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TOLERANCE_PX = 2;

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close((err) => (err ? reject(err) : resolve(port)));
    });
    server.on("error", reject);
  });
}

async function waitForServer(url, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // keep polling
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`server did not become ready: ${url}`);
}

async function measure(page) {
  return page.evaluate(() => {
    const slot = document.querySelector("[data-profile-photo-slot]");
    if (!slot) return { error: "no slot" };
    const r = slot.getBoundingClientRect();
    const shades = slot.querySelector("img[data-pixel-shades]");
    return {
      live: slot.classList.contains("is-live"),
      w: r.width,
      h: r.height,
      shadesPosition: shades ? getComputedStyle(shades).position : null,
    };
  });
}

function assertSquare(label, geom) {
  if (geom.error) {
    console.error(`FAIL ${label}: ${geom.error}`);
    return 1;
  }
  const delta = Math.abs(geom.w - geom.h);
  if (delta > TOLERANCE_PX) {
    console.error(
      `FAIL ${label}: ${geom.w}×${geom.h} not square (Δ${delta}px, shades=${geom.shadesPosition}, live=${geom.live})`,
    );
    return 1;
  }
  console.log(
    `PASS ${label}: ${Math.round(geom.w)}×${Math.round(geom.h)} live=${geom.live} shades=${geom.shadesPosition}`,
  );
  return 0;
}

const port = await freePort();
const base = `http://127.0.0.1:${port}`;
const child = spawn(
  "python3",
  [path.join(ROOT, "scripts/serve-public.py"), "--port", String(port)],
  { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] },
);

let failed = 0;
try {
  await waitForServer(`${base}/`);

  const browser = await chromium
    .launch({ channel: "chrome" })
    .catch(() => chromium.launch());

  try {
    {
      const page = await browser.newPage({
        viewport: { width: 1280, height: 800 },
        hasTouch: false,
      });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`${base}/`, { waitUntil: "networkidle" });
      await page
        .locator("[data-profile-photo-slot].is-live")
        .waitFor({ timeout: 8000 });
      const geom = await measure(page);
      failed += assertSquare("desktop-1280", geom);
      if (geom.shadesPosition && geom.shadesPosition !== "absolute") {
        console.error(
          `FAIL desktop-1280: shades must be absolute, got ${geom.shadesPosition}`,
        );
        failed++;
      }
      await page.close();
    }

    {
      const page = await browser.newPage({
        viewport: { width: 458, height: 900 },
        hasTouch: true,
      });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`${base}/`, { waitUntil: "networkidle" });
      await page.waitForTimeout(300);
      failed += assertSquare("mobile-fresh-458", await measure(page));
      await page.close();
    }

    {
      const page = await browser.newPage({
        viewport: { width: 1280, height: 800 },
        hasTouch: false,
      });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`${base}/`, { waitUntil: "networkidle" });
      await page
        .locator("[data-profile-photo-slot].is-live")
        .waitFor({ timeout: 8000 });
      await page.setViewportSize({ width: 458, height: 900 });
      await page.waitForTimeout(300);
      failed += assertSquare("desktop-then-458", await measure(page));
      await page.close();
    }
  } finally {
    await browser.close();
  }
} catch (err) {
  console.error(`FAIL avatar-geometry-smoke: ${err.message}`);
  failed++;
} finally {
  child.kill("SIGTERM");
}

console.log(
  `\navatar-geometry-smoke: ${failed === 0 ? "passed" : "FAILED"} (${failed})`,
);
process.exit(failed ? 1 : 0);
