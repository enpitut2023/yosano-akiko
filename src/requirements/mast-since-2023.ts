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
  isHakubutsukan,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
  isJapanese,
  isJiyuukamoku,
  isKyoushoku,
  isKyoutsuu,
} from "@/requirements/common";

type Mode = "known" | "real";

function isA1(id: string): boolean {
  // 卒業研究A
  return (
    id === "GC48708" || // 秋学期
    id === "GC48808" // 春学期
  );
}

function isA2(id: string): boolean {
  // 卒業研究B
  return (
    id === "GC48608" || // 春学期
    id === "GC48908"
  );
}

function isA3(id: string) {
  return id === "GC41103"; // 情報メディア実験A
}

function isA4(id: string) {
  return id === "GC41203"; // 情報メディア実験B
}

function isA5(id: string) {
  return id === "GC42102"; // 専門英語A
}

function isA6(id: string) {
  return id === "GC42202"; // 専門英語B
}

function isB1(id: string) {
  return id.startsWith("GC5") || id.startsWith("GA4");
}

function classifyColumnC(id: CourseId, tableYear: number): string | undefined {
  if (id === "GA15331") return "c1"; // 微分積分A
  if (id === "GC11701") return "c2"; // 微分積分B
  if (id === "GA15231") return "c3"; // 線形代数A
  if (id === "GC11801") return "c4"; // 線形代数B
  if (id === "GA15131") return "c5"; // 情報数学A
  if (id === "GC11601") return "c6"; // 確率と統計
  if (id === "GA18222") return "c7"; // プログラミング入門A
  if (id === "GA18322") return "c8"; // プログラミング入門B
  let offset = 0;
  if (tableYear >= 2025) {
    offset = 1;
    if (id === "GC12104") {
      return "c9";
    }
  }
  if (id === "GC12701") return "c" + (9 + offset); // プログラミング
  if (id === "GC13101") return "c" + (10 + offset); // コンピュータシステムとOS
  if (id === "GC12401") return "c" + (11 + offset); // データ構造とアルゴリズム
  if (id === "GC12403") return "c" + (12 + offset); // データ構造とアルゴリズム実習
  if (id === "GC13201") return "c" + (13 + offset); // データ工学概論
}

function isD1(id: string) {
  return (
    id !== "GA15111" && //情報数学A
    id !== "GA15121" &&
    id !== "GA15131" &&
    id !== "GA15141" &&
    id !== "GA15211" && //線形代数A
    id !== "GA15221" &&
    id !== "GA15231" &&
    id !== "GA15241" &&
    id !== "GA15311" && //微分積分A
    id !== "GA15321" &&
    id !== "GA15331" &&
    id !== "GA15341" &&
    id !== "GA18212" && //プログラミング入門A
    id !== "GA18222" &&
    id !== "GA18232" &&
    id !== "GA18312" && //プログラミング入門B
    id !== "GA18322" &&
    id !== "GA18332" &&
    (id.startsWith("GC2") || id.startsWith("GA1"))
  );
}

function isE1(id: string, mode: Mode) {
  return (
    id === "1119102" || // ファーストイヤーセミナー
    id === "1227611" || // 学問への誘い
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string, mode: Mode) {
  return (
    id === "6525102" || // データサイエンス
    id === "6425102" || // 情報リテラシー(演習)
    id === "6114101" || // 情報リテラシー(講義) 2023
    id === "6125101" || // 情報リテラシー(講義) 2024, 2025
    (mode === "real" &&
      (isInfoLiteracyLecture(id) ||
        isInfoLiteracyExercise(id) ||
        isDataScience(id)))
  );
}

function isE3(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

function isE4(name: string): boolean {
  return isCompulsoryEnglishByName(name);
}

function isF1(id: string) {
  return isGakushikiban(id);
}

function isF2(id: string) {
  return isElectivePe(id);
}

function isF3(id: string) {
  return isForeignLanguage(id);
}

function isF4(id: string) {
  return isJapanese(id);
}

function isF5(id: string) {
  return isArt(id);
}

function isH1(id: string) {
  return !(/^G[ABCE]/.test(id) || isKyoutsuu(id) || isKyoushoku(id));
}

function isH2(id: string) {
  return id.startsWith("GB") || id.startsWith("GE");
}

function isH3(id: string): boolean {
  return isHakubutsukan(id) || isJiyuukamoku(id);
}

const COMPULSORY_NAMES = new Set([
  "卒業研究A",
  "卒業研究B",
  "情報メディア実験A",
  "情報メディア実験B",
  "専門英語A",
  "専門英語B",
  "微分積分A",
  "微分積分B",
  "線形代数A",
  "線形代数B",
  "情報数学A",
  "確率と統計",
  "プログラミング入門A",
  "プログラミング入門B",
  "プログラミング",
  "コンピュータシステムとOS",
  "データ構造とアルゴリズム",
  "データ構造とアルゴリズム実習",
  "データ工学概論",
  "ファーストイヤーセミナー",
  "学問への誘い",
  "情報リテラシー(講義)",
  "情報リテラシー(演習)",
  "データサイエンス",
]);

function classify(
  id: CourseId,
  name: string,
  tableYear: number,
  _isNative: boolean,
  mode: Mode,
): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isA2(id)) return "a2";
  if (isA3(id)) return "a3";
  if (isA4(id)) return "a4";
  if (isA5(id)) return "a5";
  if (isA6(id)) return "a6";
  const c = classifyColumnC(id, tableYear);
  if (c !== undefined) return c;
  if (isE1(id, mode)) return "e1";
  if (isE2(id, mode)) return "e2";
  if (isE3(id)) return "e3";
  if (isE4(name)) return "e4";
  if (COMPULSORY_NAMES.has(name)) return undefined;
  // 選択
  if (isB1(id)) return "b1";
  if (isD1(id)) return "d1";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isF3(id)) return "f3";
  if (isF4(id)) return "f4";
  if (isF5(id)) return "f5";
  if (isH2(id)) return "h2";
  if (isH3(id)) return "h3";
  if (isH1(id)) return "h1"; // 「...以外」なので最後
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  _opts: ClassifyOptions,
  tableYear: number,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, tableYear, true, "known");
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  opts: ClassifyOptions,
  tableYear: number,
): Map<CourseId, string> {
  cs = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, tableYear, opts.isNative, "real");
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

// TODO:
export function classifyFakeCourses(
  cs: FakeCourse[],
  _opts: ClassifyOptions,
  _tableYear: number,
): Map<FakeCourseId, string> {
  const fakeCourseIdToCellId = new Map<FakeCourseId, string>();
  for (const c of cs) {
    if (isE4(c.name)) {
      fakeCourseIdToCellId.set(c.id, "e4");
    }
  }
  return fakeCourseIdToCellId;
}

export const creditRequirementsSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 3, max: 3 },
    a2: { min: 3, max: 3 },
    a3: { min: 3, max: 3 },
    a4: { min: 3, max: 3 },
    a5: { min: 1, max: 1 },
    a6: { min: 1, max: 1 },
    b1: { min: 20, max: 35 },
    c1: { min: 2, max: 2 },
    c2: { min: 2, max: 2 },
    c3: { min: 2, max: 2 },
    c4: { min: 2, max: 2 },
    c5: { min: 2, max: 2 },
    c6: { min: 2, max: 2 },
    c7: { min: 2, max: 2 },
    c8: { min: 1, max: 1 },
    c9: { min: 2, max: 2 },
    c10: { min: 2, max: 2 },
    c11: { min: 2, max: 2 },
    c12: { min: 1, max: 1 },
    c13: { min: 2, max: 2 },
    d1: { min: 32, max: 47 },
    e1: { min: 2, max: 2 },
    e2: { min: 4, max: 4 },
    e3: { min: 2, max: 2 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 4 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 6 },
    h1: { min: 6, max: 15 },
    h2: { min: 0, max: 9 },
    h3: { min: 0, max: 9 },
  },
  columns: {
    a: { min: 14, max: 14 },
    b: { min: 20, max: 35 },
    c: { min: 24, max: 24 },
    d: { min: 32, max: 47 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 10 },
    h: { min: 6, max: 15 },
  },
  compulsory: 50,
  elective: 74,
};

export const creditRequirementsSince2025: SetupCreditRequirements = {
  cells: {
    a1: { min: 3, max: 3 },
    a2: { min: 3, max: 3 },
    a3: { min: 3, max: 3 },
    a4: { min: 3, max: 3 },
    a5: { min: 1, max: 1 },
    a6: { min: 1, max: 1 },
    b1: { min: 20, max: 35 },
    c1: { min: 2, max: 2 },
    c2: { min: 2, max: 2 },
    c3: { min: 2, max: 2 },
    c4: { min: 2, max: 2 },
    c5: { min: 2, max: 2 },
    c6: { min: 2, max: 2 },
    c7: { min: 2, max: 2 },
    c8: { min: 1, max: 1 },
    c9: { min: 1, max: 1 },
    c10: { min: 2, max: 2 },
    c11: { min: 2, max: 2 },
    c12: { min: 2, max: 2 },
    c13: { min: 1, max: 1 },
    c14: { min: 2, max: 2 },
    d1: { min: 31, max: 46 },
    e1: { min: 2, max: 2 },
    e2: { min: 4, max: 4 },
    e3: { min: 2, max: 2 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 4 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 6 },
    h1: { min: 6, max: 15 },
    h2: { min: 0, max: 9 },
    h3: { min: 0, max: 9 },
  },
  columns: {
    a: { min: 14, max: 14 },
    b: { min: 20, max: 35 },
    c: { min: 25, max: 25 },
    d: { min: 31, max: 46 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 10 },
    h: { min: 6, max: 15 },
  },
  compulsory: 50,
  elective: 74,
};
