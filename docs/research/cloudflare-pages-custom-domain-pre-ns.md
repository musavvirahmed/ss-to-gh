# Cloudflare Pages custom domain before NS cutover (2026-08-28)

Observed during [Pre-cutover DNS and domain staging](https://github.com/musavvirahmed/ss-to-gh/issues/25).

## Finding

**Apex custom domains cannot be attached to Cloudflare Pages while the zone is Pending** (nameservers still at Squarespace).

Flow when adding `musavvir.info` on Pages → Custom domains:

1. Enter domain → **Transfer DNS management** screen.
2. **Begin DNS transfer** → redirects to **Add a site** (generic connect flow).
3. No custom domain is registered on the Pages project; Custom domains tab stays empty.

The zone already exists in the same account with mail DNS configured. Re-running **Add a site → Connect a domain** is not the fix.

## Runbook impact

ADR-0005 updated: pre-NS gate is `*.pages.dev` smoke + flip-book only. **Custom domains + Bulk Redirect www→apex move to immediately after NS cutover** (`cutover-wizard.sh` stage 10).

## References

- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) — apex requires full zone with NS at Cloudflare.
- Prior research assumed Pending attach was possible; UI behavior on 2026-08-28 contradicts that for apex.
