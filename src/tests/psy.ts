import { readFileSync } from "node:fs";
import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirementsSince2023,
} from "@/requirements/psy-since-2023";
import { assertCreditStatsEqual, getCreditStats } from "@/test-util";

function test1(): void {
  const csv = readFileSync("grade-csvs/2023/psy-1.csv", {
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
      a1: { taken: 2 },
      a2: { taken: 2 },
      a3: { taken: 2 },
      a4: { taken: 2 },
      a5: { taken: 2 },
      a6: { taken: 2 },
      a7: { taken: 2 },
      a8: { mightTake: 2 },
      b1: { taken: 29.5, mightTake: 1 },
      b2: { taken: 5 },
      c1: { taken: 1 },
      c2: { taken: 2 },
      c3: { rawTaken: 4, effectiveTaken: 2 },
      c4: { rawTaken: 4, effectiveTaken: 2 },
      c5: { taken: 1 },
      c6: { taken: 2 },
      c7: { taken: 2 },
      c8: { taken: 2 },
      c9: { taken: 1 },
      c10: { taken: 2 },
      c11: { taken: 2 },
      c12: { taken: 3 },
      d1: { taken: 1 },
      e1: { taken: 2 },
      e2: { taken: 2 },
      e3: { taken: 4 },
      e4: { taken: 3 },
      e5: { taken: 4 },
      f1: { taken: 1 },
      f2: { taken: 1 },
      h1: { taken: 17, mightTake: 1 },
    },
    columns: {
      a: { taken: 14, mightTake: 2 },
      b: { taken: 34.5, mightTake: 1 },
      c: { taken: 22 },
      d: { taken: 1 },
      e: { taken: 15 },
      f: { taken: 2 },
      h: { taken: 17, mightTake: 1 },
    },
    compulsory: { taken: 51, mightTake: 2 },
    elective: { taken: 54.5, mightTake: 2 },
  });
}

function test2(): void {
  const csv = readFileSync("grade-csvs/2023/psy-2.csv", {
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
      a1: { taken: 2 },
      a2: { taken: 2 },
      a3: { taken: 2 },
      a4: { taken: 2 },
      a5: { taken: 2 },
      a6: { taken: 2 },
      a7: { taken: 2 },
      a8: { mightTake: 2 },
      b1: { taken: 33, mightTake: 4 },
      b2: { taken: 5 },
      c1: { taken: 1 },
      c2: { taken: 2 },
      c3: { taken: 2 },
      c4: { rawTaken: 4, effectiveTaken: 2 },
      c5: { taken: 1 },
      c6: { taken: 2 },
      c7: { taken: 2 },
      c8: { taken: 2 },
      c9: { taken: 1 },
      c10: { taken: 2 },
      c11: { taken: 2 },
      c12: { taken: 3 },
      d1: { taken: 1 },
      d2: { mightTake: 3 },
      e1: { taken: 2 },
      e2: { taken: 2 },
      e3: { taken: 4 },
      e4: { taken: 3 },
      e5: { taken: 4 },
      f1: { taken: 2 },
      h1: { taken: 14, mightTake: 1 },
    },
    columns: {
      a: { taken: 14, mightTake: 2 },
      b: { taken: 38, mightTake: 4 },
      c: { taken: 22 },
      d: { taken: 1, mightTake: 3 },
      e: { taken: 15 },
      f: { taken: 2 },
      h: { taken: 14, mightTake: 1 },
    },
    compulsory: { taken: 51, mightTake: 2 },
    elective: { taken: 55, mightTake: 8 },
  });
}

test1();
test2();
console.log(__filename, "ok");
