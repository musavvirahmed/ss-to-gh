#!/usr/bin/env node
/**
 * One-time (or post-promote) surgery: location markers + footer mount in Publish HTML.
 * Idempotent when markers / content-footer-row already exist.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HTML_TARGETS, PUBLIC, renderFooterLinks, loadSiteContent } from "./lib/site-content.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const FOOTER_BLOCK_CSS_START = "  .fe-block-51697b3894f8863fd2b5 {";
const FOOTER_ROW_CSS = `  .content-footer-row {
    grid-area: 1/1/6/-1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  @media (min-width: 768px) {
    .content-footer-row {
      grid-area: 2/2/3/26;
    }
  }

`;

const FE_BLOCK_INNER_START =
  '<div class="fluid-engine fe-652c57a10d6f9a768507b174"><div class="fe-block fe-block-51697b3894f8863fd2b5">';

function patchLocation(html) {
  if (html.includes("<!-- content:location -->")) return html;
  return html.replace(
    /Product designer based in ([^<,]+),/,
    "Product designer based in <!-- content:location -->$1<!-- /content:location -->,",
  );
}

function patchFooterCss(html) {
  if (html.includes(".content-footer-row")) return html;
  const start = html.indexOf(FOOTER_BLOCK_CSS_START);
  if (start === -1) {
    throw new Error("Footer fe-block CSS anchor not found");
  }
  const endMarker = "\n\n</style><div class=\"fluid-engine fe-652c57a10d6f9a768507b174\">";
  const end = html.indexOf(endMarker, start);
  if (end === -1) {
    throw new Error("Footer CSS end anchor not found");
  }
  return html.slice(0, start) + FOOTER_ROW_CSS + html.slice(end);
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
  const replacement = `<div class="fluid-engine fe-652c57a10d6f9a768507b174"><div class="content-footer-row">
  <!-- content:footer-links -->
  ${footerHtml}
  <!-- /content:footer-links -->
</div></div></div>
    </div>
  
  </div>
  
</section>`;
  return html.slice(0, start) + replacement + html.slice(end + closePattern.length);
}

function patchFile(name, footerHtml) {
  const filePath = path.join(PUBLIC, name);
  let html = fs.readFileSync(filePath, "utf8");
  html = patchLocation(html);
  html = patchFooterCss(html);
  html = patchFooterMount(html, footerHtml);
  fs.writeFileSync(filePath, html);
  console.log(`Patched ${name}`);
}

const content = loadSiteContent();
const footerHtml = renderFooterLinks(content.footer_links);
for (const name of HTML_TARGETS) {
  patchFile(name, footerHtml);
}
