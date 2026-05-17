## Git workflow

- **`dev` is the integration branch.** All pull requests must target `dev`, not `main`. `main` is reserved for releases — only merges from `dev` land there.
- When opening a PR via `gh` or the GitHub MCP, always pass `base: "dev"`. If a PR was opened against `main` by mistake, retarget it (`gh pr edit <n> --base dev` or `update_pull_request`) rather than rebasing.
