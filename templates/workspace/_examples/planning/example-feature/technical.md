# Audit Log — Technical Plan

> Companion to `summary.md`. Update this doc as decisions firm up during implementation.

## Data model

New table `AuditEvent`:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `userId` | `text` | actor — nullable for system-initiated events |
| `action` | `text` | enum: `signin.success`, `signin.failed`, `password.change`, `role.change`, `apiKey.create`, `apiKey.revoke`, `data.export` |
| `targetType` | `text` | what was acted on: `User`, `ApiKey`, etc. |
| `targetId` | `text` | id of the target |
| `metadata` | `jsonb` | request IP, user agent, free-form per action |
| `createdAt` | `timestamptz` | `default NOW()`, indexed |

Indexes:

- `(userId, createdAt desc)` — for "what did this user do" queries.
- `(action, createdAt desc)` — for "show me all failed signins" queries.

Migration: standard `node-pg-migrate` file. No backfill — log starts empty.

## Write path

New module `src/lib/audit.ts` exposes:

```ts
export async function logAuditEvent(input: AuditEventInput): Promise<void>
```

- Called from server actions and route handlers at the point of the action.
- Failures are logged at `error` level but never throw — losing an audit row should never break user flow.
- Wrap each call so that "actor user id" comes from the active session (or `null` for system-initiated events).

Decided: synchronous write inside the same transaction as the action when possible, async fire-and-forget otherwise. Both flow through the same helper.

## Read path

New page `/admin/super-admin/audit`:

- Filter by user (autocomplete), action (multi-select), time window (default last 24h).
- Paginated, 50 rows per page, sorted newest first.
- Each row expandable to show full `metadata` JSON.

Server action `searchAuditEvents` does the query. Hand-rolled SQL — no ORM. Existing pagination helper applies.

## Retention

A weekly cron deletes rows older than 90 days:

```sql
DELETE FROM "AuditEvent" WHERE "createdAt" < NOW() - INTERVAL '90 days';
```

Implemented as a Vercel scheduled function. Logs how many rows it deleted to platform analytics.

## Open questions

- **Should `metadata` be free-form jsonb or per-action typed?** Going with free-form for v1 — typed once we see what fields each action actually wants to log.
- **Do we need a separate "system" actor row in `User` for system-initiated events?** Decided: no, `userId = null` is fine. The admin UI labels these as "system".
- **What about rate-limiting the audit-log query in the admin UI?** Deferred. If it becomes an issue, add a 10/min cap per admin.

## Rollout

1. Land migration + write helper (no readers yet). Start logging events in a single high-confidence place (sign-in success/failure).
2. Add the remaining write call sites action-by-action over a week. Verify each event lands as expected.
3. Land the admin page.
4. Run for one week, monitor row count + query latency.
5. Land the retention cron.

## After shipping

Promote to `docs/systems/audit-log.md`:

- Table schema as-built.
- Write helper API.
- Read-path queries with example SQL.
- Retention policy and how to change it.
- Known failure modes.

Then move this folder to `_workspace/archived/audit-log/`.
