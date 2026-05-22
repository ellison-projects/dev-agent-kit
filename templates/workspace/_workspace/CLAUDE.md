# _workspace/

Working materials for in-flight product work. The leading underscore is the signal: this folder is *process* material, not state-of-world. Read `docs/` for current reality.

## What's in here

```
_workspace/
  backlog.md            # ideas you might do — one file, low-effort capture
  active/<feature>/     # hot work — one folder per feature in flight
  archived/<feature>/   # shipped or killed work — historical record
```

Three pieces, organized by *state of the work* — not by document type.

## The flow

### 1. Got an idea

Add a line to `backlog.md`. Don't create a folder. Don't make a branch. A bullet is enough; a short paragraph if you'll forget the context.

```markdown
## Ideas

- Audit log for admin actions — incidents need forensic reconstruction
- Faster tenant onboarding — current flow takes ~3 days
```

### 2. Picking it up

When you're ready to actually engage with an item:

- Branch: `feat/<feature>` (or whatever you do today)
- Run `/start <feature>` — creates `_workspace/active/<feature>/` and removes the matching backlog line
- Write whatever the work needs in there: `notes.md`, `plan.md`, `research.md`, sketches. No required shape.

The folder is yours — keep it as loose or as structured as the work warrants.

### 3. Pausing across branches

If the work splits into a plan branch and a separate impl branch (days later), the folder stays in `active/` between sessions. That's honest: still in flight, just paused.

Plan branch: commit the `active/<feature>/` folder, merge, done. No ship ritual yet — nothing's shipped.

Impl branch (later): fresh off main, folder is already there from last time, keep going.

If `active/` grows past ~6 entries, you've over-started — clean up.

### 4. Shipping

Before opening the impl PR, on the impl branch:

```
/ship <feature>
```

What it does:

- Stubs `docs/systems/<feature>.md` with sections pulled from your plan + TODOs
- You fill in the systems doc (this is the part that benefits from your hands)
- Moves `_workspace/active/<feature>/` to `_workspace/archived/<feature>/`
- Stages everything

You commit and open the PR — code, systems doc, and archive move all land in one merge.

### 5. Killing

If you abandon a feature mid-flight: `/ship --kill <feature>` moves it to `archived/` with a one-line `STATUS.md` saying why. No systems doc.

## Quick reference

| What just happened | What to do |
|---|---|
| New idea | Add a line to `backlog.md` |
| Starting work on a backlog item | `/start <feature>`, branch, write into `active/<feature>/` |
| Coming back to a paused feature | Branch fresh off main; folder is already in `active/` |
| Wrapping up an impl branch | `/ship <feature>` before opening the PR |
| Killing an in-flight feature | `/ship --kill <feature>` |
| Checking what's hot | `ls _workspace/active/` |

## Why this shape

- **State, not document type.** `active/` is the live signal — it tells you what's in flight at a glance. The earlier `research/` / `planning/` split was a doc-type cut, which is why nothing flowed naturally between them.
- **One backlog file, not a folder.** Most ideas never become full plans. A single file keeps capture cheap; you only spend folder-energy on items you've committed to engage with.
- **Per-feature archive folders.** History is per-feature, easy to navigate. Not a flat dumping ground.
