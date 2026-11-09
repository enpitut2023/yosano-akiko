import {
  type CourseId,
  type FakeCourse,
  type CellId,
  type FakeCourseId,
  type KnownCourse,
  type RealCourse,
} from "#lib/akiko.ts";
import type {
  ClassifyOptions,
  SetupCreditRequirements,
} from "#lib/app-setup.ts";
import type { Major } from "#lib/constants.ts";
import {
  handleFaCalculus,
  handleFaLinearAlgebra,
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
  type Mode,
  UNLISTED,
  unlisted,
} from "#lib/requirements/common.ts";

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

function isC1(id: string): boolean {
  return id === "GA15331"; // 微分積分A
}

function isC1Unlisted(id: string): boolean {
  // 他学類開設の微分積分A
  return (
    id === "GA15311" || // 情報科学類1・2クラス
    id === "GA15321" || // 情報科学類3・4クラス
    id === "GA15341" // 知識情報・図書館学類
  );
}

function isC2(id: string): boolean {
  return id === "GC11701"; // 微分積分B
}

function isC3(id: string): boolean {
  return id === "GA15231"; // 線形代数A
}

function isC3Unlisted(id: string): boolean {
  // 他学類開設の線形代数A
  return (
    id === "GA15211" || // 情報科学類1・2クラス
    id === "GA15221" || // 情報科学類3・4クラス
    id === "GA15241" // 知識情報・図書館学類
  );
}

function isC4(id: string): boolean {
  return id === "GC11801"; // 線形代数B
}

function isC5(id: string): boolean {
  return id === "GA15131"; // 情報数学A
}

function isC5Unlisted(id: string): boolean {
  // 他学類開設の情報数学A
  return (
    id === "GA15111" || // 情報科学類1・2クラス
    id === "GA15121" || // 情報科学類3・4クラス
    id === "GA15141" // 知識情報・図書館学類
  );
}

function isC6(id: string): boolean {
  return id === "GC11601"; // 確率と統計
}

function isC7(id: string): boolean {
  return id === "GA18222"; // プログラミング入門A
}

// TODO: 社会工学類の新入生向けのクラス(FH60484・FH60494・FH60584・FH60594)も
// 移行生が使えるか、情報メディア創成学類の確認待ち
function isC7Unlisted(id: string, fromSougou: boolean): boolean {
  // 他学類開設のプログラミング入門A
  return (
    id === "GA18212" || // 情報科学類
    id === "GA18232" || // 知識情報・図書館学類
    (fromSougou && id === "FH60474") // 社会工学類、総合学域群優先
  );
}

function isC8(id: string): boolean {
  return id === "GA18322"; // プログラミング入門B
}

function isC8Unlisted(id: string, fromSougou: boolean): boolean {
  // 他学類開設のプログラミング入門B
  return (
    id === "GA18312" || // 情報科学類
    id === "GA18332" || // 知識情報・図書館学類
    (fromSougou && id === "FH60574") // 社会工学類、総合学域群優先
  );
}

function classifyColumnC(
  id: CourseId,
  tableYear: number,
  fromSougou: boolean,
  mode: Mode,
): string | typeof UNLISTED | undefined {
  if (isC1(id)) return "c1";
  if (isC1Unlisted(id)) return unlisted("c1", mode);
  if (isC2(id)) return "c2";
  if (isC3(id)) return "c3";
  if (isC3Unlisted(id)) return unlisted("c3", mode);
  if (isC4(id)) return "c4";
  if (isC5(id)) return "c5";
  if (isC5Unlisted(id)) return unlisted("c5", mode);
  if (isC6(id)) return "c6";
  if (isC7(id)) return "c7";
  if (isC7Unlisted(id, fromSougou)) return unlisted("c7", mode);
  if (isC8(id)) return "c8";
  if (isC8Unlisted(id, fromSougou)) return unlisted("c8", mode);
  let offset = 0;
  if (tableYear >= 2025) {
    offset = 1;
    // コンピュータリテラシー
    if (id === "GC12104") return "c9";
  }
  if (
    id === "GC12701" || // プログラミング (2023,4,5)
    id === "GC12791" // プログラミング
  )
    return "c" + (9 + offset);
  if (id === "GC13101") return "c" + (10 + offset); // コンピュータシステムとOS
  if (id === "GC12401") return "c" + (11 + offset); // データ構造とアルゴリズム
  if (id === "GC12403") return "c" + (12 + offset); // データ構造とアルゴリズム実習
  if (id === "GC13201") return "c" + (13 + offset); // データ工学概論
}

function isD1(id: string) {
  return id.startsWith("GC2") || id.startsWith("GA1");
}

function isE1(id: string) {
  return (
    id === "1119102" || // ファーストイヤーセミナー
    id === "1227611" // 学問への誘い
  );
}

function isE1Unlisted(id: string): boolean {
  return isFirstYearSeminar(id) || isIzanai(id);
}

function isE2(id: string) {
  return (
    id === "6525102" || // データサイエンス
    id === "6425102" || // 情報リテラシー(演習)
    id === "6114101" || // 情報リテラシー(講義) 2023
    id === "6125101" // 情報リテラシー(講義) 2024, 2025
  );
}

function isE2Unlisted(id: string): boolean {
  return (
    isInfoLiteracyLecture(id) || isInfoLiteracyExercise(id) || isDataScience(id)
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
  fromSougou: boolean,
  mode: Mode,
): string | typeof UNLISTED | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isA2(id)) return "a2";
  if (isA3(id)) return "a3";
  if (isA4(id)) return "a4";
  if (isA5(id)) return "a5";
  if (isA6(id)) return "a6";
  const c = classifyColumnC(id, tableYear, fromSougou, mode);
  if (c !== undefined) return c;
  if (isE1(id)) return "e1";
  if (isE1Unlisted(id)) return unlisted("e1", mode);
  if (isE2(id)) return "e2";
  if (isE2Unlisted(id)) return unlisted("e2", mode);
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
  opts: ClassifyOptions,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(
      c.id,
      c.name,
      opts.tableYear,
      opts.fromSougou,
      "known",
    );
    if (cellId !== undefined && cellId !== UNLISTED) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  opts: ClassifyOptions,
): Map<CourseId, string> {
  cs = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();

  // 注10: 総合学域群からの移行生はFAから始まる微積分1と2で微分積分Aに、
  // 線形代数1と2で線形代数Aに読み替えられる
  if (opts.fromSougou) {
    handleFaCalculus(cs, courseIdToCellId, "c1");
    handleFaLinearAlgebra(cs, courseIdToCellId, "c3");
  }

  for (const c of cs) {
    const cellId = classify(
      c.id,
      c.name,
      opts.tableYear,
      opts.fromSougou,
      "real",
    );
    if (cellId !== undefined && cellId !== UNLISTED) {
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
    if (isE4(c.name)) {
      fakeCourseIdToCellId.set(c.id, "e4");
    }
  }
  return fakeCourseIdToCellId;
}

export function getRemark(id: CellId, _tableYear: number): string | undefined {
  if (id === "a2") {
    // !!F!!
    return `注9(表の下部参照)には対応していません。`;
  }
  if (id === "e4" || id === "f3") {
    // !!E!!
    return `注8(表の下部参照)には対応していません。`;
  }
  if (id === "c2" || id === "c4" || id === "c7" || id === "c8") {
    // !!D!!
    return `総合学域群からの移行学生に関する注10(表の下部参照)には対応していません。`;
  }
  if (id === "h1" || id === "h2") {
    // !!C!!
    return `注5(表の下部参照)にもある通り、専門基礎科目などで指定された科目と同様の内容の講義の場合、ここに表示されていてもここではないマスの単位としてカウントされる場合があるので注意してください。`;
  }
}

const reqSince2021: SetupCreditRequirements = {
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

const reqSince2025: SetupCreditRequirements = {
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
  compulsory: 51,
  elective: 73,
};

export function getCreditRequirements(
  tableYear: number,
  _major: Major,
): SetupCreditRequirements {
  if (tableYear >= 2025) return reqSince2025;
  if (tableYear >= 2021) return reqSince2021;
  throw new Error(`Bad table year: ${tableYear}`);
}
