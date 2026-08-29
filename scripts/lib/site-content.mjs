import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import yaml from "yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const CONTENT_FILE = path.join(ROOT, "content", "site.yaml");
export const NOT_FOUND_FILE = path.join(ROOT, "content", "not-found.yaml");
export const SCHEMA_FILE = path.join(ROOT, "content", "site.schema.json");
export const NOT_FOUND_SCHEMA_FILE = path.join(ROOT, "content", "not-found.schema.json");
export const ADMIN_SOURCE = path.join(ROOT, "content", "admin");
export const PUBLIC = path.join(ROOT, "public");
export const HTML_TARGETS = ["index.html", "404.html"];

const HIGHLIGHT_ATTR_IDS = {
  underline: "cb43d076-99f0-4f47-a9d4-2ecdd32e4916",
  scribble: "770da126-29b7-44d5-88e7-3b30f5206484",
  "underline-link": "5b2cbb39-e010-44fa-8b48-321bcb15de97",
};

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

function normalizeSiteContent(data) {
  if (typeof data.avatar === "string" && data.avatar.startsWith("/")) {
    data.avatar = data.avatar.replace(/^\//, "");
  }
  for (const highlight of data.bio?.highlights ?? []) {
    if (!highlight.href?.trim()) {
      delete highlight.href;
    }
  }
  return data;
}

export function loadSiteContent(
  siteFile = CONTENT_FILE,
  notFoundFile = NOT_FOUND_FILE,
) {
  const site = normalizeSiteContent(yaml.parse(fs.readFileSync(siteFile, "utf8")));
  const notFound = yaml.parse(fs.readFileSync(notFoundFile, "utf8"));
  return { ...site, not_found: notFound };
}

function validateAgainstSchema(data, schemaFile, label) {
  const schema = JSON.parse(fs.readFileSync(schemaFile, "utf8"));
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  if (!validate(data)) {
    const msg = ajv.errorsText(validate.errors, { separator: "\n" });
    throw new Error(`${label} failed schema validation:\n${msg}`);
  }
}

export function validateSiteContent(data) {
  const { not_found: notFound, ...site } = data;
  validateAgainstSchema(site, SCHEMA_FILE, "content/site.yaml");
  validateAgainstSchema(notFound, NOT_FOUND_SCHEMA_FILE, "content/not-found.yaml");
  validateHighlights(data);
  return data;
}

function bioParagraphs(content) {
  return content.bio.paragraphs.map((p) =>
    typeof p === "string" ? p : p.paragraph,
  );
}

function notFoundLines(content) {
  return content.not_found.lines.map((l) => (typeof l === "string" ? l : l.line));
}

function validateHighlights(content) {
  if (!content.bio?.highlights?.length) return;
  const corpus = bioParagraphs(content).join("\n");
  for (const { phrase } of content.bio.highlights) {
    if (!corpus.includes(phrase)) {
      throw new Error(
        `content/site.yaml: highlight phrase not found in bio paragraphs: ${JSON.stringify(phrase)}`,
      );
    }
  }
}

export function loadValidatedSiteContent(
  siteFile = CONTENT_FILE,
  notFoundFile = NOT_FOUND_FILE,
) {
  return validateSiteContent(loadSiteContent(siteFile, notFoundFile));
}

function renderMarkdownBold(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

/** Minimal markdown: **bold** and [label](url). */
export function renderMarkdownInline(text) {
  const parts = [];
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  for (const match of text.matchAll(linkRe)) {
    const [full, label, href] = match;
    if (match.index > last) {
      parts.push(renderMarkdownBold(text.slice(last, match.index)));
    }
    const external = href.startsWith("http");
    const attrs = external ? ' target="_blank"' : "";
    parts.push(
      `<a href="${escapeAttr(href)}"${attrs}>${renderMarkdownBold(label)}</a>`,
    );
    last = match.index + full.length;
  }
  if (last < text.length) {
    parts.push(renderMarkdownBold(text.slice(last)));
  }
  return parts.join("");
}

function wrapHighlightPhrase(html, phrase, spec) {
  const idx = html.indexOf(phrase);
  if (idx === -1) {
    throw new Error(`highlight phrase not found in rendered bio HTML: ${JSON.stringify(phrase)}`);
  }
  const wrapped = renderHighlightSpan(phrase, spec);
  return html.slice(0, idx) + wrapped + html.slice(idx + phrase.length);
}

function renderHighlightSpan(text, { style, bold, href }) {
  const inner = escapeHtml(text);
  if (href) {
    const id = HIGHLIGHT_ATTR_IDS["underline-link"];
    return `<span class="sqsrte-text-highlight" data-text-attribute-id="${id}"><a href="${escapeAttr(href)}" target="_blank">${inner}</a></span>`;
  }
  if (style === "scribble" && bold) {
    const id = HIGHLIGHT_ATTR_IDS.scribble;
    return `<span class="sqsrte-text-highlight" data-text-attribute-id="${id}"><span class="sqsrte-text-color--white"><strong>${inner}</strong>.</span></span>`;
  }
  const id = HIGHLIGHT_ATTR_IDS.underline;
  return `<span class="sqsrte-text-highlight" data-text-attribute-id="${id}">${inner}</span>`;
}

export function renderBio(content) {
  const paragraphs = bioParagraphs(content).map((p) =>
    p.replaceAll("{{location}}", content.location),
  );

  let combined = paragraphs
    .map((p) => renderMarkdownInline(p))
    .join("<br><br>");

  for (const spec of content.bio.highlights ?? []) {
    combined = wrapHighlightPhrase(combined, spec.phrase, spec);
  }

  combined = combined.replace(
    /(<\/span>) &amp; (<span class="sqsrte-text-highlight" data-text-attribute-id="770da126)/,
    '$1 <span class="sqsrte-text-color--white">&amp; </span>$2',
  );

  return combined;
}

export function renderNotFound(content) {
  const { heading } = content.not_found;
  const lines = notFoundLines(content);
  const body = lines
    .map(
      (line, i) =>
        `<p class="sqsrte-large"${i === 0 ? ' style="white-space:pre-wrap;"' : ' style="white-space:pre-wrap;"'}>${renderMarkdownInline(line)}</p>`,
    )
    .join("");
  return `<h1 style="white-space:pre-wrap;">${escapeHtml(heading)}</h1>${body}`;
}

export function syncResumeFooterLinks(footerLinks, resumePdf) {
  return footerLinks.map((link) => {
    if (/résumé|resume/i.test(link.label)) {
      return { ...link, href: resumePdf };
    }
    return link;
  });
}

export function renderFooterLinks(footerLinks) {
  const gridClass =
    footerLinks.length === 4 ? "content-footer-link" : "content-footer-link-flex";
  const items = footerLinks
    .map(({ label, href }) => {
      const external = href.startsWith("http");
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `    <h4 class="${gridClass}"><a href="${escapeAttr(href)}"${attrs}><span style="text-decoration:underline">${escapeHtml(label)}</span></a></h4>`;
    })
    .join("\n");

  const layoutClass =
    footerLinks.length === 4 ? "content-footer-links" : "content-footer-links content-footer-links--flex";

  return `<nav id="content-footer-links" class="${layoutClass}" data-content-applied="true" aria-label="Footer">\n${items}\n  </nav>`;
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

export function replaceSlotIfPresent(html, name, innerHtml) {
  const open = `<!-- content:${name} -->`;
  if (!html.includes(open)) return html;
  return replaceSlot(html, name, innerHtml);
}

export function applyContentToHtml(
  html,
  content,
  { includeBio = false, includeNotFound = false, includeAvatar = true } = {},
) {
  let out = html;
  const footerLinks = syncResumeFooterLinks(content.footer_links, content.resume_pdf);

  if (includeBio) {
    out = replaceSlot(out, "bio", renderBio(content));
  }
  if (includeNotFound) {
    out = replaceSlot(out, "not-found", renderNotFound(content));
  }
  if (includeAvatar) {
    out = replaceSlot(out, "avatar", content.avatar);
  }
  out = replaceSlot(out, "footer-links", renderFooterLinks(footerLinks));
  return out;
}

export function copyAdminAssets() {
  const dest = path.join(PUBLIC, "admin");
  fs.mkdirSync(dest, { recursive: true });
  for (const name of ["index.html", "config.yml"]) {
    fs.copyFileSync(path.join(ADMIN_SOURCE, name), path.join(dest, name));
  }
}

export function applyContent({ root = ROOT } = {}) {
  const content = loadValidatedSiteContent(
    path.join(root, "content", "site.yaml"),
    path.join(root, "content", "not-found.yaml"),
  );
  const publicDir = path.join(root, "public");

  for (const name of HTML_TARGETS) {
    const filePath = path.join(publicDir, name);
    const html = fs.readFileSync(filePath, "utf8");
    fs.writeFileSync(
      filePath,
      applyContentToHtml(html, content, {
        includeBio: name === "index.html",
        includeNotFound: name === "404.html",
        includeAvatar: true,
      }),
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
