# dev-agent-kit

Canonical source for Claude Code conventions — rules, CLAUDE.md fragments, and starting-point templates — that you want to share across multiple repositories.

Consumer repos pull files from this kit via [`sync.sh`](./sync.sh), run on-demand from an npm script. The kit doesn't know or care who pulls from it: any repo with the npm script and network access can sync. No manifest, no daemon, no precommit hook, no CI dependency.

## Layout

| Folder | What it is | What happens in the consumer |
|---|---|---|
| [`rules/`](./rules) | Byte-identical files (`.claude/rules/*.md`) | Auto-applied to `.claude/rules/`. Local edits are detected and the sync aborts unless `--force`. |
| [`partials/`](./partials) | CLAUDE.md sections | Mirrored to `.dev-agent-kit/partials/`. Sync alerts when they change upstream; you paste into `CLAUDE.md` yourself. |
| [`templates/`](./templates) | Starting points for repo-owned files | Mirrored to `.dev-agent-kit/templates/`. Sync alerts when they change upstream; you copy to the final location once and own it. |

## Consumer setup

In each consumer repo, add an npm script to `package.json`:

```json
{
  "scripts": {
    "sync-agent-kit": "curl -fsSL https://raw.githubusercontent.com/ellison-projects/dev-agent-kit/main/sync.sh | bash -s --"
  }
}
```

Then run it once:

```bash
npm run sync-agent-kit
```

That's it. No manifest, no setup beyond the npm script. The first run creates `.dev-agent-kit/` (pristine mirror + auto-generated `CLAUDE.md`) and copies the rules into `.claude/rules/`. Re-run any time you want to pull the latest kit content.

## Consumer layout after sync

```
your-repo/
├── .dev-agent-kit/                 # auto-managed by sync.sh
│   ├── CLAUDE.md                   # last sync date, kit ref + SHA, file list
│   ├── rules/                      # pristine mirror of kit/rules/
│   ├── partials/                   # pristine mirror of kit/partials/
│   └── templates/                  # pristine mirror of kit/templates/
├── .claude/
│   └── rules/
│       ├── CLAUDE.md               # managed block listing kit-synced rules
│       ├── test-files.md           # ← synced from kit
│       └── e2e-gotchas.md          # ← synced from kit
└── package.json                    # contains the sync-agent-kit script
```

## Commands

```bash
npm run sync-agent-kit              # normal sync
npm run sync-agent-kit -- --check   # report drift, exit 1 if anything would change
npm run sync-agent-kit -- --force   # overwrite rule files that have local edits
KIT_REF=v1.0.0 npm run sync-agent-kit   # pin to a specific kit ref
```

## How drift detection works

The pristine mirror at `.dev-agent-kit/` is the key — it's a snapshot of what the kit last gave you. To check for local edits at any time:

```bash
diff -r .dev-agent-kit/rules .claude/rules
```

`sync.sh` uses the same idea: it compares your working copy to the mirror to decide whether you've locally edited a rule. If you have, it aborts that file (`--force` to override). If you haven't, it's safe to overwrite with the new kit content.

For partials and templates, sync compares the *old* mirror against the *new* kit content before overwriting the mirror. If they differ, it prints an alert so you know to review and re-apply (paste into CLAUDE.md, re-copy the template, etc.). The mirror always reflects the latest synced kit version after a run, so you see exactly one alert per upstream change.

## Pinning

`KIT_REF` accepts a branch, tag, or commit SHA. Default is `main`.

- `KIT_REF=main` — track latest (default).
- `KIT_REF=v1.0.0` — pin to a tag. Recommended for shared environments; bump deliberately.
- `KIT_REF=<sha>` — pin to a commit.

## Editing the kit

- **Rules** must be universal across every consumer. If a rule shouldn't apply to one of them, it doesn't belong in the kit — keep it locally in that consumer.
- **Partials** are CLAUDE.md sections you want to keep in sync as a concept but allow each consumer to paste manually.
- **Templates** are starting points for files each consumer customizes (like `docs/CROSS_REPO_RULES.md`).

After editing, tag a release if downstream pins use tags:

```bash
git tag v1.1.0
git push origin v1.1.0
```

## Status

v1.
