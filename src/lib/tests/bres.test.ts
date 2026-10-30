import { describe, expect, test } from "vitest";
import type { CourseId } from "$lib/akiko";
import { knownCourses } from "$lib/current-courses";
import {
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  getCreditRequirements,
} from "$lib/requirements/bres-since-2023";
import { classifySingleRealCourse, runTest } from "./util";

test("grade-csvs/2024/bres-1.csv", () => {
  runTest({
    csvPath: "grade-csvs/2024/bres-1.csv",
    isNative: true,
    tableYear: 2023,
    major: "bres",
    getCreditRequirements,
    classifyRealCourses,
    classifyFakeCourses,
    want: {
      cells: {
        a1: { taken: 2 },
        b1: { taken: 19, rawMightTake: 1, effectiveMightTake: 0 },
        b2: { taken: 1 },
        b3: { taken: 17, mightTake: 2 },
        c1: { taken: 1 },
        d1: { taken: 4 },
        d2: { taken: 15 },
        e1: { taken: 2 },
        e2: { taken: 2 },
        e3: { taken: 4 },
        e4: { taken: 4 },
        e5: { taken: 1 },
        f1: { taken: 1 },
        f4: { taken: 2 },
        h1: { taken: 9 },
      },
      columns: {
        a: { taken: 2 },
        b: { taken: 37, mightTake: 2 },
        c: { taken: 1 },
        d: { taken: 19 },
        e: { taken: 13 },
        f: { taken: 3 },
        h: { taken: 9 },
      },
      compulsory: { taken: 16 },
      elective: { taken: 68, mightTake: 2 },
    },
  });
});

describe("生物資源科学演習", () => {
  const classify = (courseId: string, isNative: boolean) =>
    classifySingleRealCourse({
      classifyRealCourses,
      courseId,
      isNative,
      major: "bres",
      tableYear: 2026,
    });
  const offered = (courseId: string, isNative: boolean) =>
    classifyKnownCourses(knownCourses, {
      isNative,
      major: "bres",
      tableYear: 2026,
    }).get(courseId as CourseId);

  test.each(["EC11212", "EC11222", "EC11232", "EC11242", "EC11252"])(
    "%s, a class section, is in c1 only for students who entered directly",
    (id) => {
      expect(classify(id, true)).toBe("c1");
      expect(classify(id, false)).not.toBe("c1");
    },
  );

  test("EC11262 is in c1 only for 移行 students", () => {
    expect(classify("EC11262", false)).toBe("c1");
    expect(classify("EC11262", true)).not.toBe("c1");
  });

  test("each student is offered only their own class", () => {
    expect(offered("EC11212", true)).toBe("c1");
    expect(offered("EC11262", true)).toBeUndefined();
    expect(offered("EC11262", false)).toBe("c1");
    expect(offered("EC11212", false)).toBeUndefined();
  });
});
