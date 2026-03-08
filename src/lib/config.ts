import type {
  KnownCourse,
  CourseId,
  RealCourse,
  FakeCourse,
  FakeCourseId,
  CellId,
} from "./akiko";
import type { ClassifyOptions } from "./app-setup";
import { courses } from "./current-courses.js";

export type Config = {
  knownCourses: KnownCourse[];
  knownCourseYear: number;
  creditRequirements: any;
  major: string;
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

export async function getConfig(year: string, major: string): Promise<Config> {
  const y = parseInt(year);
  let req: any;
  let specialty: string | undefined;

  if (major.startsWith("coins") && y >= 2023) {
    req = await import("./requirements/coins-since-2023");
    specialty =
      major === "coins" ? "scs" : major === "coins-cs" ? "cs" : "mimt";
  } else if (major.startsWith("klis")) {
    req = await import("./requirements/klis-since-2023");
    specialty =
      major === "klis-science"
        ? "science"
        : major === "klis-system"
          ? "system"
          : "rm";
  } else if (major === "mast" && y >= 2023) {
    req = await import("./requirements/mast-since-2023");
  } else if (major === "math" && y >= 2023) {
    req = await import("./requirements/math-since-2023");
  } else if (major === "physics" && y >= 2023) {
    req = await import("./requirements/physics-since-2023");
  } else if (major.startsWith("esys") && y >= 2023) {
    req = await import("./requirements/esys-since-2023");
    specialty = major === "esys-ies" ? "ies" : "eme";
  } else if (major.startsWith("coens") && y >= 2023) {
    req = await import("./requirements/coens-since-2023");
    specialty =
      major === "coens-ap"
        ? "ap"
        : major === "coens-eqe"
          ? "eqe"
          : major === "coens-mse"
            ? "mse"
            : "mme";
  } else if (major.startsWith("pops") && y >= 2023) {
    req = await import("./requirements/pops-since-2023");
    specialty =
      major === "pops-ses" ? "ses" : major === "pops-mse" ? "mse" : "urp";
  } else if (major === "chem" && y >= 2023) {
    req = await import("./requirements/chem-since-2023");
  } else if (major.startsWith("jpjp") && y >= 2023) {
    req = await import("./requirements/jpjp-since-2023");
    specialty = major === "jpjp" ? "jpjp" : "jltt";
  } else if (major === "ccc" && y >= 2023) {
    req = await import("./requirements/ccc-since-2023");
  } else if (major.startsWith("earth") && y >= 2023) {
    req = await import("./requirements/earth-since-2023");
    specialty = major === "earth-gs" ? "gs" : "ees";
  } else if (major === "edu" && y >= 2023) {
    req = await import("./requirements/edu-since-2023");
  } else if (major === "psy" && y >= 2023) {
    req = await import("./requirements/psy-since-2023");
  } else if (major === "ds" && y >= 2023) {
    req = await import("./requirements/ds-since-2023");
  } else if (major.startsWith("cis") && y >= 2023) {
    req = await import("./requirements/cis-since-2023");
    specialty = major === "cis-ir" ? "ir" : "id";
  } else if (major === "pe" && y >= 2023) {
    req = await import("./requirements/pe-since-2023");
  } else if (major.startsWith("meds") && y >= 2023) {
    req = await import("./requirements/meds-since-2023");
    specialty =
      major === "meds-ms" ? "ms" : major === "meds-ims" ? "ims" : "mspis";
  } else if (major.startsWith("bres") && y >= 2023) {
    req = await import("./requirements/bres-since-2023");
    specialty = major === "bres" ? "bres" : "as";
  } else {
    // Default or fallback
    req = await import("./requirements/coins-since-2023");
    specialty = "scs";
  }

  let rects: any;
  try {
    rects = await import(`./${year}/${major}/cell-id-to-rect.json`);
  } catch (e) {
    rects = await import(`./2023/coins/cell-id-to-rect.json`);
  }

  const creditRequirements = req.creditRequirements ||
    (y >= 2025
      ? req.creditRequirementsSince2025
      : req.creditRequirementsSince2023) ||
    req.creditRequirementsSince2023 ||
    req.creditRequirementsSince2025 || {
      cells: {},
      columns: {},
      compulsory: 0,
      elective: 0,
    };

  // Capture current values for closures
  const currentSpecialty = specialty;
  const currentReq = req;

  return {
    knownCourses: (courses as any) || [],
    knownCourseYear: 2025,
    creditRequirements,
    major,
    requirementsTableYear: y,
    cellIdToRectRecord: rects.default,
    classifyKnownCourses: (cs, opts) => {
      try {
        if (
          major.startsWith("klis") ||
          major.startsWith("mast") ||
          major.startsWith("math") ||
          major.startsWith("physics") ||
          major.startsWith("chem") ||
          major.startsWith("esys") ||
          major.startsWith("coens") ||
          major.startsWith("pops") ||
          major.startsWith("jpjp") ||
          major.startsWith("earth") ||
          major.startsWith("edu") ||
          major.startsWith("psy") ||
          major.startsWith("ds") ||
          major.startsWith("cis") ||
          major.startsWith("pe") ||
          major.startsWith("meds") ||
          major.startsWith("bres")
        ) {
          return currentReq.classifyKnownCourses(cs, opts, y, currentSpecialty);
        }
        return currentReq.classifyKnownCourses(cs, opts, currentSpecialty);
      } catch (e) {
        return new Map();
      }
    },
    classifyRealCourses: (cs, opts) => {
      try {
        if (
          major.startsWith("klis") ||
          major.startsWith("mast") ||
          major.startsWith("math") ||
          major.startsWith("physics") ||
          major.startsWith("chem") ||
          major.startsWith("esys") ||
          major.startsWith("coens") ||
          major.startsWith("pops") ||
          major.startsWith("jpjp") ||
          major.startsWith("earth") ||
          major.startsWith("edu") ||
          major.startsWith("psy") ||
          major.startsWith("ds") ||
          major.startsWith("cis") ||
          major.startsWith("pe") ||
          major.startsWith("meds") ||
          major.startsWith("bres")
        ) {
          return currentReq.classifyRealCourses(cs, opts, y, currentSpecialty);
        }
        return currentReq.classifyRealCourses(cs, opts, currentSpecialty);
      } catch (e) {
        return new Map();
      }
    },
    classifyFakeCourses: (cs, opts) => {
      try {
        if (
          major.startsWith("klis") ||
          major.startsWith("mast") ||
          major.startsWith("math") ||
          major.startsWith("physics") ||
          major.startsWith("chem") ||
          major.startsWith("esys") ||
          major.startsWith("coens") ||
          major.startsWith("pops") ||
          major.startsWith("jpjp") ||
          major.startsWith("earth") ||
          major.startsWith("edu") ||
          major.startsWith("psy") ||
          major.startsWith("ds") ||
          major.startsWith("cis") ||
          major.startsWith("pe") ||
          major.startsWith("meds") ||
          major.startsWith("bres")
        ) {
          return currentReq.classifyFakeCourses(cs, opts, y, currentSpecialty);
        }
        return currentReq.classifyFakeCourses(cs, opts, currentSpecialty);
      } catch (e) {
        return new Map();
      }
    },
    getRemark: currentReq.getRemark,
    tableViewBox: currentReq.tableViewBox,
  };
}
