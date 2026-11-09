// Copied beside the per-major tests' util.ts by snapshot.sh for one run, then removed. Dumps every
// classification, the credit requirements and the remarks of every page, as
// one gzipped JSON per page and 移行 answer.
//
// Env: SNAPSHOT_DIR (output), SNAPSHOT_SWEEP (sweep.txt from make-sweep.py),
// SNAPSHOT_PAST (past-courses.json), SNAPSHOT_PAGES (optional regex on
// "<major>-<tableYear>").
//
// A copy named snapshot.tmp.<i>of<n>.test.ts does only every nth page,
// starting at the ith. Vitest runs test files in parallel, so n copies split
// the pages between workers, and coverage from all of them is merged.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { test } from "vitest";
import type {
  CourseId,
  FakeCourse,
  FakeCourseId,
  Grade,
  KnownCourse,
  RealCourse,
} from "#lib/akiko.ts";
import { instances } from "#lib/constants.ts";
import { parseImportedCsv } from "#lib/csv.ts";
import { knownCourses } from "#lib/current-courses.ts";
import type { MajorConfig } from "#lib/app-setup.ts";
import { MAJOR_TO_REQUIREMENTS } from "#lib/major-config.ts";
import { assert } from "#lib/util.ts";
import { getCreditStats } from "./util";

const env = {
  dir: process.env.SNAPSHOT_DIR,
  sweep: process.env.SNAPSHOT_SWEEP,
  past: process.env.SNAPSHOT_PAST,
  pages: process.env.SNAPSHOT_PAGES,
};

type Course = Pick<RealCourse, "id" | "name" | "credit">;

function sorted(m: Map<unknown, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    [...m]
      .map(([k, v]): [string, unknown] => [String(k), v])
      .sort(([a], [b]) => (a < b ? -1 : 1)),
  );
}

// JSON can't hold Maps, so turn them into sorted objects
function plain(v: unknown): unknown {
  if (v instanceof Map) return plain(sorted(v));
  if (Array.isArray(v)) return v.map(plain);
  if (typeof v === "object" && v !== null) {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
  }
  return v;
}

function shuffled<T>(xs: T[], seed: number): T[] {
  const out = [...xs];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2 ** 31;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function realOf(c: Course, tableYear: number, grade: Grade): RealCourse {
  return { ...c, takenYear: tableYear, grade };
}

// A throw is recorded like any other result, so a refactor that adds or
// removes one shows up in the diff instead of stopping the run
function attempt<T>(f: () => T): T | string {
  try {
    return f();
  } catch (e) {
    return `throws ${String(e)}`;
  }
}

test.skipIf(env.dir === undefined)(
  "snapshot",
  async () => {
    const { dir, sweep, past: pastPath } = env;
    assert(dir !== undefined && sweep !== undefined && pastPath !== undefined);
    mkdirSync(dir, { recursive: true });

    // The catalog, then past courses it doesn't have, then the sweep's rest
    const courses = new Map<string, Course>();
    for (const c of knownCourses) courses.set(c.id, c);
    const past = JSON.parse(readFileSync(pastPath, "utf8")) as Course[];
    for (const c of past) if (!courses.has(c.id)) courses.set(c.id, c);
    const named = [...courses.values()];
    // Grades files have few fake courses, all English, so every known name
    // also goes in as one
    const names = [...new Set(named.map((c) => c.name))].sort();
    for (const id of readFileSync(sweep, "utf8").split("\n")) {
      if (id !== "" && !courses.has(id)) {
        courses.set(id, { id: id as CourseId, name: "", credit: 1 });
      }
    }
    const all = [...courses.values()];
    // classifyKnownCourses reads only these fields
    const asKnown = all as unknown as KnownCourse[];

    const csvs = readdirSync("grade-csvs").flatMap((year) =>
      readdirSync(join("grade-csvs", year))
        .filter((f) => f.endsWith(".csv"))
        .map((f) => {
          const path = join("grade-csvs", year, f);
          const csv = readFileSync(path, "utf8");
          const result = parseImportedCsv(csv);
          assert(result.kind === "ok");
          return { path, csv, ...result };
        }),
    );

    const pages = env.pages === undefined ? undefined : new RegExp(env.pages);
    const m = /\.(\d+)of(\d+)\.test\.ts$/.exec(fileURLToPath(import.meta.url));
    const [shard, shards] = m === null ? [0, 1] : [Number(m[1]), Number(m[2])];
    for (const [i, { major, tableYear }] of instances.entries()) {
      if (i % shards !== shard) continue;
      if (pages !== undefined && !pages.test(`${major}-${tableYear}`)) continue;
      const load = MAJOR_TO_REQUIREMENTS[major];
      if (load === undefined) continue;
      const req: Pick<
        MajorConfig,
        | "getCreditRequirements"
        | "classifyKnownCourses"
        | "classifyRealCourses"
        | "classifyFakeCourses"
        | "getRemark"
      > = await load();
      const requirements = req.getCreditRequirements(tableYear, major);
      const remarks = Object.fromEntries(
        Object.keys(requirements.cells).map((cellId) => [
          cellId,
          req.getRemark(cellId as never, tableYear, major),
        ]),
      );

      for (const fromSougou of [false, true]) {
        const opts = { major, tableYear, fromSougou };
        const alone = new Map<string, string>();
        for (const c of all) {
          const cellId = attempt(() =>
            req
              .classifyRealCourses([realOf(c, tableYear, "a+")], opts)
              .get(c.id),
          );
          if (cellId !== undefined) alone.set(c.id, cellId);
        }
        const fakes = names.map((name, i): FakeCourse => ({
          id: i as FakeCourseId,
          name,
          credit: 1,
          takenYear: tableYear,
          grade: "free",
        }));
        const together = (cs: Course[], grade: Grade) =>
          attempt(() =>
            sorted(
              req.classifyRealCourses(
                cs.map((c) => realOf(c, tableYear, grade)),
                opts,
              ),
            ),
          );
        const snapshot = {
          requirements,
          remarks,
          known: attempt(() => sorted(req.classifyKnownCourses(asKnown, opts))),
          realAlone: sorted(alone),
          realTogether: together(named, "a+"),
          realTogetherShuffled: together(shuffled(named, 1), "a+"),
          realTogetherFailed: together(named, "d"),
          fakeByName: attempt(() =>
            sorted(
              new Map(
                [...req.classifyFakeCourses(fakes, opts)].map(
                  ([id, cellId]) => [names[id], cellId],
                ),
              ),
            ),
          ),
          csvs: Object.fromEntries(
            csvs.map((csv) => [
              csv.path,
              {
                real: attempt(() =>
                  sorted(req.classifyRealCourses(csv.realCourses, opts)),
                ),
                fake: attempt(() =>
                  sorted(req.classifyFakeCourses(csv.fakeCourses, opts)),
                ),
                stats: attempt(() =>
                  plain(
                    getCreditStats({
                      csv: csv.csv,
                      fromSougou,
                      tableYear,
                      major,
                      creditRequirements: requirements,
                      classifyRealCourses: req.classifyRealCourses,
                      classifyFakeCourses: req.classifyFakeCourses,
                    }),
                  ),
                ),
              },
            ]),
          ),
        };
        const name = `${major}-${tableYear}-${fromSougou ? "ikou" : "direct"}`;
        writeFileSync(
          join(dir, `${name}.json.gz`),
          gzipSync(JSON.stringify(snapshot, null, 1)),
        );
      }
    }
  },
  3_600_000,
);
