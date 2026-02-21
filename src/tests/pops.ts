import { readFileSync } from "node:fs";
import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirementsSes,
} from "@/requirements/pops-since-2023";
import { assertCreditStatsEqual, getCreditStats } from "@/test-util";

function test1(): void {
  const csv = readFileSync("grade-csvs/2023/pops-ses-1.csv", {
    encoding: "utf8",
  });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements: creditRequirementsSes,
    classifyRealCourses: (cs, opts) =>
      classifyRealCourses(cs, opts, 2023, "ses"),
    classifyFakeCourses: (cs, opts) =>
      classifyFakeCourses(cs, opts, 2023, "ses"),
  });
  assertCreditStatsEqual(got, {
    cells: {
      b1: { taken: 30 },
      b2: { taken: 30 },
      b3: { taken: 2 },
      c1: { taken: 3 },
      c2: { taken: 2 },
      c3: { taken: 2 },
      c4: { taken: 1 },
      d1: { taken: 16 },
      e1: { taken: 2 },
      e2: { taken: 4 },
      e3: { taken: 4 },
      e4: { taken: 2, mightTake: 1 },
      f1: { taken: 3 },
      f2: { rawTaken: 5, effectiveTaken: 4 },
      h1: { taken: 11 },
      h2: { taken: 6 },
      h3: { taken: 1 },
      h4: { taken: 1 },
    },
    columns: {
      b: { taken: 62 },
      c: { taken: 8 },
      d: { taken: 16 },
      e: { taken: 12, mightTake: 1 },
      f: { taken: 7 },
      h: { taken: 19 },
    },
    compulsory: { taken: 20, mightTake: 1 },
    elective: { rawTaken: 104, effectiveTaken: 95 },
  });
}

function test2(): void {
  const csv = readFileSync("grade-csvs/2024/pops-ses-1.csv", {
    encoding: "utf8",
  });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements: creditRequirementsSes,
    classifyRealCourses: (cs, opts) =>
      classifyRealCourses(cs, opts, 2024, "ses"),
    classifyFakeCourses: (cs, opts) =>
      classifyFakeCourses(cs, opts, 2024, "ses"),
  });
  assertCreditStatsEqual(got, {
    cells: {
      b1: { taken: 16, mightTake: 4 },
      b2: { taken: 10 },
      c1: { taken: 3 },
      c2: { taken: 2 },
      c3: { taken: 2 },
      c4: { taken: 1 },
      d1: { taken: 15 },
      e1: { taken: 2 },
      e2: { taken: 4 },
      e3: { taken: 4 },
      e4: { taken: 2 },
      f1: { taken: 1 },
      h1: { taken: 8 },
      h2: { taken: 8, mightTake: 3 },
      h3: { taken: 2 },
    },
    columns: {
      b: { taken: 26, mightTake: 4 },
      c: { taken: 8 },
      d: { taken: 15 },
      e: { taken: 12 },
      f: { taken: 1 },
      h: { taken: 18, rawMightTake: 3, effectiveMightTake: 2 },
    },
    compulsory: { taken: 20 },
    elective: { taken: 60, mightTake: 6 },
  });
}

test1();
test2();
console.log(__filename, "ok");
