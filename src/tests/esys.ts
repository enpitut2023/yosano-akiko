import { readFileSync } from "node:fs";
import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirementsEme,
  creditRequirementsIes,
} from "@/requirements/esys-since-2023";
import { assertCreditStatsEqual, getCreditStats } from "@/test-util";

function test1(): void {
  const csv = readFileSync("grade-csvs/2023/esys-ies-1.csv", {
    encoding: "utf8",
  });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements: creditRequirementsIes,
    classifyRealCourses: (cs, opts) =>
      classifyRealCourses(cs, opts, 2023, "ies"),
    classifyFakeCourses: (cs, opts) =>
      classifyFakeCourses(cs, opts, 2023, "ies"),
  });
  assertCreditStatsEqual(got, {
    cells: {
      a1: { taken: 3 },
      a2: { taken: 4 },
      a3: { mightTake: 6 },
      a6: { taken: 2, mightTake: 1 },
      b1: { taken: 2 },
      b2: { taken: 1 },
      b3: { taken: 4 },
      b4: { taken: 20, mightTake: 3 },
      c1: { taken: 1 },
      c2: { taken: 1 },
      c3: { taken: 1 },
      c4: { taken: 1 },
      c5: { taken: 1 },
      c6: { taken: 1 },
      c7: { taken: 1 },
      c8: { taken: 1 },
      c9: { taken: 1 },
      c10: { taken: 1 },
      c11: { taken: 1 },
      c12: { taken: 1 },
      c13: { taken: 1 },
      c14: { taken: 1 },
      c15: { taken: 1 },
      c16: { taken: 1 },
      c17: { taken: 2 },
      c18: { taken: 1 },
      c19: { taken: 2 },
      c20: { taken: 1 },
      c21: { taken: 1 },
      c22: { taken: 1 },
      c23: { taken: 1 },
      c24: { taken: 1 },
      c25: { taken: 2 },
      c26: { taken: 2 },
      c27: { taken: 1 },
      e1: { taken: 2 },
      e2: { taken: 3 },
      e3: { taken: 4 },
      e4: { taken: 4 },
      f1: { rawTaken: 4, effectiveTaken: 3 },
      h1: { taken: 11 },
      h2: { taken: 1 },
    },
    columns: {
      a: { taken: 9, mightTake: 7 },
      b: { taken: 27, mightTake: 3 },
      c: { taken: 31 },
      e: { taken: 13 },
      f: { taken: 3 },
      h: { taken: 12 },
    },
    compulsory: { taken: 53, mightTake: 7 },
    elective: { taken: 42, mightTake: 3 },
  });
}

function test2(): void {
  const csv = readFileSync("grade-csvs/2023/esys-ies-2.csv", {
    encoding: "utf8",
  });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements: creditRequirementsIes,
    classifyRealCourses: (cs, opts) =>
      classifyRealCourses(cs, opts, 2023, "ies"),
    classifyFakeCourses: (cs, opts) =>
      classifyFakeCourses(cs, opts, 2023, "ies"),
  });
  assertCreditStatsEqual(got, {
    cells: {
      a1: { taken: 3 },
      a2: { taken: 4 },
      a3: { mightTake: 6 },
      a6: { taken: 2, mightTake: 1 },
      b1: { taken: 4, mightTake: 2 },
      b2: { taken: 3 },
      b3: { taken: 1 },
      b4: { taken: 18 },
      b5: { taken: 5, mightTake: 3 },
      c1: { taken: 1 },
      c2: { taken: 1 },
      c3: { taken: 1 },
      c4: { taken: 1 },
      c5: { taken: 1 },
      c6: { taken: 1 },
      c7: { taken: 1 },
      c8: { taken: 1 },
      c9: { taken: 1 },
      c10: { taken: 1 },
      c11: { taken: 1 },
      c12: { taken: 1 },
      c13: { taken: 1 },
      c14: { taken: 1 },
      c15: { taken: 1 },
      c16: { taken: 1 },
      c17: { taken: 2 },
      c18: { taken: 1 },
      c19: { taken: 2 },
      c20: { taken: 1 },
      c21: { taken: 1 },
      c22: { taken: 1 },
      c23: { taken: 1 },
      c24: { taken: 1 },
      c25: { taken: 2 },
      c26: { taken: 2 },
      c27: { taken: 1 },
      e1: { taken: 2 },
      e2: { taken: 3 },
      e3: { taken: 4 },
      e4: { taken: 4 },
      f1: { taken: 2 },
      f3: { taken: 2 },
      h1: { taken: 9 },
      h2: { taken: 1 },
      h3: { taken: 2 },
    },
    columns: {
      a: { taken: 9, mightTake: 7 },
      b: { taken: 31, mightTake: 5 },
      c: { taken: 31 },
      e: { taken: 13 },
      f: { taken: 4 },
      h: { taken: 12 },
    },
    compulsory: { taken: 53, mightTake: 7 },
    elective: { taken: 47, mightTake: 5 },
  });
}

test1();
test2();
console.log(__filename, "ok");
