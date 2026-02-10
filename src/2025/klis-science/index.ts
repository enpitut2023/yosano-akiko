import { KnownCourse } from "@/akiko";
import {
  Specialty,
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  creditRequirements,
} from "@/requirements/klis-since-2023";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRect from "./cell-id-to-rect.json";

const YEAR = 2024;
const SPECIALTY: Specialty = "science";

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: creditRequirements,
  major: "klis-science",
  requirementsTableYear: YEAR,
  cellIdToRectRecord: cellIdToRect,
  classifyKnownCourses: (cs, opts) =>
    classifyKnownCourses(cs, opts, YEAR, SPECIALTY),
  classifyRealCourses: (cs, opts) =>
    classifyRealCourses(cs, opts, YEAR, SPECIALTY),
  classifyFakeCourses: (cs, opts) =>
    classifyFakeCourses(cs, opts, YEAR, SPECIALTY),
});
