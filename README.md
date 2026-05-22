# dev-agent-kit

Starter template for new dev projects. Use this when you're spinning up something new and want conventions, folder structure, and Claude Code config to come pre-loaded.

## How to use

1. Click **Use this template** on GitHub (or `gh repo create --template ellison-projects/dev-agent-kit <new-repo>`).
2. Clone the new repo locally.
3. Read [`CLAUDE.md`](./CLAUDE.md) — the entry point for the conventions and stack.
4. Replace this `README.md` with one that describes your actual project.

## What this template assumes

The conventions, workflows, and tooling here are shaped around a specific stack. If your project deviates, expect to adapt:

- **Hosting:** Vercel (with per-PR preview deploys).
- **Database:** Postgres on **Neon**, with a branchable DB per preview environment.
- **Framework:** Next.js (App Router) + React + TypeScript.
- **Testing:** Vitest (unit + integration) + Puppeteer (E2E).
- **Migrations:** `node-pg-migrate` (plain SQL files).
- **Email:** Resend.
- **Auth:** NextAuth v5.
- **File storage:** AWS S3.
- **AI:** Anthropic Claude (`@anthropic-ai/sdk`).

Full rationale in [`CLAUDE.md`](./CLAUDE.md) under "Preferred stack." The `.github/workflows/` here also assume Vercel + Neon — e.g., per-PR Neon branch cleanup, dev-database reset.

## What's in here

- **[`CLAUDE.md`](./CLAUDE.md)** — top-level project guide (structure, stack, workflow, Claude Code conventions).
- **[`docs/`](./docs/)** — state-of-the-world reference. Subfolders: `patterns/` (code conventions, including pre-loaded testing rules), `systems/` (created on demand), `features/` (created on demand).
- **[`_workspace/`](./_workspace/)** — work in flight: `backlog.md`, `active/<feature>/`, `archived/<feature>/`.
- **[`_research/`](./_research/)** — exploratory thinking, long-lived reference.
- **[`.claude/`](./.claude/)** — Claude Code settings, starter skills (`vercel-deployment`, `review-copilot-pr-comments`), `SessionStart` hook that runs `scripts/setup.sh` if present.
- **[`.github/workflows/`](./.github/workflows/)** — starter GitHub Actions for Claude branch cleanup, Neon branch lifecycle, dev DB reset, and dev↔main merging.

## After cloning

- Replace this README with one describing the new project.
- Drop unused workflows from `.github/workflows/` (each one is opinionated about Neon / Vercel / dev-branch flow).
- Empty out `_workspace/backlog.md` and `_workspace/active/.gitkeep` if you don't want the placeholders.
- Start writing `docs/systems/<feature>.md` as you ship features.

## Updating an existing repo from this template

Updates don't propagate to repos already created from this template — once forked, you're on your own to pull changes. If that becomes a real problem, a lightweight sync mechanism can come back later.
