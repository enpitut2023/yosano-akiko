#!/bin/bash
# Show which lines of src/lib/requirements/ the snapshot never runs.
#
# Usage: coverage.sh OUT
#
# Runs the snapshot once in the current working tree with V8 coverage and
# prints the text report. OUT holds the sweep and the throwaway snapshot.
# Needs @vitest/coverage-v8 at the installed vitest's version.
set -euo pipefail

out=$1
here=$(cd "$(dirname "$0")" && pwd)
repo=$(git rev-parse --show-toplevel)

if [ ! -d "$repo/node_modules/@vitest/coverage-v8" ]; then
  version=$(node -p "require('$repo/node_modules/vitest/package.json').version")
  echo "@vitest/coverage-v8 isn't installed. To install it without touching package.json:" >&2
  echo "  npm install --no-save @vitest/coverage-v8@$version" >&2
  exit 1
fi

mkdir -p "$out"
out=$(cd "$out" && pwd)
python3 -I "$here/make-sweep.py" "$repo" >"$out/sweep.txt"

test=$repo/src/lib/tests/snapshot.tmp.test.ts
cp "$here/snapshot.test.ts" "$test"
trap 'rm -f "$test"' EXIT
cd "$repo"
SNAPSHOT_DIR=$out/coverage-snapshot SNAPSHOT_SWEEP=$out/sweep.txt \
  SNAPSHOT_PAST=$here/../data/past-courses.json \
  npx vitest run snapshot.tmp --coverage.enabled --coverage.provider=v8 \
  --coverage.include='src/lib/requirements/**' --coverage.reporter=text \
  --coverage.reportsDirectory="$out/coverage"
