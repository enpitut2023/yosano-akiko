import { readFileSync } from "node:fs";
import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirementsSince2023,
} from "@/requirements/chem-since-2023";
import { assertCreditStatsEqual, getCreditStats } from "@/test-util";

function test1(): void {
  const csv = readFileSync("grade-csvs/2023/chem-1.csv", {
    encoding: "utf8",
  });
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
      a1: { taken: 4 },
      a2: { taken: 4 },
      a3: { mightTake: 4 },
      b1: { taken: 4, mightTake: 2 },
      b2: { taken: 6, rawMightTake: 3, effectiveMightTake: 0 },
      b3: {
        rawTaken: 9,
        effectiveTaken: 6,
        rawMightTake: 3,
        effectiveMightTake: 0,
      },
      b4: { taken: 11, mightTake: 4 },
      c1: { taken: 3 },
      d1: { rawTaken: 16, effectiveTaken: 12 },
      d2: { taken: 13 },
      e1: { taken: 2 },
      e2: { taken: 2 },
      e3: { taken: 4 },
      e4: { taken: 4 },
      h1: { taken: 2 },
      h2: { rawTaken: 10, effectiveTaken: 9 },
    },
    columns: {
      a: { taken: 8, mightTake: 4 },
      b: { taken: 27, mightTake: 6 },
      c: { taken: 3 },
      d: { taken: 25 },
      e: { taken: 12 },
      h: { taken: 11 },
    },
    compulsory: { taken: 23, mightTake: 4 },
    elective: { taken: 63, mightTake: 6 },
  });
}

test1();
console.log(__filename, "ok");
