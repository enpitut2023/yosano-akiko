"""List the code the snapshot never ran, from coverage.sh's output.

Usage: python3 -I uncovered.py OUT/coverage/coverage-final.json [FILE_SUBSTRING]

Prints, per file: functions never called, then branches never taken (the
side of an if or ?: and each operand of || and && that was never evaluated),
then statements never run outside those, each with its line and source. A
branch inside a function that was never called isn't listed again.

Left out, since the types already rule them out: code that only leads to an
unreachable(...) or a throw (a switch's default, the else of the last
`if (m === ...)`, the `break` after an `if` that always returns), and
fallbacks to a literal like `?? 0`.
"""

import json
import re
import sys
from pathlib import Path


def text(lines, loc) -> str:
    start, end = loc["start"], loc["end"]
    if start["line"] == end["line"]:
        s = lines[start["line"] - 1][start["column"] : end["column"]]
    else:
        s = lines[start["line"] - 1][start["column"] :] + " …"
    s = " ".join(s.split())
    return s if len(s) <= 100 else s[:97] + "..."


DEAD_END = re.compile(r"unreachable\(|throw new Error\(")
PASS_THROUGH = re.compile(r"^(break;|\}|default:.*|case .*:)$")
LITERAL = re.compile(r'^(0|undefined|null|false|""|\[\])$')


def leads_to_throw(lines, line) -> bool:
    for i, src in enumerate(lines[line - 1 : line + 5]):
        src = src.strip()
        if DEAD_END.search(src):
            return True
        if i > 0 and not PASS_THROUGH.match(src):
            return False
    return False


def inside(loc, ranges) -> bool:
    line = loc["start"]["line"]
    return any(a <= line <= b for a, b in ranges)


def main() -> None:
    coverage = json.loads(Path(sys.argv[1]).read_text())
    only = sys.argv[2] if len(sys.argv) > 2 else ""
    for path, cov in sorted(coverage.items()):
        if only not in path:
            continue
        lines = Path(path).read_text().splitlines()
        out = []
        dead = []
        for k, fn in cov["fnMap"].items():
            if cov["f"][k] == 0:
                dead.append((fn["loc"]["start"]["line"], fn["loc"]["end"]["line"]))
                out.append((fn["decl"]["start"]["line"], f"function {fn['name']} never called"))
        for k, br in cov["branchMap"].items():
            for i, (loc, n) in enumerate(zip(br["locations"], cov["b"][k])):
                # The missing else of an if has an empty location
                if "line" not in loc["start"]:
                    loc = br["loc"]
                if n != 0 or inside(loc, dead):
                    continue
                line = loc["start"]["line"]
                if leads_to_throw(lines, line) or LITERAL.match(text(lines, loc).rstrip(";")):
                    continue
                if br["type"] in ("if", "cond-expr"):
                    side = "then" if i == 0 else "else"
                    out.append((line, f"{br['type']} {side} never taken: {text(lines, br['loc'])}"))
                elif br["type"] == "binary-expr":
                    out.append((line, f"operand never evaluated: {text(lines, loc)}"))
                else:
                    out.append((line, f"{br['type']} branch {i} never taken: {text(lines, loc)}"))
        for k, loc in cov["statementMap"].items():
            if cov["s"][k] == 0 and not inside(loc, dead) and not leads_to_throw(lines, loc["start"]["line"]):
                out.append((loc["start"]["line"], f"statement never run: {text(lines, loc)}"))
        if not out:
            continue
        print(f"== {Path(path).name}")
        seen = set()
        for line, what in sorted(out):
            if (line, what) not in seen:
                seen.add((line, what))
                print(f"  {line}: {what}")


main()
