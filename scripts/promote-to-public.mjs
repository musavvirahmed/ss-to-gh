#!/usr/bin/env node
/**
 * Promote-and-strip throwaway clone → public/ (ADR-0006).
 * Source default: prototypes/throwaway-html-clone (archived on branch prototype/throwaway-html-clone).
 *
 * WARNING: deletes all of public/. After promote, re-run:
 *   npm run init-content-slots && npm run apply-content
 * or content markers and /admin are lost (ADR-0007).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_SOURCE = path.join(ROOT, "prototypes/throwaway-html-clone");
const PUBLIC = path.join(ROOT, "public");
const RESUME_PUBLIC = path.join(PUBLIC, "s", "musa-resume-2026.pdf");
const RESUME_HREF = "/s/musa-resume-2026.pdf";

const CAPTURE_CSS = [
  "site.css",
  "static.css",
  "html-component.css",
  "image-component.css",
];

const GOOGLE_FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,700;1,400&display=swap" rel="stylesheet">
`;

function stripHtml(html) {
  let out = html;

  out = out.replace(/<!-- PROTOTYPE[^]*?-->\n?/g, "");
  out = out.replace(/<!-- This is Squarespace\. -->/g, "");
  out = out.replace(/<!-- musavvirinfo -->/g, "");
  out = out.replace(/<!-- End of Squarespace Headers -->\n?/g, "");

  out = out.replace(/<link rel="stylesheet" href="fonts-local\.css"\/?>\n?/g, GOOGLE_FONTS);

  out = out.replace(
    /<link rel="preconnect" href="https:\/\/images\.squarespace-cdn\.com">\n?/g,
    "",
  );
  out = out.replace(
    /<link rel="preconnect" href="https:\/\/file\.squarespace-cdn\.com" crossorigin>\n?/g,
    "",
  );

  out = out.replace(/<script data-name="static-context">[\s\S]*?<\/script>\n?/g, "");
  out = out.replace(/<style data-sqsp-font-ids="[^"]*">[\s\S]*?<\/style>\n?/g, "");

  out = out.replace(/\sdata-block-css="[^"]*"/g, "");
  out = out.replace(/\sdata-block-scripts="[^"]*"/g, "");
  out = out.replace(/\sdata-block-type="[^"]*"/g, "");
  out = out.replace(/\sdata-definition-name="[^"]*"/g, "");
  out = out.replace(/\sdata-sqsp-block="[^"]*"/g, "");
  out = out.replace(/\sdata-website-component-id="[^"]*"/g, "");

  out = out.replace(
    /<link rel="stylesheet" type="text\/css" href="https:\/\/definitions\.sqspcdn\.com[^"]*"[^>]*>/g,
    "",
  );

  const captureLinks =
    '<link rel="stylesheet" type="text/css" href="_capture/html-component.css"/>' +
    '<link rel="stylesheet" type="text/css" href="_capture/image-component.css"/>' +
    '<link rel="stylesheet" type="text/css" href="_capture/site.css"/>' +
    '<link rel="stylesheet" type="text/css" href="_capture/static.css"/>';
  out = out.replace(
    /<link rel="stylesheet" type="text\/css" href="_capture\/[^"]+\.css"[^>]*>(?:\s*<link rel="stylesheet" type="text\/css" href="_capture\/[^"]+\.css"[^>]*>)*/g,
    captureLinks,
  );

  out = out.replace(
    /<link rel="stylesheet" href="prototype-chrome\.css"\/?>\n?/g,
    '<link rel="stylesheet" href="site-chrome.css"/>\n',
  );
  out = out.replace(/<script src="menu\.js" defer><\/script>\n?/g, "");
  out = out.replace(/<div id="prototype-badge">[\s\S]*?<\/div>\n?/g, "");

  out = out.replace(
    /href="(?:assets\/musa-resume-2025\.pdf|\/s\/musa-resume-2025\.pdf)"/g,
    `href="${RESUME_HREF}"`,
  );

  // Squarespace lazy-loader JS is stripped; show images immediately.
  out = out.replace(/\sdata-load="false"/g, "");
  out = out.replace(/\sdata-loader="sqs"/g, "");
  out = out.replace(/\ssrcset="assets\/[^"]+"/g, (match) => {
    const asset = match.match(/assets\/[^"?]+/)[0];
    return ` srcset="${asset}"`;
  });

  return out;
}

function patchImageComponentCss(css) {
  return css
    .replaceAll(
      '.sqs-block[data-definition-name="website.components.imageFluid"]',
      ".sqs-block-image",
    )
    .replace(
      /.fe-block \.fe-block \.sqs-block-image/g,
      ".fe-block .sqs-block-image",
    );
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function promote(sourceDir) {
  if (!fs.existsSync(sourceDir)) {
    console.error(
      `Source not found: ${sourceDir}\n` +
        "Checkout prototypes/throwaway-html-clone from branch prototype/throwaway-html-clone.",
    );
    process.exit(1);
  }

  const preservedResume = fs.existsSync(RESUME_PUBLIC)
    ? fs.readFileSync(RESUME_PUBLIC)
    : null;

  rmrf(PUBLIC);
  fs.mkdirSync(PUBLIC, { recursive: true });

  for (const name of ["index.html", "404.html"]) {
    const raw = fs.readFileSync(path.join(sourceDir, name), "utf8");
    fs.writeFileSync(path.join(PUBLIC, name), stripHtml(raw));
  }

  for (const name of ["highlights.js", "highlights.css"]) {
    copyFile(path.join(sourceDir, name), path.join(PUBLIC, name));
  }

  copyFile(
    path.join(ROOT, "scripts/templates/site-chrome.css"),
    path.join(PUBLIC, "site-chrome.css"),
  );

  for (const name of CAPTURE_CSS) {
    const dest = path.join(PUBLIC, "_capture", name);
    if (name === "image-component.css") {
      const raw = fs.readFileSync(path.join(sourceDir, "_capture", name), "utf8");
      fs.writeFileSync(dest, patchImageComponentCss(raw));
    } else {
      copyFile(path.join(sourceDir, "_capture", name), dest);
    }
  }

  for (const name of ["favicon.webp", "pro-pic-circular-musa.png"]) {
    copyFile(
      path.join(sourceDir, "assets", name),
      path.join(PUBLIC, "assets", name),
    );
  }

  if (preservedResume) {
    fs.mkdirSync(path.join(PUBLIC, "s"), { recursive: true });
    fs.writeFileSync(RESUME_PUBLIC, preservedResume);
  } else {
    const fallback = path.join(sourceDir, "assets", "musa-resume-2025.pdf");
    if (fs.existsSync(fallback)) {
      copyFile(fallback, RESUME_PUBLIC);
      console.warn(
        "No public/s/musa-resume-2026.pdf found; copied throwaway placeholder.",
      );
    }
  }

  fs.writeFileSync(path.join(PUBLIC, "_redirects"), "/home /\n");

  console.log(`Promoted ${sourceDir} → public/`);
  console.warn(
    "Run: npm run init-content-slots && npm run apply-content (ADR-0007 content seam)",
  );
}

const sourceArg = process.argv.find((a) => a.startsWith("--source="));
const source = sourceArg ? path.resolve(sourceArg.slice("--source=".length)) : DEFAULT_SOURCE;
promote(source);
