# Site content schema covers homepage bio, 404 copy, and Now-building index

Extends [ADR-0007](0007-git-cms-content-seam.md).

**Decision:** `content/site.yaml` holds homepage `bio` (markdown paragraphs + highlight registry) and shared fields (`location`, `avatar`, `resume_pdf`, `footer_links`). `content/not-found.yaml` holds 404 heading/lines. `content/now-building.yaml` holds the `/ai` **Building with AI** heading, optional intro, and cards (title + paragraph + optional CTA). `npm run apply-content` bakes slots in `public/index.html`, `public/404.html`, and `public/ai/index.html`. Footer links use `display: contents` + original Squarespace `grid-area` map (four links) on homepage/404; `/ai` uses a simple flex footer row.

**Rejected:** editing promoted HTML by hand; flex-only footer layout on homepage (regressed vs fluid-engine grid).

**Consequences:** Sveltia form groups Homepage bio, 404 page, Building with AI, and shared fields. Highlight phrases validated at apply time. Résumé footer `href` syncs from `resume_pdf`. Empty card `cta_href` is normalized away before schema validation (no button).
