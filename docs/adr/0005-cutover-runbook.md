# Cutover runbook

Research ([#18](https://github.com/musavvirahmed/ss-to-gh/issues/18)) documented Cloudflare/Porkbun/Squarespace mechanics; grilling ([#17](https://github.com/musavvirahmed/ss-to-gh/issues/17)) locks the human runbook.

## Decision

**Go-live** is the single nameserver change at Squarespace to Cloudflare — not Porkbun transfer completion.

**Pre-NS (go/no-go before NS flip):** Cloudflare zone with Jellyfish mail records (DNS-only/grey cloud on mail **A** records only; MX/TXT have no proxy toggle); production Pages deploy verified on `*.pages.dev`; smoke test + flip-book + overlay on `*.pages.dev`; `dig MX` against the Cloudflare zone matches Jellyfish. **Custom domains and Bulk Redirect www→apex are deferred to immediately after NS cutover** — Cloudflare Pages blocks apex attach until nameservers point to Cloudflare (observed 2026-08-28; "Transfer DNS management" loops to Add a site if zone is Pending). Playwright pixel gate on production apex is **not** a cutover gate.

**NS cutover** at Squarespace → Cloudflare nameservers.

**Immediately after NS stable (before apex verify):** attach `musavvir.info` + `www.musavvir.info` on Cloudflare Pages; configure Bulk Redirect www→apex (ADR-0004).

**After NS stable (same day):** verify apex HTTPS, www→apex 301, MX lookup → cancel Squarespace **website** immediately (not Retain Access) → unlock domain + start Porkbun transfer → watch registrant inbox for Tucows/OpenSRS confirm link.

**Billing:** cancel website after cutover verify; before **16 Sep 2026** renewal (~€132) if still on Squarespace website billing. Disable Squarespace domain auto-renew after Porkbun transfer completes.

**Rollback:** none — fix forward on Cloudflare only.

**Mechanics unchanged from research:** Bulk Redirects www→apex; Always Use HTTPS + HSTS ~6mo without preload/`includeSubDomains`; `*.pages.dev` stays reachable; mail grey-cloud DNS-only; DNSSEC not delegated (no disable step expected).

## Rejected

- Early Porkbun transfer before NS cutover.
- Retain Access rollback buffer on Squarespace website billing.
- NS revert / Squarespace DNS rollback.
- Playwright pixel gate on production apex before cutover.
- Single Redirect instead of Bulk Redirects (ADR-0004 stands).
