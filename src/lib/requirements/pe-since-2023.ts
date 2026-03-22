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
  isCompulsoryEnglishById,
  isCompulsoryEnglishByName,
  isDataScience,
  isFirstYearSeminar,
  isGakushikiban,
  isHakubutsukan,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
  isJapanese,
  isJiyuukamoku,
  isKyoushoku,
  isKyoutsuu,
  isSecondForeignLanguage,
} from "$lib/requirements/common";

type Mode = "known" | "real";

function isA1(id: string): boolean {
  // 専門語学B（卒業研究領域別）
  return id.startsWith("W14") && !isA2(id);
}

function isA2(id: string): boolean {
  // 卒業研究
  return id === "W140008";
}

function isA3(id: string): boolean {
  // 保健体育科（体力づくり運動）指導法
  return id === "W170011";
}

function isA4(id: string): boolean {
  return (
    id === "W171012" || // 種目別コーチング演習I
    id === "W171022" // 種目別コーチング演習II
  );
}

function isA5(id: string, tableYear: number): boolean {
  if (tableYear >= 2026) {
    // TODO: 科目番号不明 !!B!!
    return (
      id === "xxxxxxx" || // スポーツキャリア形成A
      id === "xxxxxxx" // スポーツキャリア形成B
    );
  }
  return (
    id === "W160361" || // スポーツキャリア形成I
    id === "W160371" || // スポーツキャリア形成II
    id === "W160381" // スポーツキャリア形成III
  );
}

function isB1(id: string): boolean {
  // 分野別専門科目（科目番号がW15で始まる科目）
  return id.startsWith("W15");
}

function isB2(id: string): boolean {
  // キャリア支援科目（科目番号がW16で始まる科目）
  return id.startsWith("W16");
}

function isB3(id: string): boolean {
  // 卒業研究領域科目（科目番号がW18で始まる科目）
  return id.startsWith("W18");
}

function isB4(id: string): boolean {
  // 体育専門学群で開設する専門科目
  // 専門科目の定義: https://spehss.taiiku.tsukuba.ac.jp/curriculum/
  // TODO: b1, b2, b3でほとんどカバーされているだが、真相は不明。 !!B!!
  return /^W1[5-8]/.test(id);
}

function isC1(id: string): boolean {
  // 専門語学A
  return id.startsWith("W810"); // !!IP!!
}

function isC2(id: string): boolean {
  // 専門基礎共通演習
  return id === "W816011";
}

function isC3(id: string): boolean {
  // 体育科学シンポジウム
  return id === "W815011";
}

function isC4(id: string): boolean {
  // 体育・スポーツ専門英語基礎演習
  return id.startsWith("W86"); // !!IP!!
}

function isC5(id: string, tableYear: number): boolean {
  if (tableYear >= 2026) {
    // TODO: 科目番号不明 !!B!!
    return id === "xxxxxxx"; //実技理論・実習
  }
  return id === "W981915"; // 臨海実習
}

function isC6(id: string): boolean {
  // テーピング・マッサージ
  return id === "W992215";
}

function isD1(id: string): boolean {
  // 体育・スポーツ学領域科目（科目番号がW87で始まる科目）
  return id.startsWith("W87");
}

function isD2(id: string): boolean {
  // コーチング学領域科目（科目番号がW88で始まる科目）
  return id.startsWith("W88");
}

function isD3(id: string): boolean {
  // 健康体力学領域科目（科目番号がW89で始まる科目）
  return id.startsWith("W89");
}

function isD4(id: string): boolean {
  // 実技理論・実習
  // TODO: 「A群からG群まで各群から1単位ずつ履修すること。」という条件は未実装。
  // W98から始まる科目はH群だが、このマスの単位数は7であり、A群からH群まで1単位
  // ずつ履修すると7単位になるので、W98は含めなくて良い。
  return /^W9[1-7]/.test(id);
}

function isD5(id: string): boolean {
  // 体育専門学群で開設する専門基礎科目
  return /^W[89]/.test(id);
}

function isE1(id: string, mode: Mode): boolean {
  // ファーストイヤーセミナー
  return (
    id.startsWith("1124") || // !!IP!!
    (mode === "real" && isFirstYearSeminar(id))
  );
}

function isE2(id: string, mode: Mode): boolean {
  // 学問への誘い
  return (
    id === "1227771" || // 1クラス
    id === "1227781" || // 2クラス
    id === "1227791" || // 3クラス
    id === "1227801" || // 4クラス
    id === "1227811" || // 5クラス
    id === "1227821" || // 6クラス
    id === "1227831" || // 7クラス
    id === "1227841" || // 8クラス
    id === "1227851" || // 9クラス
    id === "1227861" || // 10クラス
    (mode === "real" && isIzanai(id))
  );
}

function isE3(id: string): boolean {
  return isCompulsoryEnglishById(id);
}

function isE4(id: string, mode: Mode): boolean {
  // 情報
  return (
    id.startsWith("6120") || // 情報リテラシー(講義) !!IP!!
    id.startsWith("6420") || // 情報リテラシー(演習) !!IP!!
    id.startsWith("6520") || // データサイエンス !!IP!!
    (mode === "real" &&
      (isInfoLiteracyLecture(id) ||
        isInfoLiteracyExercise(id) ||
        isDataScience(id)))
  );
}

function isE5(id: string): boolean {
  return isJapanese(id);
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isF2(id: string): boolean {
  return isArt(id);
}

function isF3(id: string): boolean {
  return isSecondForeignLanguage(id);
}

function isH1(id: string): boolean {
  // TODO: 「自由科目（特設）については、4単位を上限として卒業に必要な単位とし
  // て含めることができる。」という条件は未実装。
  if (isKyoushoku(id) || isHakubutsukan(id) || isJiyuukamoku(id)) return true;
  if (isKyoutsuu(id)) return false;
  return !id.startsWith("W");
}

function isH2(id: string): boolean {
  // 教育実習
  return id.startsWith("95");
}

const COMPULSORY_NAMES = new Set([
  "専門語学B(英語)",
  "専門語学B(独語)",
  "卒業研究",
  "保健体育科(体力づくり運動)指導法",
  "種目別コーチング演習I",
  "種目別コーチング演習II",
  "スポーツキャリア形成I",
  "スポーツキャリア形成II",
  "スポーツキャリア形成III",
  "専門語学A",
  "専門基礎共通演習",
  "体育科学シンポジウム",
  "体育・スポーツ専門英語基礎演習",
  "臨海実習",
  "テーピング・マッサージ",
]);

function classify(
  id: CourseId,
  name: string,
  mode: Mode,
  _isNative: boolean,
  tableYear: number,
): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isA2(id)) return "a2";
  if (isA3(id)) return "a3";
  if (isA4(id)) return "a4";
  if (isA5(id, tableYear)) return "a5";
  if (isC1(id)) return "c1";
  if (isC2(id)) return "c2";
  if (isC3(id)) return "c3";
  if (isC4(id)) return "c4";
  if (isC5(id, tableYear)) return "c5";
  if (isC6(id)) return "c6";
  if (isE1(id, mode)) return "e1";
  if (isE2(id, mode)) return "e2";
  if (isE3(id)) return "e3";
  if (isE4(id, mode)) return "e4";
  if (isE5(id)) return "e5";
  if (COMPULSORY_NAMES.has(name)) return undefined;
  // 選択
  if (isB1(id)) return "b1";
  if (isB2(id)) return "b2";
  if (isB3(id)) return "b3";
  if (isB4(id)) return "b4";
  if (isD1(id)) return "d1";
  if (isD2(id)) return "d2";
  if (isD3(id)) return "d3";
  if (isD4(id)) return "d4";
  if (isD5(id)) return "d5";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isF3(id)) return "f3";
  if (isH2(id)) return "h2";
  if (isH1(id)) return "h1"; // 「...以外」なので最後
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, "known", opts.isNative);
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
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, "real", opts.isNative, tableYear);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  cs: FakeCourse[],
  _opts: ClassifyOptions,
): Map<FakeCourseId, string> {
  const fakeCourseIdToCellId = new Map<FakeCourseId, string>();
  for (const c of cs) {
    if (isCompulsoryEnglishByName(c.name)) {
      fakeCourseIdToCellId.set(c.id, "e3");
    }
  }
  return fakeCourseIdToCellId;
}

const reqSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 2, max: 2 },
    a2: { min: 6, max: 6 },
    a3: { min: 1, max: 1 },
    a4: { min: 3, max: 3 },
    a5: { min: 3, max: 3 },
    b1: { min: 10, max: 10 },
    b2: { min: 7, max: 7 },
    b3: { min: 6, max: 6 },
    b4: { min: 5, max: 20 },
    c1: { min: 1, max: 1 },
    c2: { min: 1, max: 1 },
    c3: { min: 1, max: 1 },
    c4: { min: 1, max: 1 },
    c5: { min: 1, max: 1 },
    c6: { min: 1, max: 1 },
    d1: { min: 10, max: 10 },
    d2: { min: 4, max: 4 },
    d3: { min: 10, max: 10 },
    d4: { min: 7, max: 7 },
    d5: { min: 0, max: 8 },
    e1: { min: 1, max: 1 },
    e2: { min: 1, max: 1 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 2, max: 2 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 3 },
    f3: { min: 0, max: 4 },
    h1: { min: 12, max: 20 },
    h2: { min: 0, max: 5 },
  },
  columns: {
    a: { min: 15, max: 15 },
    b: { min: 28, max: 43 },
    c: { min: 6, max: 6 },
    d: { min: 31, max: 39 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 10 },
    h: { min: 12, max: 25 },
  },
  compulsory: 33,
  elective: 91,
};

const reqSince2026: SetupCreditRequirements = {
  cells: {
    a1: { min: 2, max: 2 },
    a2: { min: 6, max: 6 },
    a3: { min: 1, max: 1 },
    a4: { min: 3, max: 3 },
    a5: { min: 2, max: 2 },
    b1: { min: 10, max: 10 },
    b2: { min: 7, max: 7 },
    b3: { min: 6, max: 6 },
    b4: { min: 5, max: 20 },
    c1: { min: 1, max: 1 },
    c2: { min: 1, max: 1 },
    c3: { min: 1, max: 1 },
    c4: { min: 1, max: 1 },
    c5: { min: 2, max: 2 },
    c6: { min: 1, max: 1 },
    d1: { min: 10, max: 10 },
    d2: { min: 4, max: 4 },
    d3: { min: 10, max: 10 },
    d4: { min: 7, max: 7 },
    d5: { min: 0, max: 8 },
    e1: { min: 1, max: 1 },
    e2: { min: 1, max: 1 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 2, max: 2 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 3 },
    f3: { min: 0, max: 4 },
    h1: { min: 12, max: 20 },
    h2: { min: 0, max: 5 },
  },
  columns: {
    a: { min: 14, max: 14 },
    b: { min: 28, max: 43 },
    c: { min: 7, max: 7 },
    d: { min: 31, max: 39 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 10 },
    h: { min: 12, max: 25 },
  },
  compulsory: 33,
  elective: 91,
};

export function getCreditRequirements(
  tableYear: number,
  _major: Major,
): SetupCreditRequirements {
  if (tableYear >= 2026) return reqSince2026;
  return reqSince2023;
}
