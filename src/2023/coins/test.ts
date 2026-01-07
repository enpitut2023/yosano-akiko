import { assertCreditStatsEqual, getCreditStats } from "../../test-util";
import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirements,
} from "./conditions";
import { readFileSync } from "node:fs";

function test1(): void {
  const csv = readFileSync("grade-csvs/2023/coins-1.csv", { encoding: "utf8" });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements,
    classifyRealCourses,
    classifyFakeCourses,
  });
  assertCreditStatsEqual(got, {
    cells: {
      a1: { taken: 3, mightTake: 3 },
      b1: { taken: 11, mightTake: 6 },
      b2: { taken: 8, mightTake: 8 },
      c1: { taken: 2 },
      c3: { taken: 2 },
      c4: { taken: 2 },
      c5: { taken: 2 },
      c6: { taken: 1 },
      c7: { taken: 2 },
      c8: { taken: 1 },
      c9: { taken: 3 },
      c10: { taken: 3 },
      c11: { taken: 2 },
      c12: { taken: 2 },
      c13: { taken: 2 },
      d1: { taken: 8 },
      d2: { mightTake: 2 },
      d3: { taken: 2, mightTake: 2 },
      d4: { taken: 8, mightTake: 2 },
      e1: { taken: 2 },
      e2: { taken: 2 },
      e3: { taken: 4 },
      e4: { taken: 4 },
      f1: { taken: 3 },
      h1: { taken: 3, mightTake: 3 },
      h2: { taken: 2 },
    },
    columns: {
      a: { taken: 3, mightTake: 3 },
      b: { taken: 19, mightTake: 14 },
      c: { taken: 24 },
      d: { taken: 18, mightTake: 6 },
      e: { taken: 12 },
      f: { taken: 3 },
      h: { taken: 5, mightTake: 3 },
    },
    compulsory: { taken: 39, mightTake: 3 },
    elective: { taken: 45, mightTake: 23 },
  });
}

function test2(): void {
  const csv = readFileSync("grade-csvs/2023/coins-2.csv", { encoding: "utf8" });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements,
    classifyRealCourses,
    classifyFakeCourses,
  });
  assertCreditStatsEqual(got, {
    cells: {
      a1: { taken: 3, mightTake: 3 },
      b1: { taken: 13, mightTake: 2 },
      b2: { taken: 12, mightTake: 5 },
      c1: { taken: 2 },
      c2: { taken: 2 },
      c3: { taken: 2 },
      c4: { taken: 2 },
      c5: { taken: 2 },
      c6: { taken: 1 },
      c7: { taken: 2 },
      c8: { taken: 1 },
      c9: { taken: 3 },
      c10: { taken: 3 },
      c11: { taken: 2 },
      c12: { taken: 2 },
      c13: { taken: 2 },
      d1: { taken: 9 },
      d2: { taken: 2 },
      d3: { taken: 4 },
      d4: { taken: 11 },
      e1: { taken: 2 },
      e2: { taken: 2 },
      e3: { taken: 4 },
      e4: { taken: 4 },
      f1: { mightTake: 1 },
      h1: { taken: 8 },
      h2: { taken: 4 },
    },
    columns: {
      a: { taken: 3, mightTake: 3 },
      b: { taken: 25, mightTake: 7 },
      c: { taken: 26 },
      d: { taken: 26 },
      e: { taken: 12 },
      f: { mightTake: 1 },
      h: { rawTaken: 12, effectiveTaken: 10 },
    },
    compulsory: { taken: 41, mightTake: 3 },
    elective: { taken: 61, mightTake: 8 },
  });
}

function test3(): void {
  const csv = readFileSync("grade-csvs/2023/coins-3.csv", { encoding: "utf8" });
  const isNative = false;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements,
    classifyRealCourses,
    classifyFakeCourses,
  });
  assertCreditStatsEqual(got, {
    cells: {
      b1: { taken: 2 },
      b2: { rawTaken: 25, effectiveTaken: 18 },
      c1: { taken: 1 }, // TODO
      // c1: { taken: 2 },
      d3: { taken: 2 },
      e3: { taken: 1 },
      f1: { taken: 2 },
      f2: { rawTaken: 7, effectiveTaken: 4 },
      h1: { taken: 4 },
      h2: { taken: 2 },
    },
    columns: {
      b: { taken: 20 },
      c: { taken: 1 },
      d: { taken: 2 },
      e: { taken: 1 },
      f: { rawTaken: 6, effectiveTaken: 5 },
      h: { taken: 6 },
    },
    compulsory: { taken: 2 },
    elective: { taken: 33 },
  });
}

test1();
test2();
test3();
console.log(__filename, "ok");
