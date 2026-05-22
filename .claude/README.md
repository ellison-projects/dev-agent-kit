# .claude/

Claude Code config for this project — settings, hooks, and starter skills. Edit freely.

## What's in here

```
.claude/
├── settings.json           # acceptEdits + SessionStart hook loader
├── hooks/
│   └── session-start.sh    # remote-only Postgres + npm install bootstrap
├── rules/
│   ├── test-files.md       # Vitest conventions, auto-applied on **/*.test.{ts,tsx}
│   └── e2e-gotchas.md      # Puppeteer/E2E gotchas, auto-applied on tests/e2e/**
└── skills/
    ├── review-copilot-pr-comments/SKILL.md  # walk PR comments, fix/reply/subscribe
    └── vercel-deployment/SKILL.md           # check latest deploy, fix on failure
```

## settings.json

Two notable bits of config:

- `permissions.defaultMode: "acceptEdits"` — agents can edit files without prompting. Reverse this in `settings.local.json` if you want stricter local behavior.
- `SessionStart` runs `.claude/hooks/session-start.sh` if present and executable. The `test -x … || true` wrapper keeps it safely a no-op if you delete the hook.

## hooks/session-start.sh

Guarded on `CLAUDE_CODE_REMOTE=true` (set by the Claude Code web runner), so local sessions are untouched. On remote sessions it:

1. Starts PostgreSQL if it's not running.
2. Sets the `postgres` superuser password to `postgres` so tests can connect over TCP with scram-sha-256.
3. Runs `npm install` if `node_modules` is missing or older than `package.json`.

If your project doesn't use Postgres or has its own bootstrap, edit the script — it's just shell.

Add your own hooks as needed. Common patterns:

- **PostToolUse on migrations** — run schema smoke tests when a migration file is edited:
  ```jsonc
  {
    "matcher": "Edit|Write|MultiEdit",
    "hooks": [{
      "type": "command",
      "command": "if echo \"${CLAUDE_FILE_PATHS:-}\" | grep -qE 'migrations/.*\\.sql$'; then npx vitest run --reporter=dot tests/integration/db-smoke.test.ts; fi"
    }]
  }
  ```
- **Stop** — desktop notification or sound when a long-running session finishes.
- **PreToolUse** — gate destructive shell commands with a confirmation prompt.

See https://code.claude.com/docs/en/claude-code/settings for the full hook reference.

## rules/

Markdown files Claude Code auto-loads. Files without `paths:` frontmatter load on every session (same priority as `CLAUDE.md`); files with `paths:` only load when Claude reads matching files. One topic per file, descriptive filename.

The two starters:

- **`test-files.md`** — Vitest conventions (mobile-friendly `it.each` format, file naming, mocking patterns). Scoped to `**/*.test.{ts,tsx}`.
- **`e2e-gotchas.md`** — Puppeteer + Vitest E2E pitfalls (selector stability, async waits, env teardown). Scoped to `tests/e2e/**` and `vitest.e2e.config.ts`.

See https://code.claude.com/docs/en/memory#organize-rules-with-claude/rules/ for the full rules reference.

## skills/

Two starter skills:

- **`review-copilot-pr-comments`** — invoked when you ask Claude to "review PR comments" or "watch this PR". Triages each review comment into fix / defer / push-back, replies to all, then subscribes the session so future events keep waking it. Requires GitHub MCP access.
- **`vercel-deployment`** — checks the latest Vercel deploy via the Vercel MCP, summarizes the state, and if it failed, pulls logs and applies a minimal fix. Resolves the project from `.vercel/project.json` or `$ARGUMENTS`; hardcode IDs in the skill body if your fresh-session environment doesn't have `.vercel/` committed.

Skills auto-trigger on matching user phrasing — the `description` frontmatter is what does the matching, so don't edit it lightly.
