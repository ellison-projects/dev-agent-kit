---
name: review-copilot-pr-comments
description: Review and respond to every open review comment on a GitHub PR, then subscribe the session to PR activity so future comments and CI failures keep waking the session. TRIGGER when the user says "review GitHub PR comments", "review pr comments", "go through PR comments", "address PR comments", "watch this PR", or any close variation. Also a good fit immediately after a PR is opened, since the subscribe step makes it easy to stay live on the PR. Sorts each comment into a category, auto-fixes the obvious ones (commit + push), replies to every comment — fixed, deferred, or rejected — and then subscribes for ongoing webhook events.
argument-hint: "[pr-number] (optional - defaults to PR for current branch)"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash(git:*), Bash(npm:*)
---

Walk every open review comment on a GitHub pull request. Triage each one into a category, act accordingly, reply to every comment without exception, and then subscribe the session to PR activity so review comments and CI failures keep waking it as they arrive.

Safe to invoke right after a PR is opened — even with zero comments, the subscribe step makes the skill the natural "be present on this PR going forward" trigger.

## Tools

GitHub MCP tools are deferred. Before calling any `mcp__github__*` tool, load its schema via `ToolSearch` (e.g. `select:mcp__github__list_pull_requests,mcp__github__pull_request_read,mcp__github__add_reply_to_pull_request_comment,mcp__github__resolve_review_thread,mcp__github__list_commits,mcp__github__subscribe_pr_activity`).

## Steps

1. **Identify the PR.**
   - If the user passed a PR number via `$ARGUMENTS`, use that.
   - Otherwise run `git branch --show-current` and call `mcp__github__list_pull_requests` filtered by `head` to find the open PR for the branch. If there's no PR, stop and tell the user.

2. **Fetch comments and threads.** Use `mcp__github__pull_request_read` to pull all inline review comments and review threads (so you know which threads are already resolved). Also pull top-level issue comments via `mcp__github__issue_read` if there are review-style comments there.

3. **Filter what to act on.** Skip a comment if any of these is true:
   - The comment is in a thread already marked resolved.
   - You (the bot account) authored the comment.
   - You already replied in that thread *and* your reply is newer than the latest non-bot comment in the thread (i.e. nothing new has come in since you last responded). If a human follow-up came in after your reply, do not skip — treat the thread as needing a fresh response.

4. **For each remaining comment, investigate** — read the file and surrounding code — then sort it into one of these categories:
   - **(A) Obvious — just fix.** Clearly correct, low-risk, the fix is unambiguous. Examples: typos, missing null checks, wrong copy, dead imports, off-by-one, an obviously better local pattern.
   - **(B) Legit concern but may not be worth the effort.** The reviewer has a valid point, but the cost / blast radius / scope creep makes it a judgment call you shouldn't make alone. Examples: "you should refactor this whole module," "consider extracting a shared helper across X files," "this could be cleaner if we change the data shape." Don't fix automatically — defer to the operator.
   - **(C) Incorrect / not a concern.** The comment is wrong, based on a misunderstanding, already handled elsewhere, or contradicts an explicit project rule. Examples: a question already answered by a comment two lines up, a "missing" check that exists at the call site, a stylistic preference that conflicts with `CLAUDE.md`.

   If a comment looks like (A) but you're genuinely unsure between two valid fixes, treat it as (B) and surface it to the operator instead of guessing.

5. **Act per category.**
   - **(A) Obvious fix** — make the edits, run any quick local validation appropriate to the change (e.g. `npm run lint` or `npm test` if code under test was touched, per `CLAUDE.md`), create a new commit per fix or per tight batch (never amend), and push with `git push -u origin <branch>`. Capture the new commit SHA(s).
   - **(B) Legit but not auto-fixed** — do **not** edit code. Note the comment for the operator report.
   - **(C) Incorrect** — do not edit code. Note the comment for the operator report.

6. **Reply to every comment** via `mcp__github__add_reply_to_pull_request_comment`. No comment goes unanswered.
   - **(A)** Brief reply: `Fixed in <short-sha>.` Add a one-line note only if the change isn't self-explanatory from the diff.
   - **(B)** Acknowledge the point, name the tradeoff, and say it's been flagged for the operator. Example wording: `Valid concern — [one-line tradeoff]. Flagged this for @<owner> to decide; leaving the code as-is for now.`
   - **(C)** Polite, specific reply explaining why it's not a concern. Cite the existing pattern, the constraint, or the line/file that already handles it. Don't be defensive.

7. **Try to resolve threads for category (A)** via `mcp__github__resolve_review_thread` if the tool is available in this environment. If it isn't, or the call errors out, just skip — the reply is enough. Leave (B) and (C) threads open either way: (B) waits on the operator, (C) waits on the reviewer.

8. **Subscribe to PR activity.** Call `mcp__github__subscribe_pr_activity` with the PR number so future review comments, CI runs, and merge/close events wake the session. The subscribe call is idempotent — safe to invoke even if the session is already subscribed. If it errors (server hiccup, MCP disconnected), surface the error in the report but don't fail the skill — the comment work already landed.

9. **Report back** in the chat with a compact summary, grouped by category, plus the watch status:
   - **Fixed (A):** comment → commit SHA, one-line description, file:line.
   - **Needs your call (B):** comment → reviewer's point, your tradeoff read, file:line. Make this section easy to scan — the operator should be able to decide each (B) item in a few seconds.
   - **Pushed back (C):** comment → why you replied it's not a concern, file:line.
   - **Watching:** "Subscribed — I'll respond to new comments and try to autofix CI failures as they arrive." (Or, if the subscribe call failed: a one-line note that subscription didn't take and the operator can retry.)

   Then **end the turn**. Don't poll, don't sleep, don't tail CI logs. Future events will arrive as `<github-webhook-activity>` messages and re-invoke this skill.

## Rules

- **Reply to every open comment.** Silence isn't an option, even when no fix is needed.
- **Auto-fix only category (A).** When in doubt, treat it as (B) and let the operator decide.
- **One commit per fix (or per tight batch).** Don't amend, don't squash.
- **Always subscribe at the end**, even when there were zero comments to act on — the subscribe is the second purpose of this skill.
- **Never** force-push, skip hooks (`--no-verify`), or push to a branch other than the PR's head.
- **Never** create a new PR from this skill.
- **Never** poll or sleep waiting for CI / new comments after subscribing — let webhook events wake the session.
- **Honor `CLAUDE.md`** — follow the project's testing, linting, and styling conventions; never run destructive schema-mutating commands (e.g. `db:push`, `migrate:reset`) automatically.
- Keep replies concise. One or two sentences is usually enough.
