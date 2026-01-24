import {
  CourseId,
  FakeCourse,
  FakeCourseId,
  KnownCourse,
  RealCourse,
} from "../../akiko";
import { ClassifyOptions, SetupCreditRequirements } from "../../app-setup";
import { isGakushikiban } from "@/requirements/common";

export function classifyKnownCourses(cs: KnownCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    // TODO: 授業振り分け
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  opts: ClassifyOptions,
): Map<CourseId, string> {
  return new Map();
}

export function classifyFakeCourses(
  cs: FakeCourse[],
): Map<FakeCourseId, string> {
  return new Map();
}

export const creditRequirements: SetupCreditRequirements = {
  cells: {
    // TODO: 各マスの合計単位
  },
  columns: {
    // TODO: 各列の合計単位
  },
  compulsory: 0, // TODO: 必修の合計単位
  elective: 0, // TODO: 選択の合計単位
};
