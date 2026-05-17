# docs/features/

Per-feature state-of-world references. Use when a feature needs its own current-behavior doc that doesn't fit `systems/` (because it spans systems, or it's user-facing behavior rather than architecture).

One folder per feature. Inside, free-form: behavior reference, API endpoints, UI flows, edge cases. Whatever a future maintainer would want to know to understand what the feature does today.

Distinct from:

- `systems/` — architecture / how it works under the hood.
- `_workspace/planning/` — what we *meant* to build.

If you're unsure where something belongs, default to `systems/` for "how" and `features/` for "what".
