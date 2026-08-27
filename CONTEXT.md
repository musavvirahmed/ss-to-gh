# musavvir.info migration

Domain language for replacing the Squarespace-hosted personal site with a cheap static equivalent. This harness decides how that site is owned and edited; it is not the live site itself.

## Language

**Site content**:
The editable words and assets on musavvir.info — bio copy, avatar image, footer links, and résumé PDF.
_Avoid_: page content, CMS content, marketing copy

**Git-as-CMS**:
The chosen editing model: Site content lives in the git repo and changes by commit. There is no separate CMS.
_Avoid_: headless CMS, content platform, Squarespace editor

**Host**:
The service that serves the built static site to the public — Cloudflare Pages, connected to the private GitHub repo `ss-to-gh`.
_Avoid_: hosting provider, CDN alone, GitHub Pages, GitLab Pages
