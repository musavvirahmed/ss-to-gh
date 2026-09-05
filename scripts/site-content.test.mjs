#!/usr/bin/env node
/**
 * Site content seam tests — bio highlights + Now-building index bake (#49).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import yaml from "yaml";
import {
  applyContent,
  loadValidatedSiteContent,
  normalizeNowBuilding,
  renderBio,
  renderMarkdownInline,
  renderNowBuildingCards,
  validateSiteContent,
} from "./lib/site-content.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIBBLE_ID = "770da126-29b7-44d5-88e7-3b30f5206484";

function baseSite(overrides = {}) {
  return {
    html_title: "musavvir.info",
    location: "The Hague",
    avatar: "assets/pro-pic-circular-musa.png",
    resume_pdf: "/s/musa-resume-2026.pdf",
    bio: {
      paragraphs: [
        "Product designer based in {{location}}, interested in growth hacking & building with AI.",
        "Currently designing at Nord Security.",
        "Feel free to say hello!",
      ],
      highlights: [
        { phrase: "growth hacking", style: "underline", bold: false },
        {
          phrase: "building with AI",
          style: "scribble",
          bold: true,
          href: "/ai",
        },
        {
          phrase: "Nord Security",
          style: "underline",
          bold: true,
          href: "https://nordsecurity.com/",
          color: "white",
        },
        {
          phrase: "say hello",
          style: "underline",
          bold: false,
          href: "https://adplist.org/mentors/musavvir-ahmed",
          color: "darkAccent",
        },
      ],
    },
    footer_links: [
      { label: "Linkedin", href: "https://www.linkedin.com/in/musavvirinfo/" },
      { label: "Résumé", href: "/s/musa-resume-2026.pdf" },
      { label: "Iconfinder", href: "https://www.iconfinder.com/musavvir" },
      { label: "Dribbble", href: "https://dribbble.com/musavvir" },
    ],
    ...overrides,
  };
}

test("bio highlight to /ai uses linked scribble in the same tab", () => {
  const html = renderBio({
    ...baseSite(),
    not_found: {
      html_title: "Custom 404 Page — musavvir.info",
      heading: "Oops…",
      lines: ["gone"],
    },
  });

  assert.match(
    html,
    new RegExp(
      `data-text-attribute-id="${SCRIBBLE_ID}"[^>]*>` +
        `[\\s\\S]*?<a href="/ai"><strong>building with AI</strong></a>`,
    ),
    "building with AI must be a same-tab scribble link",
  );
  assert.doesNotMatch(
    html,
    /href="\/ai"[^>]*target="_blank"/,
    "/ai must open in the same tab",
  );
  assert.match(
    html,
    /href="https:\/\/nordsecurity\.com\/"[^>]*target="_blank"/,
    "external highlight links stay target=_blank",
  );
});

test("Sveltia blank highlight color/href survive load + schema validation", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sveltia-blank-"));
  const contentDir = path.join(tmp, "content");
  fs.mkdirSync(contentDir, { recursive: true });
  const site = baseSite();
  site.bio.highlights = site.bio.highlights.map((h) => ({
    ...h,
    href: h.href ?? "",
    color: h.color ?? "",
  }));
  const siteFile = path.join(contentDir, "site.yaml");
  fs.writeFileSync(siteFile, yaml.stringify(site));
  fs.copyFileSync(
    path.join(ROOT, "content", "not-found.yaml"),
    path.join(contentDir, "not-found.yaml"),
  );
  fs.copyFileSync(
    path.join(ROOT, "content", "now-building.yaml"),
    path.join(contentDir, "now-building.yaml"),
  );

  const loaded = loadValidatedSiteContent(
    siteFile,
    path.join(contentDir, "not-found.yaml"),
    path.join(contentDir, "now-building.yaml"),
  );
  for (const h of loaded.bio.highlights) {
    assert.notEqual(h.color, "", "blank color must be stripped before schema");
    if (h.color !== undefined) {
      assert.ok(["white", "darkAccent"].includes(h.color));
    }
    if (h.href !== undefined) {
      assert.notEqual(h.href, "");
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
});

test("renderMarkdownInline turns ~~strike~~ into del", () => {
  assert.equal(
    renderMarkdownInline("A gift from ~~God~~ Musa"),
    "A gift from <del>God</del> Musa",
  );
});

test("now-building card title renders strikethrough markdown", () => {
  const html = renderNowBuildingCards({
    cards: [
      {
        title: "A gift from ~~God~~ Musa for HSM job seekers",
        paragraph: "Body with ~~also~~ strike",
      },
    ],
  });
  assert.match(
    html,
    /<h2 class="now-building-card-title">A gift from <del>God<\/del> Musa for HSM job seekers<\/h2>/,
  );
  assert.match(html, /<p class="now-building-card-p">Body with <del>also<\/del> strike<\/p>/);
});

test("hash cta_href is a valid Coming Soon placeholder and bakes a same-tab link", () => {
  const normalized = normalizeNowBuilding({
    html_title: "Building with AI @ musavvir.info",
    heading: "Building with AI?",
    cards: [
      {
        title: "Soon",
        paragraph: "Body",
        cta_href: "#",
        cta_label: "(Coming Soon) Fire it up",
      },
    ],
  });
  validateSiteContent({
    ...baseSite(),
    not_found: {
      html_title: "Oops @ musavvir.info",
      heading: "Oops…",
      lines: ["gone"],
    },
    now_building: normalized,
  });
  const html = renderNowBuildingCards(normalized);
  assert.match(
    html,
    /<a class="now-building-cta" href="#"><span>\(Coming Soon\) Fire it up<\/span><\/a>/,
  );
  assert.doesNotMatch(html, /target="_blank"/);
});

test("empty card CTA is omitted after normalize and bake", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "now-building-"));
  const contentDir = path.join(tmp, "content");
  const adminDir = path.join(contentDir, "admin");
  const publicDir = path.join(tmp, "public");
  const aiDir = path.join(publicDir, "ai");
  fs.mkdirSync(adminDir, { recursive: true });
  fs.mkdirSync(aiDir, { recursive: true });

  fs.writeFileSync(path.join(contentDir, "site.yaml"), yaml.stringify(baseSite()));
  fs.writeFileSync(
    path.join(contentDir, "not-found.yaml"),
    yaml.stringify({
      html_title: "Custom 404 Page — musavvir.info",
      heading: "Oops…",
      lines: ["No such page."],
    }),
  );
  fs.writeFileSync(
    path.join(contentDir, "now-building.yaml"),
    yaml.stringify({
      html_title: "Building with AI — musavvir.info",
      heading: "Building with AI",
      cards: [
        {
          title: "The recurring annual Squarespace cost I erased with the help of AI",
          paragraph:
            "Squarespace’s ~€132/year liability is gone. This site now runs on a free GitHub + Cloudflare stack. One month of Cursor Individual (~€20) helped build the pixel-identical clone—then we kept it free.",
          cta_href: "",
          cta_label: "View README on GitHub",
        },
      ],
    }),
  );
  fs.copyFileSync(
    path.join(ROOT, "content", "admin", "index.html"),
    path.join(adminDir, "index.html"),
  );
  fs.writeFileSync(path.join(adminDir, "config.yml"), "collections: []\n");

  fs.writeFileSync(
    path.join(aiDir, "index.html"),
    `<!doctype html><html><body>
<!-- content:now-building-heading -->x<!-- /content:now-building-heading -->
<!-- content:now-building-intro -->x<!-- /content:now-building-intro -->
<!-- content:now-building-cards -->x<!-- /content:now-building-cards -->
<!-- content:footer-links -->x<!-- /content:footer-links -->
<img data-sqsp-image-block-image src="old.png" />
</body></html>`,
  );
  for (const name of ["index.html", "404.html"]) {
    fs.writeFileSync(
      path.join(publicDir, name),
      `<!doctype html><html><body>
<!-- content:bio -->x<!-- /content:bio -->
<!-- content:not-found -->x<!-- /content:not-found -->
<!-- content:footer-links -->x<!-- /content:footer-links -->
<img data-sqsp-image-block-image src="old.png" />
</body></html>`,
    );
  }

  applyContent({ root: tmp });
  const aiHtml = fs.readFileSync(path.join(aiDir, "index.html"), "utf8");

  assert.match(
    aiHtml,
    /The recurring annual Squarespace cost I erased with the help of AI/,
  );
  assert.match(aiHtml, /€132\/year/);
  assert.doesNotMatch(aiHtml, /View README on GitHub/);
  assert.doesNotMatch(aiHtml, /cta_href|cta_label/);
});
