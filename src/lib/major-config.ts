import { type MajorConfig } from "./app-setup";
import { type Major } from "./constants";
import { knownCourses, knownCourseYear } from "./current-courses";
import { assert } from "./util.js";

export async function getMajorConfig(
  tableYear: number,
  major: Major,
): Promise<MajorConfig> {
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
  } else if (major.startsWith("med-") || major === "med") {
    req = await import("./requirements/med-since-2023");
  } else if (major.startsWith("meds")) {
    req = await import("./requirements/meds-since-2023");
  } else if (major.startsWith("bres")) {
    req = await import("./requirements/bres-since-2023");
  } else if (major.startsWith("nurse")) {
    req = await import("./requirements/nurse-since-2023");
  } else {
    throw new Error(`Bad major: ${major}`);
  }

  const rects = await import(`./${tableYear}/${major}/cell-id-to-rect.json`);

  return {
    knownCourses,
    knownCourseYear,
    getCreditRequirements: req.getCreditRequirements,
    major,
    tableYear: tableYear,
    cellIdToRectRecord: rects.default,
    classifyKnownCourses: req.classifyKnownCourses,
    classifyRealCourses: req.classifyRealCourses,
    classifyFakeCourses: req.classifyFakeCourses,
    getRemark: req.getRemark,
    tableViewBox: req.tableViewBox,
  };
}
