import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirementsSince2024,
} from "@/requirements/coens-since-2023";
import { assertCreditStatsEqual, getCreditStats } from "@/test-util";
import { readFileSync } from "node:fs";

function test1(): void {
  const csv = readFileSync("grade-csvs/2024/coens-1.csv", {
    encoding: "utf8",
  });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements: creditRequirementsSince2024,
    classifyRealCourses: (cs, opts) =>
      classifyRealCourses(cs, opts, 2024, "ap"),
    classifyFakeCourses: (cs, opts) =>
      classifyFakeCourses(cs, opts, 2024, "ap"),
  });
  assertCreditStatsEqual(got, {
    cells: {
      a1: { taken: 1 },
      b2: { taken: 5, mightTake: 3 },
      c1: { taken: 1 },
      c2: { taken: 16, mightTake: 3 },
      d1: { taken: 8, mightTake: 1 },
      d2: { taken: 16 },
      e1: { taken: 2 },
      e2: { taken: 2 },
      e3: { taken: 4 },
      e4: { taken: 4 },
      f1: { rawTaken: 2, effectiveTaken: 1 },
      f2: { taken: 4 },
      h1: { taken: 11 },
      h2: { taken: 2 },
    },
    columns: {
      a: { taken: 1 },
      b: { taken: 5, mightTake: 3 },
      c: { taken: 17, mightTake: 3 },
      d: { taken: 24, mightTake: 1 },
      e: { taken: 12 },
      f: { taken: 5 },
      h: { taken: 13 },
    },
    compulsory: { taken: 30, mightTake: 3 },
    elective: { taken: 47, mightTake: 4 },
  });
}

test1();
console.log(__filename, "ok");
