# Handoff — 2026-09-01 Portrait asset source

## Where things stand

Resolved [Asset source for the interactive portrait?](https://github.com/musavvirahmed/ss-to-gh/issues/32) on map [Interactive profile photo (cursor-tracking mugshot)](https://github.com/musavvirahmed/ss-to-gh/issues/28).

- Glossary: `CONTEXT.md` (**Profile photo**, **Interactive profile photo**, **Portrait bake source**)
- ADR-0009 **Portrait bake source** paragraph updated (supersedes PNG-first + one-upgrade path)
- Portrait bake source: Drive `profile-picture-i-facebook.jpg` (2880×2880); PSD only if stuck; red backdrop in bake; tier C same source; static PNG unchanged; derived assets only in repo

## Do next

Load map [#28](https://github.com/musavvirahmed/ss-to-gh/issues/28). Claim **one** unblocked frontier ticket.

Likely takeable:

- [Prototype: tier D 3D cursor-tracking portrait at homepage scale](https://github.com/musavvirahmed/ss-to-gh/issues/33) — bake from portrait bake source (Drive JPG), not the 216 PNG; `/prototype`

Still open on map: CMS integration for GLB paths, pointer normalization scope, other pages.

Plan, don't ship production site code (parent map [#1](https://github.com/musavvirahmed/ss-to-gh/issues/1) cutover still owns v1).

## Suggested skills

- `/wayfinder`
- `/prototype` for #33
- `/handoff` at session end into `docs/handoffs/`
