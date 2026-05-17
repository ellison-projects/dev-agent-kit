# docs/systems/

Living "how it works today" docs for shipped systems. One file (or folder if large) per system.

Write these *after* shipping, by promoting the durable parts of a `_workspace/planning/<feature>/` plan. Then keep them updated whenever you change the system — out-of-date systems docs are worse than no systems docs.

Each system doc should cover:

- **What it does** in plain language.
- **Architecture / data flow** as it exists now, not what was planned.
- **Key files and their roles** (`src/lib/<system>/`, `migrations/...`).
- **Failure modes** worth knowing about.
- **Operator concerns** (env vars, feature flags, monitoring).

See `.dev-agent-kit/templates/workspace/_examples/systems/example-system.md` for a canonical example.
