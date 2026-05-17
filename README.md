# dev-agent-kit

The codified version of how I manage Claude Code conventions across multiple repos. Equal parts a shared library and a record of what I've learned about keeping multi-repo agent setups from drifting.

Consumer repos pull files from this kit via [`sync.sh`](./sync.sh), run on-demand from an npm script. The kit doesn't know or care who pulls from it: any repo with the npm script and network access can sync. No manifest, no daemon, no precommit hook, no CI dependency.

## Why this exists

Three lessons baked into the structure:

1. **Not all shared content has the same lifecycle.** Some files (`rules/`) should be byte-identical everywhere and updated centrally. Some (`partials/`) are conceptually shared but pasted into each repo's `CLAUDE.md` manually — agents read `CLAUDE.md` whole, so we can't auto-sync sections of it. Some (`templates/`) are starting points each repo owns once copied. Pretending they're all the same shape causes pain.
2. **Convention beats configuration for small consumer counts.** No manifest, no opt-in/opt-out list. The kit is the manifest: if it's in `rules/`, every consumer gets it. Forces the discipline that only truly universal content lives here.
3. **Mirror, don't trust hashes.** `.dev-agent-kit/` holds a pristine copy of what the kit last gave you. Drift detection is just `diff` against that mirror — readable, debuggable, no opaque lockfile. The same mirror powers "alert on upstream change" for partials and templates without overwriting your local copies.

If you ever start a fourth repo, this is the answer to "how did I set this up before?"

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
```

## How drift detection works

The pristine mirror at `.dev-agent-kit/` is the key — it's a snapshot of what the kit last gave you. To check for local edits at any time:

```bash
diff -r .dev-agent-kit/rules .claude/rules
```

`sync.sh` uses the same idea: it compares your working copy to the mirror to decide whether you've locally edited a rule. If you have, it aborts that file (`--force` to override). If you haven't, it's safe to overwrite with the new kit content.

For partials and templates, sync compares the *old* mirror against the *new* kit content before overwriting the mirror. If they differ, it prints an alert so you know to review and re-apply (paste into CLAUDE.md, re-copy the template, etc.). The mirror always reflects the latest synced kit version after a run, so you see exactly one alert per upstream change.

## Editing the kit

- **Rules** must be universal across every consumer. If a rule shouldn't apply to one of them, it doesn't belong in the kit — keep it locally in that consumer.
- **Partials** are CLAUDE.md sections you want to keep in sync as a concept but allow each consumer to paste manually.
- **Templates** are starting points for files each consumer customizes (like `docs/CROSS_REPO_RULES.md`).

Edit upstream and push — consumers pick up the change on their next sync.

## Status

v1.
