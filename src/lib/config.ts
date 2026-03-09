import type {
  KnownCourse,
  CourseId,
  RealCourse,
  FakeCourse,
  FakeCourseId,
  CellId,
} from "./akiko";
import type { ClassifyOptions, SetupCreditRequirements } from "./app-setup";
import { type Major } from "./constants";
import { courses } from "./current-courses.js";
import { assert } from "./util.js";

export type Config = {
  knownCourses: KnownCourse[];
  knownCourseYear: number;
  getCreditRequirements: (
    tableYear: number,
    major: Major,
  ) => SetupCreditRequirements;
  major: Major;
  requirementsTableYear: number;
  cellIdToRectRecord: Record<string, any>;
  classifyKnownCourses: (
    cs: KnownCourse[],
    opts: ClassifyOptions,
  ) => Map<CourseId, string>;
  classifyRealCourses: (
    cs: RealCourse[],
    opts: ClassifyOptions,
  ) => Map<CourseId, string>;
  classifyFakeCourses: (
    cs: FakeCourse[],
    opts: ClassifyOptions,
  ) => Map<FakeCourseId, string>;
  getRemark?: (
    cellId: CellId,
    tableYear: number,
    major: Major,
  ) => string | undefined;
  tableViewBox?: any;
  docsPageName?: string;
};

export async function getConfig(
  tableYear: number,
  major: Major,
): Promise<Config> {
  assert(tableYear >= 2021);

  let req: any;
  if (major.startsWith("coins")) {
    req = await import("./requirements/coins-since-2021");
  } else if (major.startsWith("klis")) {
    req = await import("./requirements/klis-since-2023");
  } else if (major === "mast") {
    req = await import("./requirements/mast-since-2021");
  } else if (major === "math") {
    req = await import("./requirements/math-since-2023");
  } else if (major === "physics") {
    req = await import("./requirements/physics-since-2023");
  } else if (major.startsWith("esys")) {
    req = await import("./requirements/esys-since-2023");
  } else if (major.startsWith("coens")) {
    req = await import("./requirements/coens-since-2023");
  } else if (major.startsWith("pops")) {
    req = await import("./requirements/pops-since-2023");
  } else if (major === "chem") {
    req = await import("./requirements/chem-since-2023");
  } else if (major.startsWith("jpjp")) {
    req = await import("./requirements/jpjp-since-2023");
  } else if (major === "ccc") {
    req = await import("./requirements/ccc-since-2023");
  } else if (major.startsWith("earth")) {
    req = await import("./requirements/earth-since-2023");
  } else if (major === "edu") {
    req = await import("./requirements/edu-since-2023");
  } else if (major === "psy") {
    req = await import("./requirements/psy-since-2023");
  } else if (major === "ds") {
    req = await import("./requirements/ds-since-2023");
  } else if (major.startsWith("cis")) {
    req = await import("./requirements/cis-since-2023");
  } else if (major === "pe") {
    req = await import("./requirements/pe-since-2023");
  } else if (major.startsWith("meds")) {
    req = await import("./requirements/meds-since-2023");
  } else if (major.startsWith("bres")) {
    req = await import("./requirements/bres-since-2023");
  } else {
    throw new Error();
  }

  let rects: any;
  rects = await import(`./${tableYear}/${major}/cell-id-to-rect.json`);

  // Capture current values for closures
  const currentReq = req;

  return {
    knownCourses: courses as KnownCourse[],
    knownCourseYear: 2025,
    getCreditRequirements: currentReq.getCreditRequirements,
    major,
    requirementsTableYear: tableYear,
    cellIdToRectRecord: rects.default,
    classifyKnownCourses: currentReq.classifyKnownCourses,
    classifyRealCourses: currentReq.classifyRealCourses,
    classifyFakeCourses: currentReq.classifyFakeCourses,
    getRemark: currentReq.getRemark,
    tableViewBox: currentReq.tableViewBox,
  };
}
