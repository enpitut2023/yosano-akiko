import type {
  KnownCourse,
  CourseId,
  RealCourse,
  FakeCourse,
  FakeCourseId,
  CellId,
} from "./akiko";
import type { ClassifyOptions } from "./app-setup";
import { type Major } from "./constants";
import { courses } from "./current-courses.js";
import { assert } from "./util.js";

export type Config = {
  knownCourses: KnownCourse[];
  knownCourseYear: number;
  creditRequirements: any;
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
  getRemark?: (cellId: CellId) => string | undefined;
  tableViewBox?: any;
  docsPageName?: string;
};

export async function getConfig(
  tableYear: number,
  major: Major,
): Promise<Config> {
  assert(tableYear >= 2023);

  let req: any;
  if (major.startsWith("coins")) {
    req = await import("./requirements/coins-since-2023");
  } else if (major.startsWith("klis")) {
    req = await import("./requirements/klis-since-2023");
  } else if (major === "mast") {
    req = await import("./requirements/mast-since-2023");
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

  const creditRequirements = req.creditRequirements ||
    (tableYear >= 2025
      ? req.creditRequirementsSince2025
      : req.creditRequirementsSince2023) ||
    req.creditRequirementsSince2023 ||
    req.creditRequirementsSince2025 || {
      cells: {},
      columns: {},
      compulsory: 0,
      elective: 0,
    };
  assert(
    !(creditRequirements.compulsory === 0 && creditRequirements.elective === 0),
  );

  // Capture current values for closures
  const currentReq = req;

  return {
    knownCourses: (courses as any) || [],
    knownCourseYear: 2025,
    creditRequirements,
    major,
    requirementsTableYear: tableYear,
    cellIdToRectRecord: rects.default,
    classifyKnownCourses: (cs, opts) => {
      return currentReq.classifyKnownCourses(cs, opts);
    },
    classifyRealCourses: (cs, opts) => {
      return currentReq.classifyRealCourses(cs, opts);
    },
    classifyFakeCourses: (cs, opts) => {
      return currentReq.classifyFakeCourses(cs, opts);
    },
    getRemark: currentReq.getRemark,
    tableViewBox: currentReq.tableViewBox,
  };
}
