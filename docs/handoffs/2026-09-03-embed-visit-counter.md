# Handoff — 2026-09-03 Embed Visit counter

**Map:** [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1)  
**Ticket:** [Embed Visit counter (public/goatcounter.js + résumé event)](https://github.com/musavvirahmed/ss-to-gh/issues/43) — closed  
**Prior:** [Wizard: create GoatCounter site musavvir-info for Visit counter](https://github.com/musavvirahmed/ss-to-gh/issues/42) — closed this session

## Done

- Apex-only wrapper `public/goatcounter.js` → `https://musavvir-info.goatcounter.com/count`; skips `/admin` and non-`musavvir.info` hosts.
- Homepage + `404.html` load `/goatcounter.js`; admin does not.
- Résumé footer: `data-goatcounter-click="resume"` baked by `renderFooterLinks` (survives `apply-content`).
- Smoke coverage in `scripts/content-smoke.mjs`; `npm test` green.
- Map Decisions so far updated for #42 and #43.

## Uncommitted (local)

- `public/goatcounter.js`, HTML script tags, footer bake, `site-content.mjs`, content-smoke
- Earlier wizard artifacts: `scripts/goatcounter-site-wizard.sh`, ADR-0010, `.env.example`, `CONTEXT.md` Visit counter glossary
- This handoff

## Map #1 status

Visit-counter route complete. Remaining fog: Case study task after cutover + 15d stable. Open wayfinder work is on map [Building with AI…](https://github.com/musavvirahmed/ss-to-gh/issues/44).

## Next

1. Commit + push Publish-tree Visit counter (and wizard/ADR if still dirty) so Cloudflare Pages deploys.
2. On live apex: confirm a pageview in the musavvir-info dashboard; click Résumé for the `resume` event; optionally `#toggle-goatcounter` for self-exclusion.
3. Or continue map #44 frontier grilling/prototype.
