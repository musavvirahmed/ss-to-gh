#!/usr/bin/env node
/**
 * One-time (or post-promote) surgery: content slots in Publish HTML.
 * Idempotent when markers already exist.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  HTML_TARGETS,
  PUBLIC,
  applyContent,
  renderFooterLinks,
  loadSiteContent,
} from "./lib/site-content.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const FOOTER_BLOCK_CSS_START = "  .fe-block-51697b3894f8863fd2b5 {";
const FE_BLOCK_INNER_START =
  '<div class="fluid-engine fe-652c57a10d6f9a768507b174"><div class="fe-block fe-block-51697b3894f8863fd2b5">';

function patchBio(html) {
  if (html.includes("<!-- content:bio -->")) return html;
  if (!html.includes('id="block-880e0a4d670baafb02b2"')) return html;
  return html.replace(
    /(<div class="sqs-html-content" data-sqsp-text-block-content><h1 style="white-space:pre-wrap;">)[\s\S]*?(<\/h1><\/div>)/,
    "$1<!-- content:bio --><!-- /content:bio --></h1></div>",
  );
}

function patchNotFound(html) {
  if (html.includes("<!-- content:not-found -->")) return html;
  if (!html.includes('id="block-6721e778138f1a970177"')) return html;
  return html.replace(
    /(<div class="sqs-html-content" data-sqsp-text-block-content>)([\s\S]*?)(<\/div>)(\s*<style id="container-styles">#block-6721e778138f1a970177)/,
    "$1<!-- content:not-found -->$2<!-- /content:not-found -->$3$4",
  );
}

function patchAvatar(html) {
  if (html.includes("<!-- content:avatar -->")) return html;
  const pathPattern = /assets\/pro-pic-circular-musa\.png/g;
  return html
    .replace(/data-src="(assets\/[^"]+)"/g, 'data-src="<!-- content:avatar -->$1<!-- /content:avatar -->"')
    .replace(/data-image="(assets\/[^"]+)"/g, 'data-image="<!-- content:avatar -->$1<!-- /content:avatar -->"')
    .replace(
      /(<img[\s\S]*? )src="(assets\/[^"]+)"/,
      '$1src="<!-- content:avatar -->$2<!-- /content:avatar -->"',
    )
    .replace(/srcset="(assets\/[^"]+)"/g, 'srcset="<!-- content:avatar -->$1<!-- /content:avatar -->"');
}

function patchFooterCss(html) {
  if (html.includes("<!-- content:footer-links -->")) return html;
  const start = html.indexOf(FOOTER_BLOCK_CSS_START);
  if (start === -1) {
    throw new Error("Footer fe-block CSS anchor not found");
  }
  const endMarker = '\n\n</style><div class="fluid-engine fe-652c57a10d6f9a768507b174">';
  const end = html.indexOf(endMarker, start);
  if (end === -1) {
    throw new Error("Footer CSS end anchor not found");
  }
  return html.slice(0, start) + html.slice(end);
}

function patchFooterMount(html, footerHtml) {
  if (html.includes("<!-- content:footer-links -->")) return html;
  const start = html.indexOf(FE_BLOCK_INNER_START);
  if (start === -1) {
    throw new Error("Footer fluid-engine inner anchor not found");
  }
  const closePattern =
    "</div>\n</div></div></div></div></div>\n    </div>\n  \n  </div>\n  \n</section>";
  const end = html.indexOf(closePattern, start);
  if (end === -1) {
    throw new Error("Footer mount end anchor not found");
  }
  const replacement = `<div class="fluid-engine fe-652c57a10d6f9a768507b174">
  <!-- content:footer-links -->
  ${footerHtml}
  <!-- /content:footer-links -->
</div></div></div>
    </div>
  
  </div>
  
</section>`;
  return html.slice(0, start) + replacement + html.slice(end + closePattern.length);
}

function patchFile(name, content) {
  const filePath = path.join(PUBLIC, name);
  let html = fs.readFileSync(filePath, "utf8");
  html = patchAvatar(html);
  if (name === "index.html") {
    html = patchBio(html);
  }
  if (name === "404.html") {
    html = patchNotFound(html);
  }
  if (!html.includes("<!-- content:footer-links -->")) {
    html = patchFooterCss(html);
    html = patchFooterMount(html, renderFooterLinks(content.footer_links));
  }
  fs.writeFileSync(filePath, html);
  console.log(`Patched ${name} (slots)`);
}

const content = loadSiteContent();
for (const name of HTML_TARGETS) {
  patchFile(name, content);
}

// Bake initial content into slots
applyContent({ root: ROOT });
console.log("Applied content/site.yaml → public/");
