#!/bin/bash
# Snapshot one tree. Used by run.sh and coverage.sh.
#
# Usage: snapshot.sh TREE DEST SWEEP [VITEST_ARGS...]
#
# Copies SHARDS (default 8) copies of snapshot.test.ts into the tree, runs
# them in one vitest process, which spreads them over its workers, and
# removes them again. The log goes to DEST.log.
set -euo pipefail

tree=$1 dest=$2 sweep=$3
shift 3
here=$(cd "$(dirname "$0")" && pwd)
shards=${SHARDS:-8}

# Base trees from before the per-major tests moved keep them in src/lib/tests.
dir=$tree/src/lib/requirements/tests
[[ -d $dir ]] || dir=$tree/src/lib/tests

tests=()
for ((i = 0; i < shards; i++)); do
  tests+=("$dir/snapshot.tmp.${i}of$shards.test.ts")
  cp "$here/snapshot.test.ts" "${tests[$i]}"
done
trap 'rm -f "${tests[@]}"' EXIT

rm -rf "$dest"
cd "$tree"
if ! SNAPSHOT_DIR=$dest SNAPSHOT_SWEEP=$sweep \
  SNAPSHOT_PAST=$here/../data/past-courses.json \
  npx vitest run snapshot.tmp --maxWorkers="$shards" "$@" >"$dest.log" 2>&1; then
  echo "snapshot failed in $tree; see $dest.log" >&2
  exit 1
fi
