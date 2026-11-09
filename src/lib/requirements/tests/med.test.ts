import { describe, expect, test } from "vitest";
import type { CourseId } from "#lib/akiko.ts";
import { knownCourses } from "#lib/current-courses.ts";
import type { Major } from "#lib/constants.ts";
import {
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  getCreditRequirements,
} from "#lib/requirements/med-since-2023.ts";
import { classifySingleRealCourse, runTest } from "./util";

function counted(id: string, major: Major, tableYear: number) {
  return classifySingleRealCourse({
    classifyRealCourses,
    courseId: id,
    fromSougou: false,
    major,
    tableYear,
  });
}

function offered(id: string, major: Major, tableYear: number) {
  return classifyKnownCourses(knownCourses, {
    fromSougou: false,
    major,
    tableYear,
  }).get(id as CourseId);
}

describe.each([
  { name: "医療概論I-B", id: "HB32122", cellId: "a3", shown: true },
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

// h1 takes every HB course
test.each([
  { name: "医療概論I-B", id: "HB32122" },
  { name: "医学の基礎B", id: "HB32235" },
  { name: "医科分子生物学", id: "HB21221" },
  { name: "医科生化学", id: "HB21211" },
])("$name counts in h1 for direct-entry students", ({ id }) => {
  expect(counted(id, "med", 2026)).toBe("h1");
});

test.each([
  { tableYear: 2023, cellId: "a18" },
  { tableYear: 2024, cellId: "a7" },
  { tableYear: 2026, cellId: "a7" },
])(
  "English Medical Terminology I is in $cellId in $tableYear",
  ({ tableYear, cellId }) => {
    expect(counted("HB32212", "med", tableYear)).toBe(cellId);
  },
);

describe("c3", () => {
  test("is TOEFL演習 until 2025, and the 2023-2024 class isn't offered", () => {
    expect(counted("HB13222", "med", 2025)).toBe("c3");
    expect(counted("HB33312", "med", 2025)).toBe("c3");
    expect(offered("HB33312", "med", 2025)).toBeUndefined();
  });

  test("is 学術英語 from 2026, and TOEFL演習 falls to h1", () => {
    expect(counted("HB13232", "med", 2026)).toBe("c3");
    expect(offered("HB13232", "med", 2026)).toBe("c3");
    expect(counted("HB13222", "med", 2026)).toBe("h1");
    expect(counted("HB33312", "med", 2026)).toBe("h1");
  });
});

describe.each(["med-2", "med-2-new"] as const)("%s", (major) => {
  test("counts its own 学問への誘い in e1, but not med's", () => {
    expect(counted("1228211", major, 2025)).toBe("e1");
    expect(counted("1227671", major, 2025)).toBeUndefined();
  });

  // med-2 has no e3, so classifyFakeCourses's e3 counts nowhere
  test("counts English credited without a course ID nowhere", () => {
    runTest({
      csv: [
        "学籍番号,学生氏名,科目番号,科目名,単位数,春学期,秋学期,総合評価,科目区分,開講年度,開講区分",
        `,,,English Reading Skills I," 1.0",-,-,認,A,2023,通常`,
      ].join("\n"),
      fromSougou: false,
      tableYear: 2025,
      major,
      getCreditRequirements,
      classifyRealCourses,
      classifyFakeCourses,
      want: { cells: {}, columns: {}, compulsory: {}, elective: {} },
    });
  });
});
