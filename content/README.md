# Site content

Editable copy for musavvir.info. **Do not** edit bio or footer text in `public/index.html`.

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

## Examples

- Change city: set `location: Den Haag`
- Add a footer link: add a row under `footer_links`
- New résumé: drop PDF in `public/s/`, update `resume_pdf` and the Résumé link `href`

## Build

Cloudflare Pages **build command:** `npm run apply-content`  
**Output directory:** `public`

See ADR-0007 and `docs/research/content-edit-workflow.md`.
