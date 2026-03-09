import { KnownCourse } from "@/akiko";
import {
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  creditRequirementsSince2024,
} from "@/requirements/earth-les-since-2024";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRect from "./cell-id-to-rect.json";

const YEAR = 2025;

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: creditRequirementsSince2024,
  major: "earth-les",
  requirementsTableYear: YEAR,
  cellIdToRectRecord: cellIdToRect,
  classifyKnownCourses: (cs, opts) => classifyKnownCourses(cs, opts, YEAR),
  classifyRealCourses: (cs, opts) => classifyRealCourses(cs, opts, YEAR),
  classifyFakeCourses: (cs, opts) => classifyFakeCourses(cs, opts, YEAR),
});
