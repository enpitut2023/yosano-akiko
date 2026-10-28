import { describe, expect, test } from "vitest";
import {
  akikoGetOccupiedSlots,
  akikoNew,
  isCourseId,
  type CourseId,
  type KnownCourse,
  type MergedCourse,
  type OccupiedSlots,
  type Slot,
} from "$lib/akiko";
import { createCreditRequirementsOrFail } from "$lib/app-setup";
import { assert } from "$lib/util";
import {
  courseMatchesFilters,
  filterChoicesOf,
  filtersActiveCount,
  filtersInEffect,
  slotsMatchFilters,
  wontTakeFiltersDefault,
  type WontTakeFilters,
} from "./course-filters";

function courseId(s: string): CourseId {
  assert(isCourseId(s), `Bad course id: "${s}"`);
  return s;
}

const MON1: Slot = {
  term: "spring-a",
  when: { kind: "regular", dow: "mon", period: 1 },
};
const TUE2: Slot = {
  term: "autumn",
  when: { kind: "regular", dow: "tue", period: 2 },
};
const INTENSIVE: Slot = { term: "summer-break", when: { kind: "intensive" } };

function knownCourse(
  id: string,
  overrides: Partial<Omit<KnownCourse, "id">>,
): KnownCourse {
  return {
    id: courseId(id),
    name: id,
    credit: 1,
    expects: [1],
    expectsString: "1",
    slots: [],
    slotsString: "",
    availability: "available",
    remark: "",
    ...overrides,
  };
}

function merged(known: KnownCourse): MergedCourse {
  return {
    id: known.id,
    name: known.name,
    credit: known.credit,
    known,
    real: undefined,
    cellId: undefined,
    syllabusYear: 2026,
  };
}

function filters(overrides: Partial<WontTakeFilters>): WontTakeFilters {
  return { ...wontTakeFiltersDefault(), ...overrides };
}

/** The slots taken by a course in 取る授業 that has them. */
function occupiedBy(slots: Slot[]): OccupiedSlots {
  const planned = knownCourse("GB99999", { slots });
  const akiko = akikoNew(
    [planned],
    2026,
    [],
    [],
    new Map([[planned.id, "might-take"]]),
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
  return akikoGetOccupiedSlots(akiko);
}

const NONE_OCCUPIED = occupiedBy([]);

describe("slotsMatchFilters", () => {
  test("no term or day matches any course, even one without slots", () => {
    expect(slotsMatchFilters([], undefined, [])).toBe(true);
  });

  test("term", () => {
    expect(slotsMatchFilters([MON1, TUE2], "autumn", [])).toBe(true);
    expect(slotsMatchFilters([MON1], "autumn", [])).toBe(false);
  });

  test("any of the days", () => {
    expect(slotsMatchFilters([TUE2], undefined, ["mon", "tue"])).toBe(true);
    expect(slotsMatchFilters([TUE2], undefined, ["wed"])).toBe(false);
  });

  test("a day leaves out courses without a fixed day", () => {
    expect(slotsMatchFilters([INTENSIVE], undefined, ["mon"])).toBe(false);
    expect(slotsMatchFilters([INTENSIVE], "summer-break", [])).toBe(true);
  });

  test("the term and the day must hold for the same slot", () => {
    // 春A on Monday and 秋学期 on Tuesday, but no 秋学期 on Monday
    expect(slotsMatchFilters([MON1, TUE2], "autumn", ["mon"])).toBe(false);
    expect(slotsMatchFilters([MON1, TUE2], "autumn", ["tue"])).toBe(true);
  });
});

describe("courseMatchesFilters", () => {
  const course = merged(
    knownCourse("GB12345", {
      name: "データ構造とアルゴリズム",
      credit: 2,
      expects: [2, 3],
      slots: [MON1],
    }),
  );
  const matches = (overrides: Partial<WontTakeFilters>) =>
    courseMatchesFilters(course, filters(overrides), NONE_OCCUPIED);

  test("no filters", () => {
    expect(matches({})).toBe(true);
  });

  test("search by ID, ignoring case", () => {
    expect(matches({ courseIdOrName: "gb123" })).toBe(true);
    expect(matches({ courseIdOrName: "GB999" })).toBe(false);
  });

  test("search by name", () => {
    expect(matches({ courseIdOrName: "アルゴリズム" })).toBe(true);
    expect(matches({ courseIdOrName: "線形代数" })).toBe(false);
  });

  test("credit", () => {
    expect(matches({ credit: 2 })).toBe(true);
    expect(matches({ credit: 1 })).toBe(false);
  });

  test("year", () => {
    expect(matches({ expects: 3 })).toBe(true);
    expect(matches({ expects: 1 })).toBe(false);
  });

  test("term and day", () => {
    expect(matches({ term: "spring-a", dows: ["mon"] })).toBe(true);
    expect(matches({ term: "spring-a", dows: ["tue"] })).toBe(false);
  });

  test("only free slots", () => {
    const f = filters({ onlyUnoccupied: true });
    expect(courseMatchesFilters(course, f, NONE_OCCUPIED)).toBe(true);
    expect(courseMatchesFilters(course, f, occupiedBy([MON1]))).toBe(false);
    expect(courseMatchesFilters(course, f, occupiedBy([TUE2]))).toBe(true);
  });

  test("a course not in the catalog matches only filters on what it has", () => {
    const notKnown: MergedCourse = {
      ...course,
      known: undefined,
      credit: 2,
    };
    const matchesNotKnown = (overrides: Partial<WontTakeFilters>) =>
      courseMatchesFilters(notKnown, filters(overrides), NONE_OCCUPIED);
    expect(matchesNotKnown({ credit: 2, onlyUnoccupied: true })).toBe(true);
    expect(matchesNotKnown({ expects: 2 })).toBe(false);
    expect(matchesNotKnown({ term: "spring-a" })).toBe(false);
  });
});

describe("filterChoicesOf", () => {
  test("the values the courses have, sorted, without duplicates", () => {
    const choices = filterChoicesOf([
      merged(
        knownCourse("GB10000", { credit: 3, expects: [3], slots: [TUE2] }),
      ),
      merged(
        knownCourse("GB20000", {
          credit: 1,
          expects: [1, 3],
          slots: [MON1, INTENSIVE],
        }),
      ),
      merged(knownCourse("GB30000", { credit: undefined, expects: [] })),
    ]);
    expect(choices).toEqual({
      credits: [1, 3],
      expects: [1, 3],
      dows: ["mon", "tue"],
      terms: ["spring-a", "autumn", "summer-break"],
      termGroups: [
        { label: "モジュール", terms: ["spring-a"] },
        { label: "学期", terms: ["autumn"] },
        { label: "その他", terms: ["summer-break"] },
      ],
    });
  });

  test("leaves out empty term groups", () => {
    const choices = filterChoicesOf([
      merged(knownCourse("GB10000", { slots: [MON1] })),
    ]);
    expect(choices.termGroups).toEqual([
      { label: "モジュール", terms: ["spring-a"] },
    ]);
  });

  test("no courses", () => {
    expect(filterChoicesOf([])).toEqual({
      credits: [],
      expects: [],
      dows: [],
      terms: [],
      termGroups: [],
    });
  });
});

describe("filtersInEffect", () => {
  const chosen = filters({
    courseIdOrName: "GB",
    credit: 2,
    expects: 3,
    term: "spring-a",
    dows: ["mon", "tue"],
    onlyUnoccupied: true,
  });

  test("keeps the values on offer", () => {
    const choices = filterChoicesOf([
      merged(
        knownCourse("GB10000", { credit: 2, expects: [3], slots: [MON1] }),
      ),
      merged(knownCourse("GB20000", { slots: [TUE2] })),
    ]);
    expect(filtersInEffect(chosen, choices)).toEqual(chosen);
  });

  test("leaves out the values not on offer", () => {
    const choices = filterChoicesOf([
      merged(
        knownCourse("GB10000", { credit: 1, expects: [1], slots: [TUE2] }),
      ),
    ]);
    expect(filtersInEffect(chosen, choices)).toEqual({
      ...chosen,
      credit: undefined,
      expects: undefined,
      term: undefined,
      dows: ["tue"],
    });
  });
});

test("filtersActiveCount counts each day but not the search", () => {
  expect(filtersActiveCount(filters({ courseIdOrName: "GB" }))).toBe(0);
  expect(
    filtersActiveCount(
      filters({
        credit: 2,
        expects: 1,
        term: "spring-a",
        dows: ["mon", "tue"],
        onlyUnoccupied: true,
      }),
    ),
  ).toBe(6);
});
