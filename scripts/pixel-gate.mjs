#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import {
  BASELINES_DIR,
  DIFFS_DIR,
  baselinePath,
  comparePngBuffers,
  loadBreakpoints,
  screenshotAtWidth,
} from "./lib/visual.mjs";

const bp = loadBreakpoints();
const maxRatio = bp.gate.maxDiffPixelRatio;
const cloneUrl = process.env.CLONE_URL;
const widths = bp.viewportWidthsPx;

if (!cloneUrl) {
  console.error(
    "CLONE_URL is required (e.g. CLONE_URL=http://127.0.0.1:4173 npm run visual:gate)",
  );
  process.exit(2);
}

for (const width of widths) {
  if (!fs.existsSync(baselinePath(width))) {
    console.error(`Missing baseline: ${baselinePath(width)}`);
    process.exit(2);
  }
}

fs.mkdirSync(DIFFS_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  deviceScaleFactor: bp.capture.deviceScaleFactor ?? 1,
  reducedMotion: "reduce",
});
const page = await context.newPage();

let failed = 0;
console.log(
  `Pixel gate vs ${cloneUrl} (fail if differing pixels > ${(maxRatio * 100).toFixed(1)}%)`,
);

for (const width of widths) {
  const actualBuf = await screenshotAtWidth(page, cloneUrl, width);
  const baselineBuf = fs.readFileSync(baselinePath(width));
  const result = comparePngBuffers(baselineBuf, actualBuf);

  if (!result.ok) {
    failed += 1;
    console.error(`  FAIL ${width}w: ${result.reason}`);
    fs.writeFileSync(path.join(DIFFS_DIR, `${width}w-actual.png`), actualBuf);
    continue;
  }

  const pct = (result.ratio * 100).toFixed(3);
  if (result.ratio > maxRatio) {
    failed += 1;
    const diffPath = path.join(DIFFS_DIR, `${width}w-diff.png`);
    fs.writeFileSync(diffPath, result.diffPng);
    fs.writeFileSync(path.join(DIFFS_DIR, `${width}w-actual.png`), actualBuf);
    console.error(
      `  FAIL ${width}w: ${result.diffPixels}/${result.totalPixels} pixels (${pct}%) > ${(maxRatio * 100).toFixed(1)}% — ${diffPath}`,
    );
  } else {
    console.log(
      `  pass ${width}w: ${result.diffPixels}/${result.totalPixels} (${pct}%)`,
    );
  }
}

await browser.close();

if (failed) {
  console.error(`Pixel gate failed: ${failed}/${widths.length} widths`);
  process.exit(1);
}
console.log(`Pixel gate passed: ${widths.length}/${widths.length} widths`);
