# Scripts

This folder contains build helpers, smoke checks, and unit tests for the static site.

Edit page copy in [`content/`](../content/). These scripts bake that copy into `public/` and check the result.

## Commands

| npm script | What it does |
| ---------- | ------------ |
| `npm run apply-content` | Writes `content/*.yaml` into HTML slots under `public/`. Cloudflare Pages runs this on every build. |
| `npm run init-content-slots` | Adds or repairs HTML content markers. Safe to run more than once. |
| `npm run serve:public` | Serves `public/` locally. Serves custom `404.html` and maps `/home` to the homepage. |
| `npm test` | Runs content smoke, unit tests, and the avatar geometry smoke. |

## Files

| Path | Role                                                                            |
| ---- | ------------------------------------------------------------------------------- |
| `apply-content.mjs` | Entry point for the content bake.                                |
| `init-html-content-slots.mjs` | One-time (or post-promote) HTML slot surgery.          |
| `serve-public.py` | Local preview server for `public/`.                                |
| `content-smoke.mjs` | Schema, bake idempotency, and HTML assertions.                   |
| `avatar-geometry-smoke.mjs` | Playwright check that the profile photo stays square.    |
| `site-content.test.mjs` | Unit tests for the content library.                          |
| `interactive-profile-photo.test.mjs` | Unit tests for the interactive portrait script. |
| `lib/` | Shared content bake and validation code.                                      |
| `templates/` | CSS and markup pieces used by the scripts.                              |

## Usual flow

```bash
npm run apply-content
npm test
npm run serve:public
```

After you change slot structure in the HTML, run `npm run init-content-slots`, then apply content again.
