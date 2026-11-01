"""Print the course IDs to sweep, one per line.

Usage: python3 -I make-sweep.py TREE... > sweep.txt

TREE is a checkout of the repository. Pass both trees being compared, so
both sides sweep the same IDs.

The requirements modules match IDs by exact value or by prefix (startsWith,
^-anchored regexes). Real IDs start with one of the 2-character prefixes in
../data/prefixes.txt, so instead of every possible ID this covers:

- each known prefix followed by every 3rd and 4th character, so any rule on
  the first 4 characters is hit
- each ID-like token in the trees' requirements literals, extended by every
  possible next character, so each side of a longer prefix rule is hit
- a fixed random sample under the known prefixes, for anything else, and a
  smaller one over any prefix, for catch-all rules like "everything but
  共通科目" meeting an ID nobody has seen yet

Fails if a course ID in a tree's catalog or grades files, or in the past
catalogs, starts with a prefix that isn't known, so the sweep would miss it.
"""

import itertools
import json
import random
import re
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
RANDOM_COUNT = 20_000
ANY_PREFIX_COUNT = 5_000
COURSE_ID = re.compile(r"\b[A-Z0-9]{7}\b")
# String literals and ^-anchored regex bodies
LITERAL = re.compile(r'"([^"\n]*)"|/\^([^/\n]*)/')
TOKEN = re.compile(r"[A-Z0-9]{2,7}")


def pad(s: str) -> str:
    return (s + "0" * 7)[:7]


def main() -> None:
    prefixes = (DATA / "prefixes.txt").read_text().split()
    trees = [Path(t) for t in sys.argv[1:]]

    seen = {c["id"] for c in json.loads((DATA / "past-courses.json").read_text())}
    for tree in trees:
        seen |= set(re.findall(r'"id":"([A-Z0-9]{7})"', (tree / "src/lib/current-courses.ts").read_text()))
        for csv in (tree / "grade-csvs").glob("*/*.csv"):
            seen |= set(COURSE_ID.findall(csv.read_text(errors="ignore")))
    unknown = sorted({i[:2] for i in seen} - set(prefixes))
    if unknown:
        sys.exit(f"Unknown 2-character prefixes, add them to {DATA / 'prefixes.txt'}: {' '.join(unknown)}")

    ids = set()
    for p in prefixes:
        for a, b in itertools.product(CHARS, repeat=2):
            ids.add(pad(p + a + b))
    for tree in trees:
        for path in (tree / "src/lib/requirements").glob("*.ts"):
            for m in LITERAL.finditer(path.read_text()):
                for token in TOKEN.findall(m.group(1) or m.group(2) or ""):
                    ids.add(pad(token))
                    if len(token) < 7:
                        for ch in CHARS:
                            ids.add(pad(token + ch))
    rng = random.Random(0)
    for _ in range(RANDOM_COUNT):
        ids.add(rng.choice(prefixes) + "".join(rng.choice(CHARS) for _ in range(5)))
    for _ in range(ANY_PREFIX_COUNT):
        ids.add("".join(rng.choice(CHARS) for _ in range(7)))
    for i in sorted(ids):
        print(i)


main()
