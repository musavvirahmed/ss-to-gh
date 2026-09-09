# Leaving Squarespace without learning to be a sysadmin

**Live site:** [musavvir.info](https://musavvir.info/) · **Cutover:** 3 Sep 2026 · **Stable:** 5+ days

I used to pay Squarespace on the order of **€132/year** (plus tax) to park a one-page personal site. The domain renewal was never the expensive part. The subscription was.

I wanted out — same site, near-zero hosting cost, domain somewhere cheap and boring — without turning the cutover into a second job. I ran the migration with coding agents (Cursor / Claude) behind a decision map on GitHub Issues, and put the scary human-only steps (DNS, registrar, cancel) into **interactive bash wizards** so I could click dashboards without inventing the order from memory.

**Outcome:** [musavvir.info](https://musavvir.info/) still looks like itself. Hosting beyond the domain is effectively **$0** (Cloudflare Pages). The domain lives at Porkbun with my other names. Squarespace website billing is gone.

This README is the public **Case study**: skim below, then the longer memoir. The clone stack is supporting cast. The escape hatch is the point.

---

## Skim this first

| | |
|---|---|
| **Problem** | Squarespace was convenient and expensive for a static personal page. |
| **Goal** | Identical site; $0 host beyond domain; leave Squarespace website billing. |
| **Method** | Agent-led planning (Wayfinder issues → ADRs) + human dashboard wizards for go-live. |
| **Host** | Cloudflare Pages ← this GitHub repo. |
| **Registrar** | Porkbun (transfer off Squarespace Domains). |
| **Edit model** | Git-as-CMS: `content/*.yaml` + optional Sveltia at `/admin`. |
| **What you must do by hand** | Cloudflare / Porkbun / Squarespace clicks — scripted by `scripts/*-wizard.sh`, not by vibes. |
| **What agents did** | Research, prototypes, pixel gates, content seams, runbook decisions — not your registrar password. |
| **Don’t cargo-cult** | Pixel-identical bar, visual waives, and portrait delight were *my* scope. Your escape hatch may be uglier and still win. |

If you only need the non-technical path: stage DNS on Cloudflare → flip nameservers at Squarespace → attach custom domain + www→apex → verify → **cancel the website** → transfer the domain to Porkbun. The wizards in `scripts/` encode that order.

---

## The longer story

### Why leave

The site is a one-pager: bio, links, résumé. Squarespace was fine product — and the wrong price for “HTML that barely changes.” Renewal math made the website plan the material cost; `.info` at Porkbun is on the order of **~$22/year**, which is the boring line item you keep.

I also wanted a job-search and teaching artifact: prove I can ship with agents without pretending agents can click Squarespace for me.

### What “agent-led” meant here

I did **not** open a chat and say “migrate my site” once.

I used [Matt Pocock’s Wayfinder](https://github.com/mattpocock/skills) shape: one map issue ([musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1)), child tickets for research / prototypes / grilling / tasks, decisions written down, then ADRs in `docs/adr/`. Agents claimed one frontier ticket at a time. Humans answered grilling. Dashboards stayed human.

Before this repo was published, a private agent harness (skills, handoffs, local backups) lived here too. That pack was removed from the public tip on purpose; the **decision trail** (Issues + ADRs + wizards) is what remains for readers. A full private snapshot stays on my machine.

### The escape hatch (foreground)

Cutover is mostly **order**, not clever code.

Locked runbook ([ADR-0005](docs/adr/0005-cutover-runbook.md)):

1. **Pre-NS:** Cloudflare zone with mail DNS copied; production deploy healthy on `*.pages.dev`; smoke + eyeball. Custom domains wait — Pages blocked apex while the zone was Pending.
2. **Go-live:** change nameservers at Squarespace to Cloudflare. That flip *is* go-live.
3. **Same day after NS stable:** attach apex + `www` on Pages; Bulk Redirect `www` → apex; verify HTTPS and mail; **cancel Squarespace website** (don’t “Retain Access” as a comfort blanket); unlock + transfer domain to Porkbun; confirm the Tucows/OpenSRS email.
4. **Rollback:** none worth planning — fix forward on Cloudflare.

Wizards that walked me through the clicks:

- `scripts/pre-cutover-wizard.sh`
- `scripts/cutover-wizard.sh`
- `scripts/fix-www-apex-redirect-wizard.sh` (we hit a bad Bulk Redirect row once; the wizard exists because dashboards lie politely)

Agents drafted research and the runbook. **I** still logged into Squarespace, Cloudflare, and Porkbun.

### Supporting cast (the stack)

| Piece | Choice | Why (short) |
|---|---|---|
| Host | Cloudflare Pages | GitHub Free couldn’t serve Pages from a private repo; Pages + CF DNS was $0 beyond domain ([ADR-0001](docs/adr/0001-cloudflare-pages-host.md)). Repo is public now; the Host decision still holds. |
| Registrar | Porkbun | Transfer, don’t DNS-only-at-Squarespace ([ADR-0002](docs/adr/0002-porkbun-registrar.md)). |
| Canonical URL | `https://musavvir.info` | Always HTTPS; `www` → apex 301 ([ADR-0004](docs/adr/0004-apex-canonical-hostname.md)). |
| Fidelity | Pixel-identical v1 | Frozen baselines + Playwright; human **visual waive** when flip-book still passed ([ADR-0003](docs/adr/0003-pixel-identical-clone.md)). |
| Content | Git-as-CMS | `content/site.yaml` (etc.) → `npm run apply-content`; Sveltia optional ([ADR-0007](docs/adr/0007-git-cms-content-seam.md)). |
| Publish tree | `public/` | Promoted throwaway clone, stripped ([ADR-0006](docs/adr/0006-site-content-publish-tree.md)). |

Mail (Namecheap Jellyfish) was nice-to-have; brief breakage through cutover was acceptable. Visit counts use GoatCounter on the apex only ([ADR-0010](docs/adr/0010-visit-counter-goatcounter.md)).

### What went sideways (useful, not heroic)

- **Apex before NS:** Cloudflare Pages refused a sensible custom-domain attach while nameservers were still elsewhere. Staging on `*.pages.dev` was the honest pre-flight.
- **www redirect:** a legacy Bulk Redirect pattern bit us after go-live; fixed same day with a dedicated wizard.
- **Pixel gate:** Playwright failed loudly against “identical”; I waived after human flip-book/overlay still looked right. Agents don’t get to redefine “looks like my site.”
- **Scope creep after cutover:** interactive portrait, Now-building gallery, fonts — real, but orthogonal to escaping the bill. Don’t wait on delight to cancel Squarespace.

### Money and calendar

- Cancel website billing **after** verify, and before the Squarespace website renewal (mine was mid-September 2026).
- Domain auto-renew off at Squarespace once Porkbun transfer completes.
- Hosting marginal cost: domain + whatever you already pay for GitHub/Cloudflare zero-tier.

### If you want to copy the shape (not the pixels)

1. Put decisions on Issues (or equivalent) so chat logs aren’t the source of truth.
2. Write a runbook that names **one** go-live action (here: NS flip).
3. Wrap registrar/DNS/cancel in a checklist or wizard **you** will actually run.
4. Keep the static site boring: HTML/CSS in git, CMS optional.
5. Treat agents as researchers and typists with a ticket queue — not as people who own your domain lock.

### Pointers in this repo

- Decision map: [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1)
- ADRs: [`docs/adr/`](docs/adr/)
- Cutover wizards: [`scripts/`](scripts/)
- Site content: [`content/`](content/) → build into [`public/`](public/)
- Glossary: [`CONTEXT.md`](CONTEXT.md)

---

*Case study thesis: agent-led cutover memoir (job-search + teaching). Packaging: this README. Harness skill pack not published on the tip.*
