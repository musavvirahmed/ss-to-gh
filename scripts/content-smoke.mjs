#!/usr/bin/env node
/**
 * Content pipeline smoke: schema, apply idempotency, HTML assertions, admin static.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
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
applyContent({ root: ROOT });
const afterFirst = Object.fromEntries(
  HTML_TARGETS.map((n) => [n, readPublic(n)]),
);
applyContent({ root: ROOT });
const afterSecond = Object.fromEntries(
  HTML_TARGETS.map((n) => [n, readPublic(n)]),
);

for (const name of HTML_TARGETS) {
  assert(
    afterFirst[name] === afterSecond[name],
    `${name}: apply-content is not idempotent`,
  );
}
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
    html.includes(`<!-- content:avatar -->${content.avatar}<!-- /content:avatar -->`) ||
      html.includes(content.avatar),
    `${name}: missing avatar path ${content.avatar}`,
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
console.log("OK HTML assertions");

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
assert(configText.includes("not_found"), "admin config must include 404 fields");
console.log("OK admin static");

void before;

console.log("content:smoke passed");
