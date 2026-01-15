import {
  KnownCourse,
  CourseId,
  RealCourse,
  FakeCourse,
  FakeCourseId,
} from "./akiko";

type Rect = { x: number; y: number; width: number; height: number };

export type ClassifyOptions = { isNative: boolean };

export type SetupCreditRequirements = {
  cells: Record<string, { min: number; max: number | undefined }>;
  columns: Record<string, { min: number; max: number }>;
  compulsory: number;
  elective: number;
};

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
