# Visit counter via GoatCounter (post-cutover)

Post-cutover health on musavvir.info needs light pageview/event signal (apex alive, résumé click, 404 spikes) without reopening product analytics or the pixel bar. **Decision:** add a **Visit counter** with a new GoatCounter site code `musavvir-info`; embed via `public/goatcounter.js` (commit-edited, not Site content / Sveltia); count only on Canonical hostname `musavvir.info` (skip `/admin` and non-apex hosts such as `*.pages.dev`); no consent banner; résumé footer click as a GoatCounter event; self-noise reduced with `#toggle-goatcounter` plus Ignore IPs when useful. Ship when tickets land (not deferred to the 15d case-study window).

**Rejected:** reusing `musavvir-fyi` (or other existing codes) and mixing hosts; putting the count endpoint in `content/site.yaml`; consent chrome on the one-pager; matching .fyi’s stock noisy embed as the exclusion bar; waiting for 15d “clean” charts before enabling.
