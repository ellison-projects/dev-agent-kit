# Project guide

Conventions for this project — how it's structured, what stack it assumes, how work moves through it. Entry point for Claude Code agents and humans alike.

## Project structure

Three top-level folders for project material — know which is which:

- **[`docs/`](./docs/)** — state of the world **today**. If reality changes, update these docs in the same commit. Subfolder breakdown lives in [`docs/CLAUDE.md`](./docs/CLAUDE.md).
- **[`_workspace/`](./_workspace/)** — work in flight, organized by state. The underscore is the signal. Contains: `backlog.md` (ideas), `active/<feature>/` (currently planning or implementing — each has a required `brief.md`), `archived/<feature>/` (shipped or killed).
- **[`_research/`](./_research/)** — exploratory thinking, kept as long-lived reference. Options explored, decisions made or deferred. Doesn't move — research stays put even after the work is shipped or abandoned.

When you have an idea: write to `_research/<topic>.md` if you need to weigh options first, add a line to `_workspace/backlog.md` if direction is clear but not starting yet, or go straight to `_workspace/active/<feature>/` if you're starting now. After shipping, write `docs/systems/<feature>.md` and `git mv` the active folder to `archived/` in the same PR as the code. Research stays in `_research/` — it's thinking, not state.

Folder-scoped guides: [`_workspace/CLAUDE.md`](./_workspace/CLAUDE.md), [`_workspace/active/CLAUDE.md`](./_workspace/active/CLAUDE.md), [`_research/CLAUDE.md`](./_research/CLAUDE.md), [`docs/CLAUDE.md`](./docs/CLAUDE.md).

## Preferred stack

The stack this template assumes. Default unless there's a specific reason to deviate.

| Concern | Choice | Why |
|---|---|---|
| Hosting | **Vercel** | Tightest Next.js integration; per-PR preview deploys come free. |
| Database | **Postgres on Neon** | Branchable DB per preview env; idle-suspend keeps cost near zero on side projects that don't get daily traffic. |
| Migrations | **`node-pg-migrate`** | Plain SQL files, raw control over the schema. Tried Prisma — the schema-as-config indirection cost more than the type-safety gave back. |
| Framework | **Next.js (App Router) + React + TypeScript** | Server Components + Server Actions remove most endpoint boilerplate. |
| Testing | **Vitest** (unit + integration), **Puppeteer** (E2E) | Fast, Jest-shaped, plays nice with Vite-flavored toolchains. Conventions live in [`.claude/rules/test-files.md`](./.claude/rules/test-files.md) and [`.claude/rules/e2e-gotchas.md`](./.claude/rules/e2e-gotchas.md) — auto-applied when Claude works with matching files. |
| Email | **Resend** | Clean transactional API, sender verification was painless. Always behind a `src/lib/email.ts` wrapper — no direct SDK calls from feature code. |
| Auth | **NextAuth v5** (`next-auth`) | Built for App Router, supports credential + OAuth flows without depending on a third-party service. |
| File storage | **AWS S3** (`@aws-sdk/client-s3`) | Ubiquitous, cheap, presigned URLs for direct browser upload. |
| AI | **Anthropic Claude** (`@anthropic-ai/sdk`) | Default LLM. Reach for OpenAI only when a specific capability requires it. Every call routed through a logging helper so usage + cost is tracked. |

When a `docs/patterns/*.md` doc or `.claude/rules/*.md` rule enforces something about one of these (testing conventions, etc.), that file is the source of truth and this row is just the pointer.

## Git workflow

- **`dev` is the integration branch.** All pull requests must target `dev`, not `main`. `main` is reserved for releases — only merges from `dev` land there.
- When opening a PR via `gh` or the GitHub MCP, always pass `base: "dev"`. If a PR was opened against `main` by mistake, retarget it (`gh pr edit <n> --base dev` or `update_pull_request`) rather than rebasing.

## Claude Code skills

When creating or modifying Claude Code skills in this repository, always review the latest skills documentation at: **https://code.claude.com/docs/en/skills**

Key conventions:

- Skills use YAML frontmatter in `SKILL.md` (NOT a separate `skill.json`).
- The `description` field is critical for auto-triggering — don't edit it lightly.
- Use `context: fork` to run skills in isolated subagent context.
- See [`.claude/README.md`](./.claude/README.md) for what's already in `.claude/` and how to extend it.

## Important

**When a direct question is asked, NEVER infer next steps or take action. Answer the question only. Wait for explicit instruction before making changes or running commands.**
