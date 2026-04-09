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
export type CreditStats = {
  cells: Map<CellId, CellCreditStats>;
  columns: Map<ColumnId, ColumnCreditStats>;
  compulsory: CompulsoryCreditStats;
  elective: ElectiveCreditStats;
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
export type CoursePosition = { cellId: CellId; listKind: ListKind };
export type Akiko = {
  knownCourses: Map<CourseId, KnownCourse>;
  realCourses: Map<CourseId, RealCourse>;
  fakeCourses: Map<FakeCourseId, FakeCourse>;
  coursePositions: Map<CourseId, CoursePosition>;
  fakeCoursePositions: Map<FakeCourseId, CellId>;
  creditRequirements: CreditRequirements;
};

export function akikoNew(
  knownCoursesArray: KnownCourse[],
  realCoursesArray: RealCourse[],
  fakeCoursesArray: FakeCourse[],
  mightTakeCourseIds: CourseId[],
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

  const coursePositions = new Map<CourseId, CoursePosition>();
  for (let [courseId, cellId] of courseIdToCellId) {
    coursePositions.set(courseId, { cellId, listKind: "wont-take" });
  }

  for (const id of mightTakeCourseIds) {
    const pos = coursePositions.get(id);
    if (pos !== undefined) {
      pos.listKind = "might-take";
    }
  }

  for (const [courseId, cellId] of realCoursePositions) {
    const realCourse = realCourses.get(courseId);
    if (realCourse === undefined) {
      return undefined;
    }
    let listKind: ListKind;
    switch (realCourse.grade) {
      case "wip":
        listKind = "might-take";
        break;
      case "a+":
      case "a":
      case "b":
      case "c":
      case "pass":
        listKind = "taken";
        break;
      case "d":
      case "fail":
        listKind = "wont-take";
        break;
      default:
        unreachable(realCourse.grade);
    }
    coursePositions.set(courseId, { cellId, listKind });
  }

  return {
    knownCourses,
    realCourses,
    fakeCourses,
    coursePositions,
    fakeCoursePositions,
    creditRequirements,
  };
}

export function akikoGetCreditStats(akiko: Akiko): CreditStats {
  const cellIdToMightTakeIds = new Map<CellId, CourseId[]>();
  const cellIdToTakenIds = new Map<CellId, CourseId[]>();
  for (const [courseId, { cellId, listKind }] of akiko.coursePositions) {
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

  return {
    cells,
    columns,
    compulsory: {
      max: akiko.creditRequirements.compulsoryMin,
      ...baseCreditStatsNew(
        compulsoryRawMightTake,
        compulsoryRawTaken,
        akiko.creditRequirements.compulsoryMin,
        akiko.creditRequirements.compulsoryMin,
      ),
    },
    elective: {
      max: akiko.creditRequirements.electiveMin,
      ...baseCreditStatsNew(
        electiveRawMightTake,
        electiveRawTaken,
        akiko.creditRequirements.electiveMin,
        akiko.creditRequirements.electiveMin,
      ),
    },
  };
}

export function akikoGetMightTakeCourseIds(akiko: Akiko): CourseId[] {
  const res: CourseId[] = [];
  for (const [id, { listKind }] of akiko.coursePositions) {
    if (listKind === "might-take") res.push(id);
  }
  return res;
}

export function akikoGetTakenCourseIds(akiko: Akiko): CourseId[] {
  const res: CourseId[] = [];
  for (const [id, { listKind }] of akiko.coursePositions) {
    if (listKind === "taken") res.push(id);
  }
  return res;
}

export function akikoIsCourseVisible(
  akiko: Akiko,
  id: CourseId,
  idOrName: string,
): boolean {
  const kc = akiko.knownCourses.get(id);
  if (kc !== undefined) {
    const res = kc.id.includes(idOrName) || kc.name.includes(idOrName);
    if (res) {
      return true;
    }
  }
  const rc = akiko.realCourses.get(id);
  if (rc !== undefined) {
    return rc.id.includes(idOrName) || rc.name.includes(idOrName);
  }
  return false;
}

export function akikoGetUnclassifiedRealCourses(akiko: Akiko): RealCourse[] {
  const rcs: RealCourse[] = [];
  for (const rc of akiko.realCourses.values()) {
    if (!akiko.coursePositions.has(rc.id)) {
      rcs.push(rc);
    }
  }
  return rcs;
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

export type Overlap = { slot: Slot; courses: KnownCourse[] };

export type AkikoExportForTwinsResult =
  | { kind: "ok"; toExport: KnownCourse[]; jizentouroku: KnownCourse[] }
  | { kind: "err"; overlaps: Overlap[]; jizentouroku: KnownCourse[] };

export function akikoExportForTwins(akiko: Akiko): AkikoExportForTwinsResult {
  const candidates: KnownCourse[] = [];
  for (const [id, { listKind }] of akiko.coursePositions) {
    const kc = akiko.knownCourses.get(id);
    if (
      listKind === "might-take" &&
      kc !== undefined &&
      akiko.realCourses.get(id)?.grade !== "wip"
    )
      candidates.push(kc);
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
  if (overlaps.length > 0) return { kind: "err", overlaps, jizentouroku };
  return {
    kind: "ok",
    toExport: candidates.filter((c) => !knownCourseIsJizentouroku(c)),
    jizentouroku,
  };
}

export type AkikoMoveCourseDst = "wont-take" | "might-take";

export type AkikoMoveCourseResult =
  | undefined
  | "no-such-course"
  | "course-taken"
  | "course-does-not-move";

export function akikoMoveCourse(
  akiko: Akiko,
  courseId: CourseId,
  dst: AkikoMoveCourseDst,
): AkikoMoveCourseResult {
  const pos = akiko.coursePositions.get(courseId);
  if (pos === undefined) return "no-such-course";
  if (pos.listKind === "taken") return "course-taken";
  if (pos.listKind === dst) return "course-does-not-move";
  pos.listKind = dst;
}
