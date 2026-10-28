import { describe, expect, test } from "vitest";
import {
  type CellId,
  type CourseId,
  type FakeCourse,
  type FakeCourseId,
  type KnownCourse,
  type ListKindOverrides,
  type RealCourse,
  akikoGetAllCourses,
  akikoGetClassifiedFakeCourses,
  akikoGetMergedCourse,
  akikoGetCreditStats,
  akikoGetListKind,
  akikoMoveCourse,
  akikoNew,
  creditSum,
  isCellId,
  isCourseId,
  isFakeCourseId,
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
    2026,
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

const CATALOG_YEAR = 2026;

function knownCourse(id: CourseId, credit = 2): KnownCourse {
  return {
    id,
    name: `catalog ${id}`,
    credit,
    expects: [],
    expectsString: "",
    slots: [],
    slotsString: "",
    availability: "available",
    remark: "",
  };
}

function cellId(s: string): CellId {
  assert(isCellId(s), `Bad cell id: "${s}"`);
  return s;
}

function fakeCourseId(n: number): FakeCourseId {
  assert(isFakeCourseId(n), `Bad fake course id: ${n}`);
  return n;
}

/** An akiko with every course in `cells` placed in its cell. */
function akikoWith(params: {
  known?: KnownCourse[];
  real?: RealCourse[];
  fake?: FakeCourse[];
  cells?: Record<string, CourseId[]>;
  fakeCells?: Record<string, FakeCourseId[]>;
  requirements?: Parameters<typeof createCreditRequirementsOrFail>[0];
}) {
  const positions = new Map<CourseId, CellId>();
  for (const [id, courseIds] of Object.entries(params.cells ?? {})) {
    for (const c of courseIds) positions.set(c, cellId(id));
  }
  const fakePositions = new Map<FakeCourseId, CellId>();
  for (const [id, fakeIds] of Object.entries(params.fakeCells ?? {})) {
    for (const f of fakeIds) fakePositions.set(f, cellId(id));
  }
  const akiko = akikoNew(
    params.known ?? [],
    CATALOG_YEAR,
    params.real ?? [],
    params.fake ?? [],
    new Map(),
    positions,
    new Map(),
    fakePositions,
    createCreditRequirementsOrFail(
      params.requirements ?? {
        cells: {},
        columns: {},
        compulsory: 0,
        elective: 0,
      },
    ),
  );
  assert(akiko !== undefined);
  return akiko;
}

describe("akikoGetMergedCourse", () => {
  test("a course only in the catalog", () => {
    const akiko = akikoWith({
      known: [knownCourse(PLANNED, 2)],
      cells: { b1: [PLANNED] },
    });
    expect(akikoGetMergedCourse(akiko, PLANNED)).toMatchObject({
      name: `catalog ${PLANNED}`,
      credit: 2,
      cellId: "b1",
      syllabusYear: CATALOG_YEAR,
    });
  });

  test("the grades file's name and credit win over the catalog's", () => {
    const akiko = akikoWith({
      known: [knownCourse(PASSED, 2)],
      real: [{ ...realCourse(PASSED, "a"), name: "graded", credit: 1 }],
    });
    expect(akikoGetMergedCourse(akiko, PASSED)).toMatchObject({
      name: "graded",
      credit: 1,
    });
  });

  test("a passed course's syllabus is the year it was taken", () => {
    const akiko = akikoWith({ real: [realCourse(PASSED, "a")] });
    expect(akikoGetMergedCourse(akiko, PASSED)?.syllabusYear).toBe(2024);
  });

  test("any other course's syllabus is the catalog's year", () => {
    const akiko = akikoWith({
      real: [realCourse(WIP, "wip"), realCourse(FAILED, "d")],
    });
    expect(akikoGetMergedCourse(akiko, WIP)?.syllabusYear).toBe(CATALOG_YEAR);
    expect(akikoGetMergedCourse(akiko, FAILED)?.syllabusYear).toBe(
      CATALOG_YEAR,
    );
  });

  test("a course in neither is undefined", () => {
    expect(akikoGetMergedCourse(akikoWith({}), PLANNED)).toBeUndefined();
  });
});

test("lists put 履修中 courses first, then failed ones, each by ID", () => {
  const first = courseId("GB00001");
  const otherWip = courseId("GB50000");
  const akiko = akikoWith({
    known: [PLANNED, first, FAILED, WIP].map((id) => knownCourse(id)),
    real: [
      realCourse(otherWip, "wip"),
      realCourse(WIP, "wip"),
      realCourse(FAILED, "d"),
    ],
  });
  const lists = akikoGetAllCourses(akiko);
  expect(lists.wontTake).toEqual([FAILED, first, PLANNED]);
  expect(lists.mightTake).toEqual([WIP, otherWip]);
});

test("akikoGetClassifiedFakeCourses has only the ones in a cell", () => {
  const fake = (id: number): FakeCourse => ({
    id: fakeCourseId(id),
    name: `fake ${id}`,
    credit: 2,
    takenYear: 2024,
    grade: "free",
  });
  const akiko = akikoWith({
    fake: [fake(1), fake(2)],
    fakeCells: { h1: [fakeCourseId(2)] },
  });
  expect(akikoGetClassifiedFakeCourses(akiko)).toEqual([fake(2)]);
});

test("the total credits are 必修 and 選択 together", () => {
  const elective = courseId("GB50000");
  const akiko = akikoWith({
    known: [knownCourse(PLANNED, 3)],
    real: [
      realCourse(PASSED, "a"),
      { ...realCourse(elective, "a"), credit: 2 },
    ],
    cells: { a1: [PASSED], b1: [elective, PLANNED] },
    requirements: {
      cells: { a1: { min: 1, max: 1 }, b1: { min: 4, max: undefined } },
      columns: { a: { min: 1, max: 1 }, b: { min: 4, max: 10 } },
      compulsory: 1,
      elective: 4,
    },
  });
  // PLANNED is still in 当てはまる授業, so it doesn't count
  expect(akikoGetCreditStats(akiko).total).toMatchObject({
    min: 5,
    max: 5,
    effectiveTaken: 3,
    effectiveMightTake: 0,
  });
});

test("creditSum counts unknown credits as 0", () => {
  expect(creditSum([{ credit: 2 }, { credit: undefined }, { credit: 1 }])).toBe(
    3,
  );
});
