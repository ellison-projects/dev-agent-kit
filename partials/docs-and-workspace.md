## Docs and workspace

Two top-level folders for project material — know which is which:

- **`docs/`** — reference material that doesn't move. Subfolders: `patterns/` (code conventions), `systems/` (living "how it works today" docs for shipped features), `features/` (per-feature state-of-world references), `research/` (option exploration and decisions — kept around as the trail of "why we picked X over Y").
- **`_workspace/`** — work in flight, organized by state. The underscore is the signal. Contains: `backlog.md` (ideas), `active/<feature>/` (currently planning or implementing), `archived/<feature>/` (shipped or killed).

When you have an idea: write to `docs/research/<topic>.md` if you need to weigh options first, add a line to `_workspace/backlog.md` if direction is clear but not starting yet, or go straight to `_workspace/active/<feature>/` if you're starting now. After shipping, promote the durable parts into `docs/systems/` and move the active folder to `archived/`. Research doesn't move — it stays in `docs/research/` as reference.
