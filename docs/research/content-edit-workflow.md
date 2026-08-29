# Site content editing workflow (2026-08-29)

Decision: keep **Git-as-CMS** ([#3](https://github.com/musavvirahmed/ss-to-gh/issues/3)); add a YAML **content seam** and **Sveltia CMS** at `/admin`. No hosted headless CMS.

## Problem

Site content was trapped in promoted Squarespace HTML (`public/index.html`, ~2,300 lines). Copy edits required hunting inside fluid-engine blocks. ADR-0006 chose promote-and-strip, not a framework rewrite.

## Options compared

| Approach | Edit UX | Fits static HTML + Cloudflare Pages | Cost | Verdict |
|----------|---------|-------------------------------------|------|---------|
| **YAML + apply script** | Edit `content/site.yaml` in repo | Yes — build step patches HTML | $0 | **Core** |
| **Sveltia CMS** | Form UI at `/admin`, commits to GitHub | Yes — static SPA + GitHub API ([docs](https://sveltiacms.app/en/docs/start)) | $0 | **UI layer** |
| Decap CMS | Same as Sveltia | GitHub OAuth needs Pages Functions proxy ([GitHub backend](https://decapcms.org/docs/github-backend/)) | $0 | Skip — more auth plumbing |
| Tina / Keystatic | Visual editing | Expects Next/Astro app ([Keystatic](https://keystatic.com/)) | $0–cloud | Rejected — rewrite |
| Pages CMS | Git-native UI | Self-host needs PostgreSQL + GitHub App ([docs](https://pagescms.org/docs/)) | Infra | Rejected — ops |
| Sanity / Contentful / Dato | Hosted dashboard | Content leaves git; API at build/runtime | Free tier + vendor | Rejected — reopens #3 |

## Chosen architecture

1. **`content/site.yaml`** — sole source of truth for bio location, footer links, résumé path, avatar path.
2. **`npm run apply-content`** — validates YAML, patches marked slots in `public/index.html` and `public/404.html`, copies `content/admin/` → `public/admin/`.
3. **Sveltia CMS** at `/admin` — GitHub backend, solo editor uses [PAT sign-in](https://sveltiacms.app/en/docs/backends/github#access-token-quick-start) (no OAuth Worker). Pinned `@sveltia/cms@0.198.0`.
4. **Cloudflare Pages** build command: `npm run apply-content` ([build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)).
5. **Smoke tests**: `npm test` → `content:smoke` (schema + apply + HTML assertions); `pages:smoke` post-deploy.

## What editors do

- **Visual:** open `https://musavvir.info/admin/` → Sign in with GitHub token → edit Site content → Save (commits `content/site.yaml`).
- **Direct:** edit `content/site.yaml`, run `npm test`, commit.
- **Never:** edit bio/footer copy inside `public/index.html`.

## Footer links

Replaced four Squarespace `fe-block` cells with one schema-driven `<nav id="content-footer-links">` so N links need no grid surgery.

## References

- [Sveltia CMS — Getting started](https://sveltiacms.app/en/docs/start)
- [Sveltia CMS — GitHub backend](https://sveltiacms.app/en/docs/backends/github)
- [Decap CMS — GitHub backend](https://decapcms.org/docs/github-backend/)
- [Decap CMS — Backends overview (OAuth proxy)](https://decapcms.org/docs/backends-overview/)
- [Cloudflare Pages — Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- ADR-0007: `docs/adr/0007-git-cms-content-seam.md`
