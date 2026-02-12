import { KnownCourse } from "@/akiko";
import {
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  creditRequirements,
} from "@/requirements/ccc-since-2023";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRectRecord from "./cell-id-to-rect.json";

const YEAR = 2025;

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: creditRequirements,
  major: "ccc",
  requirementsTableYear: YEAR,
  cellIdToRectRecord,
  classifyKnownCourses: (cs, opts) => classifyKnownCourses(cs, opts, YEAR),
  classifyRealCourses: (cs, opts) => classifyRealCourses(cs, opts, YEAR),
  classifyFakeCourses: (cs, opts) => classifyFakeCourses(cs, opts, YEAR),
});
