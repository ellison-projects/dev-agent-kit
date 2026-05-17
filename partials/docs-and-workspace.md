## Docs and workspace

Two top-level folders for project material — know which is which:

- **`docs/`** — state of the world **today**. If reality changes, update these docs in the same commit. Common subfolders: `patterns/` (code conventions), `systems/` (living "how it works today" docs for shipped features), `features/` (per-feature state-of-world references).
- **`_workspace/`** — non-living working materials. The underscore is the signal. Common subfolders: `planning/` (pre-implementation feature plans), `research/` (open questions evaluating options), `archived/` (finished plans, abandoned research).

Pre-implementation plans go in `_workspace/planning/<feature>/`, not `docs/`. After shipping, promote the durable parts into `docs/systems/`, then archive the plan. The split keeps the docs you read in-flight (plans, options, debate) separate from the docs you read to understand reality today.
