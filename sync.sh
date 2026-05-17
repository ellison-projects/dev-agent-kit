#!/usr/bin/env bash
# dev-agent-kit sync.sh — pull canonical Claude Code files into a consumer repo.
#
# Run from a consumer repo root:
#   npm run sync-agent-kit             # normal sync
#   npm run sync-agent-kit -- --check  # report drift, exit 1 if anything would change
#   npm run sync-agent-kit -- --force  # overwrite rule files that have local edits
#
# Convention (no manifest):
#   kit/rules/<f>      → consumer's .claude/rules/<f>           (auto-applied)
#   kit/partials/<f>   → mirror only at .dev-agent-kit/partials/<f>
#   kit/templates/<f>  → mirror only at .dev-agent-kit/templates/<f>

set -euo pipefail

KIT_URL="${KIT_URL:-https://github.com/ellison-projects/dev-agent-kit.git}"
KIT_DIR=".dev-agent-kit"
RULES_TARGET=".claude/rules"

FORCE=0
CHECK=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --check) CHECK=1 ;;
    -h|--help)
      sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

echo "fetching dev-agent-kit..."
git clone --quiet --depth=1 --branch main "$KIT_URL" "$TMPDIR"
KIT_SHA="$(git -C "$TMPDIR" rev-parse --short HEAD)"

CHANGES=0
ALERTS=0
ERRORS=0
RULE_FILES=()

mkdir -p "$KIT_DIR"

# --- Rules: auto-apply with local-edit detection via mirror diff ---
if [[ -d "$TMPDIR/rules" ]]; then
  while IFS= read -r src; do
    rel="${src#"$TMPDIR/rules/"}"
    mirror="$KIT_DIR/rules/$rel"
    working="$RULES_TARGET/$rel"
    RULE_FILES+=("$rel")

    if [[ ! -f "$working" ]]; then
      if (( CHECK )); then
        echo "  + $working  (would create)"
      else
        mkdir -p "$(dirname "$working")"
        cp "$src" "$working"
        echo "  + $working  (created)"
      fi
      CHANGES=$((CHANGES+1))
    elif [[ ! -f "$mirror" ]]; then
      # First sync of a pre-existing file. Adopt only if byte-identical.
      if cmp -s "$src" "$working"; then
        echo "  · $working  (adopted, identical to kit)"
      else
        echo "  ✗ $working  (exists locally but doesn't match kit; resolve manually or rm to adopt)"
        ERRORS=$((ERRORS+1))
        continue
      fi
    elif cmp -s "$working" "$mirror"; then
      # No local edit. Update if kit content has moved.
      if cmp -s "$src" "$working"; then
        echo "  · $working  (up to date)"
      else
        if (( CHECK )); then
          echo "  ↻ $working  (would update)"
        else
          cp "$src" "$working"
          echo "  ↻ $working  (updated)"
        fi
        CHANGES=$((CHANGES+1))
      fi
    else
      # Local edit detected.
      if (( FORCE )); then
        if (( CHECK )); then
          echo "  ! $working  (would force-overwrite local edits)"
        else
          cp "$src" "$working"
          echo "  ! $working  (forced overwrite of local edits)"
        fi
        CHANGES=$((CHANGES+1))
      else
        echo "  ✗ $working  (local edits — pass --force to overwrite)"
        ERRORS=$((ERRORS+1))
        continue
      fi
    fi

    # Update mirror to reflect what the kit currently provides.
    if (( ! CHECK )); then
      mkdir -p "$(dirname "$mirror")"
      cp "$src" "$mirror"
    fi
  done < <(find "$TMPDIR/rules" -type f | sort)
fi

# --- Mirror-only (partials, templates): alert when upstream changes ---
sync_mirror_only() {
  local kind="$1"
  local kit_sub="$TMPDIR/$kind"
  [[ -d "$kit_sub" ]] || return 0
  while IFS= read -r src; do
    local rel="${src#"$kit_sub/"}"
    local mirror="$KIT_DIR/$kind/$rel"

    if [[ ! -f "$mirror" ]]; then
      echo "  + $kind/$rel  (new in mirror)"
      CHANGES=$((CHANGES+1))
    elif ! cmp -s "$mirror" "$src"; then
      echo "  ⚑ $kind/$rel  (updated upstream — review and re-apply if desired)"
      ALERTS=$((ALERTS+1))
    else
      echo "  · $kind/$rel  (up to date)"
    fi

    if (( ! CHECK )); then
      mkdir -p "$(dirname "$mirror")"
      cp "$src" "$mirror"
    fi
  done < <(find "$kit_sub" -type f | sort)
}

sync_mirror_only partials
sync_mirror_only templates

if (( CHECK )); then
  if (( CHANGES > 0 || ALERTS > 0 || ERRORS > 0 )); then
    echo
    echo "drift: $CHANGES file(s) would change, $ALERTS alert(s), $ERRORS error(s)"
    exit 1
  fi
  echo "no drift"
  exit 0
fi

SYNC_AT="$(date -u +'%Y-%m-%d %H:%M:%S UTC')"

# --- Generate .dev-agent-kit/CLAUDE.md ---
{
  cat <<'STATIC_HEADER'
# Dev Agent Kit (auto-managed)

Pristine mirror of `ellison-projects/dev-agent-kit` at the last sync. Auto-managed by `npm run sync-agent-kit` — don't hand-edit anything in this folder. If you're reading this as an agent, this folder is the source of truth for what's kit-managed vs. locally owned in this repo.

STATIC_HEADER

  echo "## Last sync"
  echo
  echo "- **When:** $SYNC_AT"
  echo "- **SHA:** $KIT_SHA"
  echo

  cat <<'STATIC_BODY'
## What's in here

Three categories, each with its own sync behavior:

- **`rules/`** — auto-applied to `.claude/rules/`. Byte-identical with the kit. The mirror here is what `sync.sh` diffs against to detect local edits.
- **`partials/`** — CLAUDE.md sections the kit considers shared. Mirror only: agents read `CLAUDE.md` whole, so we can't safely auto-inject sections. Sync alerts when a partial moves upstream; you re-paste into the consumer's `CLAUDE.md` yourself.
- **`templates/`** — starting points for files the consumer owns once copied (like `docs/CROSS_REPO_RULES.md`). Mirror only. Sync alerts but never overwrites your working copy.

## Synced files

STATIC_BODY

  echo "### \`rules/\` — auto-applied to \`$RULES_TARGET/\`"
  echo
  if [[ -d "$KIT_DIR/rules" ]] && [[ -n "$(find "$KIT_DIR/rules" -type f -print -quit)" ]]; then
    while IFS= read -r f; do
      rel="${f#"$KIT_DIR/rules/"}"
      echo "- \`rules/$rel\` → \`$RULES_TARGET/$rel\`"
    done < <(find "$KIT_DIR/rules" -type f | sort)
  else
    echo "_(none)_"
  fi
  echo
  echo "### \`partials/\` — mirror only; paste into \`CLAUDE.md\` manually"
  echo
  if [[ -d "$KIT_DIR/partials" ]] && [[ -n "$(find "$KIT_DIR/partials" -type f -print -quit)" ]]; then
    while IFS= read -r f; do
      rel="${f#"$KIT_DIR/partials/"}"
      echo "- \`partials/$rel\`"
    done < <(find "$KIT_DIR/partials" -type f | sort)
  else
    echo "_(none)_"
  fi
  echo
  echo "### \`templates/\` — mirror only; copy to final location once, then own"
  echo
  if [[ -d "$KIT_DIR/templates" ]] && [[ -n "$(find "$KIT_DIR/templates" -type f -print -quit)" ]]; then
    while IFS= read -r f; do
      rel="${f#"$KIT_DIR/templates/"}"
      echo "- \`templates/$rel\`"
    done < <(find "$KIT_DIR/templates" -type f | sort)
  else
    echo "_(none)_"
  fi
  echo

  cat <<'STATIC_FOOTER'
## How to detect drift

**Rules:** working copy vs. mirror.

```bash
diff -r .dev-agent-kit/rules .claude/rules
```

If the diff is empty, no local edits. If not, you've drifted — `sync.sh` will abort those files until you `--force` or revert.

**Partials & templates:** there's nothing to diff against your working copy (the kit doesn't know where you placed them). Instead, when sync alerts `⚑ partials/X updated upstream`, it means the kit moved relative to your last sync. To see what changed, look at the kit's git log for that path. To adopt, edit your local `CLAUDE.md` or template copy by hand.

## When alerts fire

- `⚑ partials/X (updated upstream)` — diff `.dev-agent-kit/partials/X` against the matching section in your `CLAUDE.md`, port the change if you want it, or ignore.
- `⚑ templates/Y (updated upstream)` — same idea, against the working copy of Y.
- Alerts are informational, not blocking. They appear once per upstream change — the mirror catches up after each sync.

## Commands

- `npm run sync-agent-kit` — pull latest kit content (rules auto-applied, partials/templates mirrored).
- `npm run sync-agent-kit -- --check` — report drift, exit 1 if anything would change, don't modify files.
- `npm run sync-agent-kit -- --force` — overwrite rule files that have local edits (use carefully — wipes your local changes).

## Editing kit content

This folder is read-only. To change anything here, edit it upstream at `ellison-projects/dev-agent-kit` and re-run sync.
STATIC_FOOTER
} > "$KIT_DIR/CLAUDE.md"

# --- Upsert managed block in $RULES_TARGET/CLAUDE.md listing kit-managed rules ---
if (( ${#RULE_FILES[@]} > 0 )); then
  rules_claude="$RULES_TARGET/CLAUDE.md"
  begin_marker="<!-- BEGIN dev-agent-kit (managed; do not edit between markers) -->"
  end_marker="<!-- END dev-agent-kit -->"

  block_file="$(mktemp)"
  {
    echo "$begin_marker"
    echo
    echo "## Kit-managed rules"
    echo
    echo "The following files in this folder are pulled from \`ellison-projects/dev-agent-kit\`. Don't edit them locally — edit upstream and re-run \`npm run sync-agent-kit\`."
    echo
    for rel in "${RULE_FILES[@]}"; do
      echo "- \`$rel\` ← kit path \`rules/$rel\`"
    done
    echo
    echo "Last sync: $SYNC_AT (kit sha $KIT_SHA)"
    echo
    echo "$end_marker"
  } > "$block_file"

  mkdir -p "$RULES_TARGET"
  if [[ ! -f "$rules_claude" ]]; then
    cp "$block_file" "$rules_claude"
  elif ! grep -Fq -- "$begin_marker" "$rules_claude"; then
    {
      echo
      cat "$block_file"
    } >> "$rules_claude"
  else
    # Replace in place between markers.
    out="$(mktemp)"
    awk -v begin="$begin_marker" -v end="$end_marker" -v block_file="$block_file" '
      BEGIN { skipping = 0 }
      !skipping && index($0, begin) > 0 {
        while ((getline line < block_file) > 0) print line
        close(block_file)
        skipping = 1
        next
      }
      skipping && index($0, end) > 0 { skipping = 0; next }
      !skipping { print }
    ' "$rules_claude" > "$out"
    mv "$out" "$rules_claude"
  fi

  rm -f "$block_file"
fi

echo
echo "synced $CHANGES file(s), $ALERTS alert(s), $ERRORS error(s) (kit sha $KIT_SHA)"
exit $(( ERRORS > 0 ? 1 : 0 ))
