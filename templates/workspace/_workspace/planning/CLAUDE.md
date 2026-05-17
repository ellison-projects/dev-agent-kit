# _workspace/planning/

Pre-implementation feature plans. One folder per feature.

Each plan folder should contain at minimum:

- **`summary.md`** — what we're building, why, who it's for. Mostly prose, no code.
- **`technical.md`** — how we'll build it. Data model changes, API surface, integration points, open questions.

Optional extras: design notes, mockups, decision logs.

## Lifecycle

- **Start:** create `planning/<feature-name>/` and draft both files.
- **During implementation:** update the plan to reflect actual decisions. The plan is allowed to drift — it's a snapshot of intent + course-corrections, not a contract.
- **After shipping:** promote the durable parts into `docs/systems/<name>.md`, then move this folder to `_workspace/archived/`.

See `.dev-agent-kit/templates/workspace/_examples/planning/example-feature/` for canonical `summary.md` + `technical.md`.
