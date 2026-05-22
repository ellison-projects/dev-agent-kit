## Docs and workspace

Two top-level folders for project material — know which is which:

- **`docs/`** — state of the world **today**. If reality changes, update these docs in the same commit. Common subfolders: `patterns/` (code conventions), `systems/` (living "how it works today" docs for shipped features), `features/` (per-feature state-of-world references).
- **`_workspace/`** — working materials. The underscore is the signal. Contains: `backlog.md` (ideas), `research/` (long-lived reference — options explored, decisions made), `active/<feature>/` (currently planning or implementing), `archived/<feature>/` (shipped or killed).

When you have an idea: write to `_workspace/research/<topic>.md` if you need to weigh options first, add a line to `_workspace/backlog.md` if direction is clear but not starting yet, or go straight to `_workspace/active/<feature>/` if you're starting now. After shipping, promote the durable parts into `docs/systems/` and move the active folder to `archived/`. Research stays put — it's reference, not work-in-flight.
