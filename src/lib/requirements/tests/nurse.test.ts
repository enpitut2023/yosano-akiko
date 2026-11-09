import { describe, expect, test } from "vitest";
import { type CourseId, fakeCourseIdFromContent } from "#lib/akiko.ts";
import { instances, type Major } from "#lib/constants.ts";
import { knownCourses } from "#lib/current-courses.ts";
import {
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  getCreditRequirements,
} from "#lib/requirements/nurse-since-2023.ts";
import { classifySingleRealCourse, runTest } from "./util";

const HEADER =
  "学籍番号,学生氏名,科目番号,科目名,単位数,春学期,秋学期,総合評価,科目区分,開講年度,開講区分";

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
  { major: "nurse-n", cellId: "d1" },
  { major: "nurse-phn", cellId: "c23" },
  { major: "nurse-h", cellId: "c24" },
] as const)("日本国憲法 in $major", ({ major, cellId }) => {
  test.each([
    "BB00301", // 体育・看護・医療対象
    "BB00601", // 全学対象(2年次以上)
  ])(`%s is offered and counts in ${cellId}`, (id) => {
    expect(offered(id, major, 2025)).toBe(cellId);
    expect(counted(id, major, 2025)).toBe(cellId);
  });

  test(`another 学類's class counts in ${cellId} but isn't offered`, () => {
    expect(offered("BB00101", major, 2025)).toBeUndefined();
    expect(counted("BB00101", major, 2025)).toBe(cellId);
  });
});

// The 学類 hasn't said where the other credit goes; see the TODO in
// classifyColumnD
test("日本国憲法 counts 1 of its 2 credits in nurse-n's 1-credit d1", () => {
  runTest({
    csv: [HEADER, `,,BB00301,日本国憲法," 2.0",-,-,A,A,2024,通常`].join("\n"),
    fromSougou: false,
    tableYear: 2024,
    major: "nurse-n",
    getCreditRequirements,
    classifyRealCourses,
    classifyFakeCourses,
    want: {
      cells: { d1: { rawTaken: 2, effectiveTaken: 1 } },
      columns: { d: { taken: 1 } },
      compulsory: {},
      elective: { taken: 1 },
    },
  });
});

test("微生物学 under both its IDs fills c11 only once", () => {
  runTest({
    csv: [
      HEADER,
      `,,HE21021,微生物学," 2.0",-,-,A,A,2024,通常`,
      `,,EC22101,微生物学," 2.0",-,-,A,A,2024,通常`,
    ].join("\n"),
    fromSougou: false,
    tableYear: 2024,
    major: "nurse-n",
    getCreditRequirements,
    classifyRealCourses,
    classifyFakeCourses,
    want: {
      cells: { c11: { rawTaken: 4, effectiveTaken: 2 } },
      columns: { c: { taken: 2 } },
      compulsory: { taken: 2 },
      elective: {},
    },
  });
});

// h1 is a list of courses until 2024 and every other 学類's course from 2025
describe.each(["nurse-n", "nurse-phn", "nurse-h"] as const)(
  "h1 in %s",
  (major) => {
    test("doesn't count 医学類's 医学の基礎 until 2024", () => {
      expect(counted("HB31107", major, 2024)).toBeUndefined();
    });

    test.each([2025, 2026])("counts 医学類's 医学の基礎 in %i", (tableYear) => {
      expect(counted("HB31107", major, tableYear)).toBe("h1");
    });
  },
);

describe.each([
  {
    name: "情報リテラシー(講義)",
    id: "6118101",
    cellIds: { "nurse-n": "e4", "nurse-phn": "e4", "nurse-h": "e5" },
  },
  {
    name: "ドイツ語圏の言語と文化A",
    id: "3251112",
    cellIds: { "nurse-n": undefined, "nurse-phn": undefined, "nurse-h": "f1" },
  },
] as const)("$name", ({ id, cellIds }) => {
  test.each(Object.entries(cellIds))("counts in %s's %s", (major, cellId) => {
    expect(counted(id, major as Major, 2025)).toBe(cellId);
  });
});

describe.each([
  { major: "nurse-n", cellId: "e3" },
  { major: "nurse-phn", cellId: "e3" },
  { major: "nurse-h", cellId: undefined },
] as const)(
  "English credited without a course ID in $major",
  ({ major, cellId }) => {
    test(`counts in ${cellId ?? "no cell"}`, () => {
      const name = "English Reading Skills I";
      const id = fakeCourseIdFromContent(name, 1, 2024);
      const got = classifyFakeCourses(
        [{ id, name, credit: 1, takenYear: 2024, grade: "free" }],
        { fromSougou: false, major, tableYear: 2024 },
      );
      expect(got.get(id)).toBe(cellId);
    });
  },
);

// 注10, for 移行生, isn't supported. When it is, this test goes.
test.each(instances.filter(({ major }) => major.startsWith("nurse-")))(
  "移行 doesn't change what $major $tableYear offers",
  ({ major, tableYear }) => {
    const classify = (fromSougou: boolean) =>
      classifyKnownCourses(knownCourses, { fromSougou, major, tableYear });
    expect(classify(true)).toEqual(classify(false));
  },
);
