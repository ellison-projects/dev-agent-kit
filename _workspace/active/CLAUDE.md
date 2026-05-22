# _workspace/active/

One folder per feature currently in flight. Whatever's here is what's actively being planned or implemented.

```
_workspace/active/
  <feature-name>/        # e.g., audit-log/, faster-onboarding/
    plan.md              # or summary.md + technical.md, or notes.md — whatever shape fits
    ...                  # scratch notes, sketches, decision logs, etc.
```

## Naming

Folder name is the feature slug — lowercase, kebab-case, short. Match the branch name if you have one (e.g., `feat/audit-log` ↔ `active/audit-log/`).

## What goes inside

No required structure. Some shapes that work:

- **`plan.md` only** — small feature, one document covers it.
- **`summary.md` + `technical.md`** — split when "what + why" and "how" need to live separately.
- **`notes.md` + scratch files** — exploratory work where the plan emerges as you go.
- Link out to a `docs/research/<topic>.md` if a research doc informed this.

Add structure as the work demands it. Don't pre-plan the doc shape.

## When something leaves this folder

> **Same-PR rule:** if the current branch resolves a feature (ships or kills it), that same PR must move the folder to `archived/`. Don't defer the move to a follow-up — follow-ups never happen, and `active/` quietly fills with finished work.

- **Shipped:** write `docs/systems/<feature>.md` capturing how it actually works, then `git mv active/<feature>/ archived/<feature>/`. All in one commit, in the same PR as the code.
- **Killed:** `git mv active/<feature>/ archived/<feature>/` and add a one-line `STATUS.md` saying why. No systems doc.

See [`../CLAUDE.md`](../CLAUDE.md) for the full flow.
