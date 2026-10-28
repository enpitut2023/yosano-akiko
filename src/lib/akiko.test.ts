import { describe, expect, test } from "vitest";
import {
  type CourseId,
  type ListKindOverrides,
  type RealCourse,
  akikoGetListKind,
  akikoMoveCourse,
  akikoNew,
  isCourseId,
} from "$lib/akiko";
import { createCreditRequirementsOrFail } from "$lib/app-setup";
import { assert } from "$lib/util";

function courseId(s: string): CourseId {
  assert(isCourseId(s), `Bad course id: "${s}"`);
  return s;
}

const WIP = courseId("GB10000");
const FAILED = courseId("GB20000");
const PASSED = courseId("GB30000");
const PLANNED = courseId("GB40000");

function realCourse(id: CourseId, grade: RealCourse["grade"]): RealCourse {
  return { id, name: id, credit: 1, takenYear: 2024, grade };
}

const realCourses: RealCourse[] = [
  realCourse(WIP, "wip"),
  realCourse(FAILED, "d"),
  realCourse(PASSED, "a"),
];

function akikoForTest(listKindOverrides: ListKindOverrides) {
  const akiko = akikoNew(
    [],
    realCourses,
    [],
    listKindOverrides,
    new Map(),
    new Map(),
    new Map(),
    createCreditRequirementsOrFail({
      cells: {},
      columns: {},
      compulsory: 0,
      elective: 0,
    }),
  );
  assert(akiko !== undefined);
  return akiko;
}

describe("list kinds", () => {
  test("without overrides, grades decide", () => {
    const akiko = akikoForTest(new Map());
    expect(akikoGetListKind(akiko, WIP)).toBe("might-take");
    expect(akikoGetListKind(akiko, FAILED)).toBe("wont-take");
    expect(akikoGetListKind(akiko, PASSED)).toBe("taken");
    expect(akikoGetListKind(akiko, PLANNED)).toBe("wont-take");
  });

  test("overrides beat grades, except for passed courses", () => {
    const akiko = akikoForTest(
      new Map([
        [PLANNED, "might-take"],
        // A retake
        [FAILED, "might-take"],
        // 履修中, but moved out of 取る授業
        [WIP, "wont-take"],
        [PASSED, "might-take"],
      ] as const),
    );
    expect(akikoGetListKind(akiko, PLANNED)).toBe("might-take");
    expect(akikoGetListKind(akiko, FAILED)).toBe("might-take");
    expect(akikoGetListKind(akiko, WIP)).toBe("wont-take");
    expect(akikoGetListKind(akiko, PASSED)).toBe("taken");
    // The one the grade beat is dropped
    expect(akiko.listKindOverrides.has(PASSED)).toBe(false);
  });

  test("overrides that agree with the grades are dropped", () => {
    const akiko = akikoForTest(
      new Map([
        [WIP, "might-take"],
        [FAILED, "wont-take"],
      ] as const),
    );
    expect(akiko.listKindOverrides.size).toBe(0);
  });
});

describe("akikoMoveCourse", () => {
  test("records a move, and forgets it when moved back", () => {
    const akiko = akikoForTest(new Map());

    const out = akikoMoveCourse(akiko, WIP, "wont-take");
    assert(out.kind === "moved");
    expect(out.listKindOverrides.get(WIP)).toBe("wont-take");
    // The akiko it was given is left as is
    expect(akikoGetListKind(akiko, WIP)).toBe("might-take");

    const back = akikoMoveCourse(
      akikoForTest(out.listKindOverrides),
      WIP,
      "might-take",
    );
    assert(back.kind === "moved");
    expect(back.listKindOverrides.has(WIP)).toBe(false);
  });

  test("doesn't move a passed course", () => {
    const akiko = akikoForTest(new Map());
    expect(akikoMoveCourse(akiko, PASSED, "might-take")).toEqual({
      kind: "course-taken",
    });
  });
});
