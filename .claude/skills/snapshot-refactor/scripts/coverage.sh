#!/bin/bash
# Show which code in src/lib/requirements/ the snapshot never runs.
#
# Usage: coverage.sh OUT
#
# Runs the snapshot once in the current working tree with coverage and lists
# what it never ran (uncovered.py). OUT holds the sweep, the throwaway
# snapshot and OUT/coverage/coverage-final.json. The istanbul provider, not
# v8, because it counts each operand of || and && on its own, and most rules
# are long chains of id === "…".
set -euo pipefail

out=$1
here=$(cd "$(dirname "$0")" && pwd)
repo=$(git rev-parse --show-toplevel)

mkdir -p "$out"
out=$(cd "$out" && pwd)
python3 -I "$here/make-sweep.py" "$repo" >"$out/sweep.txt"
"$here/snapshot.sh" "$repo" "$out/snapshot" "$out/sweep.txt" \
  --coverage.enabled --coverage.provider=istanbul \
  --coverage.include='src/lib/requirements/*.ts' --coverage.reporter=json \
  --coverage.reportsDirectory="$out/coverage"
python3 -I "$here/uncovered.py" "$out/coverage/coverage-final.json"
