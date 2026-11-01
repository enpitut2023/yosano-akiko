#!/bin/bash
# Snapshot two trees and compare them.
#
# Usage: run.sh OUT BASE_REF [NEW_REF]
#
# BASE_REF (and NEW_REF, if given) are checked out as git worktrees under OUT.
# Without NEW_REF the new side is the current working tree. Snapshots land in
# OUT/base and OUT/new, and the summary of their differences is printed.
# SHARDS (default 8) sets how many workers split the pages. SNAPSHOT_PAGES
# (a regex on "<major>-<tableYear>") limits the pages, e.g. for a mutation
# check of one module.
set -euo pipefail

out=$1
base_ref=$2
new_ref=${3:-}
here=$(cd "$(dirname "$0")" && pwd)
repo=$(git rev-parse --show-toplevel)

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

cleanup() {
  for dir in "$out/wt-base" "$out/wt-new"; do
    [ -d "$dir" ] && git -C "$repo" worktree remove --force "$dir"
  done
  return 0
}
trap cleanup EXIT

worktree "$out/wt-base" "$base_ref"
new_tree=$repo
if [ -n "$new_ref" ]; then
  worktree "$out/wt-new" "$new_ref"
  new_tree=$out/wt-new
fi

python3 -I "$here/make-sweep.py" "$out/wt-base" "$new_tree" >"$out/sweep.txt"

"$here/snapshot.sh" "$out/wt-base" "$out/base" "$out/sweep.txt"
"$here/snapshot.sh" "$new_tree" "$out/new" "$out/sweep.txt"

python3 -I "$here/snapdiff.py" "$out/base" "$out/new"
