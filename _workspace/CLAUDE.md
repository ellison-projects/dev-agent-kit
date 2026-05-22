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

Research lives elsewhere: [`docs/research/`](../docs/research/). It's reference, not work-in-flight, so it doesn't belong here.

## Starting point: "I have an idea"

Tell the agent. Where it goes next depends on what you decide together:

- **Need to weigh options?** → write to [`docs/research/<topic>.md`](../docs/research/). State the question, list options, compare honestly, end with a recommendation (or "still open"). The doc stays there as reference — it doesn't move with the feature.
- **Direction is clear but not starting today?** → add a line to `backlog.md`. Link to a research doc if there was one.
- **Starting right now?** → skip to "Planning" below.

## The flow

### Picking up from the backlog

When you're ready to engage with a backlog item, remove its line from `backlog.md` and move into planning.

### Planning

- Branch off main (whatever your branch convention is).
- Create `_workspace/active/<feature>/` and write the plan inside. Shape it however the work needs: `summary.md` + `technical.md`, a single `plan.md`, scratch notes, sketches. No required structure.
- If a research doc informed this, link to it from the plan.
- Commit, open the plan PR, merge. The `active/<feature>/` folder stays put between sessions.

### Implementing

Usually a separate branch a day or two later, off main. The `active/<feature>/` folder is still there from the plan branch — keep going. Build the feature.

### Shipping

Before opening the impl PR, on the impl branch, do three things in one commit:

1. Write or update `docs/systems/<feature>.md` with how the system actually works — promote the durable parts of the plan, drop the rest.
2. `git mv _workspace/active/<feature>/ _workspace/archived/<feature>/`
3. Commit everything together — code, systems doc, archive move.

Open the PR. Code and docs reshuffle land in the same merge.

### Killing

If you abandon a feature mid-flight: `git mv _workspace/active/<feature>/ _workspace/archived/<feature>/` and drop a one-line `STATUS.md` inside saying why. No systems doc.

Research that didn't lead anywhere stays in `docs/research/` as a record — "we considered this and decided not to act" is itself useful information.

## Quick reference

| What just happened | What to do |
|---|---|
| New idea, want to explore options | Write `docs/research/<topic>.md` |
| New idea, direction clear, not starting | Add a line to `_workspace/backlog.md` |
| Starting work on something | Branch, create `_workspace/active/<feature>/`, write the plan |
| Coming back to a paused feature | Branch fresh off main; folder is already in `active/` |
| Wrapping up an impl branch | Write `docs/systems/<feature>.md`, `git mv` active → archived, commit it all together |
| Killing an in-flight feature | `git mv` active → archived, add `STATUS.md` |
| Checking what's hot | `ls _workspace/active/` |
| Looking up why we picked X over Y a year ago | `docs/research/` |

## Why this shape

- **`_workspace/` is work-in-flight only.** Every folder in it moves through stages: backlog → active → archived. Reference material (including research) lives in `docs/` so this folder stays a clean live signal.
- **`active/` is the live signal.** Whatever's in there is what's in flight, full stop.
- **One backlog file, not a folder.** Most backlog items never become full plans. A single file keeps capture cheap.
- **Per-feature archive folders.** History is easy to navigate per feature, not a flat dumping ground.
