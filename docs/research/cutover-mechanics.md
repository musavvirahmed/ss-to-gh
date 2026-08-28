# Cloudflare zone, Porkbun NS, Pages custom domain, and Squarespace cutover mechanics (2026-08-27)

Ticket: [Cloudflare zone, Porkbun NS, Pages custom domain, and Squarespace cutover mechanics?](https://github.com/musavvirahmed/ss-to-gh/issues/18)

Context: `musavvir.info` registered at Squarespace (Tucows backend), website on Squarespace, mail via Namecheap Jellyfish (nice-to-have). Target: Cloudflare Pages from `ss-to-gh` repo; apex canonical; www→apex 301; Always Use HTTPS; HSTS ~6 months. Website renews 16 Sep 2026 (~€132/yr); domain expires 21 Apr 2027.

---

## Executive summary

**Recommended cutover sequence for this project:**

1. **Prepare Cloudflare** (zone Pending is fine): add `musavvir.info` as a full-setup zone, import/rebuild DNS (Squarespace web records replaced later; keep Jellyfish MX/SPF/mail A as DNS-only), deploy Pages, attach custom domains (`musavvir.info` + `www.musavvir.info`), configure Bulk Redirect www→apex (ADR-0004/0005), Always Use HTTPS, HSTS.
2. **Website cutover = NS change at Squarespace** → Cloudflare nameservers. This is the moment traffic leaves Squarespace hosting; Pages goes live once zone is Active and custom domains validate.
3. **Registrar transfer to Porkbun** can run **after** NS already points to Cloudflare. Porkbun preserves third-party NS through transfer — no further NS work at Porkbun unless you want to change delegation there later.
4. **Cancel Squarespace website** after cutover is verified; do **not** expect a refund on the Sep 2026 renewal (outside 14-day window). Domain subscription stays separate until transferred or auto-renew disabled.

Registrar transfer and website cutover are **decoupled**: Squarespace explicitly says transferring the domain does not cancel the site ([Transferring a domain away from Squarespace](https://support.squarespace.com/hc/en-us/articles/205812338-Transferring-a-domain-away-from-Squarespace)).

---

## 1. Order of operations

### Cloudflare zone + DNS rebuild — before NS change

Cloudflare full setup is a three-phase process: add zone → review DNS → change nameservers at registrar ([Set up a primary zone](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)).

You can (and should) complete phases 1–2 while the zone is **Pending**:

- Add the domain to Cloudflare and enter all DNS records manually or via quick scan.
- Review apex, www, and **email records** before activation ([Set up a primary zone § Review your DNS records](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)).
- Cloudflare warns that activating without correct records causes `DNS_PROBE_FINISHED_NXDOMAIN` ([same doc](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)).

**Minimize-downtime guidance** ([Minimize downtime](https://developers.cloudflare.com/fundamentals/performance/minimize-downtime/)):

- Start with records **DNS-only** (gray cloud); verify edge certificate; then proxy web records.
- Confirm apex, www, and mail records before switching NS.

### NS change — before, during, or after registrar transfer?

| Phase | Where NS is changed | Notes |
|-------|---------------------|-------|
| **Website cutover (recommended first)** | Squarespace Domains dashboard | Squarespace is the current registrar/reseller; NS update happens there ([Update nameservers](https://developers.cloudflare.com/dns/nameservers/update-nameservers/) links Squarespace provider docs). |
| **Registrar transfer** | No NS change required if already on Cloudflare | Porkbun: “If you're using a third-party host's nameservers (such as … a DNS provider like Cloudflare), they'll keep working properly after the domain transfer completes” ([Will my nameservers be imported during a transfer?](https://kb.porkbun.com/article/117-will-my-nameservers-be-imported-during-a-transfer)). |
| **During pending transfer** | Avoid | Squarespace: “After initiating the transfer, avoid changing your DNS settings … it avoids general connection issues” ([Domain transfer timing](https://support.squarespace.com/hc/en-us/articles/115011719247-Domain-transfer-timing)). |

**Recommended order for musavvir.info:**

```
A. Cloudflare zone + DNS + Pages deploy + custom domains + redirect/TLS rules (zone Pending)
B. Disable DNSSEC at Squarespace if enabled (before NS change)
C. NS change: Squarespace → Cloudflare  ← live cutover
D. Verify apex/www HTTPS, mail still resolves
E. Unlock domain + start Porkbun transfer (NS stays on Cloudflare)
F. Cancel Squarespace website subscription (after cutover; before Sep 16 if avoiding renewal)
```

**Alternative (Porkbun-first DNS):** Porkbun’s zero-downtime transfer guide rebuilds DNS on Porkbun NS *before* transfer ([transfer with little to no DNS downtime](https://kb.porkbun.com/article/89-how-to-transfer-a-domain-to-porkbun-with-no-downtime)). That path targets Porkbun-hosted DNS, not Cloudflare — **not recommended** for this project since the decision is Cloudflare authoritative DNS.

**Tucows expedite:** Squarespace Tucows domains may receive a confirmation email; clicking the link starts transfer immediately vs waiting five business days ([Transferring a domain away from Squarespace § Confirm the transfer](https://support.squarespace.com/hc/en-us/articles/205812338-Transferring-a-domain-away-from-Squarespace)).

---

## 2. Cloudflare Pages custom domain (apex + www, Cloudflare NS at Porkbun)

### Apex requires full setup

For apex (`musavvir.info`), Pages requires the domain as a **Cloudflare zone** with nameservers pointed to Cloudflare ([Custom domains § Add a custom apex domain](https://developers.cloudflare.com/pages/configuration/custom-domains/)).

Subdomains-only can use external CNAME without full zone; **apex cannot** on Free plan (partial/CNAME setup is Business+ only) ([CNAME setup (Partial)](https://developers.cloudflare.com/dns/zone-setups/partial-setup/)).

### Workflow

1. Pages → project → **Custom domains** → add `musavvir.info` and `www.musavvir.info` ([Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)).
2. Point registrar NS to Cloudflare (Squarespace now; delegation visible at Porkbun after transfer).
3. Once NS propagate and zone is Active, Cloudflare **auto-creates CNAME records** for confirmed custom domains ([Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)).

**Critical:** Do not hand-create CNAME-to-`*.pages.dev` without going through the Pages custom-domain UI — causes 522 ([Custom domains § Known issues](https://developers.cloudflare.com/pages/configuration/custom-domains/)).

### After transfer to Porkbun

NS delegation is at the **registrar** (Porkbun after transfer). Cloudflare zone is unchanged. Porkbun NS edit UI is the same whether domain registered at Squarespace or Porkbun ([How to Change Nameservers](https://kb.porkbun.com/article/22-how-to-change-nameservers)) — but if NS already show `*.ns.cloudflare.com`, **no Porkbun NS edit is needed** post-transfer ([article 117](https://kb.porkbun.com/article/117-will-my-nameservers-be-imported-during-a-transfer)).

---

## 3. Exact DNS record types for Cloudflare Pages

### Apex (`musavvir.info`)

| Type | Name | Target | Proxy | Mechanism |
|------|------|--------|-------|-----------|
| CNAME | `@` | `<project>.pages.dev` (auto by Pages) | Proxied (orange) | CNAME flattening at apex ([CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/), [Setup](https://developers.cloudflare.com/dns/cname-flattening/set-up-cname-flattening/)) |

CNAME flattening is **automatic** at zone apex on all plans when apex is a CNAME ([Set up CNAME flattening § For your zone apex](https://developers.cloudflare.com/dns/cname-flattening/set-up-cname-flattening/)). This is what makes apex Pages work without A records ([CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/): “allows you to use a root custom domain with a Cloudflare Pages site”).

Proxied records return Cloudflare anycast IPs, not the literal CNAME in public DNS ([DNS FAQ § Why are Cloudflare's A records appearing](https://developers.cloudflare.com/dns/troubleshooting/faq/)).

### www (`www.musavvir.info`)

Two valid patterns:

| Approach | Records | www→apex |
|----------|---------|----------|
| **A (recommended here)** | Pages custom domain on `www` → auto CNAME (proxied) | Single Redirect rule (below) |
| **B** | CNAME `www` → apex or Pages target | May serve duplicate content without redirect |

Pages `_redirects` file **cannot** do domain-level www→apex (`Domain-level redirects ❌`) ([Pages Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)).

### Mail (preserve from Jellyfish / Namecheap)

Keep as **DNS-only** (gray cloud). Cloudflare full-setup docs list typical mail records ([Set up a primary zone § Email records](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)):

| Type | Name | Purpose |
|------|------|---------|
| MX | `@` | Jellyfish inbound |
| TXT | `@` | SPF |
| TXT | `_dmarc` | DMARC (if used) |
| A | `mail` | Mail host (if used) |

Squarespace connection docs also warn: don’t delete MX when changing web records ([Connect a third-party domain § Step 2](https://support.squarespace.com/hc/en-us/articles/205812378)).

### Remove before cutover (Squarespace web)

Replace Squarespace apex A×4 and www CNAME (`ext-sq.squarespace.com` / `ext.cust.squarespace.com`) with Pages records above.

---

## 4. Porkbun nameserver delegation to Cloudflare

At Porkbun (post-transfer, or if domain already there):

1. Domain Management → **Details** → **Nameservers** → edit ([How to Change Nameservers](https://kb.porkbun.com/article/22-how-to-change-nameservers)).
2. Remove existing entries; add Cloudflare-assigned nameservers **exactly** (two names, from Cloudflare zone Overview / DNS Records page) ([Set up a primary zone § Get nameserver names](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)).
3. NS records in Porkbun DNS editor ≠ authoritative delegation — use the Nameservers field, not NS-type DNS records ([Porkbun DNS edit note](https://kb.porkbun.com/article/68-how-to-change-your-nameservers) — wrong article slug; see [article 22](https://kb.porkbun.com/article/22-how-to-change-nameservers)).

**Warning:** Changing away from Porkbun NS breaks Porkbun-hosted web/email ([article 22](https://kb.porkbun.com/article/22-how-to-change-nameservers)) — intended here since DNS lives in Cloudflare.

**DNSSEC:** Turn off at registrar before NS change; re-enable via Cloudflare after Active ([Set up a primary zone § Turn off DNSSEC](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)). Remove Squarespace DNSSEC before transfer if present ([Transferring away § prepare](https://support.squarespace.com/hc/en-us/articles/205812338-Transferring-a-domain-away-from-Squarespace)).

---

## 5. Squarespace website cancellation vs domain transfer

### Independent subscriptions

- **Website cancel** ≠ **domain cancel**. Domain subscription “stays active and continues to be billed” after website goes offline ([Cancel your website subscription § What happens to my other subscriptions](https://support.squarespace.com/hc/en-us/articles/205810508-Cancel-your-website-subscription)).
- **Domain transfer** ≠ **website cancel**. Squarespace: “Transferring your Squarespace domain doesn't move your site hosting … cancel your website subscription after transferring your domain” ([Transferring away](https://support.squarespace.com/hc/en-us/articles/205812338-Transferring-a-domain-away-from-Squarespace)).

### Can you cancel website before cutover?

**Yes**, but:

- Annual cancel → **immediate** offline (“Website expired” on all connected domains) ([Cancel website](https://support.squarespace.com/hc/en-us/articles/205810508-Cancel-your-website-subscription)).
- **Retain Access** option → cancel at billing-cycle end (same doc).
- Domain still resolves to Squarespace until DNS/NS changed ([What to do with your domain if you cancel](https://support.squarespace.com/hc/en-us/articles/205845348-What-to-do-with-your-domain-if-you-cancel-your-website)): “stays linked to your canceled site until you move, forward, or point it to another site.”

**Do not cancel website before Cloudflare cutover** unless intentional — visitors still hit Squarespace DNS until NS flips.

### Refund policy vs Sep 16 2026 renewal

| Item | Policy | Implication |
|------|--------|-------------|
| Website annual plan | Full refund only within **14 days of purchase**; no refund on renewals or after 14 days ([Website refund policy](https://support.squarespace.com/hc/en-us/articles/46051001586701-Website-refund-policy)) | Sep 2026 renewal (~€132) is **non-refundable** if outside 14-day window. Cancel **before renewal date** on invoice to avoid charge. |
| Monthly plan | Non-refundable | N/A if annual. |
| Domain subscription | Separate policy ([Domains refund policy](https://support.squarespace.com/hc/en-us/articles/360000623648-Refund-policies-for-your-Squarespace-subscriptions)) | Transfer to Porkbun replaces Squarespace domain billing. |

Squarespace recommends transferring domain away **before** canceling website ([What to do with domain](https://support.squarespace.com/hc/en-us/articles/205845348-What-to-do-with-your-domain-if-you-cancel-your-website)).

---

## 6. Downtime and propagation expectations

| Event | Typical duration | Source |
|-------|------------------|--------|
| Cloudflare zone NS propagation | Up to **24 hours** (registrar dependent); verify with `dig ns` / whatsmydns | [Set up a primary zone § Verify changes](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/) |
| Porkbun NS change | Up to **48 hours**; often a few hours | [How to Change Nameservers](https://kb.porkbun.com/article/22-how-to-change-nameservers), [How long NS change](https://kb.porkbun.com/article/35-how-long-will-it-take-to-switch-nameservers) |
| Cloudflare DNS record changes (once Active) | **~5 minutes** globally (proxied TTL 5 min) | [DNS FAQ § How long for DNS change](https://developers.cloudflare.com/dns/troubleshooting/faq/) |
| Squarespace DNS disconnect | Usually **<1 hour**, up to **48–72 hours** | [Canceling a Squarespace domain § Disconnect](https://support.squarespace.com/hc/en-us/articles/218813967-Canceling-a-Squarespace-domain) |
| Squarespace → Porkbun transfer | **5–7 days** typical; up to **15 days** | [Porkbun Squarespace transfer](https://kb.porkbun.com/article/229-how-to-transfer-domain-from-squarespace-to-porkbun), [Squarespace transfer timing](https://support.squarespace.com/hc/en-us/articles/115011719247-Domain-transfer-timing) |
| Pages custom domain / cert | Edge cert should be active before proxying; possible brief errors during issuance | [Minimize downtime § Verify SSL](https://developers.cloudflare.com/fundamentals/performance/minimize-downtime/) |

**Cutover risk window:** NS flip is the main user-visible event. Mail may blip if MX/SPF wrong in Cloudflare zone (acceptable per ticket context).

**Transfer while on Cloudflare NS:** Website stays on Pages throughout Porkbun transfer ([Porkbun article 117](https://kb.porkbun.com/article/117-will-my-nameservers-be-imported-during-a-transfer)).

---

## 7. HSTS, Bulk Redirects, Always Use HTTPS

### Always Use HTTPS

- Redirects all HTTP → HTTPS for all subdomains/hosts ([Always Use HTTPS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/)).
- Requires SSL/TLS mode **not Off** ([same doc](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/)).
- Available on **Free** plan.
- Enable: SSL/TLS → Edge Certificates → Always Use HTTPS.

### HSTS (~6 months)

- Enable: SSL/TLS → Edge Certificates → HSTS ([HTTP Strict Transport Security](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/)).
- **Requirements:** HTTPS working first; keep HTTPS enabled ([HSTS § Requirements](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/)).
- **Max-Age:** dashboard offers **1–12 months** — pick **6 months** (middle option).
- **includeSubDomains:** optional; if on, all subdomains must support HTTPS.
- **Preload:** optional; requires ≥12 months max-age for browser preload lists ([HSTS § Configuration](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/)).
- **Caution:** Removing HTTPS before disabling HSTS or before max-age expires can lock visitors out ([HSTS § Requirements](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/)).

**Enable HSTS only after cutover is stable** on Cloudflare.

### www → apex 301

| Tool | Fit |
|------|-----|
| **Single Redirect** (Redirect Rule) | **Best for www→apex.** Wildcard: `https://www.musavvir.info/*` → `https://musavvir.info/${1}` status **301**. Requires proxied www ([Create redirect rule](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-dashboard/)). |
| **Bulk Redirects** | Account-level; thousands of static URLs ([Bulk Redirects](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/)). Overkill for one hostname pair. Also noted for redirecting `*.pages.dev` away ([Custom domains § Disable pages.dev](https://developers.cloudflare.com/pages/configuration/custom-domains/)). |
| **Pages `_redirects`** | Path-only; no domain-level redirects ([Pages Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)). |

Bulk Redirects run after WAF; Single Redirects suffice for canonical hostname policy.

---

## Proposed cutover checklist (musavvir.info)

1. [ ] Export current DNS (Squarespace + Jellyfish records) — screenshot per Squarespace transfer guidance ([#8](https://github.com/musavvirahmed/ss-to-gh/issues/8)).
2. [ ] Disable Squarespace **website** auto-renew (before 16 Sep 2026).
3. [ ] Unlock domain; request auth code; **start Porkbun transfer** (parallel with CF prep; NS unchanged).
4. [ ] Add `musavvir.info` to Cloudflare; enter mail MX/TXT/A (DNS-only); omit Squarespace web A/CNAME.
5. [ ] Deploy production Pages; add custom domains apex + www.
6. [ ] Create Bulk Redirect: www → apex 301 (ADR-0004/0005).
7. [ ] Turn off DNSSEC at Squarespace if enabled.
8. [ ] **Go/no-go:** production Pages; mail in zone; flip-book + overlay on production URL.
9. [ ] Change NS at Squarespace to Cloudflare (**cutover / go-live**); wait for zone + custom domains Active.
10. [ ] Verify apex HTTPS, www→apex 301; enable Always Use HTTPS + HSTS (~6mo, ADR-0004).
11. [ ] **Cancel Squarespace website immediately** after go/no-go passes.
12. [ ] Porkbun transfer completes (inherit Cloudflare NS); disable Squarespace domain auto-renew when appropriate.
13. [ ] **Rollback if needed:** repoint NS + restore [#8](https://github.com/musavvirahmed/ss-to-gh/issues/8) DNS; post-cancel → re-subscribe or `*.pages.dev`.

---

## Locked runbook decisions ([#17](https://github.com/musavvirahmed/ss-to-gh/issues/17))

| # | Question | Decision |
|---|----------|----------|
| 1 | Cutover vs transfer timing | **Split:** start Porkbun transfer early (parallel with CF prep); NS cutover at Squarespace is go-live gate |
| 2 | Website cancel timing | Disable auto-renew now; cancel website immediately after go/no-go (not Retain Access); before 16 Sep 2026 |
| 3 | Go/no-go gate | Production Pages; apex + www Active in CF; mail in zone; flip-book + overlay on production URL |
| 4 | Mail during cutover | Single NS change; brief Jellyfish breakage OK; optional send test not a gate |
| 5 | Rollback | Repoint NS + restore [#8](https://github.com/musavvirahmed/ss-to-gh/issues/8) DNS; post-cancel → re-subscribe or `*.pages.dev` |
| 6 | NS flip registrar | At Squarespace before/during transfer when CF zone ready; Porkbun inherits NS on completion |
| 7 | HSTS / `*.pages.dev` | ADR-0004: ~6mo HSTS, no preload/`includeSubDomains`; `*.pages.dev` reachable |
| 8 | Tucows confirm link | Monitor registrant inbox; expedite transfer |
| — | www→apex mechanism | Bulk Redirects (ADR-0004) |

ADR: `docs/adr/0005-cutover-runbook.md`. Glossary **Cutover**, **Go/no-go gate** in `CONTEXT.md`.

## Open questions for grilling (#17)

_Resolved — see table above._

---

## Sources

### Cloudflare
- [Custom domains (Pages)](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Set up a primary zone (Full setup)](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)
- [Update nameservers](https://developers.cloudflare.com/dns/nameservers/update-nameservers/)
- [CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/)
- [Set up CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/set-up-cname-flattening/)
- [CNAME setup (Partial)](https://developers.cloudflare.com/dns/zone-setups/partial-setup/)
- [Minimize downtime](https://developers.cloudflare.com/fundamentals/performance/minimize-downtime/)
- [DNS troubleshooting FAQ](https://developers.cloudflare.com/dns/troubleshooting/faq/)
- [Always Use HTTPS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/)
- [HSTS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/)
- [Pages Redirects (_redirects)](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Single Redirects](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/)
- [Create redirect rule (dashboard)](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-dashboard/)
- [Bulk Redirects](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/)
- [Create Bulk Redirects (dashboard)](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/create-dashboard/)
- [DNS best practices — Phase 2 preparation](https://developers.cloudflare.com/learning-paths/dns-best-practices/concepts/phase-2/)

### Porkbun
- [How to Change Nameservers](https://kb.porkbun.com/article/22-how-to-change-nameservers)
- [How long NS change](https://kb.porkbun.com/article/35-how-long-will-it-take-to-switch-nameservers)
- [Transfer from Squarespace to Porkbun](https://kb.porkbun.com/article/229-how-to-transfer-domain-from-squarespace-to-porkbun)
- [Transfer to Porkbun (any registrar)](https://kb.porkbun.com/article/56-how-to-transfer-a-domain-to-porkbun)
- [Transfer with little/no DNS downtime](https://kb.porkbun.com/article/89-how-to-transfer-a-domain-to-porkbun-with-no-downtime)
- [Nameservers imported during transfer?](https://kb.porkbun.com/article/117-will-my-nameservers-be-imported-during-a-transfer)
- [Transfer statuses](https://kb.porkbun.com/article/79-what-do-transfer-statuses-mean)

### Squarespace
- [Transferring a domain away from Squarespace](https://support.squarespace.com/hc/en-us/articles/205812338-Transferring-a-domain-away-from-Squarespace)
- [Domain transfer timing](https://support.squarespace.com/hc/en-us/articles/115011719247-Domain-transfer-timing)
- [Cancel your website subscription](https://support.squarespace.com/hc/en-us/articles/205810508-Cancel-your-website-subscription)
- [Website refund policy](https://support.squarespace.com/hc/en-us/articles/46051001586701-Website-refund-policy)
- [What to do with your domain if you cancel your website](https://support.squarespace.com/hc/en-us/articles/205845348-What-to-do-with-your-domain-if-you-cancel-your-website)
- [Canceling a Squarespace domain](https://support.squarespace.com/hc/en-us/articles/218813967-Canceling-a-Squarespace-domain)
- [Connect a third-party domain (DNS record types reference)](https://support.squarespace.com/hc/en-us/articles/205812378)
