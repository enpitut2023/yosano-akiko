// Copied into src/lib/requirements/tests/ by dump.sh for one run, then
// removed. Writes what each page's requirements module says, one text file
// per page, in the notation the tables use: 6, 16〜, 2〜10.
//
// Env: DUMP_DIR (output).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { test } from "vitest";
import type { CellId } from "#lib/akiko.ts";
import type { MajorConfig } from "#lib/app-setup.ts";
import { instances } from "#lib/constants.ts";
import { MAJOR_TO_REQUIREMENTS } from "#lib/major-config.ts";

const bound = ({ min, max }: { min: number; max: number | undefined }) =>
  min === max ? `${min}` : `${min}〜${max ?? ""}`;

test("dump", async () => {
  const out = process.env.DUMP_DIR;
  if (out === undefined) throw new Error("DUMP_DIR is not set");
  mkdirSync(out, { recursive: true });
  for (const { major, tableYear } of instances) {
    const load = MAJOR_TO_REQUIREMENTS[major];
    if (load === undefined) continue;
    const req: Pick<MajorConfig, "getCreditRequirements" | "getRemark"> =
      await load();
    const r = req.getCreditRequirements(tableYear, major);
    const rectsPath = `static/rects/${tableYear}/${major}.json`;
    const rectIds = existsSync(rectsPath)
      ? Object.keys(JSON.parse(readFileSync(rectsPath, "utf8")) as object)
      : [];
    const cellIds = Object.keys(r.cells);
    const lines = ["cells:"];
    for (const id of cellIds.toSorted())
      lines.push(`  ${id}: ${bound(r.cells[id])}`);
    lines.push("columns:");
    for (const id of Object.keys(r.columns).toSorted())
      lines.push(`  ${id}: ${bound(r.columns[id])}`);
    lines.push(`compulsory(必修 計): ${r.compulsory}`);
    lines.push(`elective(選択 計): ${r.elective}`);
    const noReq = rectIds.filter((id) => !(id in r.cells));
    const noRect = cellIds.filter((id) => !rectIds.includes(id));
    if (noReq.length > 0)
      lines.push(`rect cells without requirements: ${noReq.join(", ")}`);
    if (rectIds.length > 0 && noRect.length > 0)
      lines.push(`requirement cells without rect: ${noRect.join(", ")}`);
    const remarks: string[] = [];
    for (const id of [...new Set([...cellIds, ...rectIds])].toSorted()) {
      const remark = req.getRemark(id as CellId, tableYear, major);
      if (remark !== undefined)
        remarks.push(`  ${id}: ${remark.replaceAll("\n", " ")}`);
    }
    if (remarks.length > 0) lines.push("remarks:", ...remarks);
    writeFileSync(`${out}/${tableYear}-${major}.txt`, lines.join("\n") + "\n");
  }
});
