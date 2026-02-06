import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirements,
} from "@/requirements/math-since-2023";
import { assertCreditStatsEqual, getCreditStats } from "@/test-util";
import { readFileSync } from "node:fs";

function test1(): void {
  const csv = readFileSync("grade-csvs/2023/math-1.csv", { encoding: "utf8" });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements,
    classifyRealCourses: (cs, opts) => classifyRealCourses(cs, opts, 2023),
    classifyFakeCourses: (cs, opts) => classifyFakeCourses(cs, opts, 2023),
  });
  assertCreditStatsEqual(got, {
    cells: {
      a2: { mightTake: 3 },
      a3: { taken: 2 },
      b1: { taken: 44.5, mightTake: 10.5 },
      c1: { taken: 2 },
      c2: { taken: 2 },
      c3: { taken: 1 },
      c4: { taken: 1 },
      d1: { taken: 20 },
      e1: { taken: 2 },
      e2: { taken: 2 },
      e3: { taken: 4 },
      e4: { taken: 4 },
      f1: { taken: 1 },
      f2: { taken: 1 },
      h1: { taken: 9, mightTake: 2 },
    },
    columns: {
      a: { taken: 2, mightTake: 3 },
      b: { taken: 44.5, mightTake: 10.5 },
      c: { taken: 6 },
      d: { taken: 20 },
      e: { taken: 12 },
      f: { taken: 2 },
      h: { taken: 9, mightTake: 2 },
    },
    compulsory: { taken: 20, mightTake: 3 },
    elective: { taken: 75.5, mightTake: 12.5 },
  });
}

test1();
console.log(__filename, "ok");
