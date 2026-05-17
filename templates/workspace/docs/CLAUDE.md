# docs/

State-of-the-world documentation. If reality changes, update these docs in the same commit.

For pre-implementation plans, open research, and archived material, see [`../_workspace/CLAUDE.md`](../_workspace/CLAUDE.md).

| Folder | What it is | When to write |
|---|---|---|
| [`patterns/`](./patterns/) | Code conventions (error handling, testing, naming, etc.) | When you establish a new convention you want enforced everywhere |
| [`systems/`](./systems/) | Living "how it works today" docs for shipped systems | **After** shipping. Promote durable parts of the plan, then keep updated |
| [`features/`](./features/) | Per-feature state-of-world references | When a feature needs its own current-behavior doc that doesn't fit `systems/` |

## Decision tree

- **About to build something new?** → Write a plan in [`_workspace/planning/<feature>/`](../_workspace/planning/CLAUDE.md). Don't put in-progress plans in `docs/`.
- **Exploring options?** → Output to [`_workspace/research/<topic>/`](../_workspace/CLAUDE.md). Promote to planning once you've picked a direction.
- **Just shipped something?** → Promote the durable parts into `systems/<name>.md`, mark the plan `Complete`, link them. Then archive the plan in `_workspace/archived/`.
- **Modifying an existing system?** → Update its `systems/` doc *in the same change*. Out-of-date systems docs are worse than no systems docs.
- **Establishing a new code convention?** → Write it as a `patterns/` doc and reference it from the top-level `CLAUDE.md`.

## Why this split?

- **`docs/`** explains *reality* — what exists today and why. It stays current.
- **`_workspace/`** explains *intent* — what we set out to build and why. It goes stale once shipped, but it preserves the original debate, alternatives considered, and decisions that didn't survive implementation.

A `systems/` doc tells you what we *actually* did. A `_workspace/planning/` doc tells you what we *meant* to do. Both are useful for different reasons.

## Example

See `.dev-agent-kit/templates/workspace/_examples/systems/example-system.md` for the canonical shape of a `systems/` doc.
