#!/bin/bash
# Writes OUT/<year>-<major>.txt: each page's credit requirements, rect IDs
# without requirements (and the reverse), and remarks.
#
# Usage: todo/requirements-check/dump.sh OUT   (from the repo root)
set -euo pipefail

out=$(cd "$(dirname "$1")" && pwd)/$(basename "$1")
here=$(cd "$(dirname "$0")" && pwd)
test=src/lib/requirements/tests/dump.tmp.test.ts
cp "$here/dump.test.ts" "$test"
trap 'rm -f "$test"' EXIT
DUMP_DIR=$out npx vitest run dump.tmp >/dev/null
ls "$out" | wc -l | xargs echo "pages dumped:"
