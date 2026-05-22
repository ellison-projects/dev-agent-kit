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

When you're ready to engage with a backlog item, remove the line from `backlog.md` and move into planning.

### Planning

- Branch: `feat/<feature>` (or whatever your branch convention is)
- Run `/start <feature>` — creates `_workspace/active/<feature>/`
- Write the plan inside. Shape it however the work needs: `summary.md` + `technical.md`, a single `plan.md`, scratch notes, sketches. No required structure.
- If a research doc informed this, link to it from the plan.
- Commit, open the plan PR, merge. The `active/<feature>/` folder stays put between sessions.

### Implementing

Usually a separate branch a day or two later, off main. The `active/<feature>/` folder is still there from the plan branch — keep going. Build the feature.

### Shipping

Before opening the impl PR, on the impl branch:

```
/ship <feature>
```

What it does:

- Stubs `docs/systems/<feature>.md` with section headers pulled from your plan + TODOs
- You fill in the systems doc — this is the part that benefits from your hands
- Moves `_workspace/active/<feature>/` to `_workspace/archived/<feature>/`
- Stages everything

You commit and open the PR. Code, systems doc, and archive move land in one merge.

### Killing

If you abandon a feature mid-flight: `/ship --kill <feature>` moves it to `archived/` with a one-line `STATUS.md` saying why. No systems doc.

Research that didn't lead anywhere stays in `docs/research/` as a record — "we considered this and decided not to act" is itself useful information.

## Quick reference

| What just happened | What to do |
|---|---|
| New idea, want to explore options | Write `docs/research/<topic>.md` |
| New idea, direction clear, not starting | Add a line to `_workspace/backlog.md` |
| Starting work on something | `/start <feature>`, branch, write into `_workspace/active/<feature>/` |
| Coming back to a paused feature | Branch fresh off main; folder is already in `active/` |
| Wrapping up an impl branch | `/ship <feature>` before opening the PR |
| Killing an in-flight feature | `/ship --kill <feature>` |
| Checking what's hot | `ls _workspace/active/` |
| Looking up why we picked X over Y a year ago | `docs/research/` |

## Why this shape

- **`_workspace/` is work-in-flight only.** Every folder in it moves through stages: backlog → active → archived. Reference material (including research) lives in `docs/` so this folder stays a clean live signal.
- **`active/` is the live signal.** Whatever's in there is what's in flight, full stop. If it grows past ~6 entries, you've over-started.
- **One backlog file, not a folder.** Most backlog items never become full plans. A single file keeps capture cheap.
- **Per-feature archive folders.** History is easy to navigate per feature, not a flat dumping ground.
