#!/usr/bin/env node
/** Smoke-test a Cloudflare Pages deploy (homepage, résumé PDF, custom 404). */

import { loadSiteContent } from "./lib/site-content.mjs";

const base = (
  process.env.PAGES_DEV_URL ?? "https://ss-to-gh.pages.dev"
).replace(/\/$/, "");

const content = loadSiteContent();
const firstFooter = content.footer_links[0];

const checks = [
  {
    name: "homepage",
    path: "/",
    status: 200,
    bodyIncludes: ["highlights.css", content.location, firstFooter.label],
  },
  {
    name: "résumé PDF",
    path: content.resume_pdf,
    status: 200,
    contentTypeIncludes: "application/pdf",
  },
  {
    name: "custom 404",
    path: "/does-not-exist-pages-smoke-test",
    status: 404,
    bodyIncludes: ["Custom 404 Page", firstFooter.label],
  },
  {
    name: "admin UI",
    path: "/admin/",
    status: 200,
    bodyIncludes: "sveltia-cms",
  },
];

let failed = 0;

for (const check of checks) {
  const url = `${base}${check.path}`;
  let res;
  try {
    res = await fetch(url, { redirect: "follow" });
  } catch (err) {
    console.error(`FAIL ${check.name}: ${url} — ${err.message}`);
    failed++;
    continue;
  }

  const body = await res.text();
  const ctype = res.headers.get("content-type") ?? "";
  const problems = [];

  if (res.status !== check.status) {
    problems.push(`expected HTTP ${check.status}, got ${res.status}`);
  }
  const includes = Array.isArray(check.bodyIncludes)
    ? check.bodyIncludes
    : check.bodyIncludes
      ? [check.bodyIncludes]
      : [];
  for (const needle of includes) {
    if (!body.includes(needle)) {
      problems.push(`body missing ${JSON.stringify(needle)}`);
    }
  }
  if (check.contentTypeIncludes && !ctype.includes(check.contentTypeIncludes)) {
    problems.push(
      `content-type ${JSON.stringify(ctype)} missing ${JSON.stringify(check.contentTypeIncludes)}`,
    );
  }

  if (problems.length) {
    console.error(`FAIL ${check.name}: ${url}`);
    for (const p of problems) console.error(`  - ${p}`);
    failed++;
  } else {
    console.log(`PASS ${check.name}: ${url}`);
  }
}

console.log(`\nPages smoke: ${checks.length - failed}/${checks.length} passed (${base})`);
process.exit(failed ? 1 : 0);
