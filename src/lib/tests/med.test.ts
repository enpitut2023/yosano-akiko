import { describe, expect, test } from "vitest";
import type { CourseId } from "$lib/akiko";
import { knownCourses } from "$lib/current-courses";
import {
  classifyKnownCourses,
  classifyRealCourses,
} from "$lib/requirements/med-since-2023";
import { classifySingleRealCourse } from "./util";

describe.each([
  { name: "医学の基礎B", id: "HB32235", cellId: "a4", shown: true },
  { name: "医科分子生物学", id: "HB21221", cellId: "a4", shown: false },
  { name: "医科生化学", id: "HB21211", cellId: "d1", shown: false },
])("$name", ({ id, cellId, shown }) => {
  const classify = (fromSougou: boolean) =>
    classifySingleRealCourse({
      classifyRealCourses,
      courseId: id,
      fromSougou,
      major: "med",
      tableYear: 2026,
    });

  test(`is in ${cellId} only for 移行 students`, () => {
    expect(classify(true)).toBe(cellId);
    expect(classify(false)).not.toBe(cellId);
  });

  test(`is ${shown ? "" : "not "}a choice for 移行 students`, () => {
    const got = classifyKnownCourses(knownCourses, {
      fromSougou: true,
      major: "med",
      tableYear: 2026,
    }).get(id as CourseId);
    if (shown) expect(got).toBe(cellId);
    else expect(got).toBeUndefined();
  });
});
