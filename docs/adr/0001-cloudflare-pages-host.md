# Cloudflare Pages as Host

GitHub Free cannot serve GitHub Pages from the private `ss-to-gh` repo (422). We need $0 hosting beyond the domain while keeping Git-as-CMS on that private GitHub repo. **Decision: Cloudflare Pages is the Host**, connected to `musavvirahmed/ss-to-gh`. Rejected: GitHub Pages (needs Pro or a public repo) and GitLab Pages (would move or dual-home source off the single private GitHub repo).
