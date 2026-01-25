import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRect from "./cell-id-to-rect.json";
import { KnownCourse } from "@/akiko";
import {
  classifyFakeCourses,
  classifyKnownCourses,
  classifyRealCourses,
  creditRequirements2023,
  Specialty,
} from "@/requirements/coens-since2023";

const YEAR = 2023;
const SPECIALTY: Specialty = "eqe";

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: creditRequirements2023,
  major: "coens-eqe",
  requirementsTableYear: YEAR,
  cellIdToRectRecord: cellIdToRect,
  classifyKnownCourses: (cs, opts) =>
    classifyKnownCourses(cs, opts, YEAR, SPECIALTY),
  classifyRealCourses: (cs, opts) =>
    classifyRealCourses(cs, opts, YEAR, SPECIALTY),
  classifyFakeCourses: (cs, opts) =>
    classifyFakeCourses(cs, opts, YEAR, SPECIALTY),
});
