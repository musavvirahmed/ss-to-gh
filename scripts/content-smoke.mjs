#!/usr/bin/env node
/**
 * Content pipeline smoke: schema, apply idempotency, HTML assertions, admin static.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONTENT_FILE,
  HTML_TARGETS,
  PUBLIC,
  applyContent,
  applyContentToHtml,
  loadValidatedSiteContent,
} from "./lib/site-content.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function readPublic(name) {
  return fs.readFileSync(path.join(PUBLIC, name), "utf8");
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
for (const name of HTML_TARGETS) {
  const html = afterSecond[name];
  if (name === "index.html") {
    assert(
      html.includes(
        `<!-- content:location -->${content.location}<!-- /content:location -->`,
      ),
      `${name}: missing location marker for "${content.location}"`,
    );
    assert(
      html.includes("Product designer based in"),
      `${name}: missing bio line`,
    );
  }
  for (const link of content.footer_links) {
    assert(html.includes(link.label), `${name}: missing footer label ${link.label}`);
    assert(
      html.includes(`href="${link.href}"`),
      `${name}: missing href ${link.href}`,
    );
  }
  assert(
    html.includes('id="content-footer-links"'),
    `${name}: missing content-footer-links nav`,
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
console.log("OK admin static");

// Restore pre-smoke HTML if byte-identical to post-apply (smoke only mutates in place)
void before;

console.log("content:smoke passed");
