import { describe, expect, test } from "vitest";
import type { CourseId } from "$lib/akiko";
import { knownCourses } from "$lib/current-courses";
import {
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  getCreditRequirements,
} from "$lib/requirements/math-since-2023";
import { classifySingleRealCourse, runTest } from "./util";

test("grade-csvs/2023/math-1.csv", () => {
  runTest({
    csvPath: "grade-csvs/2023/math-1.csv",
    isNative: true,
    tableYear: 2023,
    major: "math",
    getCreditRequirements,
    classifyRealCourses,
    classifyFakeCourses,
    want: {
      cells: {
        a2: { mightTake: 3 },
        a3: { taken: 2 },
        b1: { taken: 44.5, mightTake: 10.5 },
        c1: { taken: 2 },
        c2: { taken: 2 },
        c3: { taken: 1 },
        c4: { taken: 1 },
        d1: { taken: 20 },
        e1: { taken: 2 },
        e2: { taken: 2 },
        e3: { taken: 4 },
        e4: { taken: 4 },
        f1: { taken: 1 },
        f2: { taken: 1 },
        h1: { taken: 9, mightTake: 2 },
      },
      columns: {
        a: { taken: 2, mightTake: 3 },
        b: { taken: 44.5, mightTake: 10.5 },
        c: { taken: 6 },
        d: { taken: 20 },
        e: { taken: 12 },
        f: { taken: 2 },
        h: { taken: 9, mightTake: 2 },
      },
      compulsory: { taken: 20, mightTake: 3 },
      elective: { taken: 75.5, mightTake: 12.5 },
    },
  });
});

describe.each([
  { id: "FA013C1", cellId: "c1" }, // 微積分1（総合）
  { id: "GA15311", cellId: "c1" }, // 微分積分A
  { id: "FA016C1", cellId: "c2" }, // 線形代数1（総合）
  { id: "GB10234", cellId: "c2" }, // 線形代数B
])("$id", ({ id, cellId }) => {
  test(`is in ${cellId} only for 移行 students`, () => {
    const classify = (isNative: boolean) =>
      classifySingleRealCourse({
        classifyRealCourses,
        courseId: id,
        isNative,
        major: "math",
        tableYear: 2026,
      });
    expect(classify(false)).toBe(cellId);
    expect(classify(true)).not.toBe(cellId);
  });

  test(`is not a choice in ${cellId} for 移行 students`, () => {
    const got = classifyKnownCourses(knownCourses, {
      isNative: false,
      major: "math",
      tableYear: 2026,
    });
    expect(got.get(id as CourseId)).not.toBe(cellId);
  });
});
