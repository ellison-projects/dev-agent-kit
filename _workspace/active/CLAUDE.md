# _workspace/active/

One folder per feature currently in flight. Whatever's here is what's actively being planned or implemented.

```
_workspace/active/
  <feature-name>/        # e.g., audit-log/, faster-onboarding/
    brief.md             # required — see "What goes inside"
    ...                  # optional: plan.md, technical.md, notes, sketches
```

## Naming

Folder name is the feature slug — lowercase, kebab-case, short. Match the branch name if you have one (e.g., `feat/audit-log` ↔ `active/audit-log/`).

## What goes inside

**Required:** every `active/<feature>/` folder has a `brief.md` — the canonical "where am I?" anchor. Template:

```markdown
# <feature-name>

**Status:** Planning | Building | Paused | Blocked

## Problem
<one or two sentences — what we're solving, not how>

## TODO
- [ ] step 1
- [ ] step 2
- [ ] ...
```

- Status vocabulary above is a suggestion, not an enum — free-form is fine.
- TODO is for high-level steps (3–6 items). Deeper-level tasks should be managed outside this process.

**Optional**, add as the work demands:

- `plan.md` — single-doc plan for medium features.
- `summary.md` + `technical.md` — split when "what + why" and "how" need to live separately.
- `notes.md` + scratch files — exploratory work where the plan emerges as you go.
- Link out to a `_research/<topic>.md` if a research doc informed this.

Don't pre-plan the doc shape. Brief is required; the rest grows with the work.

## When something leaves this folder

> **Same-PR rule:** if the current branch resolves a feature (ships or kills it), that same PR must move the folder to `archived/`. Don't defer the move to a follow-up — follow-ups never happen, and `active/` quietly fills with finished work.

- **Shipped:** before opening the PR, the same branch should include:
  - Code for the feature, with **unit tests** covering it.
  - `docs/systems/<feature>.md` capturing how it actually works.
  - Any other docs the change touches (patterns, features, API references).
  - `git mv _workspace/active/<feature>/ _workspace/archived/<feature>/`.

  All in one PR.
- **Killed:** `git mv _workspace/active/<feature>/ _workspace/archived/<feature>/` and add a one-line `STATUS.md` saying why. No systems doc.

See [`../CLAUDE.md`](../CLAUDE.md) for the full flow.
