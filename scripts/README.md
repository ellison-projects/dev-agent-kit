# scripts/

Build-time and dev-time scripts for the Next.js + Vercel + Neon + `node-pg-migrate` stack assumed by this template. If your project deviates from that stack, expect to delete or rewrite the relevant pieces.

## What's in here

```
scripts/
├── build-preview.js          # Vercel build orchestrator (preview vs. prod, with Neon reset on preview)
├── reset-preview-branch.js   # Reset a Vercel preview's Neon branch from main, then migrate
├── migrate-build.js          # Standalone migration runner for the build step
├── generate-build-info.js    # Writes lib/build-info.ts with timestamp + commit metadata
└── reset-database.js         # Local dev: wipe + re-migrate the whole DB (guarded)
```

## Wiring it up

Add these to `package.json`:

```json
{
  "scripts": {
    "build": "dotenv-flow -- sh -c 'node scripts/build-preview.js && node scripts/generate-build-info.js && next build'",
    "migrate:create": "node-pg-migrate create",
    "migrate:up": "dotenv-flow -- node-pg-migrate up --no-check-order",
    "migrate:down": "dotenv-flow -- node-pg-migrate down",
    "migrate:reset": "npm run migrate:down && npm run migrate:up",
    "db:reset": "node scripts/reset-database.js",
    "db:reset:seed": "node scripts/reset-database.js --seed"
  }
}
```

Install the runtime deps: `npm i -D dotenv-flow node-pg-migrate pg`.

## build-preview.js

The entry point Vercel's build step runs. Branches on env:

| `VERCEL_ENV` | `NEON_API_KEY` + `NEON_PROJECT_ID` set? | Behavior |
|---|---|---|
| `preview` | yes | Reset the preview's Neon branch from main, then run migrations. |
| `preview` | no  | Warn and run migrations only. |
| `production` / `development` / unset | — | Run migrations only. |

If the Neon reset fails, falls back to migrations-only so the deploy still ships (with a warning logged).

## reset-preview-branch.js

Looks up the Neon branch that matches `VERCEL_GIT_COMMIT_REF` (tries exact match → normalized `/` → `-` → partial match), then calls Neon's restore API to reset it from a source branch.

Required env (set as Vercel project env vars):

- `NEON_API_KEY` — Neon API key
- `NEON_PROJECT_ID` — Neon project ID
- `NEON_MAIN_BRANCH_ID` — Neon branch ID of your main branch (e.g. `br-xxxx-xxxxxxx`). Find this in the Neon console under Branches → click main → copy the branch ID.
- `VERCEL_GIT_COMMIT_REF` — auto-set by Vercel; the git branch name being built

Without these, the script skips the reset and just runs migrations.

## migrate-build.js

A standalone migration runner — useful as a separate Vercel build step or as a one-off command. Skips cleanly if `DATABASE_URL` is unset (so local builds without a DB don't fail).

Not used by the default `npm run build` (which goes through `build-preview.js`); included for cases where you want to split migration from the orchestrator.

## generate-build-info.js

Writes `lib/build-info.ts` with the build timestamp and Vercel git metadata. The app can import this to display "deployed at X" in a footer or `/api/health`.

```ts
import { buildInfo } from "@/lib/build-info";
console.log(buildInfo.timestamp, buildInfo.vercelGitCommitSha);
```

The output file is generated, so add it to `.gitignore`:

```
lib/build-info.ts
```

## reset-database.js

Local-dev helper. Drops every table and index in `public`, drops `pgmigrations`, then re-runs migrations. Prompts for confirmation unless `--yes` is passed or `CI=true`.

```bash
npm run db:reset           # confirm, then reset
npm run db:reset:seed      # reset + POST /api/seed (requires dev server running)
node scripts/reset-database.js --yes   # CI / scripted
```

Requires `psql` on the PATH and `DATABASE_URL` set (loaded from `.env*` via `dotenv-flow`).
