# Handoff — 2026-09-03 Ship /ai fonts + production

Map: [Building with AI (Now-building index on musavvir.info)](https://github.com/musavvirahmed/ss-to-gh/issues/44) — **closed**

**Ticket:** [Ship Now-building index at /ai + homepage entry + first card](https://github.com/musavvirahmed/ss-to-gh/issues/49) — **closed**

## Shipped

- PR https://github.com/musavvirahmed/ss-to-gh/pull/51 merged to `main`
- Cloudflare Pages deploy SUCCESS; live at https://musavvir.info/ai/ (`wf-active`, Aktiv on brand + title)

## Font answer

Typekit does not load on localhost (`127.0.0.1` not in kit). Homepage uses bare `aktiv-grotesk` → serif system fallback. `/ai` had prototype Helvetica/Arial fallbacks → sans. Fixed to site font tokens so Typekit-miss matches homepage; on apex both pages use real Aktiv.

## Next frontier

Map #44 destination met. Parent map [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1) still owns post-cutover Case study task (after 15d stable). Optional: first-card `cta_href` once a public README/Case study venue exists.

/handoff
