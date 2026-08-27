# Apex as Canonical hostname

Live Squarespace already serves apex and 301s `www`/HTTP there. **Decision: Canonical hostname is `https://musavvir.info`**, with Always Use HTTPS, 301 www→apex (path+query preserved via Cloudflare Bulk Redirects), HSTS on (~6 months, no preload / no `includeSubDomains`), and `*.pages.dev` left reachable for checks. Rejected: www as canonical; dual-host serving; redirecting or hiding `pages.dev` for v1.
