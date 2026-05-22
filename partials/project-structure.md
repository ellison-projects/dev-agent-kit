## Project structure

Three top-level folders for project material — know which is which:

- **`docs/`** — state of the world **today**. If reality changes, update these docs in the same commit. Subfolders: `patterns/` (code conventions), `systems/` (living "how it works today" docs for shipped features), `features/` (per-feature state-of-world references).
- **`_workspace/`** — work in flight, organized by state. The underscore is the signal. Contains: `backlog.md` (ideas), `active/<feature>/` (currently planning or implementing — each has a required `brief.md`), `archived/<feature>/` (shipped or killed).
- **`_research/`** — exploratory thinking, kept as long-lived reference. Options explored, decisions made or deferred. Doesn't move — research stays put even after the work is shipped or abandoned.

When you have an idea: write to `_research/<topic>.md` if you need to weigh options first, add a line to `_workspace/backlog.md` if direction is clear but not starting yet, or go straight to `_workspace/active/<feature>/` if you're starting now. After shipping, write `docs/systems/<feature>.md` and `git mv` the active folder to `archived/` in the same PR as the code. Research stays in `_research/` — it's thinking, not state.
