import { assert, unreachable } from "./util";

declare const nominalIdentifier: unique symbol;
type Nominal<T, Identifier> = T & { [nominalIdentifier]: Identifier };

export type CellId = Nominal<string, "CellId">;
export type ColumnId = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";

export function isCellId(s: string): s is CellId {
  return /^[a-h]\d+$/.test(s);
}

export function cellIdToColumnId(id: CellId): ColumnId {
  const col = id[0];
  assert(isColumnId(col));
  return col;
}

export function cellIdToRow(id: CellId): number {
  return parseInt(id.substring(1));
}

export function isColumnId(s: string): s is ColumnId {
  return (
    s === "a" ||
    s === "b" ||
    s === "c" ||
    s === "d" ||
    s === "e" ||
    s === "f" ||
    s === "g" ||
    s === "h"
  );
}

export function columnIdIsCompulsory(id: ColumnId): boolean {
  return id === "a" || id === "c" || id === "e" || id === "g";
}

export function columnIdIsElective(id: ColumnId): boolean {
  return !columnIdIsCompulsory(id);
}

export type CourseId = Nominal<string, "CourseId">;

export function isCourseId(s: string): s is CourseId {
  return /^[A-Z0-9]{7}$/.test(s);
}

export function courseIdCompare(a: CourseId, b: CourseId): number {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
}

export type FakeCourseId = Nominal<number, "FakeCourseId">;

export function isFakeCourseId(n: number): n is FakeCourseId {
  return Number.isSafeInteger(n);
}

function djb2(s: string): number {
  let hash = 5381;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash + s.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function fakeCourseIdFromContent(
  name: string,
  credit: number | undefined,
  takenYear: number,
): FakeCourseId {
  const id = djb2(`${name}|${credit}|${takenYear}`);
  assert(isFakeCourseId(id));
  return id;
}

export function fakeCourseIdCompare(a: FakeCourseId, b: FakeCourseId): number {
  return a - b;
}

export type Grade = "wip" | "a+" | "a" | "b" | "c" | "d" | "pass" | "fail";

export function isGrade(s: string): s is Grade {
  return (
    s === "wip" ||
    s === "a+" ||
    s === "a" ||
    s === "b" ||
    s === "c" ||
    s === "d" ||
    s === "pass" ||
    s === "fail"
  );
}

export function gradeIsPass(g: Grade): boolean {
  return g === "a+" || g === "a" || g === "b" || g === "c" || g === "pass";
}

export function gradeIsFail(g: Grade): boolean {
  return g === "d" || g === "fail";
}

export function gradeIsWip(g: Grade): boolean {
  return g === "wip";
}

export const TERMS = [
  "spring-a",
  "spring-b",
  "spring-c",
  "autumn-a",
  "autumn-b",
  "autumn-c",
  "spring",
  "autumn",
  "spring-break",
  "summer-break",
  "all-year",
] as const;
export type Term = (typeof TERMS)[number];

export function termToString(t: Term): string {
  switch (t) {
    case "spring-a":
      return "春A";
    case "spring-b":
      return "春B";
    case "spring-c":
      return "春C";
    case "autumn-a":
      return "秋A";
    case "autumn-b":
      return "秋B";
    case "autumn-c":
      return "秋C";
    case "spring":
      return "春学期";
    case "autumn":
      return "秋学期";
    case "spring-break":
      return "春季休業中";
    case "summer-break":
      return "夏季休業中";
    case "all-year":
      return "通年";
    default:
      unreachable(t);
  }
}

const TERM_TO_INDEX: Record<Term, number> = (() => {
  const o: Partial<Record<Term, number>> = {};
  for (let i = 0; i < TERMS.length; i++) o[TERMS[i]] = i;
  return o as Record<Term, number>;
})();
export function termCompare(a: Term, b: Term): number {
  return TERM_TO_INDEX[a] - TERM_TO_INDEX[b];
}

export const DOWS = ["mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type Dow = (typeof DOWS)[number];

export function dowToString(d: Dow): string {
  switch (d) {
    case "mon":
      return "月";
    case "tue":
      return "火";
    case "wed":
      return "水";
    case "thu":
      return "木";
    case "fri":
      return "金";
    case "sat":
      return "土";
    default:
      unreachable(d);
  }
}

const DOW_TO_INDEX: Record<Dow, number> = (() => {
  const o: Partial<Record<Dow, number>> = {};
  for (let i = 0; i < DOWS.length; i++) o[DOWS[i]] = i;
  return o as Record<Dow, number>;
})();
export function dowCompare(a: Dow, b: Dow): number {
  return DOW_TO_INDEX[a] - DOW_TO_INDEX[b];
}

export type When =
  | { kind: "regular"; dow: Dow; period: number }
  | { kind: "intensive" }
  | { kind: "oudan" }
  | { kind: "zuiji" }
  | { kind: "nt" };

export function whenToString(w: When): string {
  switch (w.kind) {
    case "regular":
      return dowToString(w.dow) + w.period;
    case "intensive":
      return "集中";
    case "oudan":
      return "応談";
    case "zuiji":
      return "随時";
    case "nt":
      return "NT";
    default:
      unreachable(w);
  }
}

function whenRegularCompare(
  aDow: Dow,
  aPeriod: number,
  bDow: Dow,
  bPeriod: number,
): number {
  const dow = dowCompare(aDow, bDow);
  if (dow !== 0) return dow;
  return aPeriod - bPeriod;
}

type WhenKind = When["kind"];
const WHEN_KIND_TO_INDEX: Record<WhenKind, number> = {
  regular: 0,
  intensive: 1,
  oudan: 2,
  zuiji: 3,
  nt: 4,
};
export function whenCompare(a: When, b: When): number {
  if (a.kind === "regular") {
    if (b.kind === "regular")
      return whenRegularCompare(a.dow, a.period, b.dow, b.period);
    else return -1;
  } else {
    if (b.kind === "regular") return 1;
    else return WHEN_KIND_TO_INDEX[a.kind] - WHEN_KIND_TO_INDEX[b.kind];
  }
}

export type Slot = { term: Term; when: When };

export function slotCompare(a: Slot, b: Slot): number {
  const term = termCompare(a.term, b.term);
  if (term !== 0) return term;
  return whenCompare(a.when, b.when);
}

export function slotToString(s: Slot): string {
  return termToString(s.term) + " " + whenToString(s.when);
}

function slotHash(s: Slot): string {
  return JSON.stringify(s);
}

export type Availability = "available" | "unavailable" | "indeterminable";

export type KnownCourse = {
  id: CourseId;
  name: string;
  credit: number | undefined;
  expects: number[];
  expectsString: string;
  slots: Slot[];
  slotsString: string;
  availability: Availability;
  remark: string;
};
export type RealCourse = {
  id: CourseId;
  name: string;
  credit: number | undefined;
  takenYear: number;
  grade: Grade;
};
export type FakeCourse = {
  id: FakeCourseId;
  name: string;
  credit: number | undefined;
  takenYear: number;
  grade: "free";
};
export type ImportedCourse = RealCourse | FakeCourse;

export function knownCourseIsJizentouroku(k: KnownCourse): boolean {
  return k.remark.includes("事前登録対象");
}

export type CellCreditRequirements = { min: number; max: number | undefined };
export type ColumnCreditRequirements = { min: number; max: number };
export type CreditRequirements = {
  cells: Map<CellId, CellCreditRequirements>;
  columns: Map<ColumnId, ColumnCreditRequirements>;
  compulsoryMin: number;
  electiveMin: number;
};

export type BaseCreditStats = {
  min: number;
  rawMightTake: number;
  rawTaken: number;
  rawTotal: number;
  effectiveMightTake: number;
  effectiveTaken: number;
  effectiveTotal: number;
  overflowMightTake: number;
  overflowTaken: number;
  overflowTotal: number;
};
export type CellCreditStats = { max: number | undefined } & BaseCreditStats;
export type ColumnCreditStats = { max: number } & BaseCreditStats;
export type CompulsoryCreditStats = { max: number } & BaseCreditStats;
export type ElectiveCreditStats = { max: number } & BaseCreditStats;
export type TotalCreditStats = { max: number } & BaseCreditStats;
export type CreditStats = {
  cells: Map<CellId, CellCreditStats>;
  columns: Map<ColumnId, ColumnCreditStats>;
  compulsory: CompulsoryCreditStats;
  elective: ElectiveCreditStats;
  /** 必修 and 選択 together: the credits toward graduation. */
  total: TotalCreditStats;
};

function baseCreditStatsNew(
  rawMightTake: number,
  rawTaken: number,
  min: number,
  max: number | undefined,
): BaseCreditStats {
  const rawTotal = rawMightTake + rawTaken;
  const effectiveTotal = Math.min(rawTotal, max ?? Infinity);
  const effectiveTaken = Math.min(rawTaken, max ?? Infinity);
  const effectiveMightTake = effectiveTotal - effectiveTaken;
  return {
    min,
    rawMightTake,
    rawTaken,
    rawTotal,
    effectiveMightTake,
    effectiveTaken,
    effectiveTotal,
    overflowMightTake: rawMightTake - effectiveMightTake,
    overflowTaken: rawTaken - effectiveTaken,
    overflowTotal: rawTotal - effectiveTotal,
  };
}

export type ListKind = "wont-take" | "might-take" | "taken";

/**
 * Courses the user moved by hand, overriding the list their grade puts them in.
 * They keep what the grades can't recover, like a failed course put back in
 * 取る授業 to retake, or a 履修中 one taken out of it.
 */
export type ListKindOverride = "wont-take" | "might-take";
export type ListKindOverrides = Map<CourseId, ListKindOverride>;

export type Akiko = {
  knownCourses: Map<CourseId, KnownCourse>;
  /** The academic year the catalog in `knownCourses` is for. */
  knownCourseYear: number;
  realCourses: Map<CourseId, RealCourse>;
  fakeCourses: Map<FakeCourseId, FakeCourse>;
  courseIdToCellId: Map<CourseId, CellId>;
  courseIdToListKind: Map<CourseId, ListKind>;
  listKindOverrides: ListKindOverrides;
  fakeCoursePositions: Map<FakeCourseId, CellId>;
  creditRequirements: CreditRequirements;
};

function realCourseListKind(grade: Grade): ListKind {
  switch (grade) {
    case "wip":
      return "might-take";
    case "a+":
    case "a":
    case "b":
    case "c":
    case "pass":
      return "taken";
    case "d":
    case "fail":
      return "wont-take";
    default:
      unreachable(grade);
  }
}

export function akikoNew(
  knownCoursesArray: KnownCourse[],
  knownCourseYear: number,
  realCoursesArray: RealCourse[],
  fakeCoursesArray: FakeCourse[],
  listKindOverrides: ListKindOverrides,
  courseIdToCellId: Map<CourseId, CellId>,
  realCoursePositions: Map<CourseId, CellId>,
  fakeCoursePositions: Map<FakeCourseId, CellId>,
  creditRequirements: CreditRequirements,
): Akiko | undefined {
  const knownCourses = new Map(knownCoursesArray.map((c) => [c.id, c]));

  realCoursesArray = Array.from(realCoursesArray);
  // Make sure to use the latest grade
  realCoursesArray.sort((a, b) => a.takenYear - b.takenYear);
  const realCourses = new Map<CourseId, RealCourse>();
  for (const c of realCoursesArray) {
    realCourses.set(c.id, c);
  }

  fakeCoursesArray = Array.from(fakeCoursesArray);
  // Make sure to use the latest grade
  fakeCoursesArray.sort((a, b) => a.takenYear - b.takenYear);
  const fakeCourses = new Map<FakeCourseId, FakeCourse>();
  for (const c of fakeCoursesArray) {
    fakeCourses.set(c.id, c);
  }

  courseIdToCellId = new Map(courseIdToCellId);
  const courseIdToListKind = new Map<CourseId, ListKind>();

  // Grades first, then the overrides on top. The other way round, grades would
  // win, and planned retakes would vanish on every import.
  for (const rc of realCourses.values()) {
    courseIdToListKind.set(rc.id, realCourseListKind(rc.grade));
  }

  listKindOverrides = new Map(listKindOverrides);
  for (const [courseId, override] of listKindOverrides) {
    const fromGrade = courseIdToListKind.get(courseId) ?? "wont-take";
    // Taken courses can't move, so the grade wins. Either way, the override no
    // longer changes anything, so drop it.
    if (fromGrade === "taken" || fromGrade === override) {
      listKindOverrides.delete(courseId);
      continue;
    }
    courseIdToListKind.set(courseId, override);
  }

  for (const [courseId, cellId] of realCoursePositions) {
    courseIdToCellId.set(courseId, cellId);
  }

  return {
    knownCourses,
    knownCourseYear,
    realCourses,
    fakeCourses,
    courseIdToCellId,
    courseIdToListKind,
    listKindOverrides,
    fakeCoursePositions,
    creditRequirements,
  };
}

export function akikoGetListKind(akiko: Akiko, courseId: CourseId): ListKind {
  return akiko.courseIdToListKind.get(courseId) ?? "wont-take";
}

/** A course with what the catalog and the grades file say about it. */
export type MergedCourse = {
  id: CourseId;
  /** The grades file's, if it has one, else the catalog's. */
  name: string;
  /** The grades file's, if it has one, else the catalog's. */
  credit: number | undefined;
  known: KnownCourse | undefined;
  real: RealCourse | undefined;
  cellId: CellId | undefined;
  /**
   * The year of the syllabus the student took the course under, or would take
   * it under: the year taken if passed, else the catalog's year.
   */
  syllabusYear: number;
};

/** Not known to be offered this year. False for a course not in the catalog. */
export function mergedCourseIsUnavailable(c: MergedCourse): boolean {
  return c.known !== undefined && c.known.availability !== "available";
}

/** Undefined if neither the catalog nor the grades file has the course. */
export function akikoGetMergedCourse(
  akiko: Akiko,
  courseId: CourseId,
): MergedCourse | undefined {
  const known = akiko.knownCourses.get(courseId);
  const real = akiko.realCourses.get(courseId);
  if (known === undefined && real === undefined) return undefined;
  return {
    id: courseId,
    name: real?.name || known?.name || "（不明）",
    credit: real?.credit ?? known?.credit,
    known,
    real,
    cellId: akiko.courseIdToCellId.get(courseId),
    syllabusYear:
      real !== undefined && gradeIsPass(real.grade)
        ? real.takenYear
        : akiko.knownCourseYear,
  };
}

/** The courses' credits added up, counting unknown ones as 0. */
export function creditSum(courses: { credit: number | undefined }[]): number {
  return courses.reduce((sum, c) => sum + (c.credit ?? 0), 0);
}

/**
 * The courses of each list, each sorted with 履修中 courses first, then failed
 * ones, each group by ID.
 */
export type CourseIdLists = {
  wontTake: CourseId[];
  mightTake: CourseId[];
  taken: CourseId[];
  fake: FakeCourseId[];
};

function courseIdListsSort(akiko: Akiko, lists: CourseIdLists): CourseIdLists {
  function priority(id: CourseId): number {
    const grade = akiko.realCourses.get(id)?.grade;
    if (grade === undefined) return 2;
    if (gradeIsWip(grade)) return 0;
    if (gradeIsFail(grade)) return 1;
    return 2;
  }
  const sort = (ids: CourseId[]) =>
    ids.sort((a, b) => priority(a) - priority(b) || courseIdCompare(a, b));
  return {
    wontTake: sort(lists.wontTake),
    mightTake: sort(lists.mightTake),
    taken: sort(lists.taken),
    fake: lists.fake,
  };
}

// TODO: should return undefined for unknown cell ids
export function akikoGetCoursesInCell(
  akiko: Akiko,
  cellId: CellId,
): CourseIdLists {
  const wontTake: CourseId[] = [];
  const mightTake: CourseId[] = [];
  const taken: CourseId[] = [];
  const fake: FakeCourseId[] = [];
  for (const [courseId, cid] of akiko.courseIdToCellId) {
    if (cid !== cellId) continue;
    const listKind = akikoGetListKind(akiko, courseId);
    switch (listKind) {
      case "wont-take":
        wontTake.push(courseId);
        break;
      case "might-take":
        mightTake.push(courseId);
        break;
      case "taken":
        taken.push(courseId);
        break;
      default:
        unreachable(listKind);
    }
  }
  for (const [fakeCourseId, id] of akiko.fakeCoursePositions) {
    if (cellId === id) fake.push(fakeCourseId);
  }
  return courseIdListsSort(akiko, { wontTake, mightTake, taken, fake });
}

export function akikoGetAllCourses(akiko: Akiko): CourseIdLists {
  const wontTake = new Set<CourseId>();
  const mightTake = new Set<CourseId>();
  const taken = new Set<CourseId>();
  for (const courseId of akiko.knownCourses.keys()) {
    const listKind = akikoGetListKind(akiko, courseId);
    switch (listKind) {
      case "wont-take":
        wontTake.add(courseId);
        break;
      case "might-take":
        mightTake.add(courseId);
        break;
      case "taken":
        taken.add(courseId);
        break;
      default:
        unreachable(listKind);
    }
  }
  for (const rc of akiko.realCourses.values()) {
    if (akiko.knownCourses.has(rc.id)) continue;
    const explicit = akiko.courseIdToListKind.get(rc.id);
    if (explicit !== undefined) {
      switch (explicit) {
        case "wont-take":
          wontTake.add(rc.id);
          break;
        case "might-take":
          mightTake.add(rc.id);
          break;
        case "taken":
          taken.add(rc.id);
          break;
        default:
          unreachable(explicit);
      }
    } else {
      if (gradeIsFail(rc.grade)) wontTake.add(rc.id);
      else if (gradeIsWip(rc.grade)) mightTake.add(rc.id);
      else if (gradeIsPass(rc.grade)) taken.add(rc.id);
    }
  }
  return courseIdListsSort(akiko, {
    wontTake: Array.from(wontTake),
    mightTake: Array.from(mightTake),
    taken: Array.from(taken),
    fake: Array.from(akiko.fakeCoursePositions.keys()),
  });
}

export type CourseLists = {
  wontTake: MergedCourse[];
  mightTake: MergedCourse[];
  taken: MergedCourse[];
  fake: FakeCourse[];
};

/**
 * The courses of a cell, or every course if `cellId` is undefined, in each
 * list. `includeUnavailable` applies to 当てはまる授業 only, since a course
 * already planned or passed is shown whatever this year's catalog says.
 */
export function akikoGetCourseLists(
  akiko: Akiko,
  cellId: CellId | undefined,
  includeUnavailable: boolean,
): CourseLists {
  const ids =
    cellId !== undefined
      ? akikoGetCoursesInCell(akiko, cellId)
      : akikoGetAllCourses(akiko);
  const courses = (ids: CourseId[]) =>
    ids
      .map((id) => akikoGetMergedCourse(akiko, id))
      .filter((c) => c !== undefined);
  return {
    wontTake: courses(ids.wontTake).filter(
      (c) => includeUnavailable || !mergedCourseIsUnavailable(c),
    ),
    mightTake: courses(ids.mightTake),
    taken: courses(ids.taken),
    fake: ids.fake
      .map((id) => akiko.fakeCourses.get(id))
      .filter((fc) => fc !== undefined),
  };
}

export function akikoGetCreditStats(akiko: Akiko): CreditStats {
  const cellIdToMightTakeIds = new Map<CellId, CourseId[]>();
  const cellIdToTakenIds = new Map<CellId, CourseId[]>();
  for (const [courseId, cellId] of akiko.courseIdToCellId) {
    const listKind = akikoGetListKind(akiko, courseId);
    let map: Map<CellId, CourseId[]>;
    if (listKind === "might-take") {
      map = cellIdToMightTakeIds;
    } else if (listKind === "taken") {
      map = cellIdToTakenIds;
    } else {
      continue;
    }
    const ids = map.get(cellId);
    if (ids === undefined) {
      map.set(cellId, [courseId]);
    } else {
      ids.push(courseId);
    }
  }

  const cellIdToFakeCourseIds = new Map<CellId, FakeCourseId[]>();
  for (const [fakeCourseId, cellId] of akiko.fakeCoursePositions) {
    const ids = cellIdToFakeCourseIds.get(cellId);
    if (ids === undefined) {
      cellIdToFakeCourseIds.set(cellId, [fakeCourseId]);
    } else {
      ids.push(fakeCourseId);
    }
  }

  const cells = new Map<CellId, CellCreditStats>();
  for (const [cellId, req] of akiko.creditRequirements.cells) {
    let rawMightTake = 0;
    for (const id of cellIdToMightTakeIds.get(cellId) ?? []) {
      rawMightTake +=
        akiko.knownCourses.get(id)?.credit ??
        akiko.realCourses.get(id)?.credit ??
        0;
    }
    let rawTaken = 0;
    for (const id of cellIdToTakenIds.get(cellId) ?? []) {
      rawTaken += akiko.realCourses.get(id)?.credit ?? 0;
    }
    for (const id of cellIdToFakeCourseIds.get(cellId) ?? []) {
      rawTaken += akiko.fakeCourses.get(id)?.credit ?? 0;
    }
    cells.set(cellId, {
      max: req.max,
      ...baseCreditStatsNew(rawMightTake, rawTaken, req.min, req.max),
    });
  }

  const columns = new Map<ColumnId, ColumnCreditStats>();
  for (const [columnId, req] of akiko.creditRequirements.columns) {
    let rawMightTake = 0;
    let rawTaken = 0;
    for (const [cellId, cell] of cells) {
      if (cellIdToColumnId(cellId) === columnId) {
        rawMightTake += cell.effectiveMightTake;
        rawTaken += cell.effectiveTaken;
      }
    }
    columns.set(columnId, {
      max: req.max,
      ...baseCreditStatsNew(rawMightTake, rawTaken, req.min, req.max),
    });
  }

  let compulsoryRawMightTake = 0;
  let compulsoryRawTaken = 0;
  let electiveRawMightTake = 0;
  let electiveRawTaken = 0;
  for (const [columnId, column] of columns) {
    if (columnIdIsCompulsory(columnId)) {
      compulsoryRawMightTake += column.effectiveMightTake;
      compulsoryRawTaken += column.effectiveTaken;
    } else {
      electiveRawMightTake += column.effectiveMightTake;
      electiveRawTaken += column.effectiveTaken;
    }
  }

  const { compulsoryMin, electiveMin } = akiko.creditRequirements;
  const compulsory: CompulsoryCreditStats = {
    max: compulsoryMin,
    ...baseCreditStatsNew(
      compulsoryRawMightTake,
      compulsoryRawTaken,
      compulsoryMin,
      compulsoryMin,
    ),
  };
  const elective: ElectiveCreditStats = {
    max: electiveMin,
    ...baseCreditStatsNew(
      electiveRawMightTake,
      electiveRawTaken,
      electiveMin,
      electiveMin,
    ),
  };
  const totalMin = compulsoryMin + electiveMin;
  const total: TotalCreditStats = {
    max: totalMin,
    ...baseCreditStatsNew(
      compulsory.effectiveMightTake + elective.effectiveMightTake,
      compulsory.effectiveTaken + elective.effectiveTaken,
      totalMin,
      totalMin,
    ),
  };
  return { cells, columns, compulsory, elective, total };
}

export function akikoGetMightTakeCourseIds(akiko: Akiko): CourseId[] {
  const res: CourseId[] = [];
  for (const [id, listKind] of akiko.courseIdToListKind) {
    if (listKind === "might-take") res.push(id);
  }
  return res;
}

export function akikoGetTakenCourseIds(akiko: Akiko): CourseId[] {
  const res: CourseId[] = [];
  for (const [id, listKind] of akiko.courseIdToListKind) {
    if (listKind === "taken") res.push(id);
  }
  return res;
}

export function akikoGetUnclassifiedRealCourses(akiko: Akiko): RealCourse[] {
  const rcs: RealCourse[] = [];
  for (const rc of akiko.realCourses.values()) {
    if (!akiko.courseIdToCellId.has(rc.id)) rcs.push(rc);
  }
  return rcs;
}

/** The fake courses that landed in a cell, so count toward graduation. */
export function akikoGetClassifiedFakeCourses(akiko: Akiko): FakeCourse[] {
  const fcs: FakeCourse[] = [];
  for (const id of akiko.fakeCoursePositions.keys()) {
    const fc = akiko.fakeCourses.get(id);
    if (fc !== undefined) fcs.push(fc);
  }
  return fcs;
}

export function akikoGetUnclassifiedFakeCourses(akiko: Akiko): FakeCourse[] {
  const fcs: FakeCourse[] = [];
  for (const fc of akiko.fakeCourses.values()) {
    if (!akiko.fakeCoursePositions.has(fc.id)) {
      fcs.push(fc);
    }
  }
  return fcs;
}

export type OccupiedSlots = Nominal<Set<string>, "OccupiedSlots">;

export function akikoGetOccupiedSlots(akiko: Akiko): OccupiedSlots {
  const occupied = new Set<string>();
  for (const [courseId, listKind] of akiko.courseIdToListKind) {
    if (listKind !== "might-take") continue;
    const kc = akiko.knownCourses.get(courseId);
    if (kc === undefined) continue;
    for (const s of kc.slots) {
      if (s.when.kind === "regular") occupied.add(slotHash(s));
    }
  }
  return occupied as OccupiedSlots;
}

/** Whether any of the slots is taken by a course in 取る授業. */
export function occupiedSlotsOverlap(
  occupied: OccupiedSlots,
  slots: Slot[],
): boolean {
  return slots.some((s) => occupied.has(slotHash(s)));
}

export type Overlap = { slot: Slot; courses: KnownCourse[] };

/**
 * Courses in 取る授業 that can't be registered through the file: 事前登録
 * courses and courses not offered this year. The UI lists them instead.
 */
export type AkikoExportLeftOut = {
  jizentouroku: KnownCourse[];
  unavailable: KnownCourse[];
};

export type AkikoExportForTwinsResult = AkikoExportLeftOut &
  (
    | { kind: "ok"; toExport: KnownCourse[] }
    | { kind: "err"; overlaps: Overlap[] }
  );

export function akikoExportForTwins(akiko: Akiko): AkikoExportForTwinsResult {
  const candidates: KnownCourse[] = [];
  const unavailable: KnownCourse[] = [];
  for (const [id, listKind] of akiko.courseIdToListKind) {
    const kc = akiko.knownCourses.get(id);
    if (
      listKind !== "might-take" ||
      kc === undefined ||
      akiko.realCourses.get(id)?.grade === "wip"
    )
      continue;
    if (kc.availability === "unavailable") unavailable.push(kc);
    else candidates.push(kc);
  }

  // Map from "term|dow|period" → CourseId[]
  const slotMap = new Map<string, { slot: Slot; courses: KnownCourse[] }>();
  for (const kc of candidates) {
    for (const slot of kc.slots) {
      if (slot.when.kind !== "regular") continue;
      const key = `${slot.term}|${slot.when.dow}|${slot.when.period}`;
      let entry = slotMap.get(key);
      if (entry === undefined) {
        entry = { slot, courses: [] };
        slotMap.set(key, entry);
      }
      entry.courses.push(kc);
    }
  }

  const overlaps: Overlap[] = [];
  for (const entry of slotMap.values()) {
    if (entry.courses.length >= 2) overlaps.push(entry);
  }
  overlaps.sort((a, b) => slotCompare(a.slot, b.slot));

  const jizentouroku = candidates.filter(knownCourseIsJizentouroku);
  if (overlaps.length > 0) {
    return { kind: "err", overlaps, jizentouroku, unavailable };
  }
  return {
    kind: "ok",
    toExport: candidates.filter((c) => !knownCourseIsJizentouroku(c)),
    jizentouroku,
    unavailable,
  };
}

export type AkikoMoveCourseDst = "wont-take" | "might-take";

export type AkikoMoveCourseResult =
  | { kind: "moved"; listKindOverrides: ListKindOverrides }
  | { kind: "no-such-course" | "course-taken" | "course-does-not-move" };

/**
 * The overrides after moving a course. Leaves `akiko` as is; build the moved
 * state with `akikoNew` from the returned overrides.
 */
export function akikoMoveCourse(
  akiko: Akiko,
  courseId: CourseId,
  dst: AkikoMoveCourseDst,
): AkikoMoveCourseResult {
  if (!akiko.knownCourses.has(courseId) && !akiko.realCourses.has(courseId)) {
    return { kind: "no-such-course" };
  }
  const current = akikoGetListKind(akiko, courseId);
  if (current === "taken") return { kind: "course-taken" };
  if (current === dst) return { kind: "course-does-not-move" };

  const listKindOverrides = new Map(akiko.listKindOverrides);
  const rc = akiko.realCourses.get(courseId);
  const fromGrade =
    rc === undefined ? "wont-take" : realCourseListKind(rc.grade);
  if (fromGrade === dst) {
    listKindOverrides.delete(courseId);
  } else {
    listKindOverrides.set(courseId, dst);
  }
  return { kind: "moved", listKindOverrides };
}
