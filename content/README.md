# Site content

Editable copy for musavvir.info. **Do not** edit bio, 404 copy, or footer text in `public/index.html` / `public/404.html`.

## Edit options

1. **Visual editor:** [https://musavvir.info/admin/](https://musavvir.info/admin/) (or `*.pages.dev/admin/` before cutover)
   - Sign in with **Sign in with Token** and a GitHub [personal access token](https://github.com/settings/tokens) with `repo` scope on `musavvirahmed/ss-to-gh`.
   - Save commits `content/site.yaml` to `main`; Cloudflare rebuilds.

2. **YAML:** edit [`site.yaml`](site.yaml), then:

   ```bash
   npm test
   git add content/site.yaml public/
   git commit -m "Update site content"
   ```

## What you can edit

| Section | Fields |
|---------|--------|
| **Shared** | `location`, `avatar`, `resume_pdf`, `footer_links` |
| **Homepage bio** | `bio.paragraphs` (markdown), `bio.highlights` (underline/scribble decorations) |
| **404 page** | `not_found.heading`, `not_found.lines` (markdown) |

Use `{{location}}` in the first bio paragraph. Highlight phrases must match bio text exactly.

## Examples

- Change city: set `location: Den Haag` (or use `{{location}}` in bio paragraph 1)
- Add a footer link: add a row under `footer_links`
- New résumé: drop PDF in `public/s/`, update `resume_pdf` (Résumé footer link href syncs on apply)
- Edit 404 message: change `not_found.heading` or `not_found.lines`

## Build

Cloudflare Pages **build command:** `npm run apply-content`  
**Output directory:** `public`

After changing slot structure: `npm run init-content-slots` (idempotent).

See ADR-0007 and `docs/research/content-edit-workflow.md`.
