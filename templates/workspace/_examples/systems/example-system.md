# Audit Log

Append-only log of security-sensitive actions: who did what, when, against which resource. Queryable from an admin UI, retained 90 days.

Use this doc to understand how it works today. For the original plan (intent, alternatives considered), see `_workspace/archived/audit-log/`.

## Schema

Table `AuditEvent`:

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` | PK |
| `userId` | `text` | actor; `null` for system-initiated events |
| `action` | `text` | enum (see below) |
| `targetType` | `text` | what was acted on: `User`, `ApiKey`, etc. |
| `targetId` | `text` | id of the target |
| `metadata` | `jsonb` | request IP, user agent, free-form per action |
| `createdAt` | `timestamptz` | `default NOW()` |

Indexes: `(userId, createdAt desc)` and `(action, createdAt desc)`.

Action enum (kept in `src/lib/audit.ts` as `AuditAction`):

- `signin.success`, `signin.failed`
- `password.change`
- `role.change`
- `apiKey.create`, `apiKey.revoke`
- `data.export`

## Write path

`logAuditEvent()` in `src/lib/audit.ts`:

```ts
export async function logAuditEvent(input: AuditEventInput): Promise<void>
```

Call from a server action or route handler at the point of the action. Caught and logged on failure — never throws. Wraps `query()` from `@/lib/db-pg`.

Current callers:

- `src/app/(auth)/signin/actions.ts` — `signin.success`, `signin.failed`
- `src/app/admin/account/password/actions.ts` — `password.change`
- `src/app/admin/super-admin/users/[id]/actions.ts` — `role.change`
- `src/app/admin/api-keys/actions.ts` — `apiKey.create`, `apiKey.revoke`
- `src/app/admin/exports/actions.ts` — `data.export`

## Read path

Admin UI at `/admin/super-admin/audit`. Server action `searchAuditEvents` builds a parameterized SQL query with optional filters (`userId`, `action[]`, time window). Returns paginated rows + total count.

Default time window: last 24 hours. Page size: 50.

## Retention

Vercel scheduled function `scripts/cron/audit-cleanup.ts` runs weekly. Deletes rows older than 90 days:

```sql
DELETE FROM "AuditEvent" WHERE "createdAt" < NOW() - INTERVAL '90 days';
```

Deletion count logged to `AnalyticsEvent` for observability. If you need a different retention window, change the interval here and update this doc.

## Failure modes worth knowing

- **`logAuditEvent` is fire-and-forget.** A DB outage means events are lost without breaking the user flow. Acceptable — audit miss > user-visible failure.
- **Retention cron skipped.** If the Vercel cron fails to run for several weeks, rows accumulate. Table grows but nothing else breaks. Re-runs of the cron catch up.
- **No tamper detection.** Anyone with DB write access can delete or modify rows. Compliance work in a future quarter will add Merkle-chain integrity if needed.

## Operator concerns

- No env vars specific to this system.
- Monitor: row insert rate, query p95 latency on the admin page, cron success.
- Schema changes: new actions get added to the `AuditAction` enum + (rarely) a migration if `metadata` shape needs a constraint.
