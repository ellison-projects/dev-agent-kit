---
globs:
  - "migrations/**/*.sql"
---

# Migrations

## Filename timestamps

Use a real `Date.now()` timestamp for the filename prefix — run `date +%s%3N` in the shell to generate one. Never manually increment from the last migration or use a round number; parallel branches will collide.

```bash
# Generate a fresh timestamp:
date +%s%3N
# → 1716401234567

# Then name the file like:
# migrations/1716401234567_add_widgets_table.sql
```

## Keep schema docs in sync

When you create or modify a `.sql` migration, update the matching subject-area schema doc in the same commit. Each consumer repo has its own location for these — common conventions:

- `docs/data/<area>.md` (one file per subject area like `users.md`, `billing.md`)
- `docs/schema/<area>.md`
- A single `docs/database.md` for smaller repos

Check the repo's `docs/` layout (or its `docs/CLAUDE.md` if present) to confirm where schema docs live.

What to update:

- Add or remove tables from the subject-area overview.
- Update column descriptions when columns are added, dropped, or altered.
- Update invariants and lifecycle rules when behavior changes.
- Keep table-purpose descriptions accurate after refactors or renames.

If a migration introduces a new subject area not yet covered, create the corresponding doc in the same commit.

## Why this rule exists

Schema docs that drift from reality are worse than no docs — agents reading them make confident, wrong decisions. Pairing migration edits with doc updates in the same commit is the cheapest way to keep them honest: if you wrote the SQL, you already know what the doc needs to say.
