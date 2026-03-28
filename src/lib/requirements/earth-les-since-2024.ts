import {
  type CourseId,
  type FakeCourse,
  type FakeCourseId,
  type KnownCourse,
  type RealCourse,
} from "$lib/akiko";
import type { ClassifyOptions, SetupCreditRequirements } from "$lib/app-setup";
import type { Major } from "$lib/constants";
import {
  isArt,
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
  isJapaneseAsForeignLanguage,
  isKyoutsuu,
} from "./common";

type Mode = "known" | "real";

function isA1(id: string): boolean {
  return (
    id === "EG71102" || // 研究演習A spring start
    id === "EG71122" || // 研究演習A fall start
    id === "EG71112" || // 研究演習B spring start
    id === "EG71152" // 研究演習B fall start
  );
}

function isA2(id: string): boolean {
  return (
    id === "EG71002" || // 地球学演習A spring start
    id === "EG71022" || // 地球学演習A fall start
    id === "EG71012" || // 地球学演習B spring start
    id === "EG71032" // 地球学演習B fall start
  );
}

function isA3(id: string): boolean {
  return (
    id === "EG79018" || // 卒業研究A 2023,2024開講 entered by 2020, spring start
    id === "EG79038" || // 卒業研究A 2023,2024開講 entered by 2020, fall start
    id === "EG79118" || // 卒業研究A spring start
    id === "EG79138" || // 卒業研究A fall start
    id === "EG79028" || // 卒業研究B 2023,2024開講 entered by 2020
    id === "EG79068" || // 卒業研究B 2023,2024開講
    id === "EG79128" || // 卒業研究B spring start
    id === "EG79168" // 卒業研究B fall start
  );
}

function isA4(id: string): boolean {
  return (
    id === "EG79178" || // Paper Preparation spring
    id === "EG79188" // Paper Preparation fall
  );
}

function isB1(id: string): boolean {
  return (
    id === "EG91203" || // 地球環境学野外実験I 2025開講
    id === "EG91213" || // 地球環境学野外実験II 2025開講
    id === "EG91223" || // 地球環境学野外実験III 2023開講
    id === "EG91233" || // 地球環境学野外実験IV 2023開講
    id === "EG91243" || // 地球環境学野外実験V 2024開講
    id === "EG91253" || // 地球環境学野外実験VI 2024開講
    id === "EG92053" || // 地球進化学野外実験A 2024開講
    id === "EG92063" || // 地球進化学野外実験B 2023,2025開講
    id === "EG92073" || // 地球進化学野外実験C 2024,2025開講
    id === "EG92083" || // 地球進化学野外実験D 2025開講
    id === "EG92103" // 地球進化学野外実験F 2023開講
  );
}

function isB2(id: string): boolean {
  return /^(EG[69]|EB[5-8]|EC[234]|EE[23])/.test(id);
}

function isC1(id: string): boolean {
  return (
    id === "EG70031" || // 地球と生命の進化
    id === "EG70021" || // 地球環境学入門
    id === "EG70013" // 地球学基礎実験
  );
}

function isD1(id: string): boolean {
  return (
    /^(EG0[25]|EE1)/.test(id) ||
    id === "EB11151" || // 系統分類・進化学概論
    id === "EB11251" || // 分子細胞生物学概論
    id === "EB11351" || // 遺伝学概論
    id === "EB11651" || // 生態学概論
    id === "EB11751" || // 動物生理学概論
    id === "EB11851" // 植物生理学概論
  );
}

function isE1(id: string, mode: Mode): boolean {
  return (
    id === "1111102" || // ファーストイヤーセミナー 地球1クラス対象
    id === "1111202" || // ファーストイヤーセミナー 地球2クラス対象
    id === "1227351" || // 学問への誘い 地球1クラス対象
    id === "1227361" || // 学問への誘い 地球2クラス対象
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isJapaneseAsForeignLanguage(id);
}

function isE3(id: string, mode: Mode): boolean {
  return (
    id === "6109101" || // 情報リテラシー(講義) 生物, 地球対象
    id === "6411102" || // 情報リテラシー(演習) 地球, 生物1班対象
    id === "6511102" || // データサイエンス 地球, 生物1班対象
    (mode === "real" &&
      (isInfoLiteracyLecture(id) ||
        isInfoLiteracyExercise(id) ||
        isDataScience(id)))
  );
}

function isE4(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

function isE5(id: string): boolean {
  return isArt(id);
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isF2(id: string): boolean {
  return isElectivePe(id) || isArt(id) || isForeignLanguage(id);
}

function isH1(id: string): boolean {
  return !/^E[ABCEG]/.test(id) && !isKyoutsuu(id);
}

function classify(id: CourseId, mode: Mode): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isA2(id)) return "a2";
  if (isA3(id)) return "a3";
  if (isA4(id)) return "a4";
  if (isC1(id)) return "c1";
  if (isE1(id, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(id, mode)) return "e3";
  if (isE4(id)) return "e4";
  if (isE5(id)) return "e5";
  // 選択
  if (isB1(id)) return "b1";
  if (isB2(id)) return "b2";
  if (isD1(id)) return "d1";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isH1(id)) return "h1";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  _opts: ClassifyOptions,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, "known");
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  _opts: ClassifyOptions,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, "real");
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  _cs: FakeCourse[],
  _opts: ClassifyOptions,
): Map<FakeCourseId, string> {
  return new Map();
}

const reqSince2024: SetupCreditRequirements = {
  cells: {
    a1: { min: 3, max: 3 },
    a2: { min: 3, max: 3 },
    a3: { min: 12, max: 12 },
    a4: { min: 7, max: 7 },
    b1: { min: 6, max: 19 },
    b2: { min: 41, max: 55 },
    c1: { min: 3.5, max: 3.5 },
    d1: { min: 11.5, max: 25.5 },
    e1: { min: 2, max: 2 },
    e2: { min: 4, max: 4 },
    e3: { min: 4, max: 4 },
    e4: { min: 2, max: 2 },
    e5: { min: 1, max: 1 },
    f1: { min: 1, max: 1 },
    f2: { min: 0, max: 14 },
    h1: { min: 9, max: 23 },
  },
  columns: {
    a: { min: 25, max: 25 },
    b: { min: 47, max: 61 },
    c: { min: 3.5, max: 3.5 },
    d: { min: 11.5, max: 25.5 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 15 },
    h: { min: 9, max: 23 },
  },
  compulsory: 41.5,
  elective: 82.5,
};

export function getCreditRequirements(
  _tableYear: number,
  _major: Major,
): SetupCreditRequirements {
  return reqSince2024;
}
