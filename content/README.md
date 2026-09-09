# Site content

This is the copy for [musavvir.info](https://musavvir.info/).

Do not edit the bio, 404 page, Building with AI cards, or footer in `public/` HTML.

## Edit in the browser

Open [musavvir.info/admin](https://musavvir.info/admin/) (or `*.pages.dev/admin/` on a preview).

1. Choose **Sign in with Token**.
2. Use a GitHub [personal access token](https://github.com/settings/tokens) with `repo` scope on `musavvirahmed/ss-to-gh`.
3. Save. This commits the YAML in `content/` to `main`. Cloudflare rebuilds the site.

## Edit YAML

Edit [`site.yaml`](site.yaml), [`not-found.yaml`](not-found.yaml), or [`now-building.yaml`](now-building.yaml). Then:

```bash
npm test
git add content/ public/
git commit -m "Update site content"
```

## Notes

- `html_title` is the title for the browser tab and for social previews. It is not the heading on the page.
- Put `{{location}}` in the first bio paragraph.
- Highlight phrases must match the bio text exactly.
- For a new résumé, put the PDF in `public/s/`. Then set `resume_pdf`. The footer Résumé link updates when you apply content.
- For a Building with AI card with no button, leave `cta_href` blank.

The Cloudflare Pages build command is `npm run apply-content`. The output directory is `public`.

After you change slot structure, run `npm run init-content-slots`. You can run that command more than once.
