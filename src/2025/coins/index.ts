import { KnownCourse } from "@/akiko";
import {
  Specialty,
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  creditRequirements,
} from "@/requirements/coins-since-2023";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRectRecord from "./cell-id-to-rect.json";

const YEAR = 2025;
const SPECIALTY: Specialty = "scs";

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: creditRequirements,
  major: "coins",
  requirementsTableYear: YEAR,
  cellIdToRectRecord,
  classifyKnownCourses: (cs, opts) => classifyKnownCourses(cs, opts, SPECIALTY),
  classifyRealCourses: (cs, opts) => classifyRealCourses(cs, opts, SPECIALTY),
  classifyFakeCourses: (cs, opts) => classifyFakeCourses(cs, opts, SPECIALTY),
});
