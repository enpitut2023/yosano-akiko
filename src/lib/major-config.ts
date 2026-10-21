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

type RequirementsModule = Pick<
  MajorConfig,
  | "getCreditRequirements"
  | "classifyKnownCourses"
  | "classifyRealCourses"
  | "classifyFakeCourses"
  | "getRemark"
>;

/**
 * Imported lazily so each major page bundles only its own requirements module.
 * `undefined` marks a major with no requirements module yet.
 */
const MAJOR_TO_REQUIREMENTS = {
  "help-p": () => import("./requirements/help-since-2023"),
  "help-h": () => import("./requirements/help-since-2023"),
  "help-af": () => import("./requirements/help-since-2023"),
  "help-l": () => import("./requirements/help-since-2023"),
  ccc: () => import("./requirements/ccc-since-2023"),
  jpjp: () => import("./requirements/jpjp-since-2023"),
  "jpjp-jltt": () => import("./requirements/jpjp-since-2023"),
  "css-s": () => import("./requirements/css-since-2023"),
  "css-l": () => import("./requirements/css-since-2023"),
  "css-ps": () => import("./requirements/css-since-2023"),
  "css-e": () => import("./requirements/css-since-2023"),
  "cis-ir": () => import("./requirements/cis-since-2023"),
  "cis-id": () => import("./requirements/cis-since-2023"),
  edu: () => import("./requirements/edu-since-2023"),
  psy: () => import("./requirements/psy-since-2023"),
  ds: () => import("./requirements/ds-since-2023"),
  biol: undefined,
  bres: () => import("./requirements/bres-since-2023"),
  "bres-as": () => import("./requirements/bres-since-2023"),
  "bres-les": () => import("./requirements/bres-les-since-2023"),
  "earth-gs": () => import("./requirements/earth-since-2023"),
  "earth-ees": () => import("./requirements/earth-since-2023"),
  "earth-les": () => import("./requirements/earth-les-since-2024"),
  math: () => import("./requirements/math-since-2023"),
  physics: () => import("./requirements/physics-since-2023"),
  chem: () => import("./requirements/chem-since-2023"),
  "coens-ap": () => import("./requirements/coens-since-2023"),
  "coens-eqe": () => import("./requirements/coens-since-2023"),
  "coens-mse": () => import("./requirements/coens-since-2023"),
  "coens-mme": () => import("./requirements/coens-since-2023"),
  "esys-ies": () => import("./requirements/esys-since-2023"),
  "esys-eme": () => import("./requirements/esys-since-2023"),
  "pops-ses": () => import("./requirements/pops-since-2023"),
  "pops-mse": () => import("./requirements/pops-since-2023"),
  "pops-urp": () => import("./requirements/pops-since-2023"),
  coins: () => import("./requirements/coins-since-2021"),
  "coins-cs": () => import("./requirements/coins-since-2021"),
  "coins-mimt": () => import("./requirements/coins-since-2021"),
  mast: () => import("./requirements/mast-since-2021"),
  "klis-science": () => import("./requirements/klis-since-2023"),
  "klis-system": () => import("./requirements/klis-since-2023"),
  "klis-rm": () => import("./requirements/klis-since-2023"),
  med: () => import("./requirements/med-since-2023"),
  "med-new": () => import("./requirements/med-since-2023"),
  "med-2": () => import("./requirements/med-since-2023"),
  "med-2-new": () => import("./requirements/med-since-2023"),
  "nurse-n": () => import("./requirements/nurse-since-2023"),
  "nurse-phn": () => import("./requirements/nurse-since-2023"),
  "nurse-h": () => import("./requirements/nurse-since-2023"),
  "meds-ms": () => import("./requirements/meds-since-2023"),
  "meds-ims": () => import("./requirements/meds-since-2023"),
  "meds-mspis": () => import("./requirements/meds-since-2023"),
  pe: () => import("./requirements/pe-since-2023"),
  art: () => import("./requirements/art-since-2023"),
  "art-jad": () => import("./requirements/art-since-2023"),
} as const satisfies {
  [K in Major]: (() => Promise<RequirementsModule>) | undefined;
};

export async function getMajorConfig(
  tableYear: number,
  major: Major,
  fetch: typeof globalThis.fetch,
): Promise<MajorConfig> {
  assert(tableYear >= 2021);

  const loadRequirements = MAJOR_TO_REQUIREMENTS[major];
  if (loadRequirements === undefined) {
    throw new Error(`No requirements for major: ${major}`);
  }
  const req: RequirementsModule = await loadRequirements();

  const rects = (await import(`./rects/${tableYear}/${major}.json`)) as {
    default: MajorConfig["cellIdToRectRecord"];
  };

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
