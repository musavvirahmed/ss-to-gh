# Git-as-CMS content seam (YAML + Sveltia)

[Git-as-CMS vs a headless CMS — accept the seed?](https://github.com/musavvirahmed/ss-to-gh/issues/3) locked content in the private repo. Editing promoted Squarespace HTML directly was error-prone.

**Decision:** **Site content** lives in `content/site.yaml`. `npm run apply-content` validates and bakes it into marked slots in the Publish tree (`public/index.html`, `public/404.html`). **Sveltia CMS** at `/admin` is the visual editor over that file (GitHub backend, PAT auth for solo editor). Still Git-as-CMS — no Sanity/Contentful/Dato.

**Rejected:** hosted headless CMS (reopens #3); editing `public/index.html` by hand; cloning Squarespace `fe-block` markup for each new footer link.

**Consequences:** Cloudflare Pages build runs `npm run apply-content`. `npm test` gates bad YAML before deploy. Footer is one N-link mount (small layout change vs frozen clone). `promote:public` must re-run slot init + apply-content or it wipes markers.
