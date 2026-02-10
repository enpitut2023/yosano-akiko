import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRectRecord from "./cell-id-to-rect.json";
import { KnownCourse } from "@/akiko";
import {
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  creditRequirements,
  Specialty,
} from "@/requirements/coins-since-2023";

const YEAR = 2024;
const SPECIALTY: Specialty = "mimt";

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: creditRequirements,
  major: "coins-mimt",
  requirementsTableYear: YEAR,
  cellIdToRectRecord,
  classifyKnownCourses: (cs, opts) => classifyKnownCourses(cs, opts, SPECIALTY),
  classifyRealCourses: (cs, opts) => classifyRealCourses(cs, opts, SPECIALTY),
  classifyFakeCourses: (cs, opts) => classifyFakeCourses(cs, opts, SPECIALTY),
});
