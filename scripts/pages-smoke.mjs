#!/usr/bin/env node
/** Smoke-test a Cloudflare Pages deploy (homepage, résumé PDF, custom 404). */

const base = (
  process.env.PAGES_DEV_URL ?? "https://ss-to-gh.pages.dev"
).replace(/\/$/, "");

const checks = [
  {
    name: "homepage",
    path: "/",
    status: 200,
    bodyIncludes: "highlights.css",
  },
  {
    name: "résumé PDF",
    path: "/s/musa-resume-2026.pdf",
    status: 200,
    contentTypeIncludes: "application/pdf",
  },
  {
    name: "custom 404",
    path: "/does-not-exist-pages-smoke-test",
    status: 404,
    bodyIncludes: "Custom 404 Page",
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
  if (check.bodyIncludes && !body.includes(check.bodyIncludes)) {
    problems.push(`body missing ${JSON.stringify(check.bodyIncludes)}`);
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
