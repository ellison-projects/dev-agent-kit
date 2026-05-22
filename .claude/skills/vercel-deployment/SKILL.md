---
name: vercel-deployment
description: Check the latest Vercel deployment for the current project, and if it failed, fetch the build logs, diagnose the error, and fix it. Use when the user asks about deploy status, "is the deploy green?", "did my push deploy?", "why did the build fail?", or "fix the build".
argument-hint: "[project-name-or-id] (optional - defaults to .vercel/project.json)"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash(git:*)
---

Report the latest Vercel deployment status. If it failed, fetch the build logs, identify the root cause, and apply the minimal code fix.

## Resolving the project

The skill needs a Vercel project ID + team ID. It tries in order:

1. If `$ARGUMENTS` is provided, treat it as a project name or `prj_…` ID. If it's a name, call `list_teams` then `list_projects` for each team and find the matching project to get its `id` and `accountId` (use as `teamId`). If the name matches projects in **more than one team**, do NOT silently pick one — list every candidate (`<team-slug>/<project-name>` with its `prj_…` ID) and ask the user which to use.
2. Otherwise, if `.vercel/project.json` exists at the repo root, use its `projectId` + `orgId` (the `orgId` is the `teamId`). Lets the user override by running `vercel link` against a different project.
3. Otherwise, ask the user for the project name or `prj_…` ID. The IDs aren't secret (they appear in every deploy URL) — to avoid the prompt in fresh Claude Code on the web sessions where `.vercel/` is gitignored, hardcode the consumer repo's `projectId` / `teamId` here in step 3 after copying this skill.

## Steps

1. **Resolve the project** per the section above.

2. **Fetch the right deployment.** Call `list_deployments` with `projectId` and `teamId` — the response is ordered newest-first.
   - **If the response is empty** (e.g. a newly linked project that's never deployed): report *"No deployments found for project `<project-name-or-id>`."* and stop. Do not proceed to the summary block.
   - **If the project came from `.vercel/project.json`** (implied local-repo context): get the current branch with `git branch --show-current`, then walk the deployments and pick the first one whose `meta.githubCommitRef` matches that branch. If no deployment in the response matches, do NOT silently fall back — report it explicitly: *"No deployment found for branch `<branch>` in the last 20 deployments. Most recent deployment on this project is for branch `<other-branch>`, <age> ago."* Then stop.
   - **If the project came from `$ARGUMENTS`** (no implied branch context): just take the first entry of the response.

3. **Summarize it.** Print exactly this block, in this order, with these labels — no extras, no reordering, no emoji:

   ```
   State:    <READY | BUILDING | ERROR | QUEUED | CANCELED>
   URL:      https://<deployment.url>
   Created:  <relative age, e.g. "3m ago", "2h ago", "yesterday">
   ```

   That's the entire summary. Do not add commit, target, or creator fields. Any further detail (build error excerpt, diagnosis, fix) goes *after* this block, not inside it.

4. **If the state is `ERROR`: fetch logs, diagnose, fix.**
   a. Call `get_deployment_build_logs` with the deployment's `uid` (or `url`), the same `teamId`, and `limit: 200`. If the failure isn't visible in the last 200 lines, raise to 500.
   b. Scan for the actual failure (lines containing `error`, `Error`, `failed`, `ELIFECYCLE`, TypeScript `TS####`, ESLint, `Module not found`, `Cannot find`, framework-specific errors). Print only the relevant excerpt — never the full log.
   c. State a one-line diagnosis: what broke, in which file (with `path:line` if the log gives it), and the likely root cause.
   d. **Apply the minimal fix.** Open the offending file(s) and make the smallest change that resolves the error. Explain what changed and why. If the cause is ambiguous (multiple plausible roots) or the fix is non-trivial (touches multiple files, changes shared types, requires a dependency change), surface options and ask the user before editing.
   e. After fixing, suggest the next step (e.g. "run `npm run build` locally to verify, then commit and push to retrigger the deploy"). Do NOT auto-commit, auto-push, or auto-redeploy.

5. **If the state is `BUILDING` or `QUEUED`:** mention that it's still in progress and offer to re-run the skill in a moment, or to live-tail logs via `get_deployment_build_logs`. Do not auto-poll.

6. **If the state is `READY`:** that's it — short success line is enough. Don't fetch logs.

## Notes

- Never call `list_teams` + `list_projects` when `.vercel/project.json` already has the IDs — it's wasted round-trips.
- Don't paginate or fetch more than the latest deployment unless the user explicitly asks for history.
- Build log output can be huge; always summarize, never paste raw logs end-to-end.
