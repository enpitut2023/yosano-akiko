import {
  Specialty,
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  creditRequirementsMse,
} from "@/requirements/pops-since-2023";
import { KnownCourse } from "../../akiko";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRect from "./cell-id-to-rect.json";

const YEAR = 2023;
const SPECIALTY: Specialty = "mse";

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: creditRequirementsMse,
  major: "pops-mse",
  requirementsTableYear: YEAR,
  cellIdToRectRecord: cellIdToRect,
  classifyKnownCourses: (cs, opts) =>
    classifyKnownCourses(cs, opts, YEAR, SPECIALTY),
  classifyRealCourses: (cs, opts) =>
    classifyRealCourses(cs, opts, YEAR, SPECIALTY),
  classifyFakeCourses: (cs, opts) =>
    classifyFakeCourses(cs, opts, YEAR, SPECIALTY),
});
