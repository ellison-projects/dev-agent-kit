# _workspace/

Work tracker for in-flight features. The leading underscore is the signal: this folder is *process* material — things flow through it. Read `docs/` for reference material (state of the world, past research, conventions).

## What's in here

```
_workspace/
  backlog.md            # ideas you might do — one file, low-effort capture
  active/<feature>/     # currently planning or implementing
  archived/<feature>/   # shipped or killed work
```

Three states, one direction: backlog → active → archived. Every folder in here moves through stages.

Research lives elsewhere: [`_research/`](../_research/). It's reference, not work-in-flight, so it doesn't belong here.

## Starting point: "I have an idea"

Tell the agent. Where it goes next depends on what you decide together:

- **Need to weigh options?** → write to [`_research/<topic>.md`](../_research/). State the question, list options, compare honestly, end with a recommendation (or "still open"). The doc stays there as reference — it doesn't move with the feature.
- **Direction is clear but not starting today?** → add a line to `backlog.md`. Link to a research doc if there was one.
- **Starting right now?** → skip to "Planning" below.

## The flow

### Picking up from the backlog

When you're ready to engage with a backlog item, remove its line from `backlog.md` and move into planning.

### Planning

- Branch off your integration branch (`dev` per the root [`CLAUDE.md`](../CLAUDE.md)).
- Create `_workspace/active/<feature>/` with a `brief.md` (status, problem, high-level TODO — see [`active/CLAUDE.md`](./active/CLAUDE.md) for the template). Add a `plan.md`, `summary.md` + `technical.md`, or scratch notes alongside as the work demands.
- If a research doc informed this, link to it from the brief.
- Commit, open the plan PR, merge. The `active/<feature>/` folder stays put between sessions.

### Implementing

Usually a separate branch a day or two later, off the same integration branch (`dev`). The `active/<feature>/` folder is still there from the plan branch — keep going. Build the feature.

### Shipping

Before opening the impl PR, the same branch should include all of:

1. Code for the feature, with unit tests covering it.
2. `docs/systems/<feature>.md` — how the system actually works (promote the durable parts of the plan, drop the rest).
3. Any other docs the change touches (patterns, features, API references).
4. `git mv _workspace/active/<feature>/ _workspace/archived/<feature>/`.

All four land in one PR. Don't defer the archive move to a follow-up — follow-ups don't happen.

### Killing

If you abandon a feature mid-flight: `git mv _workspace/active/<feature>/ _workspace/archived/<feature>/` and drop a one-line `STATUS.md` inside saying why. No systems doc.

Research that didn't lead anywhere stays in `_research/` as a record — "we considered this and decided not to act" is itself useful information.

## Quick reference

| What just happened | What to do |
|---|---|
| New idea, want to explore options | Write `_research/<topic>.md` |
| New idea, direction clear, not starting | Add a line to `_workspace/backlog.md` |
| Starting work on something | Branch, create `_workspace/active/<feature>/`, write the plan |
| Coming back to a paused feature | Branch fresh off `dev`; folder is already in `active/` |
| Wrapping up an impl branch | Tests + `docs/systems/<feature>.md` + any other touched docs + `git mv` active → archived — all in one PR |
| Killing an in-flight feature | `git mv` active → archived, add `STATUS.md` |
| Checking what's hot | `ls _workspace/active/` |
| Looking up why we picked X over Y a year ago | `_research/` |

## Why this shape

- **`_workspace/` is work-in-flight only.** Every folder in it moves through stages: backlog → active → archived. Reference material (including research) lives in `docs/` so this folder stays a clean live signal.
- **`active/` is the live signal.** Whatever's in there is what's in flight, full stop.
- **One backlog file, not a folder.** Most backlog items never become full plans. A single file keeps capture cheap.
- **Per-feature archive folders.** History is easy to navigate per feature, not a flat dumping ground.
