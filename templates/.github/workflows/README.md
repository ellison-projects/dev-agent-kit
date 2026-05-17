# Workflow templates

Reusable GitHub Actions workflows for repos that follow these conventions:

- `main` is the release branch, `dev` is the integration branch.
- Neon hosts the Postgres database; each PR gets a `preview/<branch>` DB branch.
- Agent work lives on `claude/*` git branches.

Copy any workflow you want into `.github/workflows/` in the consumer repo and configure the secrets/vars listed below. Each file is a starting point — once copied, the consumer owns it.

## Files

| Workflow | Trigger | What it does | Needs |
|---|---|---|---|
| `cleanup-claude-branches.yml` | Manual (`workflow_dispatch`) | Deletes `claude/*` branches whose PRs have merged. Blocks if any PR is open. Dry-run by default. | `GITHUB_TOKEN` (default) |
| `merge-main-into-dev.yml` | Push to `main` + manual | Fast-forwards `dev` with `main` after every release. Errors if `dev` doesn't exist. | `GITHUB_TOKEN` (default) |
| `neon-branch-delete.yml` | Git branch deleted + PR closed | Deletes the matching `preview/<branch>` Neon branch. Skips `main` and `preview/dev`. | `secrets.NEON_API_KEY`, `vars.NEON_PROJECT_ID` |
| `cleanup-neon-branches.yml` | Manual | Bulk cleanup of Neon branches that aren't default/primary/`main`/`preview/dev`. Dry-run by default. | `secrets.NEON_API_KEY`, `vars.NEON_PROJECT_ID` |
| `reset-dev-database.yml` | Manual | Resets the `preview/dev` Neon branch to its parent (typically `main`) so dev matches prod. | `secrets.NEON_API_KEY`, `vars.NEON_PROJECT_ID` |

## Configuring Neon secrets

In the consumer repo's settings:

- **Secret** `NEON_API_KEY` — personal or org API key from https://console.neon.tech/app/settings/api-keys
- **Variable** `NEON_PROJECT_ID` — the project ID (not name) from the Neon console URL

## Adapting per-repo

The protected-branch lists (`main`, `preview/dev`) are hardcoded as the most common case. If a repo uses a different integration branch name, change those literals in the workflow file after copying — they're not parameterized.
