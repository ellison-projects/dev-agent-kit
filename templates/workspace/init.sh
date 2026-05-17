#!/usr/bin/env bash
# init.sh — stub the docs/ + _workspace/ structure into a consumer repo.
#
# Run once from the consumer repo root:
#   bash .dev-agent-kit/templates/workspace/init.sh
#
# Behavior:
#   - Copies docs/ and _workspace/ from this template bundle into ./
#   - Skips any file that already exists (no clobber).
#   - Ignores _examples/ — that's reference material, not for install.

set -euo pipefail

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CREATED=0
SKIPPED=0

for top in docs _workspace; do
  [[ -d "$SRC_DIR/$top" ]] || continue
  while IFS= read -r f; do
    rel="${f#"$SRC_DIR/$top/"}"
    dest="$top/$rel"
    if [[ -e "$dest" ]]; then
      echo "  · $dest  (exists, skipped)"
      SKIPPED=$((SKIPPED+1))
    else
      mkdir -p "$(dirname "$dest")"
      cp "$f" "$dest"
      echo "  + $dest  (created)"
      CREATED=$((CREATED+1))
    fi
  done < <(find "$SRC_DIR/$top" -type f | sort)
done

echo
echo "init complete: $CREATED file(s) created, $SKIPPED skipped"
echo "examples available at: $SRC_DIR/_examples/"
