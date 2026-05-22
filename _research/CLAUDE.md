# _research/

Long-lived reference for **exploratory** research — questions explored, options compared, directions picked or rejected.

**Read this folder for *thinking*, not for *state*.** A research doc says "we considered X" — it does **not** tell you whether X is currently active in the platform, was built, was abandoned, or was deferred. Presence of a research doc means somebody thought about something, nothing more. For what's actually shipped and running today, see [`docs/`](../docs/) (specifically `docs/systems/`). For what's in flight right now, see [`_workspace/active/`](../_workspace/active/).

One file per topic (promote to `<topic>/` folder if it grows).

Each research doc should:

- State the question clearly at the top.
- List the options considered.
- Compare them honestly — tradeoffs, costs, complexity.
- End with a recommendation, the decision made, or "still open" if nothing was decided.

Once you act on a research doc (start planning, commit to a direction), **the doc stays put**. Don't archive it. The trail of "we considered X and Y and picked Z" is exactly the thing future-you will want, and burying it in `_workspace/archived/` makes that trail invisible.

If a research question resolves with "no action," leave the doc here and mark it `Resolved: no action` at the top. Same shelf.

## Why this is a top-level folder

Three top-level concepts, each with one purpose:

- **`docs/`** — state of the world today.
- **`_workspace/`** — work in flight.
- **`_research/`** — exploratory thinking, kept as reference.

Research doesn't fit `docs/` because docs is "state, update when reality changes" — research is a snapshot of thinking, not state. It doesn't fit `_workspace/` because workspace material moves through stages and research doesn't. So it gets its own top-level folder. The underscore prefix signals "not state-of-world," matching `_workspace/`.
