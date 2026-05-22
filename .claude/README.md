# .claude/

Claude Code config for this project — settings, hooks, and starter skills. Edit freely.

## What's in here

```
.claude/
├── settings.json   # SessionStart hook loader, no-ops if scripts/setup.sh doesn't exist
├── rules/
│   ├── test-files.md   # Vitest conventions, auto-applied on **/*.test.{ts,tsx}
│   └── e2e-gotchas.md  # Puppeteer/E2E gotchas, auto-applied on tests/e2e/**
└── skills/
    ├── review-copilot-pr-comments/SKILL.md  # walk PR comments, fix/reply/subscribe
    └── vercel-deployment/SKILL.md           # check latest deploy, fix on failure
```

## settings.json

Ships with one hook: `SessionStart` runs `scripts/setup.sh` if it exists. The `test -f … || true` wrapper means the hook is a no-op for repos that haven't created the setup script yet — safe to copy and forget. Use the script to load `.env.build`-style stub vars for agent sessions or to install missing CLIs.

Add your own hooks as needed. Common patterns:

- **PostToolUse on migrations** — run schema smoke tests when a migration file is edited:
  ```jsonc
  {
    "matcher": "Edit|Write|MultiEdit",
    "hooks": [{
      "type": "command",
      "command": "case \"$CLAUDE_TOOL_INPUT_file_path\" in *migrations/*) npx vitest run tests/integration/db-smoke.test.ts ;; esac"
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
