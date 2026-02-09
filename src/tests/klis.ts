import { readFileSync } from "node:fs";
import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirements,
} from "@/requirements/klis-since-2023";
import { assertCreditStatsEqual, getCreditStats } from "@/test-util";

function test1(): void {
  const csv = readFileSync("grade-csvs/2023/klis-rm-1.csv", {
    encoding: "utf8",
  });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements,
    classifyRealCourses: (cs, opts) =>
      classifyRealCourses(cs, opts, 2023, "rm"),
    classifyFakeCourses: (cs, opts) =>
      classifyFakeCourses(cs, opts, 2023, "rm"),
  });
  assertCreditStatsEqual(got, {
    cells: {
      a3: { taken: 1 },
      a4: { mightTake: 1 },
      a5: { taken: 1 },
      a6: { mightTake: 1 },
      b1: { taken: 6, mightTake: 10 },
      b2: { taken: 10, mightTake: 6 },
      c1: { taken: 1 },
      c2: { taken: 1 },
      c3: { taken: 2 },
      c4: { taken: 1 },
      c5: { taken: 2 },
      c6: { taken: 2 },
      c7: { taken: 2 },
      c8: { taken: 1 },
      c9: { taken: 1 },
      c10: { taken: 2 },
      c11: { taken: 2 },
      c12: { taken: 2 },
      d1: { taken: 38 },
      e1: { taken: 2 },
      e2: { taken: 4 },
      e3: { taken: 2 },
      e4: { taken: 4 },
      f1: { taken: 2 },
      f2: { taken: 1 },
      h1: { taken: 14 },
    },
    columns: {
      a: { taken: 2, mightTake: 2 },
      b: { taken: 16, mightTake: 16 },
      c: { taken: 19 },
      d: { taken: 38 },
      e: { taken: 12 },
      f: { taken: 3 },
      h: { taken: 14 },
    },
    compulsory: { taken: 33, mightTake: 2 },
    elective: { taken: 71, rawMightTake: 16, effectiveMightTake: 12 },
  });
}

function test2(): void {
  const csv = readFileSync("grade-csvs/2023/klis-system-1.csv", {
    encoding: "utf8",
  });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements,
    classifyRealCourses: (cs, opts) =>
      classifyRealCourses(cs, opts, 2023, "system"),
    classifyFakeCourses: (cs, opts) =>
      classifyFakeCourses(cs, opts, 2023, "system"),
  });
  assertCreditStatsEqual(got, {
    cells: {
      a3: { taken: 1 },
      a4: { taken: 1 },
      a5: { taken: 1 },
      a6: { taken: 1 },
      b1: { taken: 16, mightTake: 2 },
      b2: { taken: 9, mightTake: 3 },
      c1: { taken: 1 },
      c2: { taken: 1 },
      c3: { taken: 2 },
      c4: { taken: 1 },
      c5: { taken: 2 },
      c6: { taken: 2 },
      c7: { taken: 2 },
      c8: { taken: 1 },
      c9: { taken: 1 },
      c10: { taken: 2 },
      c11: { taken: 2 },
      c12: { taken: 2 },
      d1: { taken: 34 },
      e1: { taken: 2 },
      e2: { taken: 4 },
      e3: { taken: 2 },
      e4: { taken: 4 },
      f1: { taken: 2 },
      f2: { taken: 3 },
      h1: { taken: 9 },
      h2: { taken: 5 },
    },
    columns: {
      a: { taken: 4 },
      b: { taken: 25, mightTake: 5 },
      c: { taken: 19 },
      d: { taken: 34 },
      e: { taken: 12 },
      f: { taken: 5 },
      h: { taken: 14 },
    },
    compulsory: { taken: 35 },
    elective: { taken: 78, mightTake: 5 },
  });
}

function test3(): void {
  const csv = readFileSync("grade-csvs/2023/klis-science-1.csv", {
    encoding: "utf8",
  });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements,
    classifyRealCourses: (cs, opts) =>
      classifyRealCourses(cs, opts, 2023, "science"),
    classifyFakeCourses: (cs, opts) =>
      classifyFakeCourses(cs, opts, 2023, "science"),
  });
  assertCreditStatsEqual(got, {
    cells: {
      a3: { taken: 1 },
      a4: { mightTake: 1 },
      a5: { taken: 1 },
      a6: { mightTake: 1 },
      b1: { taken: 8, mightTake: 8 },
      b2: { taken: 6, mightTake: 8 },
      c1: { taken: 1 },
      c2: { taken: 1 },
      c3: { taken: 2 },
      c4: { taken: 1 },
      c5: { taken: 2 },
      c6: { taken: 2 },
      c7: { mightTake: 2 },
      c8: { taken: 1 },
      c9: { taken: 1 },
      c10: { taken: 2 },
      c11: { taken: 2 },
      c12: { taken: 2 },
      d1: { taken: 35 },
      e1: { taken: 2 },
      e2: { taken: 4 },
      e3: { taken: 2 },
      e4: { taken: 4 },
      f1: { taken: 3 },
      f2: { taken: 6 },
      h1: { taken: 8 },
      h2: { taken: 2 },
    },
    columns: {
      a: { taken: 2, mightTake: 2 },
      b: { taken: 14, mightTake: 16 },
      c: { taken: 17, mightTake: 2 },
      d: { taken: 35 },
      e: { taken: 12 },
      f: { taken: 9 },
      h: { taken: 10 },
    },
    compulsory: { taken: 31, mightTake: 4 },
    elective: { taken: 68, rawMightTake: 16, effectiveMightTake: 15 },
  });
}

test1();
test2();
test3();
console.log(__filename, "ok");
