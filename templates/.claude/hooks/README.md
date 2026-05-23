# hooks/

Claude Code hooks for this repo. Currently one — `session-start.sh`.

## Why every step has a hard gate and a paper trail

The session-start hook prepares the container so the dev loop (migrations, tests, `npm run dev`) works out of the box. When it fails silently, the failure cascades: `npm test` blows up with ECONNREFUSED, migrations hit unauthenticated psql, agents waste a turn diagnosing a problem that was actually decided at boot.

The hardening here exists because we got bitten by exactly that:

- **`set -euo pipefail`** at the top — any unguarded failure exits the script.
- **Tee'd log to `/tmp/session-start.log`** — even when the hook itself succeeds, the log is the receipt for what happened during boot. Run `cat /tmp/session-start.log` after the fact when something feels off.
- **No `|| true` on critical setup paths.** A failing `ALTER USER` or `createdb` must surface immediately. If you find yourself adding `|| true` to make a noisy step quiet, you're suppressing a signal — fix the root cause or move that step out of the hook.
- **Polling `pg_isready` + a hard `exit 1` gate.** `sudo service postgresql start` returns before the socket is accepting connections. Without the poll, the next step races against a not-yet-ready Postgres and we get random "could not connect to server" errors.
- **`pg_ctlcluster` fallback.** Some container images ship Postgres without a service unit — the fallback auto-detects the installed major version instead of hardcoding.
- **Warning, not silence, when `CLAUDE_ENV_FILE` is unset.** That's the only mechanism by which `DATABASE_URL` reaches the rest of the session; a silent no-op leaves the session looking healthy but unable to connect.

## Rules for editing session-start.sh

1. **Never re-add `|| true`** on a step that's critical to the dev loop. If a step is genuinely optional, comment why.
2. **New steps need a hard gate** — if step N can fail in a way that breaks downstream steps, `exit 1` immediately rather than letting the session continue half-set-up.
3. **Echo before each step** so the tee'd log is self-explaining. `echo "Doing X..."` is cheap; a confused engineer reading a silent log is expensive.
4. **Idempotency.** Hooks re-run on every session start. Every step needs to check "is this already done?" before doing it — `ALTER USER` on an already-correct password, `createdb` on an existing DB, etc.
5. **Keep local sessions short-circuited.** The `CLAUDE_CODE_REMOTE` guard at the top is what keeps this script from clobbering a developer's local Postgres install. Don't move logic above the guard.

## Adding more hooks

Drop new shell scripts in this folder and wire them up in `.claude/settings.json`. Common patterns:

- **Stop** — desktop notification when a long session finishes.
- **PreToolUse** — confirmation prompt before destructive shell commands.
- **PostToolUse** narrowed to a path — re-run a smoke test when a config file changes.

See https://code.claude.com/docs/en/claude-code/settings for the full reference.
