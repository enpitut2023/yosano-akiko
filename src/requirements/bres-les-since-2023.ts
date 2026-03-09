import {
  CourseId,
  FakeCourse,
  FakeCourseId,
  KnownCourse,
  RealCourse,
} from "@/akiko";
import { ClassifyOptions, SetupCreditRequirements } from "@/app-setup";
import {
  isArt,
  isCompulsoryEnglishByName,
  isCompulsoryPe1,
  isCompulsoryPe2,
  isDataScience,
  isElectivePe,
  isFirstYearSeminar,
  isForeignLanguage,
  isGakushikiban,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
} from "@/requirements/common";

type Mode = "known" | "real";

function isA1(id: string): boolean {
  return (
    // TODO: 研究演習I 研究演習II
    id === "EC51958" || // 卒業研究Ⅰ 2024,2025開講 2022年度以降入学者対象
    id === "EC51968" || // 卒業研究Ⅱ 2024,2025開講 2022年度以降入学者対象
    id === "EC51978" || // 卒業研究Ⅰ 2024,2025開講 2022年度以降入学者対象
    id === "EC51988" // 卒業研究Ⅱ 2024,2025開講 2022年度以降入学者対象
  );
}

function isB1(id: string): boolean {
  return id.startsWith("EG6");
}

function isB2(id: string): boolean {
  return (
    id.startsWith("EG9") ||
    id.startsWith("EC2") ||
    id.startsWith("EC3") ||
    id.startsWith("EC4") ||
    id.startsWith("BB") ||
    id.startsWith("EB") ||
    id.startsWith("EE") ||
    id.startsWith("FF") ||
    id.startsWith("FH") ||
    id === "BE22231"
  );
}

function isC1(id: string): boolean {
  return (
    id === "EC11212" || // 生物資源科学演習 2023,2024,2025開講 生物資源1クラス対象
    id === "EC11222" || // 生物資源科学演習 2023,2024開講 生物資源2クラス対象
    id === "EC11232" || // 生物資源科学演習 2023,2024開講 生物資源学類3クラス対象
    id === "EC11242" || // 生物資源科学演習 2023,2024開講 生物資源4クラス対象
    id === "EC11252" || // 生物資源科学演習 2023開講 生物資源5クラス対象
    id === "EC11262" // 生物資源科学演習 2023,2024,2025開講 総合学域群から生物資源学類に移行した学生に限る。
  );
}

function isD1(id: string): boolean {
  return (
    id.startsWith("EG02") ||
    id.startsWith("EG5") ||
    id.startsWith("EG7") ||
    id === "EB11151" ||
    id === "EB11351" ||
    id === "EB11651" ||
    id === "EB11751" ||
    id === "EB11851" ||
    id === "EB09103" ||
    id === "BE21861"
  );
}

function isE1(id: string, mode: Mode): boolean {
  return (
    id === "1110102" || // ファーストイヤーセミナー 2023,2024,2025開講 資源1クラス対象
    id === "1110202" || // ファーストイヤーセミナー 2023,2024,2025開講 資源2クラス対象
    id === "1110302" || // ファーストイヤーセミナー 2023,2024,2025開講 資源3クラス対象
    id === "1110402" || // ファーストイヤーセミナー 2023,2024,2025開講 資源4クラス対象
    id === "1110502" || // ファーストイヤーセミナー 2023開講 資源5クラス対象
    id === "1227291" || // 学問への誘い 2023,2024,2025開講 資源1クラス対象
    id === "1227301" || // 学問への誘い 2023,2024,2025開講 資源2クラス対象
    id === "1227311" || // 学問への誘い 2023,2024,2025開講 資源3クラス対象
    id === "1227321" || // 学問への誘い 2023,2024,2025開講 資源4クラス対象
    id === "1227331" || // 学問への誘い 2023開講 資源5クラス対象
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

function isE3(name: string): boolean {
  return isCompulsoryEnglishByName(name);
}

function isE4(id: string, mode: Mode): boolean {
  return (
    id === "6110101" || // 情報リテラシー(講義)
    id === "6410102" || // 情報リテラシー(演習) 2023,2024,2025開講 資源1班対象
    id === "6410202" || // 情報リテラシー(演習) 2023,2024,2025開講 資源2班対象
    id === "6510102" || // データサイエンス 2023,2024,2025開講 資源1班対象
    id === "6510202" || // データサイエンス 2023,2024,2025開講 資源2班対象
    (mode === "real" &&
      (isInfoLiteracyLecture(id) ||
        isInfoLiteracyExercise(id) ||
        isDataScience(id)))
  );
}

function isE5(id: string, mode: Mode): boolean{
  return isArt(id);
}

function classifyColumnF(id: string, tableYear: number): string | undefined {
  if (isGakushikiban(id)) return "f1";
  if (tableYear >= 2023) {
    if (isElectivePe(id)) return "f2";
    if (isForeignLanguage(id)) return "f3";
    if (isArt(id)) return "f4";
  } else if (tableYear >= 2025) {
    if (isElectivePe(id) || isForeignLanguage(id) || isArt(id)) return "f2";
  }
}

function isH1(id: string): boolean {
  return !(
    id.startsWith("EC") ||
    id.startsWith("BB") ||
    id.startsWith("EB") ||
    id.startsWith("EE") ||
    id.startsWith("EG") ||
    id.startsWith("EZA") ||
    id.startsWith("FF") ||
    id.startsWith("FH") ||
    id.startsWith("1") ||
    id.startsWith("2") ||
    id.startsWith("3") ||
    id.startsWith("4") ||
    id.startsWith("6") ||
    id === "BE21861" ||
    id === "BE22231"
  );
}

function classify(
  id: CourseId,
  name: string,
  mode: Mode,
  tableYear: number,
): string | undefined {
  if (isA1(id)) return "a1";
  if (isC1(id)) return "c1";
  if (isE1(id, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(name)) return "e3";
  if (isE4(id, mode)) return "e4";
  if (isE5(id, mode)) return "e5";
  if (isB1(id)) return "b1";
  if (isB2(id)) return "b2";
  if (isD1(id)) return "d1";
  const f = classifyColumnF(id, tableYear);
  if (f !== undefined) return f;
  if (isH1(id)) return "h1";
  return undefined;
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  _opts: ClassifyOptions,
  tableYear: number,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, "known", tableYear);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  _opts: ClassifyOptions,
  tableYear: number,
): Map<CourseId, string> {
  cs = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();

  let e5Credits = 0;

  for (const c of cs) {
    if (isArt(c.id) && e5Credits < 1) {
      courseIdToCellId.set(c.id, "e5");
      e5Credits += c.credit ?? 0;
      continue;
    }

    const cellId = classify(c.id, c.name, "real", tableYear);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  cs: FakeCourse[],
  _opts: ClassifyOptions,
  _tableYear: number,
): Map<FakeCourseId, string> {
  const fakeCourseIdToCellId = new Map<FakeCourseId, string>();
  for (const c of cs) {
    if (isE3(c.name)) {
      fakeCourseIdToCellId.set(c.id, "e3");
    }
  }
  return fakeCourseIdToCellId;
}

export const creditRequirementsSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 14, max: 14 },
    b1: { min: 32, max: 32 },
    b2: { min: 27, max: 27 },
    c1: { min: 1, max: 1 },
    d1: { min: 28, max: 28 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 1, max: 1 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 1 },
    f3: { min: 0, max: 4 },
    f4: { min: 0, max: 1 },
    h1: { min: 21, max: 21 },
  },
  columns: {
    a: { min: 14, max: 14 },
    b: { min: 59, max: 59 },
    c: { min: 1, max: 1 },
    d: { min: 28, max: 28 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 9 },
    h: { min: 21, max: 21 },
  },
  compulsory: 28,
  elective: 96,
};

export const creditRequirementsSince2025: SetupCreditRequirements = {
  cells: {
    a1: { min: 14, max: 14 },
    b1: { min: 32, max: 32 },
    b2: { min: 27, max: 27 },
    c1: { min: 1, max: 1 },
    d1: { min: 28, max: 28 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 1, max: 1 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 6 }, 
    h1: { min: 21, max: 21 },
  },
  columns: {
    a: { min: 14, max: 14 },
    b: { min: 59, max: 59 },
    c: { min: 1, max: 1 },
    d: { min: 28, max: 28 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 9 },
    h: { min: 21, max: 21 },
  },
  compulsory: 28,
  elective: 96,
};
