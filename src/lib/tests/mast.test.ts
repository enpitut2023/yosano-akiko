import { describe, expect, test } from "vitest";
import {
  classifyFakeCourses,
  classifyRealCourses,
  getCreditRequirements,
} from "$lib/requirements/mast-since-2021";
import { classifySingleRealCourse, runTest } from "./util";

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

describe.each([
  {
    name: "微分積分A",
    cellId: "c1",
    forMast: "GA15331",
    forOthers: [
      "GA15311", // coins 1,2クラス
      "GA15321", // coins 3,4クラス
      "GA15341", // klis
    ],
  },
  {
    name: "線形代数A",
    cellId: "c3",
    forMast: "GA15231",
    forOthers: [
      "GA15211", // coins 1,2クラス
      "GA15221", // coins 3,4クラス
      "GA15241", // klis
    ],
  },
  {
    name: "情報数学A",
    cellId: "c5",
    forMast: "GA15131",
    forOthers: [
      "GA15111", // coins 1,2クラス
      "GA15121", // coins 3,4クラス
      "GA15141", // klis
    ],
  },
  {
    name: "プログラミング入門A",
    cellId: "c7",
    forMast: "GA18222",
    forOthers: [
      "FH60474", // 総合学域群優先
      "GA18212", // coins
      "GA18232", // klis
    ],
  },
  {
    name: "プログラミング入門B",
    cellId: "c8",
    forMast: "GA18322",
    forOthers: [
      "FH60574", // 総合学域群優先
      "GA18312", // coins
      "GA18332", // klis
    ],
  },
])("$name", ({ cellId, forMast, forOthers }) => {
  const classify = (courseId: string, isNative: boolean) =>
    classifySingleRealCourse({
      classifyRealCourses,
      courseId,
      isNative,
      major: "mast",
      tableYear: 2026,
    });

  test(`the course for mast is in ${cellId} for everyone`, () => {
    expect(classify(forMast, true)).toBe(cellId);
    expect(classify(forMast, false)).toBe(cellId);
  });

  test.each(forOthers)(
    `%s, for other classes, is in ${cellId} only for 移行 students`,
    (courseId) => {
      expect(classify(courseId, false)).toBe(cellId);
      expect(classify(courseId, true)).not.toBe(cellId);
    },
  );
});
