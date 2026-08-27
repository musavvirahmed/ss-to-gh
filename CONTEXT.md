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

**Registrar**:
Where `musavvir.info` is registered after cutover — Porkbun (same account as `musavvir.work` and `musavvir.fyi`).
_Avoid_: DNS host, nameserver provider, Squarespace Domains (post-transfer)

**Canonical hostname**:
The public URL of the Site — apex `https://musavvir.info`. `www` and plain HTTP permanently redirect here; the Pages `*.pages.dev` hostname is not the Canonical hostname.
_Avoid_: primary domain, preferred URL, www subdomain

**Pixel-identical clone**:
The v1 fidelity bar: musavvir.info must match today’s live page in fonts, spacing, colour, and size at every captured live CSS breakpoint, including hover/focus/transitions and document head (favicon, title, basic social meta).
_Avoid_: visual identical, content-and-layout equivalent, redesign

**Frozen baseline**:
Committed screenshots of the live site at those breakpoints; Playwright compares the clone against these images, not against the live URL.
_Avoid_: live screenshot oracle, golden master (ambiguous)

**Visual waive**:
A human override of a Playwright pixel-diff failure, allowed only after flip-book and overlay checks still pass.
_Avoid_: force pass, ignore diff
