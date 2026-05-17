# _workspace/

Non-living working materials. The leading underscore is the signal: read these for *intent* and *history*, not *current reality*.

Three subfolders:

| Folder | What it is | When to write |
|---|---|---|
| [`planning/`](./planning/) | Pre-implementation feature plans | Before you start building. One folder per feature. |
| [`research/`](./research/) | Open questions evaluating options | When exploring tradeoffs before committing to a direction. |
| [`archived/`](./archived/) | Finished plans, abandoned research, original launch material | After shipping or abandoning. |

## Lifecycle

1. **Explore** in `research/<question>.md` — what are we trying to learn, what are the options.
2. **Commit** by writing a plan in `planning/<feature>/` — `summary.md` (what + why) and `technical.md` (how).
3. **Build.** While building, keep the plan updated so it reflects the actual decisions you made.
4. **Ship.** Promote the durable "how it works today" content into `docs/systems/<name>.md`.
5. **Archive.** Move the plan folder to `archived/`. The plan stays as a historical record of what was meant vs what was built.

## Why the underscore?

The underscore puts `_workspace/` next to other "non-living" or generated folders (`_examples/`, `_build/`, etc.) when sorted, and signals to agents and humans that this is *process* material, not state-of-world. Don't read `_workspace/planning/` to understand what the system *is* — read `docs/systems/` for that.
