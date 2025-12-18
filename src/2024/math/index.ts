import { CourseId, FakeCourseId, KnownCourse } from "../../akiko";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRect from "./cell-id-to-rect.json";
import tableViewBox from "./table-view-box.json";

function classifyKnownCourses(cs: KnownCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    // TODO
  }
  return courseIdToCellId;
}

function classifyRealCourses(): Map<CourseId, string> {
  return new Map<CourseId, string>();
}

function classifyFakeCourses(): Map<FakeCourseId, string> {
  return new Map<FakeCourseId, string>();
}

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: {
    cells: {},
    columns: {},
    compulsory: 0, // TODO
    elective: 0, // TODO
  },
  major: "math",
  requirementsTableYear: 2024,
  cellIdToRectRecord: cellIdToRect,
  tableViewBox,
  classifyKnownCourses,
  classifyRealCourses,
  classifyFakeCourses,
});
