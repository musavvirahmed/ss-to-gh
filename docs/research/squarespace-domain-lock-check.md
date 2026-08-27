# Squarespace Domain Lock check — musavvir.info

Ticket: [Confirm Domain Lock is unlockable (no CoR / Can’t unlock) for musavvir.info](https://github.com/musavvirahmed/ss-to-gh/issues/12)

Checked: 2026-08-27 in Squarespace Domains dashboard (human confirmation + screenshot).

## Outcome

**Unlockable.** Default Domain Lock is **On**; the Domain Lock toggle is present and operable. No “Can’t unlock domain” (or other time-based / Change-of-Registrant) message. Human confirmed the toggle can be switched off.

Domain was **not** unlocked in this check. Leave lock on until a transfer is intentionally started.

## Evidence

Screenshot: [`squarespace-domain-lock-musavvir-info.png`](./squarespace-domain-lock-musavvir-info.png)

UI shows:

- Section **DOMAIN LOCK** with status **On**
- Green toggle labelled **LOCK** (active)
- Help tooltip: domain lock prevents transfer to another registrar; unlock only when planning to transfer

## Implication

A registrar transfer away from Squarespace is not blocked by a CoR / ICANN time-based unlock prohibition as of this check. Unlock + auth/EPP remain later cutover steps (see closed research on transfer lock / DNS copy).
