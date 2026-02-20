import { KnownCourse } from "@/akiko";
import { setup } from "@/app";
import { courses } from "@/current-courses.js";
import {
  Specialty,
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  creditRequirementsJapanExpert,
} from "@/requirements/jpjp-since-2023";
import cellIdToRect from "./cell-id-to-rect.json";

const YEAR = 2025;
const SPECIALTY: Specialty = "japan-expert";

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: creditRequirementsJapanExpert,
  major: "jpjp-jltt",
  requirementsTableYear: YEAR,
  cellIdToRectRecord: cellIdToRect,
  classifyKnownCourses: (cs, opts) =>
    classifyKnownCourses(cs, opts, YEAR, SPECIALTY),
  classifyRealCourses: (cs, opts) =>
    classifyRealCourses(cs, opts, YEAR, SPECIALTY),
  classifyFakeCourses: (cs, opts) =>
    classifyFakeCourses(cs, opts, YEAR, SPECIALTY),
});
