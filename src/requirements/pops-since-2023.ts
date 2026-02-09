import {
  CourseId,
  FakeCourse,
  FakeCourseId,
  KnownCourse,
  RealCourse,
} from "@/akiko";
import { ClassifyOptions, SetupCreditRequirements } from "@/app-setup";
import { unreachable } from "@/util";
import {
  isArt,
  isCompulsoryEnglishByName,
  isCompulsoryPe1,
  isCompulsoryPe2,
  isCompulsoryPe3,
  isDataScience,
  isElectivePe,
  isFirstYearSeminar,
  isForeignLanguage,
  isGakushikiban,
  isHakubutsukan,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
  isJapanese,
  isJiyuukamoku,
  isKyoushoku,
} from "./common";

export type Specialty =
  | "ses" // Social and Economic Sciences
  | "mse" // Management Science and Engineering
  | "urp"; // Urban and Regional Planning
type Mode = "known" | "real";

function isThesis(id: string): boolean {
  return (
    id === "FH11918" || // 卒業研究A 春
    id === "FH11928" || // 卒業研究B 秋
    id === "FH11938" || // 卒業研究A 秋
    id === "FH11948" || // 卒業研究B 春
    id === "FH11988" // 早期卒業研究
  );
}

function isA1Mse(id: string): boolean {
  return id === "FH35012"; // 問題発見と解決
}

function isA1Urp(id: string): boolean {
  return id === "FH45222"; // 都市計画情報演習
  // 2018年度以前入学者に対してはFH62033に読み替える
}

function isA2Urp(id: string): boolean {
  return (
    id === "FH45122" // 都市計画演習 BC12712でも開講
  );
}

function classifyColumnA(id: string, specialty: Specialty): string | undefined {
  switch (specialty) {
    case "ses":
      if (isThesis(id)) return "a1";
      break;
    case "mse":
      if (isA1Mse(id)) return "a1";
      if (isThesis(id)) return "a2";
      break;
    case "urp":
      if (isA1Urp(id)) return "a1";
      if (isA2Urp(id)) return "a2";
      if (isThesis(id)) return "a3";
      break;
    default:
      unreachable(specialty);
  }
}

function classifyColumnB(id: string, specialty: Specialty): string | undefined {
  const fh2 = /^FH2[467]/.test(id);
  const fh3 = /^FH3[234]/.test(id);
  const fh4 = /^FH4[678]/.test(id);
  switch (specialty) {
    case "ses":
      if (fh2) return "b1"; // TODO: 演習を2単位以上含む条件
      if (fh3 || fh4) return "b2";
      break;
    case "mse":
      if (fh3) return "b1"; // TODO: 演習を2単位以上含む条件
      if (fh2 || fh4) return "b2";
      break;
    case "urp":
      if (fh4) return "b1"; // TODO: 演習を7単位以上含む条件
      if (fh2 || fh3) return "b2";
      break;
    default:
      unreachable(specialty);
  }
  if (/^(FH[234]|FA00)/.test(id)) return "b3";
}

function isC1(id: string): boolean {
  return id === "FH60012"; // 社会工学演習
}

function isC2(id: string): boolean {
  return id === "FH60341"; // 社会工学英語
}

function isC3(id: string): boolean {
  return (
    // !!A!!
    id === "FH60474" || // プログラミング入門A 2021~2024年度入学生
    id === "FH60484" || // プログラミング入門A 2025年度入学生 12クラス
    id === "FH60484" // プログラミング入門A 2025年度入学生 34クラス
  );
}

function isC4(id: string): boolean {
  return (
    // !!A!!
    id === "FH60574" || // プログラミング入門B 2021~2024年度入学生
    id === "FH60584" || //  プログラミング入門B 2025年度入学生 12クラス
    id === "FH60594" //  プログラミング入門B 2025年度入学生 34クラス
  );
}

function isD1(id: string): boolean {
  return (
    // !!A!!
    id === "FA01151" || // 数学リテラシー1 12クラス
    id === "FA01161" || // 数学リテラシー1 34クラス
    // !!A!!
    id === "FA01251" || // 数学リテラシー2　12クラス
    id === "FA01261" || // 数学リテラシー2　34クラス
    // !!A!!
    id === "FA01651" || // 線形代数1 12クラス
    id === "FA01661" || // 線形代数1 34クラス
    // !!A!!
    id === "FA01751" || // 線形代数2 12クラス
    id === "FA01761" || // 線形代数2 34クラス
    // !!A!!
    id === "FA01851" || // 線形代数3 12クラス
    id === "FA01861" || // 線形代数3 34クラス
    // !!A!!
    id === "FA01351" || // 微積分1 12クラス
    id === "FA01361" || // 微積分1 34クラス
    // !!A!!
    id === "FA01451" || // 微積分2 12クラス
    id === "FA01461" || // 微積分2 34クラス
    // !!A!!
    id === "FA01551" || // 微積分3 12クラス
    id === "FA01561" || // 微積分3 34クラス
    // !!A!!
    id === "FH60811" || // 統計学 (学籍番号の下2桁) % 3 == 0
    id === "FH60821" || // 統計学 == 1
    id === "FH60831" || // 統計学 == 2
    id === "FH61111" || // 経済学の数理
    id === "FH61121" || // 経済学の実証
    id === "FH61131" || // 会計と経営
    id === "FH61141" || // 社会と最適化
    id === "FH61151" || // 都市計画入門
    id === "FH61161" // 都市数理
  );
}

function isE1(id: string, mode: Mode): boolean {
  return (
    id === "1117102" || //ファーストイヤーセミナー  1クラス
    id === "1117202" || //ファーストイヤーセミナー  2クラス
    id === "1117302" || //ファーストイヤーセミナー 3クラス
    id === "1117402" || //ファーストイヤーセミナー 4クラス
    id === "1227511" || // 学問への誘い 1クラス
    id === "1227521" || // 学問への誘い 2クラス
    id === "1227531" || // 学問への誘い 3クラス
    id === "1227541" || // 学問への誘い 4クラス
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(name: string): boolean {
  return isCompulsoryEnglishByName(name);
}

function isE3(id: string, mode: Mode): boolean {
  return (
    id === "6123101" || //情報リテラシー(講義)
    id === "6423102" || //情報リテラシー(演習) 1班
    id === "6423202" || //情報リテラシー(演習) 2班
    id === "6523102" || //データサイエンス 1班
    id === "6523202" || //データサイエンス 2班
    (mode === "real" &&
      (isInfoLiteracyLecture(id) ||
        isInfoLiteracyExercise(id) ||
        isDataScience(id)))
  );
}

function isE4(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id) || isCompulsoryPe3(id);
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isF2(id: string): boolean {
  return (
    isElectivePe(id) || isForeignLanguage(id) || isArt(id) || isJapanese(id)
  );
}

function isH1(id: string): boolean {
  return /^[ABC]/.test(id);
}

function isH2(id: string): boolean {
  if (/^(FA0|FH)/.test(id)) {
    return false;
  }
  return /^[EFGH]/.test(id);
}

function isH3(_id: string): boolean {
  // 上記以外の他学群又は他学類の授業科目
  // TODO: 適当に思いつくものは除いておきたい
  return true;
}

function isH4(id: string): boolean {
  return isKyoushoku(id) || isHakubutsukan(id) || isJiyuukamoku(id);
}

function classify(
  id: CourseId,
  name: string,
  _tableYear: number,
  specialty: Specialty,
  mode: "known" | "real",
): string | undefined {
  // 必修
  const a = classifyColumnA(id, specialty);
  if (a !== undefined) return a;
  if (isC1(id)) return "c1";
  if (isC2(id)) return "c2";
  if (isC3(id)) return "c3";
  if (isC4(id)) return "c4";
  if (isE1(id, mode)) return "e1";
  if (isE2(name)) return "e2";
  if (isE3(id, mode)) return "e3";
  if (isE4(id)) return "e4";
  // 選択
  const b = classifyColumnB(id, specialty);
  if (b !== undefined) return b;
  if (isD1(id)) return "d1";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isH1(id)) return "h1";
  if (isH2(id)) return "h2";
  if (isH4(id)) return "h4";
  if (isH3(id)) return "h3"; // 「...以外」なので最後
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  _opts: ClassifyOptions,
  tableYear: number,
  specialty: Specialty,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, tableYear, specialty, "known");
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
  specialty: Specialty,
): Map<CourseId, string> {
  cs = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, tableYear, specialty, "real");
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
  _specialty: Specialty,
): Map<FakeCourseId, string> {
  const fakeCourseIdToCellId = new Map<FakeCourseId, string>();
  for (const c of cs) {
    if (isCompulsoryEnglishByName(c.name)) {
      fakeCourseIdToCellId.set(c.id, "e2");
    }
  }
  return fakeCourseIdToCellId;
}

export const creditRequirementsSes: SetupCreditRequirements = {
  cells: {
    a1: { min: 8, max: 8 },
    b1: { min: 16, max: undefined },
    b2: { min: 8, max: undefined },
    b3: { min: 0, max: undefined },
    c1: { min: 3, max: 3 },
    c2: { min: 2, max: 2 },
    c3: { min: 2, max: 2 },
    c4: { min: 1, max: 1 },
    d1: { min: 11, max: 16 },
    e1: { min: 2, max: 2 },
    e2: { min: 4, max: 4 },
    e3: { min: 4, max: 4 },
    e4: { min: 3, max: 3 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 4 },
    h1: { min: 2, max: undefined },
    h2: { min: 2, max: undefined },
    h3: { min: 0, max: undefined },
    h4: { min: 0, max: 4 },
  },
  columns: {
    a: { min: 8, max: 8 },
    b: { min: 52, max: 77 },
    c: { min: 8, max: 8 },
    d: { min: 11, max: 16 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 7 },
    h: { min: 6, max: 20 },
  },
  compulsory: 29,
  elective: 95,
};

export const creditRequirementsMse: SetupCreditRequirements = {
  cells: {
    a1: { min: 2, max: 2 },
    a2: { min: 8, max: 8 },
    b1: { min: 16, max: undefined },
    b2: { min: 8, max: undefined },
    b3: { min: 0, max: undefined },
    c1: { min: 3, max: 3 },
    c2: { min: 2, max: 2 },
    c3: { min: 2, max: 2 },
    c4: { min: 1, max: 1 },
    d1: { min: 11, max: 16 },
    e1: { min: 2, max: 2 },
    e2: { min: 4, max: 4 },
    e3: { min: 4, max: 4 },
    e4: { min: 3, max: 3 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 4 },
    h1: { min: 2, max: undefined },
    h2: { min: 2, max: undefined },
    h3: { min: 0, max: undefined },
    h4: { min: 0, max: 4 },
  },
  columns: {
    a: { min: 10, max: 10 },
    b: { min: 50, max: 75 },
    c: { min: 8, max: 8 },
    d: { min: 11, max: 16 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 7 },
    h: { min: 6, max: 20 },
  },
  compulsory: 31,
  elective: 93,
};

export const creditRequirementsUrp: SetupCreditRequirements = {
  cells: {
    a1: { min: 3, max: 3 },
    a2: { min: 4, max: 4 },
    a3: { min: 8, max: 8 },
    b1: { min: 16, max: undefined },
    b2: { min: 8, max: undefined },
    b3: { min: 0, max: undefined },
    c1: { min: 3, max: 3 },
    c2: { min: 2, max: 2 },
    c3: { min: 2, max: 2 },
    c4: { min: 1, max: 1 },
    d1: { min: 11, max: 16 },
    e1: { min: 2, max: 2 },
    e2: { min: 4, max: 4 },
    e3: { min: 4, max: 4 },
    e4: { min: 3, max: 3 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 4 },
    h1: { min: 2, max: undefined },
    h2: { min: 2, max: undefined },
    h3: { min: 0, max: undefined },
    h4: { min: 0, max: 4 },
  },
  columns: {
    a: { min: 15, max: 15 },
    b: { min: 45, max: 70 },
    c: { min: 8, max: 8 },
    d: { min: 11, max: 16 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 7 },
    h: { min: 6, max: 20 },
  },
  compulsory: 36,
  elective: 88,
};
