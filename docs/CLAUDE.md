# docs/

State of the world **today**. If reality changes, update these docs in the same commit — out-of-date `docs/` is worse than no `docs/`.

This is reference material *about the current state*, not process or exploration:

- For work in flight, see [`_workspace/`](../_workspace/).
- For past exploration and decisions (thinking, not state), see [`_research/`](../_research/).

## Subfolders

- [`patterns/`](./patterns/) — code conventions you want enforced everywhere.
- [`systems/`](./systems/) — living "how it works today" docs for shipped systems. *(created on demand)*
- [`features/`](./features/) — per-feature state-of-world references that don't fit `systems/`. *(created on demand)*
- [`operations/`](./operations/) — runbooks, incident playbooks, deploy and rollback procedures.
- [`decisions/`](./decisions/) — ADRs capturing **why** the project is the way it is.
- [`integrations/`](./integrations/) — third-party service setup (Vercel, Neon, Resend, S3, Anthropic, etc.).
- [`data/`](./data/) — schema overview, invariants, lifecycle rules.

Each subfolder has its own `CLAUDE.md` describing what belongs there. Folders marked *created on demand* are listed so you know where to put things when the first relevant doc lands.
