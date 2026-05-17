## Preferred stack

The stack I reach for when starting something new. Default unless there's a specific reason to deviate.

| Concern | Choice | Why |
|---|---|---|
| Hosting | **Vercel** | Tightest Next.js integration; per-PR preview deploys come free. |
| Database | **Postgres on Neon** | Branchable DB per preview env; idle-suspend keeps cost near zero on the side projects that don't get daily traffic. |
| Migrations | **`node-pg-migrate`** | Plain SQL files, raw control over the schema. Tried Prisma — the schema-as-config indirection cost more than the type-safety gave back. |
| Framework | **Next.js (App Router) + React + TypeScript** | Server Components + Server Actions remove most endpoint boilerplate. |
| Testing | **Vitest** (unit + integration), **Puppeteer** (E2E) | Fast, Jest-shaped, plays nice with Vite-flavored toolchains. See `.claude/rules/test-files.md` and `.claude/rules/e2e-gotchas.md` for the conventions. |
| Email | **Resend** | Clean transactional API, sender verification was painless. Always behind a `src/lib/email.ts` wrapper — no direct SDK calls from feature code. |
| Auth | **NextAuth v5** (`next-auth`) | Built for App Router, supports credential + OAuth flows without depending on a third-party service. |
| File storage | **AWS S3** (`@aws-sdk/client-s3`) | Ubiquitous, cheap, presigned URLs for direct browser upload. |
| AI | **Anthropic Claude** (`@anthropic-ai/sdk`) | Default LLM. Reach for OpenAI only when a specific capability requires it. Every call routed through a logging helper so usage + cost is tracked.

When the kit's `rules/` enforces something about one of these (testing conventions, etc.), the rule is the source of truth and this row is just the pointer.
