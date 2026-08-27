import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "../..");
export const VISUAL_DIR = path.join(ROOT, "visual");
export const BASELINES_DIR = path.join(VISUAL_DIR, "baselines");
export const DIFFS_DIR = path.join(VISUAL_DIR, "diffs");

export function loadBreakpoints() {
  return JSON.parse(
    fs.readFileSync(path.join(VISUAL_DIR, "breakpoints.json"), "utf8"),
  );
}

export function baselinePath(width) {
  return path.join(BASELINES_DIR, `${width}w.png`);
}

/** Hide Squarespace platform injects; keep site chrome. */
export async function preparePage(page) {
  await page.addStyleTag({
    content: `
      #annex-cookie-banner,
      .sqs-cookie-banner-v2,
      .sqs-announcement-bar,
      .sqs-announcement-bar-dropzone,
      #sqs-cart-container,
      .sqs-cart-dropzone,
      .cart-icon-button,
      [data-animation-role="header-element"] .icon--cart,
      .sqs-widgets-confirmation,
      .sqs-system-error,
      iframe[src*="cookie"],
      iframe[title*="Cookie"],
      #prototype-badge {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  });
  await page.evaluate(async () => {
    document
      .querySelectorAll(
        "#annex-cookie-banner, .sqs-cookie-banner-v2, .sqs-announcement-bar",
      )
      .forEach((el) => el.remove());
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(400);
}

export async function screenshotAtWidth(page, url, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
  await preparePage(page);
  return page.screenshot({ fullPage: true, type: "png", animations: "disabled" });
}

export function comparePngBuffers(baselineBuf, actualBuf) {
  const baseline = PNG.sync.read(baselineBuf);
  const actual = PNG.sync.read(actualBuf);
  if (baseline.width !== actual.width || baseline.height !== actual.height) {
    return {
      ok: false,
      reason: `size mismatch baseline ${baseline.width}x${baseline.height} vs actual ${actual.width}x${actual.height}`,
      diffPixels: null,
      totalPixels: null,
      ratio: 1,
      diffPng: null,
    };
  }
  const { width, height } = baseline;
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(
    baseline.data,
    actual.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 },
  );
  const totalPixels = width * height;
  const ratio = diffPixels / totalPixels;
  return {
    ok: true,
    reason: null,
    diffPixels,
    totalPixels,
    ratio,
    diffPng: PNG.sync.write(diff),
  };
}
