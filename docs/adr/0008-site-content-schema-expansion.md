# Site content schema covers homepage bio and 404 copy

Extends [ADR-0007](0007-git-cms-content-seam.md).

**Decision:** `content/site.yaml` holds homepage `bio` (markdown paragraphs + highlight registry), `not_found` (404 heading/lines), and shared fields (`location`, `avatar`, `resume_pdf`, `footer_links`). `npm run apply-content` bakes slots in `public/index.html` and `public/404.html`. Footer links use `display: contents` + original Squarespace `grid-area` map (four links).

**Rejected:** editing promoted HTML by hand; flex-only footer layout (regressed vs fluid-engine grid).

**Consequences:** Sveltia form groups Homepage bio, 404 page, and shared fields. Highlight phrases validated at apply time. Résumé footer `href` syncs from `resume_pdf`.
