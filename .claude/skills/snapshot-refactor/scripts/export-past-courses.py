"""Write the courses in KdB exports as JSON, for snapshot inputs.

Usage: python3 -I export-past-courses.py DIR > ../data/past-courses.json

DIR holds <year>.xlsx files exported from KdB. Each course ID appears once,
with the name and credits from the latest year that has it.
"""

import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
COURSE_ID = re.compile(r"^[A-Z0-9]{7}$")


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
            yield cells.get("A", ""), cells.get("B", ""), cells.get("D", "")


def main() -> None:
    courses = {}
    for path in sorted(Path(sys.argv[1]).glob("*.xlsx")):
        for course_id, name, credit in read_rows(path):
            if not COURSE_ID.match(course_id):
                continue
            try:
                credit_value = float(credit)
            except ValueError:
                continue
            courses[course_id] = {
                "id": course_id,
                "name": name,
                "credit": int(credit_value) if credit_value.is_integer() else credit_value,
            }
    json.dump(sorted(courses.values(), key=lambda c: c["id"]), sys.stdout, ensure_ascii=False)
    print()


main()
