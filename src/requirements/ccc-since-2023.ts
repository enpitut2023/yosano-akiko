import {
  CourseId,
  FakeCourse,
  FakeCourseId,
  KnownCourse,
  RealCourse,
} from "@/akiko";
import { ClassifyOptions, SetupCreditRequirements } from "@/app-setup";
import {
  isArt,
  isCompulsoryEnglishByName,
  isCompulsoryPe1,
  isCompulsoryPe2,
  isDataScience,
  isElectivePe,
  isFirstYearSeminar,
  isForeignLanguage,
  isGakushikiban,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
  isJapanese,
  isKyoushoku,
  isKyoutsuu,
} from "@/requirements/common";

type Mode = "known" | "real";

// TODO: ここにisA1みたいな関数を作っていこう

function classify(
  id: CourseId,
  name: string,
  mode: Mode,
  isNative: boolean,
): string | undefined {
  // 必修
  // TODO: 必修科目のマスのチェック
  // 選択
  // TODO: 選択科目のマスのチェック
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
  tableYear: number,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, "known", opts.isNative);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  opts: ClassifyOptions,
  tableYear: number,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, "real", opts.isNative);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  _cs: FakeCourse[],
  _opts: ClassifyOptions,
  tableYear: number,
): Map<FakeCourseId, string> {
  // 一旦このまま置いておく
  return new Map();
}

export const creditRequirements: SetupCreditRequirements = {
  cells: {
    // TODO
  },
  columns: {
    // TODO
  },
  compulsory: 0, // TODO
  elective: 0, // TODO
};
