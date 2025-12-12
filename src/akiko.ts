import { assert, unreachable } from "./util";

declare const nominalIdentifier: unique symbol;
type Nominal<T, Identifier> = T & { [nominalIdentifier]: Identifier };

export type CellId = Nominal<string, "CellId">;
export type ColumnId = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";

export function isCellId(s: string): s is CellId {
  return /^[a-h]\d+$/.test(s);
}

export function cellIdToColumnId(id: CellId): ColumnId {
  return id[0] as ColumnId;
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
  return Number.isSafeInteger(n) && n >= 0;
}

let nextFakeCourseId = 0;
export function fakeCourseIdNewUnique(): FakeCourseId {
  const id = nextFakeCourseId;
  nextFakeCourseId++;
  assert(isFakeCourseId(id));
  return id;
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

export type KnownCourse = {
  id: CourseId;
  name: string;
  credit: number | undefined;
  expects: string;
  term: string;
  when: string;
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

export type CellCreditRequirements = { min: number; max: number | undefined };
export type ColumnCreditRequirements = { min: number; max: number };
export type CreditRequirements = {
  cells: Map<CellId, CellCreditRequirements>;
  columns: Map<ColumnId, ColumnCreditRequirements>;
  compulsoryMin: number;
  electiveMin: number;
};

type BaseCreditStats = {
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
    overflowTaken: rawTaken - effectiveTotal,
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
  knownCourses: Map<CourseId, KnownCourse>,
  realCourses: Map<CourseId, RealCourse>,
  fakeCourses: Map<FakeCourseId, FakeCourse>,
  mightTakeCourseIds: CourseId[],
  courseIdToCellId: Map<CourseId, CellId>,
  realCoursePositions: Map<CourseId, CellId>,
  fakeCoursePositions: Map<FakeCourseId, CellId>,
  creditRequirements: CreditRequirements,
): Akiko | undefined {
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

function akikoGetCourseCredit(akiko: Akiko, id: CourseId): number | undefined {
  return (akiko.knownCourses.get(id) ?? akiko.realCourses.get(id))?.credit;
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
      rawMightTake += akikoGetCourseCredit(akiko, id) ?? 0;
    }
    let rawTaken = 0;
    for (const id of cellIdToTakenIds.get(cellId) ?? []) {
      rawTaken += akikoGetCourseCredit(akiko, id) ?? 0;
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
    if (listKind === "might-take") {
      res.push(id);
    }
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
