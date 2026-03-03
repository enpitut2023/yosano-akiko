import { KnownCourse } from "@/akiko";
import { setup } from "@/app";
import { courses } from "@/current-courses.js";
import {
  Specialty,
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  creditRequirementsMed2MedNew2Since2023,
} from "@/requirements/med-since-2023";
import cellIdToRect from "./cell-id-to-rect.json";

const YEAR = 2023;
const SPECIALTY: Specialty = "med-2-new";

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: creditRequirementsMed2MedNew2Since2023,
  major: "med-2-new",
  requirementsTableYear: YEAR,
  cellIdToRectRecord: cellIdToRect,
  classifyKnownCourses: (cs, opts) =>
    classifyKnownCourses(cs, opts, YEAR, SPECIALTY),
  classifyRealCourses: (cs, opts) =>
    classifyRealCourses(cs, opts, YEAR, SPECIALTY),
  classifyFakeCourses: (cs, opts) =>
    classifyFakeCourses(cs, opts, YEAR, SPECIALTY),
});
