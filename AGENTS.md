# Agent instructions (public stub)

This repository hosts [musavvir.info](https://musavvir.info/) and the public **Case study** in `README.md`.

The private agent skill pack (Wayfinder, grilling, wizards-as-skills, handoffs, etc.) was removed from the public tip before publish. A full harness snapshot lives only in a local backup on the maintainer’s machine.

## Where process lives now

- **Narrative:** root [`README.md`](README.md)
- **Decisions:** GitHub Issues on this repo (map: [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1)) and [`docs/adr/`](docs/adr/)
- **Human dashboard steps:** [`scripts/*-wizard.sh`](scripts/)
- **Glossary:** [`CONTEXT.md`](CONTEXT.md)
- **Upstream skill ideas:** [Matt Pocock’s skills](https://github.com/mattpocock/skills) (not vendored here)

## Site content

Edit `content/site.yaml`, `content/not-found.yaml`, or `content/now-building.yaml` (or `/admin`). Run `npm test` before commit. Cloudflare Pages build: `npm run apply-content`.
