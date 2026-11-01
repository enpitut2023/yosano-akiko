#!/bin/bash
# Snapshot two trees and compare them.
#
# Usage: run.sh OUT BASE_REF [NEW_REF]
#
# BASE_REF (and NEW_REF, if given) are checked out as git worktrees under OUT.
# Without NEW_REF the new side is the current working tree. Snapshots land in
# OUT/base and OUT/new, and the summary of their differences is printed.
# SHARDS (default 4) sets how many processes split the pages. SNAPSHOT_PAGES
# (a regex on "<major>-<tableYear>") limits the pages, e.g. for a mutation
# check of one module.
set -euo pipefail

out=$1
base_ref=$2
new_ref=${3:-}
here=$(cd "$(dirname "$0")" && pwd)
repo=$(git rev-parse --show-toplevel)
shards=${SHARDS:-4}

mkdir -p "$out"
out=$(cd "$out" && pwd)

worktree() {
  local dir=$1 ref=$2
  rm -rf "$dir"
  git -C "$repo" worktree remove --force "$dir" 2>/dev/null || true
  git -C "$repo" worktree add -q --detach "$dir" "$ref"
  ln -s "$repo/node_modules" "$dir/node_modules"
  (cd "$dir" && npx svelte-kit sync >/dev/null)
}

worktree "$out/wt-base" "$base_ref"
new_tree=$repo
if [ -n "$new_ref" ]; then
  worktree "$out/wt-new" "$new_ref"
  new_tree=$out/wt-new
fi

python3 -I "$here/make-sweep.py" "$out/wt-base" "$new_tree" >"$out/sweep.txt"

snapshot() {
  local tree=$1 dest=$2
  local test=$tree/src/lib/tests/snapshot.tmp.test.ts
  rm -rf "$dest"
  cp "$here/snapshot.test.ts" "$test"
  local pids=()
  for ((i = 0; i < shards; i++)); do
    (cd "$tree" && SNAPSHOT_DIR=$dest SNAPSHOT_SWEEP=$out/sweep.txt \
      SNAPSHOT_PAST=$here/../data/past-courses.json SNAPSHOT_SHARD=$i/$shards \
      npx vitest run snapshot.tmp >"$dest.$i.log" 2>&1) &
    pids+=($!)
  done
  local failed=0
  for pid in "${pids[@]}"; do wait "$pid" || failed=1; done
  rm "$test"
  if [ $failed -ne 0 ]; then
    echo "snapshot failed in $tree; see $dest.*.log" >&2
    exit 1
  fi
}

snapshot "$out/wt-base" "$out/base"
snapshot "$new_tree" "$out/new"

git -C "$repo" worktree remove --force "$out/wt-base"
[ -n "$new_ref" ] && git -C "$repo" worktree remove --force "$out/wt-new"

python3 -I "$here/snapdiff.py" "$out/base" "$out/new"
