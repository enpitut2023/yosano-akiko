import { asset } from "$app/paths";
import { type MajorConfig } from "./app-setup";
import { type Major } from "./constants";
import { knownCourses, knownCourseYear } from "./current-courses";
import { assert, strictParseFloat } from "./util.js";

function findViewBox(
  svg: string,
): { width: number; height: number } | undefined {
  const match = /viewBox="(.*?)"/.exec(svg);
  if (!match) return undefined;
  const parts = match[1].trim().split(/\s+/).map(strictParseFloat);
  if (parts.length !== 4 || parts.some((p) => p === undefined))
    return undefined;
  const [x, y, width, height] = parts as number[];
  if (x !== 0 || y !== 0) return undefined;
  return { width, height };
}

export async function getMajorConfig(
  tableYear: number,
  major: Major,
  fetch: typeof globalThis.fetch,
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
  } else if (major === "earth-les") {
    req = await import("./requirements/earth-les-since-2024");
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
  } else if (major === "bres-les") {
    req = await import("./requirements/bres-les-since-2023");
  } else if (major.startsWith("bres")) {
    req = await import("./requirements/bres-since-2023");
  } else if (major.startsWith("nurse")) {
    req = await import("./requirements/nurse-since-2023");
  } else if (major.startsWith("art")) {
    req = await import("./requirements/art-since-2023");
  } else if (major.startsWith("css")) {
    req = await import("./requirements/css-since-2023");
  } else if (major.startsWith("help")) {
    req = await import("./requirements/help-since-2023");
  } else {
    throw new Error(`Bad major: ${major}`);
  }

  const rects = await import(`./rects/${tableYear}/${major}.json`);

  const svgUrl = asset(`/tables/${tableYear}/${major}.svg`);
  const svgResponse = await fetch(svgUrl);
  if (!svgResponse.ok) {
    throw new Error(`Failed to fetch ${svgUrl}: ${svgResponse.status}`);
  }
  const tableViewBox = findViewBox(await svgResponse.text());
  if (!tableViewBox) {
    throw new Error(`No valid viewBox found in ${svgUrl}`);
  }

  return {
    knownCourses,
    knownCourseYear,
    getCreditRequirements: req.getCreditRequirements,
    major,
    tableYear,
    cellIdToRectRecord: rects.default,
    tableViewBox,
    classifyKnownCourses: req.classifyKnownCourses,
    classifyRealCourses: req.classifyRealCourses,
    classifyFakeCourses: req.classifyFakeCourses,
    getRemark: req.getRemark,
  };
}
