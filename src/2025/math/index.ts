import cellIdToRect from "./cell-id-to-rect.json";
import { KnownCourse } from "@/akiko";
import { setup } from "@/app";
import { courses } from "@/current-courses.js";
import {
  classifyKnownCourses,
  classifyRealCourses,
  classifyFakeCourses,
  creditRequirements,
} from "@/requirements/math-since-2024";

const YEAR = 2025;

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements,
  major: "math",
  requirementsTableYear: YEAR,
  cellIdToRectRecord: cellIdToRect,
  classifyKnownCourses: (cs, opts) => classifyKnownCourses(cs, opts, YEAR),
  classifyRealCourses: (cs, opts) => classifyRealCourses(cs, opts, YEAR),
  classifyFakeCourses: (cs, opts) => classifyFakeCourses(cs, opts, YEAR),
});
