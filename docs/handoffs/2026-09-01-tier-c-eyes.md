# Handoff — 2026-09-01 Tier C eyes / atlas (#34)

## Where things stand

Closed [Prototype: tier D 3D cursor-tracking portrait at homepage scale](https://github.com/musavvirahmed/ss-to-gh/issues/33) — **fail → C (likeness)**. Gist on [Interactive profile photo (cursor-tracking mugshot)](https://github.com/musavvirahmed/ss-to-gh/issues/28).

[Prototype: tier C gaze-portrait fallback at homepage scale](https://github.com/musavvirahmed/ss-to-gh/issues/34) — **ship tier C eyes-only, iris variant A3 (matte dark)**.

| Variant | Verdict |
|---------|---------|
| A1 photo iris | Worst of three |
| A2 wet cornea | Ok, refinable |
| **A3 matte dark** | **Ship** |
| B gaze atlas | Rejected (photo sliding); eyes-only wins |

Eyelid blink overlay attempted and removed — canvas skin fill read as white flash over eye holes. Gaze-only (pupils track cursor; lids baked in PNG).

**Run:** `npm run prototype:tier-c-eyes` → http://127.0.0.1:4189/?variant=A3

## Do next

1. Gist A3 eyes-only decision onto [#28](https://github.com/musavvirahmed/ss-to-gh/issues/28) Decisions so far.
2. `/to-spec` or implementation ticket for production tier C in homepage slot.
3. Do not reopen tier D ellipsoid.

## Suggested skills

- `/wayfinder` to close #34
- `/to-spec` when ready for production
