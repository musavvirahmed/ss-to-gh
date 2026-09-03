#!/usr/bin/env node
/**
 * Content pipeline smoke: schema, apply idempotency, HTML assertions, admin static.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AI_HTML_TARGET,
  HTML_TARGETS,
  PUBLIC,
  applyContent,
  loadValidatedSiteContent,
} from "./lib/site-content.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function readPublic(name) {
  return fs.readFileSync(path.join(PUBLIC, name), "utf8");
}

function bioParagraphs(content) {
  return content.bio.paragraphs.map((p) =>
    typeof p === "string" ? p : p.paragraph,
  );
}

function notFoundLines(content) {
  return content.not_found.lines.map((l) => (typeof l === "string" ? l : l.line));
}

// 1. Schema
const content = loadValidatedSiteContent();
console.log("OK schema validation");

// 2. Apply idempotency
const before = Object.fromEntries(
  HTML_TARGETS.map((n) => [n, readPublic(n)]),
);
const aiBefore = readPublic(AI_HTML_TARGET);
applyContent({ root: ROOT });
const afterFirst = Object.fromEntries(
  HTML_TARGETS.map((n) => [n, readPublic(n)]),
);
const aiAfterFirst = readPublic(AI_HTML_TARGET);
applyContent({ root: ROOT });
const afterSecond = Object.fromEntries(
  HTML_TARGETS.map((n) => [n, readPublic(n)]),
);
const aiAfterSecond = readPublic(AI_HTML_TARGET);

for (const name of HTML_TARGETS) {
  assert(
    afterFirst[name] === afterSecond[name],
    `${name}: apply-content is not idempotent`,
  );
}
assert(
  aiAfterFirst === aiAfterSecond,
  `${AI_HTML_TARGET}: apply-content is not idempotent`,
);
console.log("OK apply-content idempotent");

// 3. HTML assertions
const indexHtml = afterSecond["index.html"];
const notFoundHtml = afterSecond["404.html"];

assert(indexHtml.includes("<!-- content:bio -->"), "index.html: missing bio slot");
assert(!indexHtml.includes("<!-- content:not-found -->"), "index.html: must not have not-found slot");
assert(
  indexHtml.includes("Product designer based in"),
  "index.html: missing bio copy",
);
assert(
  indexHtml.includes('class="sqsrte-text-highlight"'),
  "index.html: missing highlight spans",
);
for (const { phrase } of content.bio.highlights) {
  assert(indexHtml.includes(phrase), `index.html: missing highlight phrase ${phrase}`);
}
assert(
  indexHtml.includes('href="/ai"'),
  "index.html: bio must link building with AI to /ai",
);
assert(
  !indexHtml.includes('href="/ai" target="_blank"'),
  "index.html: /ai must open in the same tab",
);
assert(
  !indexHtml.includes("designOps"),
  "index.html: designOps highlight must be removed from bio",
);

assert(notFoundHtml.includes("<!-- content:not-found -->"), "404.html: missing not-found slot");
assert(!notFoundHtml.includes("<!-- content:bio -->"), "404.html: must not have bio slot");
assert(
  notFoundHtml.includes(content.not_found.heading.trim()),
  "404.html: missing not-found heading",
);
for (const line of notFoundLines(content)) {
  if (line.includes("[")) {
    const textParts = line.split(/\[[^\]]+\]\([^)]+\)/);
    const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
    assert(
      textParts.every((part) => part.trim() === "" || notFoundHtml.includes(part.trim())),
      `404.html: missing not-found line prefix ${JSON.stringify(line)}`,
    );
    if (linkMatch) {
      assert(
        notFoundHtml.includes(`href="${linkMatch[2]}">${linkMatch[1]}</a>`),
        `404.html: missing not-found link ${linkMatch[1]} → ${linkMatch[2]}`,
      );
    }
  } else {
    assert(notFoundHtml.includes(line.trim()), `404.html: missing not-found line ${JSON.stringify(line)}`);
  }
}

for (const name of HTML_TARGETS) {
  const html = afterSecond[name];
  assert(
    html.includes(`src="${content.avatar}"`),
    `${name}: avatar img must have clean src="${content.avatar}"`,
  );
  assert(
    !html.includes("<!-- content:avatar -->"),
    `${name}: avatar attributes must not contain slot markers`,
  );
  for (const link of content.footer_links) {
    assert(html.includes(link.label), `${name}: missing footer label ${link.label}`);
    const href = /résumé|resume/i.test(link.label) ? content.resume_pdf : link.href;
    assert(
      html.includes(`href="${href}"`),
      `${name}: missing href ${href}`,
    );
  }
  assert(
    html.includes('id="content-footer-links"'),
    `${name}: missing content-footer-links nav`,
  );
  assert(
    html.includes('class="content-footer-link"') ||
      html.includes('class="content-footer-link-flex"'),
    `${name}: missing content-footer-link class on footer items`,
  );
  assert(
    html.includes('data-content-applied="true"'),
    `${name}: missing data-content-applied sentinel`,
  );
}
assert(
  indexHtml.includes('class="js-content-mode-element content-fit" data-profile-photo-slot'),
  "index.html: profile photo slot must be on content-fit (no extra wrapper)",
);
assert(
  !indexHtml.includes('class="profile-photo-slot"'),
  "index.html: must not use profile-photo-slot wrapper div",
);
assert(
  indexHtml.includes('data-profile-photo="true"'),
  "index.html: missing data-profile-photo on avatar img",
);
assert(
  indexHtml.includes('src="interactive-profile-photo-bootstrap.js"'),
  "index.html: missing interactive profile photo bootstrap script",
);
assert(
  !notFoundHtml.includes("interactive-profile-photo"),
  "404.html: must not load interactive profile photo module",
);
assert(
  !notFoundHtml.includes("data-profile-photo-slot"),
  "404.html: must not have profile photo slot marker",
);
assert(
  indexHtml.includes('src="/goatcounter.js"'),
  "index.html: missing Visit counter wrapper script",
);
assert(
  notFoundHtml.includes('src="/goatcounter.js"'),
  "404.html: missing Visit counter wrapper script",
);
assert(
  indexHtml.includes('data-goatcounter-click="resume"'),
  "index.html: Résumé footer must send GoatCounter event",
);
assert(
  notFoundHtml.includes('data-goatcounter-click="resume"'),
  "404.html: Résumé footer must send GoatCounter event",
);
console.log("OK HTML assertions");

// 3c. Now-building index (/ai)
const aiHtml = aiAfterSecond;
assert(
  aiHtml.includes("<!-- content:now-building-heading -->"),
  "ai/index.html: missing heading slot",
);
assert(
  aiHtml.includes("<!-- content:now-building-cards -->"),
  "ai/index.html: missing cards slot",
);
assert(
  aiHtml.includes(content.now_building.heading),
  "ai/index.html: missing now-building heading",
);
assert(
  aiHtml.includes(content.now_building.cards[0].title),
  "ai/index.html: missing first card title",
);
assert(
  aiHtml.includes("€132"),
  "ai/index.html: missing first card cost copy",
);
assert(
  !aiHtml.includes("View README on GitHub"),
  "ai/index.html: empty CTA must not render a button",
);
assert(
  aiHtml.includes(`src="${content.avatar}"`),
  "ai/index.html: avatar img must use Site content avatar path",
);
for (const link of content.footer_links) {
  assert(aiHtml.includes(link.label), `ai/index.html: missing footer label ${link.label}`);
}
assert(
  aiHtml.includes('src="/goatcounter.js"'),
  "ai/index.html: missing Visit counter wrapper script",
);
assert(
  aiHtml.includes('id="header"') && aiHtml.includes('id="footer-sections"'),
  "ai/index.html: must reuse homepage/404 header + footer shell",
);
assert(
  aiHtml.includes("site-chrome.css") && aiHtml.includes("_capture/site.css"),
  "ai/index.html: must load shared site chrome stylesheets",
);
assert(
  aiHtml.includes('class="now-building-main"'),
  "ai/index.html: Variant A main must be present",
);
assert(
  !aiHtml.includes("now-building-header") &&
    !aiHtml.includes("now-building-footer"),
  "ai/index.html: must not use custom header/footer chrome classes",
);
assert(
  fs.existsSync(path.join(PUBLIC, "ai", "now-building.css")),
  "missing public/ai/now-building.css",
);
console.log("OK Now-building index");

// 3a. Visit counter wrapper (ADR-0010) — not Site content
const goatPath = path.join(PUBLIC, "goatcounter.js");
assert(fs.existsSync(goatPath), "missing public/goatcounter.js");
const goatJs = fs.readFileSync(goatPath, "utf8");
assert(
  goatJs.includes("musavvir.info"),
  "goatcounter.js: must gate on Canonical hostname musavvir.info",
);
assert(
  goatJs.includes("musavvir-info.goatcounter.com/count"),
  "goatcounter.js: must use musavvir-info count URL",
);
assert(goatJs.includes("/admin"), "goatcounter.js: must skip /admin");
console.log("OK Visit counter wrapper");

// 3b. Footer layout (ADR-0008): left-aligned Squarespace grid, labels stay one line
const chrome = fs.readFileSync(path.join(PUBLIC, "site-chrome.css"), "utf8");
assert(
  /\.content-footer-links \{\s*display: contents;/.test(chrome),
  "site-chrome.css: 4-link footer must use display:contents (ADR-0008)",
);
assert(
  !/\.content-footer-links \{\s*display: flex;/.test(chrome),
  "site-chrome.css: 4-link footer must not be a centered flex row",
);
assert(
  chrome.includes("white-space: nowrap"),
  "site-chrome.css: footer labels must not wrap mid-word",
);
assert(
  /\[data-profile-photo-slot\][^{]*\{[^}]*position: relative/.test(chrome),
  "site-chrome.css: profile photo slot must be a positioned overlay anchor",
);
assert(
  chrome.includes("max-height: calc(var(--container-width"),
  "site-chrome.css: profile photo must cap height to fluid-engine row span",
);
assert(
  chrome.includes(':has(img[src*="pro-pic-circular-musa"])'),
  "site-chrome.css: profile photo sizing must target homepage and 404 avatar blocks",
);
assert(
  chrome.includes("img:not([data-pixel-shades])"),
  "site-chrome.css: avatar size caps must not apply to the pixel-shades overlay",
);
assert(
  /img\[data-pixel-shades\][^{]*\{[^}]*position:\s*absolute/.test(chrome),
  "site-chrome.css: pixel-shades overlay must be position:absolute (out of flow)",
);
assert(
  chrome.includes(
    ".fluid-image-container .content-fit[data-profile-photo-slot] img[data-pixel-shades]",
  ),
  "site-chrome.css: shades selector must beat Squarespace .content-fit img { position:static }",
);
console.log("OK footer layout CSS");

// 4. Admin static
const adminIndex = path.join(PUBLIC, "admin", "index.html");
const adminConfig = path.join(PUBLIC, "admin", "config.yml");
assert(fs.existsSync(adminIndex), "missing public/admin/index.html");
assert(fs.existsSync(adminConfig), "missing public/admin/config.yml");
const configText = fs.readFileSync(adminConfig, "utf8");
assert(
  configText.includes("content/site.yaml"),
  "admin config must reference content/site.yaml",
);
assert(
  configText.includes("content/not-found.yaml"),
  "admin config must reference content/not-found.yaml",
);
assert(
  configText.includes("content/now-building.yaml"),
  "admin config must reference content/now-building.yaml",
);
assert(
  configText.includes("Building with AI"),
  "admin config must label now-building as Building with AI",
);
assert(
  configText.includes("preview: false"),
  "admin config must disable the preview pane",
);
assert(
  !fs.readFileSync(adminIndex, "utf8").includes("goatcounter"),
  "admin/index.html: must not load Visit counter",
);
assert(
  !configText.includes("goatcounter") && !configText.includes("GOATCOUNTER"),
  "admin config must not expose Visit counter endpoint as Site content",
);
console.log("OK admin static");

// 5. Tier-C eyes bake artifacts (publish tree)
const eyesConfigPath = path.join(PUBLIC, "assets", "eyes-config.json");
const cutoutPath = path.join(PUBLIC, "assets", "musa-no-eyes.png");
assert(fs.existsSync(eyesConfigPath), "missing public/assets/eyes-config.json");
assert(fs.existsSync(cutoutPath), "missing public/assets/musa-no-eyes.png");
const shadesPath = path.join(PUBLIC, "assets", "pixel-shades.png");
assert(fs.existsSync(shadesPath), "missing public/assets/pixel-shades.png");
const eyesConfig = JSON.parse(fs.readFileSync(eyesConfigPath, "utf8"));
assert(typeof eyesConfig.size === "number", "eyes-config.json: missing size");
assert(eyesConfig.eyes?.left && eyesConfig.eyes?.right, "eyes-config.json: missing eyes");
assert(
  eyesConfig.source === content.avatar,
  `eyes-config.json source must match site avatar (${content.avatar})`,
);
console.log("OK tier-C eyes + pixel-shades assets");

void before;
void aiBefore;

console.log("content:smoke passed");
