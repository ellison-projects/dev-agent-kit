# Workspace template bundle

The scaffold for the `docs/` + `_workspace/` convention. Two paths in:

**Install:**
```bash
bash .dev-agent-kit/templates/workspace/init.sh
```
Copies `docs/` and `_workspace/` into the consumer's repo root. Skips anything that already exists, so re-runs are safe.

**Reference:**
`.dev-agent-kit/templates/workspace/_examples/` holds canonical example documents — a feature plan, a system doc. Agents and humans can read these to understand the expected shape of a plan or a systems doc, without polluting the consumer's working tree.

## What gets installed

- `docs/` — state-of-the-world documentation root.
  - `docs/CLAUDE.md` — explains the split, decision tree, why it exists.
  - `docs/patterns/CLAUDE.md`, `docs/systems/CLAUDE.md`, `docs/features/CLAUDE.md` — one-paragraph explainers for each subfolder.
- `_workspace/` — working-materials root. Underscore is the signal.
  - `_workspace/CLAUDE.md` — explains the lifecycle (research → planning → ship → archive).
  - `_workspace/planning/CLAUDE.md`, `_workspace/research/CLAUDE.md`, `_workspace/archived/CLAUDE.md` — subfolder explainers.

## One-time setup

After installing, you own the files. The kit will alert (`⚑ templates/workspace/...`) if these stubs change upstream, but it never overwrites your local copy. Decide whether to port the upstream change by hand.

Pair this bundle with the `docs-and-workspace` partial — paste that section into your top-level `CLAUDE.md` so agents see the convention from the entry point.
