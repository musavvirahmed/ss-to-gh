#!/usr/bin/env node
import fs from "node:fs";
import { chromium } from "playwright";
import {
  BASELINES_DIR,
  baselinePath,
  loadBreakpoints,
  screenshotAtWidth,
} from "./lib/visual.mjs";

const bp = loadBreakpoints();
const liveUrl = process.env.LIVE_URL || bp.capture.liveUrl;
const widths = bp.viewportWidthsPx;

fs.mkdirSync(BASELINES_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  deviceScaleFactor: bp.capture.deviceScaleFactor ?? 1,
  reducedMotion: "reduce",
});
const page = await context.newPage();

console.log(`Capturing ${widths.length} baselines from ${liveUrl}`);
for (const width of widths) {
  const buf = await screenshotAtWidth(page, liveUrl, width);
  const out = baselinePath(width);
  fs.writeFileSync(out, buf);
  console.log(`  wrote ${out} (${buf.length} bytes)`);
}

await browser.close();
console.log("Done.");
