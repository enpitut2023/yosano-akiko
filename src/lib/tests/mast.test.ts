import { describe, expect, test } from "vitest";
import type { CourseId } from "$lib/akiko";
import { knownCourses } from "$lib/current-courses";
import {
  classifyFakeCourses,
  classifyKnownCourses,
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
    forOthersForEveryone: [
      "GA15311", // coins 1,2クラス
      "GA15321", // coins 3,4クラス
      "GA15341", // klis
    ],
    forOthersForIkou: [],
  },
  {
    name: "線形代数A",
    cellId: "c3",
    forMast: "GA15231",
    forOthersForEveryone: [
      "GA15211", // coins 1,2クラス
      "GA15221", // coins 3,4クラス
      "GA15241", // klis
    ],
    forOthersForIkou: [],
  },
  {
    name: "情報数学A",
    cellId: "c5",
    forMast: "GA15131",
    forOthersForEveryone: [
      "GA15111", // coins 1,2クラス
      "GA15121", // coins 3,4クラス
      "GA15141", // klis
    ],
    forOthersForIkou: [],
  },
  {
    name: "プログラミング入門A",
    cellId: "c7",
    forMast: "GA18222",
    forOthersForEveryone: [
      "GA18212", // coins
      "GA18232", // klis
    ],
    forOthersForIkou: [
      "FH60474", // 総合学域群優先
    ],
  },
  {
    name: "プログラミング入門B",
    cellId: "c8",
    forMast: "GA18322",
    forOthersForEveryone: [
      "GA18312", // coins
      "GA18332", // klis
    ],
    forOthersForIkou: [
      "FH60574", // 総合学域群優先
    ],
  },
])("$name", ({ cellId, forMast, forOthersForEveryone, forOthersForIkou }) => {
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

  test.each(forOthersForEveryone)(
    `%s, for other classes, is in ${cellId} for everyone`,
    (courseId) => {
      expect(classify(courseId, true)).toBe(cellId);
      expect(classify(courseId, false)).toBe(cellId);
    },
  );

  test.each(forOthersForIkou)(
    `%s, for other classes, is in ${cellId} only for 移行 students`,
    (courseId) => {
      expect(classify(courseId, false)).toBe(cellId);
      expect(classify(courseId, true)).not.toBe(cellId);
    },
  );

  test(`the catalog shows only the course for mast in ${cellId}`, () => {
    const got = classifyKnownCourses(knownCourses, {
      isNative: false,
      major: "mast",
      tableYear: 2026,
    });
    expect(got.get(forMast as CourseId)).toBe(cellId);
    for (const id of [...forOthersForEveryone, ...forOthersForIkou]) {
      expect(got.get(id as CourseId)).not.toBe(cellId);
    }
  });
});
