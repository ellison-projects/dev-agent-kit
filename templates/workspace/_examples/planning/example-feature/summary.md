# Audit Log — Plan Summary

> **Status:** Plan. See `technical.md` for implementation details. Once shipped, promote to `docs/systems/audit-log.md` and archive this folder.

## What we're building

A central audit log that records security-sensitive actions: who did what, when, against which resource. Append-only, queryable from an admin UI, retained for 90 days.

Initial action coverage:

- Sign-in success / failure
- Password change
- Role change
- API key creation / revocation
- Data export

## Why now

Two recent incidents needed forensic reconstruction we couldn't do cleanly — we pieced it together from application logs, which weren't designed for that purpose. An audit log makes this routine instead of archeological.

It also unblocks compliance work we're queueing for next quarter (the customer-facing claim "we log all admin actions" needs to be true).

## Who it's for

- **Engineering / on-call:** triage when something looks suspicious.
- **Customer support:** answer "when did X happen to my account?" questions.
- **Compliance:** demonstrate logging coverage to auditors.

## Out of scope for v1

- Full-text search over event payloads. (Index by user + action + time only.)
- Tamper-evident hashing (Merkle chain etc). Defer until compliance asks for it.
- Per-tenant retention overrides. Single 90-day window for v1.

## Success looks like

After we ship:

- An incident-response engineer can answer "what did user X do in the last 24 hours?" in under a minute from the admin UI.
- Every audited action lands in the log within 1 second of the underlying event.
- We never silently lose an event — audit failures are loud, never silent.
