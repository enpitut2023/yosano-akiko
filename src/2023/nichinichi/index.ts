import cellIdToRect from "./cell-id-to-rect.json";
import { KnownCourse } from "@/akiko";
import { setup } from "@/app";
import { courses } from "@/current-courses.js";
import {
  classifyKnownCourses,
  classifyRealCourses,
  classifyFakeCourses,
  creditRequirementsNormal,
  Specialty,
} from "@/requirements/nichinichi-since-2023";

const YEAR = 2023;
const SPECIALTY: Specialty = "normal";

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: creditRequirementsNormal,
  major: "nichinichi",
  requirementsTableYear: YEAR,
  cellIdToRectRecord: cellIdToRect,
  classifyKnownCourses: (cs, opts) =>
    classifyKnownCourses(cs, opts, YEAR, SPECIALTY),
  classifyRealCourses: (cs, opts) =>
    classifyRealCourses(cs, opts, YEAR, SPECIALTY),
  classifyFakeCourses: (cs, opts) =>
    classifyFakeCourses(cs, opts, YEAR, SPECIALTY),
});
