# docs/data/

The data model as it stands today — schema, invariants, and the rules that aren't captured in column types.

What belongs here:

- **Schema overview**: tables, their purpose, the relationships that aren't obvious from foreign keys alone.
- **Invariants** the database enforces (or, more importantly, the ones it *doesn't* enforce but you still rely on).
- **Lifecycle rules**: what creates a row, what archives it, what hard-deletes it.
- **Important indexes** and the queries they exist for — so the next person doesn't drop one thinking it's unused.
- **Pointers to migration history** for major schema events; the migrations themselves live wherever `node-pg-migrate` puts them, not here.

What doesn't belong here:

- The migration files themselves (those are code, not docs).
- Why a particular schema choice was made → `../decisions/`.
- How a feature reads or writes the data → `../systems/<feature>.md`.

Organize by **subject area**, not by table. `users.md`, `billing.md`, `jobs.md` — each describes the cluster of tables, columns, and rules that hang together. A single giant `schema.md` rots fast; a per-area file changes only when that area changes.

When schema reality drifts from these docs, fix the docs in the same PR as the migration. Out-of-date schema docs are actively dangerous — readers act on them.
