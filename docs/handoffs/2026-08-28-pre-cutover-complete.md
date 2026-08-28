# Handoff — 2026-08-28 Pre-cutover complete (#25)

## Where things stand

Map: [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1).

[Pre-cutover DNS and domain staging](https://github.com/musavvirahmed/ss-to-gh/issues/25) — **human completed** `./scripts/pre-cutover-wizard.sh` (8 env flags in `.env`).

| Check | Result |
|-------|--------|
| Cloudflare zone + Jellyfish mail DNS | Done (9 records, mail A grey cloud) |
| Nameservers captured | `adaline.ns.cloudflare.com`, `quinton.ns.cloudflare.com` |
| `npm run pages:smoke` | 3/3 on `https://ss-to-gh.pages.dev` |
| `dig MX @CF_NS_1` | Jellyfish hosts OK |
| Custom domains on Pages | **Deferred** — Cloudflare blocks until NS cutover ([research](../research/cloudflare-pages-custom-domain-pre-ns.md)) |
| Bulk Redirect www→apex | **Deferred** — same (stage 8 of cutover wizard) |

## Close #25

Acceptance criteria updated in ADR-0005: custom domains + Bulk Redirect move to post-NS. Human can close #25.

## Do next (go-live #26)

When ready for traffic to leave Squarespace:

```bash
./scripts/cutover-wizard.sh
```

Skip stages 1–6 if `.env` already populated — Enter through them, or start at **stage 7** (NS cutover) if comfortable.

| Stage | Action |
|-------|--------|
| 7 | Squarespace → Cloudflare nameservers (**go-live**) |
| 8 | Pages custom domains + Bulk Redirect |
| 9 | Verify `https://musavvir.info`, TLS, HSTS |
| 10–13 | Cancel SS website, Porkbun transfer, cleanup |

**Not ready yet?** No action required. Site stays on Squarespace; `ss-to-gh.pages.dev` is the preview.

## Wizard improvements (same session)

- `pre-cutover-wizard.sh` rewritten: **6 stages**, shorter copy, merged redundant mail-verify + bulk-redirect stages.
- `cutover-wizard.sh` aligned: **13 stages**, same pre-NS flow + post-NS domains at stage 8.
