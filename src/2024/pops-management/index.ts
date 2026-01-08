import { KnownCourse } from "../../akiko";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRect from "./cell-id-to-rect.json";
import {
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  creditRequirements,
} from "./conditions";

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements,
  major: "pops-management",
  requirementsTableYear: 2024,
  cellIdToRectRecord: cellIdToRect,
  classifyKnownCourses,
  classifyRealCourses,
  classifyFakeCourses,
});
