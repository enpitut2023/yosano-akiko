import {
  Specialty,
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  creditRequirementsMsSince2023,
} from "@/requirements/meds-since-2023";
import { KnownCourse } from "../../akiko";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRectRecord from "./cell-id-to-rect.json";

const YEAR = 2025;
const SPECIALTY: Specialty = "ms";

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: creditRequirementsMsSince2023,
  major: "meds-ms",
  requirementsTableYear: YEAR,
  cellIdToRectRecord,
  classifyKnownCourses: (cs, opts) =>
    classifyKnownCourses(cs, opts, YEAR, SPECIALTY),
  classifyRealCourses: (cs, opts) =>
    classifyRealCourses(cs, opts, YEAR, SPECIALTY),
  classifyFakeCourses: (cs, opts) =>
    classifyFakeCourses(cs, opts, YEAR, SPECIALTY),
});
