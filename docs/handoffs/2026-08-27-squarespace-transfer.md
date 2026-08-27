# Handoff — 2026-08-27 Squarespace transfer research

## Where things stand

Resolved [Squarespace transfer lock, auth code, and DNS/email records to copy](https://github.com/musavvirahmed/ss-to-gh/issues/8) on map [musavvir.info off Squarespace](https://github.com/musavvirahmed/ss-to-gh/issues/1).

- Findings: `docs/research/squarespace-transfer.md` on `research/squarespace-transfer`
- Blob: https://github.com/musavvirahmed/ss-to-gh/blob/research/squarespace-transfer/docs/research/squarespace-transfer.md
- ICANN post-registration / post-transfer 60-day locks clear; unlock + auth/EPP in Squarespace; copy Squarespace A/`www` **and** Namecheap Jellyfish MX/SPF/mail hosts before NS change
- Keep-or-drop mail stays inside [Transfer musavvir.info to Porkbun, or DNS-only at Squarespace?](https://github.com/musavvirahmed/ss-to-gh/issues/5) (not a separate email product)

Graduated from this research:

- New task: [Confirm Domain Lock is unlockable (no CoR / Can’t unlock) for musavvir.info](https://github.com/musavvirahmed/ss-to-gh/issues/12)
- Map cutover fog now names zone rebuild before unlock

Also caught map lag: [Export avatar and resume from Squarespace assets](https://github.com/musavvirahmed/ss-to-gh/issues/10) gisted onto Decisions so far and checklist ticked.

Still plan-only: no production site code.

## Do next

Load the map. Claim **one** unblocked, unassigned frontier ticket.

Unblocked / takeable (verify assignees first — several grillings are already claimed):

- [Pixel-identical clone, or content-and-layout equivalent?](https://github.com/musavvirahmed/ss-to-gh/issues/2) (`wayfinder:grilling`)
- [Transfer musavvir.info to Porkbun, or DNS-only at Squarespace?](https://github.com/musavvirahmed/ss-to-gh/issues/5) (`wayfinder:grilling`) — blockers #8/#9 closed
- [Cloudflare Pages vs GitHub Pages vs GitLab Pages from a private repo?](https://github.com/musavvirahmed/ss-to-gh/issues/4) (`wayfinder:grilling`) — #11 closed
- [Confirm Domain Lock is unlockable (no CoR / Can’t unlock) for musavvir.info](https://github.com/musavvirahmed/ss-to-gh/issues/12) (`wayfinder:task`, HITL / `/wizard`)

[Throwaway HTML clone: does this look like musavvir.info?](https://github.com/musavvirahmed/ss-to-gh/issues/6) still has an open blocker (likely #2).

Untracked `CONTEXT.md` may still be in the working tree from the Git-as-CMS grilling; commit it on `main` if it belongs there.

## Suggested skills

- `/wayfinder` (work the map)
- `/grilling` + `/domain-modeling` for #2 / #4 / #5
- `/wizard` for Squarespace dashboard on #12
- `/handoff` at session end into `docs/handoffs/`
