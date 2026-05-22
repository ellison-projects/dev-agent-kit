# docs/decisions/

Architecture decision records (ADRs) — durable notes capturing **why** the project is the way it is.

What belongs here:

- A decision that future-you (or a future contributor) will look at and ask "why did we do this?"
- Choices with non-obvious tradeoffs: which library, which pattern, which boundary.
- Decisions that close off other options you'd otherwise re-litigate every few months.

What doesn't belong here:

- Exploration that's still open → `../../_research/` (research is thinking; decisions is the conclusion you committed to).
- How something works today → `../systems/`.
- Code conventions → `../patterns/`.

## Format

One file per decision. Name it `NNNN-short-slug.md` with a zero-padded number (`0001-use-node-pg-migrate.md`). Numbers never get reused — even if a decision is later reversed, the original file stays.

Each ADR should have:

- **Status** — `accepted`, `superseded by NNNN`, or `reversed`.
- **Date** — when the decision was made.
- **Context** — what problem you were solving.
- **Decision** — what you chose.
- **Consequences** — what becomes easier, what becomes harder, what you've now committed to.

When a decision is reversed or replaced, **don't delete the original**. Add a new ADR that supersedes it, and update the old one's status to point at the new number. The trail of "we tried X, then moved to Y because Z" is the whole point.
