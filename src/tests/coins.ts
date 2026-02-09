import { readFileSync } from "node:fs";
import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirements,
} from "@/2023/coins/conditions";
import { assertCreditStatsEqual, getCreditStats } from "@/test-util";

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
      c1: { taken: 2 },
      d3: { taken: 2 },
      e3: { taken: 1 },
      f1: { taken: 2 },
      f2: { rawTaken: 7, effectiveTaken: 4 },
      h1: { taken: 4 },
      // FF18724 線形代数A の1単位がh2に入っている。情報科学類の学生は必修と内
      // 容が被っている他学類の線形代数などを履修することができない。そのため、
      // 本来は卒業単位として数えられないが、履修がそもそもできないなら数えてし
      // まっても問題ないとする。
      h2: { taken: 1 },
    },
    columns: {
      b: { taken: 20 },
      c: { taken: 2 },
      d: { taken: 2 },
      e: { taken: 1 },
      f: { rawTaken: 6, effectiveTaken: 5 },
      h: { taken: 5 },
    },
    compulsory: { taken: 3 },
    elective: { taken: 32 },
  });
}

test2();
test3();
console.log(__filename, "ok");
