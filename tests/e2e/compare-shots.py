"""Compares screenshots from before and after the SvelteKit 3 migration.

Usage: python3 tests/e2e/compare-shots.py screenshots

Reads <root>/before-*/ and <root>/after-*/, each a run of the e2e tests with
SHOTS set to that directory (see shot.ts). A screenshot passes if one of its
after variants is pixel for pixel the same as one of its before variants.
"""

import sys
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageChops


def load_runs(root: Path, prefix: str) -> dict[str, list[Path]]:
    """Maps each screenshot's path within a run to its files across runs."""
    shots: dict[str, list[Path]] = defaultdict(list)
    runs = sorted(root.glob(f"{prefix}-*"))
    if not runs:
        sys.exit(f"no {prefix}-* runs in {root}")
    for run in runs:
        for f in run.rglob("*.png"):
            shots[str(f.relative_to(run))].append(f)
    print(f"{prefix}: {len(runs)} runs, {len(shots)} screenshots")
    return shots


def pixels(f: Path) -> tuple[tuple[int, int], bytes]:
    with Image.open(f) as im:
        rgba = im.convert("RGBA")
        return rgba.size, rgba.tobytes()


def differing_pixels(a: Path, b: Path) -> str:
    with Image.open(a) as x, Image.open(b) as y:
        x, y = x.convert("RGBA"), y.convert("RGBA")
        if x.size != y.size:
            return f"size {x.size} vs {y.size}"
        diff = ImageChops.difference(x, y)
        n = sum(1 for p in diff.get_flattened_data() if p != (0, 0, 0, 0))
        return f"{n} pixels"


def main() -> None:
    root = Path(sys.argv[1])
    before = load_runs(root, "before")
    after = load_runs(root, "after")

    failed = 0
    for name in sorted(before.keys() - after.keys()):
        print(f"MISSING AFTER  {name}")
        failed += 1
    for name in sorted(after.keys() - before.keys()):
        print(f"MISSING BEFORE {name}")
        failed += 1

    unstable = 0
    for name in sorted(before.keys() & after.keys()):
        b = {pixels(f): f for f in before[name]}
        a = {pixels(f): f for f in after[name]}
        unstable += len(b) > 1
        if b.keys() & a.keys():
            continue
        failed += 1
        closest = min(
            (differing_pixels(fb, fa), fb, fa)
            for fb in b.values()
            for fa in a.values()
        )
        print(f"DIFF {name}: {closest[0]}\n  {closest[1]}\n  {closest[2]}")

    print(f"{unstable} screenshots varied between the before runs")
    print("OK" if failed == 0 else f"{failed} FAILED")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
