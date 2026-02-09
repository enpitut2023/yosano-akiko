import {
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  creditRequirementsSince2023,
} from "@/requirements/mast-since-2023";
import { KnownCourse } from "../../akiko";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRectRecord from "./cell-id-to-rect.json";

const YEAR = 2023;

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: creditRequirementsSince2023,
  major: "mast",
  requirementsTableYear: YEAR,
  cellIdToRectRecord,
  classifyKnownCourses: (cs, opts) => classifyKnownCourses(cs, opts, YEAR),
  classifyRealCourses: (cs, opts) => classifyRealCourses(cs, opts, YEAR),
  classifyFakeCourses: (cs, opts) => classifyFakeCourses(cs, opts, YEAR),
});
