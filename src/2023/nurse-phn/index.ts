import { KnownCourse } from "@/akiko";
import {
  Specialty,
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  creditRequirementsPhn,
} from "@/requirements/nurse-since-2023";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRect from "./cell-id-to-rect.json";

const YEAR = 2023;
const SPECIALTY: Specialty = "nurse-phn";

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: creditRequirementsPhn,
  major: "nurse-phn",
  requirementsTableYear: YEAR,
  cellIdToRectRecord: cellIdToRect,
  classifyKnownCourses: (cs, opts) =>
    classifyKnownCourses(cs, opts, YEAR, SPECIALTY),
  classifyRealCourses: (cs, opts) =>
    classifyRealCourses(cs, opts, YEAR, SPECIALTY),
  classifyFakeCourses: (cs, opts) =>
    classifyFakeCourses(cs, opts, YEAR, SPECIALTY),
});
