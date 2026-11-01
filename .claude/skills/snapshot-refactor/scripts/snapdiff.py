"""Summarize the differences between two snapshot directories.

Usage:
  python3 -I snapdiff.py BASE NEW
  python3 -I snapdiff.py BASE NEW --show PAGE [PATH_PREFIX]
  python3 -I snapdiff.py --throws DIR

Each differing value is grouped under its parent, e.g. "known" or
"csvs/grade-csvs/2023/coins-1.csv/stats/cells/c1", and the summary counts
each "old -> new" change per page and parent ("-" means absent). --show lists
every differing value of one page (a file name without .json.gz), optionally
only under a path prefix. Exits 1 when anything differs.

--throws lists the crashes recorded in one snapshot directory, per page and
section.
"""

import gzip
import json
import re
import sys
from collections import Counter, defaultdict
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

MISSING = "-"
# The snapshot writes one value per line, with its key, so a crash is
# `"<key>": "throws <message>"` on a line of its own
THROWS = re.compile(r'^ *"([^"]*)": "throws ([^"]*)"', re.M)
SECTION = re.compile(r'^ "([^"]*)":', re.M)


def read(path: Path) -> bytes:
    with gzip.open(path, "rb") as f:
        return f.read()


def leaves(a, b, path, out):
    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a) | set(b)):
            leaves(a.get(k, MISSING), b.get(k, MISSING), f"{path}/{k}" if path else k, out)
    elif a != b:
        out.append((path, a, b))


def short(v) -> str:
    return v if isinstance(v, str) else json.dumps(v, ensure_ascii=False)


def compare(job):
    """The differing leaves of one page, or None when the files are equal."""
    base, new = job
    a, b = read(base), read(new)
    # The output is deterministic, so equal bytes mean equal snapshots and
    # most pages never need parsing
    if a == b:
        return None
    diffs = []
    leaves(json.loads(a), json.loads(b), "", diffs)
    return diffs


def throws_in(path: Path) -> Counter:
    found = Counter()
    text = read(path).decode()
    sections = [(m.start(), m.group(1)) for m in SECTION.finditer(text)]
    for m in THROWS.finditer(text):
        section = max((s for s in sections if s[0] <= m.start()), default=(0, "?"))[1]
        found[(path.name.removesuffix(".json.gz"), section, m.group(2))] += 1
    return found


def throws(directory: Path) -> None:
    found = Counter()
    with ProcessPoolExecutor() as pool:
        for c in pool.map(throws_in, sorted(directory.glob("*.json.gz"))):
            found.update(c)
    for (page, section, message), n in sorted(found.items()):
        print(page, section, f"{n}x", message)
    if not found:
        print("no throws")


def main() -> None:
    args = sys.argv[1:]
    if args[0] == "--throws":
        throws(Path(args[1]))
        return
    base, new = Path(args[0]), Path(args[1])
    show = args[3] if len(args) > 3 and args[2] == "--show" else None
    prefix = args[4] if len(args) > 4 else ""

    names = {p.name for p in base.glob("*.json.gz")}
    new_names = {p.name for p in new.glob("*.json.gz")}
    differs = False
    for name in sorted(names ^ new_names):
        print(f"only in {'base' if name in names else 'new'}: {name}")
        differs = True
    common = sorted(n for n in names & new_names if show is None or n == f"{show}.json.gz")
    with ProcessPoolExecutor() as pool:
        results = pool.map(compare, [(base / n, new / n) for n in common])
        for name, diffs in zip(common, results):
            if not diffs:
                continue
            differs = True
            page = name.removesuffix(".json.gz")
            if show is not None:
                for path, a, b in diffs:
                    if path.startswith(prefix):
                        print(f"{path}: {short(a)} -> {short(b)}")
                continue
            groups = defaultdict(Counter)
            for path, a, b in diffs:
                parent = path.rsplit("/", 1)[0] if "/" in path else path
                groups[parent][f"{short(a)} -> {short(b)}"] += 1
            for parent, changes in groups.items():
                print(page, parent, dict(changes))
    if not differs:
        print("identical")
    sys.exit(1 if differs else 0)


if __name__ == "__main__":
    main()
