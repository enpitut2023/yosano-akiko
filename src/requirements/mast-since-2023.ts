import {
  CourseId,
  FakeCourse,
  FakeCourseId,
  KnownCourse,
  RealCourse,
} from "@/akiko";
import { ClassifyOptions, SetupCreditRequirements } from "@/app-setup";
import {
  isGakushikiban,
  isHakubutsukan,
  isJiyuukamoku,
  isKyoutsuu,
} from "@/conditions/common";
import {
  isArt,
  isCompulsoryEnglishByName,
  isCompulsoryPe1,
  isCompulsoryPe2,
  isElectivePe,
  isForeignLanguage,
  isJapanese,
  isKyoushoku,
} from "@/conditions/common/2025";
import { assert } from "@/util";

function assertYear(year: number): void {
  assert(2023 <= year && year <= 2025);
}

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

function isC(id: CourseId, year: number): string | undefined {
  if (id === "GA15331") return "c1"; // 微分積分A
  if (id === "GC11701") return "c2"; // 微分積分B
  if (id === "GA15231") return "c3"; // 線形代数A
  if (id === "GC11801") return "c4"; // 線形代数B
  if (id === "GA15131") return "c5"; // 情報数学A
  if (id === "GC11601") return "c6"; // 確率と統計
  if (id === "GA18222") return "c7"; // プログラミング入門A
  if (id === "GA18322") return "c8"; // プログラミング入門B
  let offset = 0;
  if (year === 2025) {
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

function isE1(id: string) {
  return (
    id === "1119102" || // ファーストイヤーセミナー
    id === "1227611" //学問への誘い
  );
}

function isE2(id: string) {
  return (
    id === "6525102" || // データサイエンス
    id === "6425102" || // 情報リテラシー(演習)
    id === "6114101" || // 情報リテラシー(講義) 2023
    id === "6125101" // 情報リテラシー(講義) 2024, 2025
  );
}

function isE3(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id); // 必修 体育
}

function isE4(name: string): boolean {
  return isCompulsoryEnglishByName(name); // 必修　外国語(英語)
}

function isF1(id: string) {
  return isGakushikiban(id); // 学士基盤科目
}

function isF2(id: string) {
  return isElectivePe(id); // 選択　体育
}

function isF3(id: string) {
  return isForeignLanguage(id); // 選択　外国語
}

function isF4(id: string) {
  return id.startsWith("5"); //選択 国語
}

function isF5(id: string) {
  return isArt(id); // 選択 芸術
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

function classify(
  id: CourseId,
  name: string,
  year: number,
  isNative: boolean,
): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isA2(id)) return "a2";
  if (isA3(id)) return "a3";
  if (isA4(id)) return "a4";
  if (isA5(id)) return "a5";
  if (isA6(id)) return "a6";
  if (isC(id, year) !== undefined) return isC(id, year);
  if (isE1(id)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(id)) return "e3";
  if (isE4(name)) return "e4";
  // 選択
  if (isB1(id)) return "b1";
  if (isD1(id)) return "d1";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isF3(id)) return "f3";
  if (isF4(id)) return "f4";
  if (isF5(id)) return "f5";
  if (isH1(id)) return "h1";
  if (isH2(id)) return "h2";
  if (isH3(id)) return "h3";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
  year: number,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, year, true);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  opts: ClassifyOptions,
  year: number,
): Map<CourseId, string> {
  cs = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, year, opts.isNative);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

// TODO:
export function classifyFakeCourses(
  cs: FakeCourse[],
  opts: ClassifyOptions,
  year: number,
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
