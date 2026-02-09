import { readFileSync } from "node:fs";
import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirementsSince2023,
} from "@/requirements/physics-since-2023";
import { assertCreditStatsEqual, getCreditStats } from "@/test-util";

function test1(): void {
  const csv = readFileSync("grade-csvs/2023/physics-1.csv", {
    encoding: "utf8",
  });
  const isNative = false;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements: creditRequirementsSince2023,
    classifyRealCourses: (cs, opts) => classifyRealCourses(cs, opts, 2023),
    classifyFakeCourses: (cs, opts) => classifyFakeCourses(cs, opts, 2023),
  });
  assertCreditStatsEqual(got, {
    cells: {
      a1: { taken: 2 },
      a2: { mightTake: 6 },
      a4: { taken: 3 },
      b1: { taken: 8, mightTake: 3 },
      b2: { taken: 5, mightTake: 3 },
      b3: { taken: 6 },
      b4: { taken: 22, mightTake: 2 },
      d1: { taken: 7 },
      d2: { taken: 8 },
      d3: { taken: 15.5 },
      e1: { taken: 2 },
      e2: { taken: 2 },
      e3: { taken: 4 },
      e4: { taken: 4 },
      f1: { taken: 1 },
      h1: { taken: 8 },
      h2: {
        rawTaken: 20,
        effectiveTaken: 18,
        rawMightTake: 2,
        effectiveMightTake: 0,
      },
    },
    columns: {
      a: { taken: 5, mightTake: 6 },
      b: { taken: 41, mightTake: 8 },
      d: { taken: 30.5 },
      e: { taken: 12 },
      f: { taken: 1 },
      h: {
        rawTaken: 26,
        effectiveTaken: 24,
      },
    },
    compulsory: { taken: 17, mightTake: 6 },
    elective: {
      rawTaken: 96.5,
      effectiveTaken: 91,
      rawMightTake: 8,
      effectiveMightTake: 0,
    },
  });
}

test1();
console.log(__filename, "ok");
