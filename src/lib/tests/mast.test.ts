import { describe, expect, test } from "vitest";
import type { CourseId, Grade } from "$lib/akiko";
import type { Major } from "$lib/constants";
import {
  classifyFakeCourses,
  classifyRealCourses,
  getCreditRequirements,
} from "$lib/requirements/mast-since-2021";
import { runTest } from "./util";

test("grade-csvs/2023/mast-1.csv", () => {
  runTest({
    csvPath: "grade-csvs/2023/mast-1.csv",
    isNative: true,
    tableYear: 2023,
    major: "mast",
    getCreditRequirements,
    classifyRealCourses,
    classifyFakeCourses,
    want: {
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
    },
  });
});

function classifySingleRealCourse(params: {
  courseId: string;
  courseName?: string;
  courseGrade?: Grade;
  courseCredit?: number;
  courseTakenYear?: number;
  isNative: boolean;
  major: Major;
  tableYear: number;
}): string | undefined {
  return classifyRealCourses(
    [
      {
        id: params.courseId as CourseId,
        name: params.courseName ?? "",
        grade: params.courseGrade ?? "a+",
        credit: params.courseCredit ?? 1,
        takenYear: params.courseTakenYear ?? params.tableYear,
      },
    ],
    params,
  ).get(params.courseId as CourseId);
}

// For 移行 students every class's section counts; for students who entered
// mast directly, only mast's own
describe.each([
  ["GA15311", "c1", false], // 微分積分A coins 1,2クラス
  ["GA15321", "c1", false], // 微分積分A coins 3,4クラス
  ["GA15331", "c1", true], // 微分積分A mast
  ["GA15341", "c1", false], // 微分積分A klis
  ["GA15211", "c3", false], // 線形代数A coins 1,2クラス
  ["GA15221", "c3", false], // 線形代数A coins 3,4クラス
  ["GA15231", "c3", true], // 線形代数A mast
  ["GA15241", "c3", false], // 線形代数A klis
  ["GA15111", "c5", false], // 情報数学A coins 1,2クラス
  ["GA15121", "c5", false], // 情報数学A coins 3,4クラス
  ["GA15131", "c5", true], // 情報数学A mast
  ["GA15141", "c5", false], // 情報数学A klis
  ["FH60474", "c7", false], // プログラミング入門A 総合学域群優先
  ["GA18212", "c7", false], // プログラミング入門A coins
  ["GA18222", "c7", true], // プログラミング入門A mast
  ["GA18232", "c7", false], // プログラミング入門A klis
  ["FH60574", "c8", false], // プログラミング入門B 総合学域群優先
  ["GA18312", "c8", false], // プログラミング入門B coins
  ["GA18322", "c8", true], // プログラミング入門B mast
  ["GA18332", "c8", false], // プログラミング入門B klis
] as const)("%s", (courseId, cellId, isMast) => {
  const classify = (isNative: boolean) =>
    classifySingleRealCourse({
      courseId,
      isNative,
      major: "mast",
      tableYear: 2026,
    });

  test(`is in ${cellId} for 移行 students`, () => {
    expect(classify(false)).toBe(cellId);
  });

  test(`is ${isMast ? "" : "not "}in ${cellId} for native students`, () => {
    if (isMast) expect(classify(true)).toBe(cellId);
    else expect(classify(true)).not.toBe(cellId);
  });
});
