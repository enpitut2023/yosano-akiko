import {
  creditRequirements,
  classifyKnownCourses,
  classifyRealCourses,
  classifyFakeCourses,
} from "../../2023/coins/conditions";
import { KnownCourse } from "../../akiko";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRectRecord from "./cell-id-to-rect.json";

// 2023年度と同じ
setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements,
  major: "coins",
  requirementsTableYear: 2025,
  cellIdToRectRecord,
  classifyKnownCourses,
  classifyRealCourses,
  classifyFakeCourses,
});
