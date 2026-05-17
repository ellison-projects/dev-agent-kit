# `.claude/` template

Starter `.claude/` directory for a new consumer repo. Copy this whole folder to the repo root, then customize.

## Contents

- **`settings.json`** — Claude Code project settings. Ships with a single `SessionStart` hook that runs `scripts/setup.sh` if it exists. Safe to copy as-is; the `test -f` guard means it no-ops in repos that don't have a setup script yet.

- **`skills/`** — opt-in skills the dev-agent-kit considers worth defaulting:
  - `review-copilot-pr-comments/` — triages PR review comments, auto-fixes obvious ones, replies to every comment, subscribes the session to ongoing PR activity.
  - `vercel-deployment/` — checks the latest Vercel deploy; on failure, fetches build logs, diagnoses, and applies a minimal fix.

## Extending

Add more hooks to `settings.json` as the repo's conventions solidify. Common patterns from sibling repos:

- **Migration smoke test** — `PostToolUse` hook that re-runs an integration test whenever `migrations/*` is edited.
- **Lint-on-save gate** — `PostToolUse` hook that runs `npm run lint` on the edited file.
- **Env-loading SessionStart** — replace the placeholder hook with a project-specific `scripts/setup.sh` that loads `.env.build` for agent sessions (see Lawncare's `.env.build` + `scripts/setup.sh` pattern for a concrete example).

Skills can be edited freely — they're owned by the consumer once copied. To add a new one, drop a directory with a `SKILL.md` under `.claude/skills/<name>/` and Claude Code will pick it up.
