import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirementsSince2023,
} from "@/requirements/mast-since-2023";
import { assertCreditStatsEqual, getCreditStats } from "@/test-util";
import { readFileSync } from "node:fs";

function test1(): void {
  const csv = readFileSync("grade-csvs/2023/mast-1.csv", { encoding: "utf8" });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements: creditRequirementsSince2023,
    classifyRealCourses: (cs, opts) => classifyRealCourses(cs, opts, 2023),
    classifyFakeCourses: (cs, opts) => classifyFakeCourses(cs, opts, 2023),
  });
  assertCreditStatsEqual(got, {
    cells: {
      a3: { taken: 3 },
      a4: { mightTake: 3 },
      b1: { taken: 10, mightTake: 11 },
      c1: { taken: 2 },
      c2: { taken: 2 },
      c3: { taken: 2 },
      c4: { taken: 2 },
      c5: { taken: 2 },
      c6: { taken: 2 },
      c7: { taken: 2 },
      c8: { taken: 1 },
      c9: { taken: 2 },
      c10: { taken: 2 },
      c11: { taken: 2 },
      c12: { taken: 1 },
      c13: { taken: 2 },
      d1: { taken: 31, mightTake: 4 },
      e1: { taken: 2 },
      e2: { taken: 4 },
      e3: { taken: 2 },
      e4: { taken: 4 },
      f1: { taken: 2 },
      h1: { taken: 13 },
      h2: { taken: 6 },
      h3: { taken: 2 },
    },
    columns: {
      a: { taken: 3, mightTake: 3 },
      b: { taken: 10, mightTake: 11 },
      c: { taken: 24 },
      d: { taken: 31, mightTake: 4 },
      e: { taken: 12 },
      f: { taken: 2 },
      h: { rawTaken: 21, effectiveTaken: 15 },
    },
    compulsory: { taken: 39, mightTake: 3 },
    elective: { taken: 58, mightTake: 15 },
  });
}

test1();
console.log(__filename, "ok");
