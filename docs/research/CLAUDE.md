# docs/research/

Long-lived reference for option exploration and decisions. One file per topic (promote to `<topic>/` folder if it grows).

Each research doc should:

- State the question clearly at the top.
- List the options considered.
- Compare them honestly — tradeoffs, costs, complexity.
- End with a recommendation, the decision made, or "still open" if nothing was decided.

Once you act on a research doc (start planning, commit to a direction), **the doc stays put**. Don't archive it. The trail of "we considered X and Y and picked Z" is exactly the thing future-you will want, and burying it in `_workspace/archived/` makes that trail invisible.

If a research question resolves with "no action," leave the doc here and mark it `Resolved: no action` at the top. Same shelf.

## Why this lives in `docs/`, not `_workspace/`

`_workspace/` is for work that moves through stages (backlog → active → archived). Research is reference — it accumulates, gets revisited, doesn't move. So it lives in `docs/` alongside other reference material (`patterns/`, `systems/`, `features/`).
