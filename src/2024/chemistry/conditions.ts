import { CourseId, FakeCourseId, KnownCourse } from "../../akiko";
import { SetupCreditRequirements } from "../../app-setup";
import { isGakushikiban } from "../../conditions/common";

export function classifyKnownCourses(cs: KnownCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    // TODO
  }
  return courseIdToCellId;
}

export function classifyRealCourses(): Map<CourseId, string> {
  return new Map<CourseId, string>();
}

export function classifyFakeCourses(): Map<FakeCourseId, string> {
  return new Map<FakeCourseId, string>();
}

export const creditRequirements: SetupCreditRequirements = {
  cells: {},
  columns: {},
  compulsory: 0, // TODO
  elective: 0, // TODO
};
