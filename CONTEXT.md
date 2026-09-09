# musavvir.info migration

Domain language for replacing the Squarespace-hosted personal site with a cheap static equivalent. This harness decides how that site is owned and edited; it is not the live site itself.

## Language

**Site content**:
The editable words and assets on musavvir.info — homepage bio (markdown paragraphs + highlighted phrases), page-not-found copy, profile photo, footer links, résumé file, and Now-building index entries.
_Avoid_: page content, CMS content, marketing copy

**Now-building index**:
The public, ungated gallery on musavvir.info at `/ai` (public label **Building with AI**) — cards exhibiting AI-assisted work currently on display, including shipped builds, edited as Site content. Homepage entry is a bio highlight phrase (`building with AI` → `/ai`), not header nav. Not a lift of the password-gated musavvir.fyi AI prototypes catalog.
_Avoid_: AI prototypes, portfolio, case studies (ambiguous), Case study

**Case study**:
The public write-up of the Squarespace→static migration (job-search signal and craft/teaching), published as this repo’s root `README.md`. Sibling of a Now-building index card, not the index itself.
_Avoid_: live-site case-study page, Now-building index, portfolio case study

**Profile photo**:
The circular headshot in the homepage bio — static PNG, edited as Site content. Shown on mobile and when reduced motion is preferred; also the fallback when the interactive profile photo does not load.
_Avoid_: avatar, mugshot, portrait (ambiguous)

**Interactive profile photo**:
Post-cutover desktop delight: the profile photo slot tracks the visitor’s cursor (3D head or gaze atlas). Ships after cutover; wink tone, not a hero takeover. Recognizable likeness required.
_Avoid_: mascot, cursor cam, animated avatar

**Portrait bake source**:
The high-resolution rectangular photograph used offline to produce interactive profile photo assets. Held outside Site content; only derived assets (e.g. GLB, atlas) are committed. Not the circular profile photo PNG; not a generative stranger face.
_Avoid_: source image, training photo, AI head model

**Homepage bio**:
The three intro paragraphs on the homepage, plus optional phrase highlights (underline, scribble, bold, link).
_Avoid_: hero copy, about text, bio block

**Page not found**:
The page heading and message shown on the custom 404 page when a URL does not exist. Edited in `content/not-found.yaml` (its own item in `/admin`).
_Avoid_: 404 page, error page, not_found

**HTML title**:
The browser-tab (and social-share) title for a page — edited per Site content entry as `html_title`. Distinct from the on-page heading.
_Avoid_: page title (ambiguous), document title, meta title, SEO title

**Footer links**:
The row of named links at the bottom of every page (link text + web address).
_Avoid_: footer menu, social links (unless they are only in the footer)

**Git-as-CMS**:
The chosen editing model: Site content lives in the git repo and changes by commit. There is no separate CMS.
_Avoid_: headless CMS, content platform, Squarespace editor

**Host**:
The service that serves the built static site to the public — Cloudflare Pages, connected to the GitHub repo `ss-to-gh` (public as of the Case study publish; was private during planning and cutover).
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

## Interactive profile photo

**Tier D**:
The preferred post-cutover delight: a lazy-loaded 3D cursor-tracking portrait (pre-baked GLB + WebGL) in the homepage profile photo slot at 216×216.
_Avoid_: 3D avatar, WebGL mugshot, Copilot clone

**Tier C**:
The fallback when tier D fails its bar: a 2D gaze sprite atlas with cursor tracking in the same slot. Eyes-only cutout (static photo, canvas irises behind punched sockets) is a valid C implementation.
_Avoid_: 2D fallback, sprite portrait, Lottie head

**Wink tone**:
The intended feel of the interactive portrait — noticeable when you move the cursor, not a full-page hero takeover or showpiece.
_Avoid_: delight mode, easter egg, micro-interaction (too generic)

**Static PNG fallback**:
The non-interactive profile photo shown on mobile, when `prefers-reduced-motion` is on, or when WebGL init fails. Not tier C — progressive enhancement only.
_Avoid_: mobile fallback, reduced-motion mode

## Ops

**Visit counter**:
Privacy-oriented pageview and event counts for the Canonical hostname (GoatCounter site `musavvir-info`), outside Site content — a commit-edited Publish-tree wrapper, not Sveltia.
_Avoid_: analytics, tracking, metrics, GoatCounter (prefer the role name; product is the implementation)
