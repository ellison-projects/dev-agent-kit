# .claude bundle

Starting-point Claude Code config for a new repo. Mirror-only — copy this folder to `.claude/` in the consumer once and own it.

## What's in here

```
.claude/
├── settings.json           # acceptEdits + SessionStart + migrations PostToolUse
├── hooks/
│   ├── README.md           # why the hardening; rules for editing session-start.sh
│   └── session-start.sh    # remote-only Postgres + dev DB + npm install bootstrap
└── skills/
    ├── review-copilot-pr-comments/SKILL.md  # walk PR comments, fix/reply/subscribe
    └── vercel-deployment/SKILL.md           # check latest deploy, fix on failure
```

## settings.json

Three notable bits of config:

- `permissions.defaultMode: "acceptEdits"` — agents can edit files without prompting. Flip in `.claude/settings.local.json` if you want stricter local behavior.
- `SessionStart` runs `.claude/hooks/session-start.sh`. The hook is guarded on `CLAUDE_CODE_REMOTE=true`, so local sessions are untouched.
- `PostToolUse` runs `npm test` (silently, last 30 lines) when any `migrations/*.sql` file is edited — schema changes get smoke-tested before you move on.

If your repo doesn't have a `migrations/` folder or `npm test`, delete the PostToolUse block; it's a no-op when the path pattern doesn't match, but the intent is wasted.

See https://code.claude.com/docs/en/claude-code/settings for the full hook reference.

## hooks/session-start.sh

Remote-only Postgres + dev-DB + npm-install bootstrap. On a fresh Claude Code web session it:

1. Starts PostgreSQL if it's not running (service unit first, `pg_ctlcluster` fallback for container images without the unit).
2. Polls `pg_isready` with a hard gate — silent DB failure exits 1 instead of leaving the session limping.
3. Sets the `postgres` superuser password to `postgres` so apps can connect over TCP with scram-sha-256.
4. Creates `$APP_DB_NAME` if it doesn't exist (default `app_dev` — rename at the top of the script).
5. Exports `DATABASE_URL` for the session via `$CLAUDE_ENV_FILE`. Add app-specific secrets (JWT_SECRET, etc.) alongside.
6. Runs `npm install` if `node_modules` is missing or older than `package.json`.

Every step tees to `/tmp/session-start.log` so a silent boot-time failure leaves a paper trail. Inspect with `cat /tmp/session-start.log`.

**Read `hooks/README.md` before editing this script** — the hardening patterns are load-bearing.

## skills/

Both skills are genericized from the lawncare-platform conventions:

- **`review-copilot-pr-comments`** — invoked when you ask Claude to "review PR comments" or "watch this PR". Triages each review comment into fix / defer / push-back, replies to all, then subscribes the session so future events keep waking it. Requires GitHub MCP access.
- **`vercel-deployment`** — checks the latest Vercel deploy via the Vercel MCP, summarizes the state, and if it failed, pulls logs and applies a minimal fix. Resolves the project from `.vercel/project.json` or `$ARGUMENTS`; hardcode IDs in the skill body if your fresh-session environment doesn't have `.vercel/` committed.

Skills auto-trigger on matching user phrasing — the `description` frontmatter is what does the matching, so don't edit it lightly.

## Extending settings.json

Common hook patterns beyond what's already wired up:

- **Stop** — desktop notification or sound when a long-running session finishes.
- **PreToolUse** — gate destructive shell commands with a confirmation prompt.
- **PostToolUse** narrowed to a different path — e.g. re-run typecheck only when `tsconfig.json` changes.
