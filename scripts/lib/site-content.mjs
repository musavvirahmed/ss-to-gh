import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import yaml from "yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const CONTENT_FILE = path.join(ROOT, "content", "site.yaml");
export const SCHEMA_FILE = path.join(ROOT, "content", "site.schema.json");
export const ADMIN_SOURCE = path.join(ROOT, "content", "admin");
export const PUBLIC = path.join(ROOT, "public");
export const HTML_TARGETS = ["index.html", "404.html"];

export function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function escapeAttr(text) {
  return escapeHtml(text).replaceAll("'", "&#39;");
}

export function loadSiteContent(file = CONTENT_FILE) {
  const raw = fs.readFileSync(file, "utf8");
  return yaml.parse(raw);
}

export function validateSiteContent(data) {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_FILE, "utf8"));
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  if (!validate(data)) {
    const msg = ajv.errorsText(validate.errors, { separator: "\n" });
    throw new Error(`content/site.yaml failed schema validation:\n${msg}`);
  }
  return data;
}

export function loadValidatedSiteContent(file = CONTENT_FILE) {
  return validateSiteContent(loadSiteContent(file));
}

export function renderFooterLinks(footerLinks) {
  const items = footerLinks
    .map(({ label, href }) => {
      const external = href.startsWith("http");
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `    <h4 style="white-space:pre-wrap;"><a href="${escapeAttr(href)}"${attrs}><span style="text-decoration:underline">${escapeHtml(label)}</span></a></h4>`;
    })
    .join("\n");

  return `<nav id="content-footer-links" class="content-footer-links" data-content-applied="true" aria-label="Footer">\n${items}\n  </nav>`;
}

export function replaceSlot(html, name, innerHtml) {
  const open = `<!-- content:${name} -->`;
  const close = `<!-- /content:${name} -->`;
  if (!html.includes(open)) {
    throw new Error(`Missing content slot ${open} in HTML`);
  }
  const re = new RegExp(`${open}[\\s\\S]*?${close}`, "g");
  return html.replace(re, `${open}${innerHtml}${close}`);
}

export function applyContentToHtml(html, content, { includeLocation = true } = {}) {
  let out = html;
  if (includeLocation) {
    out = replaceSlot(out, "location", escapeHtml(content.location));
  }
  out = replaceSlot(out, "footer-links", renderFooterLinks(content.footer_links));
  return out;
}

export function copyAdminAssets() {
  const dest = path.join(PUBLIC, "admin");
  fs.mkdirSync(dest, { recursive: true });
  for (const name of ["index.html", "config.yml"]) {
    fs.copyFileSync(
      path.join(ADMIN_SOURCE, name),
      path.join(dest, name),
    );
  }
}

export function applyContent({ root = ROOT } = {}) {
  const content = loadValidatedSiteContent(path.join(root, "content", "site.yaml"));
  const publicDir = path.join(root, "public");

  for (const name of HTML_TARGETS) {
    const filePath = path.join(publicDir, name);
    const html = fs.readFileSync(filePath, "utf8");
    fs.writeFileSync(
      filePath,
      applyContentToHtml(html, content, { includeLocation: name === "index.html" }),
    );
  }

  const adminSource = path.join(root, "content", "admin");
  const adminDest = path.join(publicDir, "admin");
  fs.mkdirSync(adminDest, { recursive: true });
  for (const name of ["index.html", "config.yml"]) {
    fs.copyFileSync(path.join(adminSource, name), path.join(adminDest, name));
  }

  return content;
}
