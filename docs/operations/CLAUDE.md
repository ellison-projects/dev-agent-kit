# docs/operations/

Runbooks for the operational work of running this project — the things you do *to* the system, not the things that live *in* it.

What belongs here:

- **Runbooks** for routine operational tasks: rotating a credential, resetting a stuck queue, replaying failed webhooks, restoring a Neon branch from backup.
- **Incident playbooks**: "the deploy is failing", "auth is down", "Resend is bouncing" — what to check, in what order, and how to recover.
- **Deploy and rollback procedures** that aren't fully automated.
- **On-call notes** if the project has them.

What doesn't belong here:

- Code conventions → `../patterns/`.
- "How the system works today" descriptions → `../systems/`.
- Third-party service setup (env vars, account wiring) → `../integrations/`.
- Past exploration of operational options → `../../_research/`.

One file per procedure. Name it after the task (`rotate-database-password.md`, `restore-from-backup.md`), not the system. A runbook is something a tired human follows step-by-step at 2am — write it that way: numbered steps, exact commands, expected output, what "done" looks like.

Keep runbooks current. If a step changes, update the runbook in the same PR. A stale runbook is worse than no runbook.
