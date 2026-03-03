import {
  CellId,
  CourseId,
  CreditRequirements,
  FakeCourse,
  FakeCourseId,
  KnownCourse,
  RealCourse,
  isCellId,
  isColumnId,
} from "./akiko";
import { assert } from "./util";

type Rect = { x: number; y: number; width: number; height: number };

export type ClassifyOptions = { isNative: boolean };

export type SetupCreditRequirements = {
  cells: Record<string, { min: number; max: number | undefined }>;
  columns: Record<string, { min: number; max: number }>;
  compulsory: number;
  elective: number;
};

export function createCreditRequirementsOrFail(
  s: SetupCreditRequirements,
): CreditRequirements {
  const req: CreditRequirements = {
    cells: new Map(),
    columns: new Map(),
    compulsoryMin: s.compulsory,
    electiveMin: s.elective,
  };
  for (const [id, cell] of Object.entries(s.cells)) {
    assert(isCellId(id), `Bad cell id: "${id}"`);
    req.cells.set(id, cell);
  }
  for (const [id, col] of Object.entries(s.columns)) {
    assert(isColumnId(id), `Bad column id: "${id}"`);
    req.columns.set(id, col);
  }
  return req;
}

export type ClassifyKnownCourses = (
  cs: KnownCourse[],
  opts: ClassifyOptions,
) => Map<CourseId, string>;

export type ClassifyRealCourses = (
  cs: RealCourse[],
  opts: ClassifyOptions,
) => Map<CourseId, string>;

export type ClassifyFakeCourses = (
  cs: FakeCourse[],
  opts: ClassifyOptions,
) => Map<FakeCourseId, string>;

export function classifyCoursesOrFail(
  knownCourses: KnownCourse[],
  realCourses: RealCourse[],
  fakeCourses: FakeCourse[],
  isNative: boolean,
  classifyKnownCourses: ClassifyKnownCourses,
  classifyRealCourses: ClassifyRealCourses,
  classifyFakeCourses: ClassifyFakeCourses,
): {
  courseIdToCellId: Map<CourseId, CellId>;
  realCoursePositions: Map<CourseId, CellId>;
  fakeCoursePositions: Map<FakeCourseId, CellId>;
} {
  const courseIdToCellId = new Map<CourseId, CellId>();
  const realCoursePositions = new Map<CourseId, CellId>();
  const fakeCoursePositions = new Map<FakeCourseId, CellId>();

  const classifyOptions: ClassifyOptions = { isNative };
  for (const [courseId, cellId] of classifyKnownCourses(
    knownCourses,
    classifyOptions,
  )) {
    assert(isCellId(cellId), `Bad cell id: "${cellId}"`);
    courseIdToCellId.set(courseId, cellId);
  }
  for (const [courseId, cellId] of classifyRealCourses(
    realCourses,
    classifyOptions,
  )) {
    assert(isCellId(cellId), `Bad cell id: "${cellId}"`);
    realCoursePositions.set(courseId, cellId);
  }
  for (const [fakeCourseId, cellId] of classifyFakeCourses(
    fakeCourses,
    classifyOptions,
  )) {
    assert(isCellId(cellId), `Bad cell id: "${cellId}"`);
    fakeCoursePositions.set(fakeCourseId, cellId);
  }

  return { courseIdToCellId, realCoursePositions, fakeCoursePositions };
}

export type SetupParams = {
  knownCourses: KnownCourse[];
  knownCourseYear: number;
  creditRequirements: SetupCreditRequirements;
  major: string;
  requirementsTableYear: number;
  cellIdToRectRecord: Record<string, Rect>;
  tableViewBox?: Rect;
  classifyKnownCourses: (
    cs: KnownCourse[],
    opts: ClassifyOptions,
  ) => Map<CourseId, string>;
  classifyRealCourses: (
    cs: RealCourse[],
    opts: ClassifyOptions,
  ) => Map<CourseId, string>;
  classifyFakeCourses: (
    cs: FakeCourse[],
    opts: ClassifyOptions,
  ) => Map<FakeCourseId, string>;
};
