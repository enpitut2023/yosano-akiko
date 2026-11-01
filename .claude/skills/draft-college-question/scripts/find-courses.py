"""Print the courses matching any pattern from each year's course spreadsheet.

Usage: python3 -I find-courses.py DIR PATTERN...

DIR holds <year>.xlsx files exported from KdB. A pattern matches a course
whose ID starts with it or whose name contains it.
"""

import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

# Columns of the KdB export
COLUMNS = {
    "A": "id",
    "B": "name",
    "D": "credit",
    "E": "year",
    "F": "term",
    "G": "slot",
    "J": "remark",
}


def read_rows(path: Path):
    z = zipfile.ZipFile(path)
    strings = []
    if "xl/sharedStrings.xml" in z.namelist():
        root = ET.parse(z.open("xl/sharedStrings.xml")).getroot()
        for si in root.iter(NS + "si"):
            strings.append("".join(t.text or "" for t in si.iter(NS + "t")))
    for name in sorted(n for n in z.namelist() if n.startswith("xl/worksheets/")):
        for _, row in ET.iterparse(z.open(name)):
            if row.tag != NS + "row":
                continue
            cells = {}
            for c in row.iter(NS + "c"):
                col = re.match(r"[A-Z]+", c.get("r", "")).group(0)
                v = c.find(NS + "v")
                if c.get("t") == "s" and v is not None:
                    cells[col] = strings[int(v.text)]
                elif c.get("t") == "inlineStr":
                    cells[col] = "".join(t.text or "" for t in c.iter(NS + "t"))
                elif v is not None:
                    cells[col] = v.text
            row.clear()
            yield {key: cells.get(col, "") for col, key in COLUMNS.items()}


def main() -> None:
    directory, *patterns = sys.argv[1:]
    for path in sorted(Path(directory).glob("*.xlsx")):
        for course in read_rows(path):
            if not any(
                course["id"].startswith(p) or p in course["name"] for p in patterns
            ):
                continue
            remark = course["remark"].replace("\n", " ")
            print(
                f'{path.stem} {course["id"]} {course["name"]} '
                f'{course["credit"]}単位 {course["year"]}年次 '
                f'{course["term"]} {course["slot"]}\n  {remark}'
            )


main()
