# Site content

Editable copy for musavvir.info. **Do not** edit bio, 404 copy, Now-building cards, or footer text in `public/` HTML by hand.

## Edit options

1. **Visual editor:** [https://musavvir.info/admin/](https://musavvir.info/admin/) (or `*.pages.dev/admin/` before cutover)
   - Sign in with **Sign in with Token** and a GitHub [personal access token](https://github.com/settings/tokens) with `repo` scope on `musavvirahmed/ss-to-gh`.
   - Save commits YAML under `content/` to `main`; Cloudflare rebuilds.

2. **YAML:** edit [`site.yaml`](site.yaml), [`not-found.yaml`](not-found.yaml), or [`now-building.yaml`](now-building.yaml), then:

   ```bash
   npm test
   git add content/ public/
   git commit -m "Update site content"
   ```

## What you can edit

| Section | Fields |
|---------|--------|
| **Shared** | `html_title`, `location`, `avatar`, `resume_pdf`, `footer_links` |
| **Homepage bio** | `bio.paragraphs` (markdown), `bio.highlights` (underline/scribble decorations) |
| **404 page** | `html_title`, `heading`, `lines` (markdown) |
| **Building with AI** (`/ai`) | `html_title`, `heading`, optional `intro`, `cards` (title, paragraph, optional CTA) |

`html_title` is the browser tab / social preview title (distinct from the on-page heading).

Use `{{location}}` in the first bio paragraph. Highlight phrases must match bio text exactly.

## Examples

- Change city: set `location: Den Haag` (or use `{{location}}` in bio paragraph 1)
- Add a footer link: add a row under `footer_links`
- New résumé: drop PDF in `public/s/`, update `resume_pdf` (Résumé footer link href syncs on apply)
- Edit 404 message: change `not_found.heading` or `not_found.lines`
- Add a Now-building card: edit `now-building.yaml` (or `/admin` → Building with AI); leave `cta_href` blank for no button

## Build

Cloudflare Pages **build command:** `npm run apply-content`  
**Output directory:** `public`

After changing slot structure: `npm run init-content-slots` (idempotent).

See ADR-0007 and `docs/research/content-edit-workflow.md`.
