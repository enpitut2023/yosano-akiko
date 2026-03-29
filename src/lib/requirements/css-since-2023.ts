import type {
  CellId,
  CourseId,
  FakeCourse,
  FakeCourseId,
  KnownCourse,
  RealCourse,
} from "$lib/akiko";
import type { ClassifyOptions, SetupCreditRequirements } from "$lib/app-setup";
import type { Major } from "$lib/constants";
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
  isJapanese,
  isKyoushoku,
  isSecondForeignLanguage,
} from "./common";
import { unreachable } from "$lib/util";

export type Specialty =
  // Sociology（社会学）
  | "s"
  // Law（法学）
  | "l"
  // Political Science（政治学）
  | "ps"
  // Economics（経済学）
  | "e";
type Mode = "known" | "real";

function majorToSpecialtyOrFail(m: Major): Specialty {
  if (m === "css-s") return "s";
  if (m === "css-l") return "l";
  if (m === "css-ps") return "ps";
  if (m === "css-e") return "e";
  throw new Error(`Bad major: ${m}`);
}

// TODO:
// 全ての主専攻で2023→2024,2025で、h2にVから始まる科目が追加され、単位数の上限が20→34まで増えた。
// 全ての主専攻で2023→2024,2025で、h3の単位数の上限が10→26まで増えた。
// TODO:
// ps（政治学）の2023,2024→2025で、b1,b2がまとめてb1となっている。（BB32、BB31→BB3）

function classifyColumnA(id: string, specialty: Specialty): string | undefined {
  if (specialty === "s") {
    if (id === "BB11998") return "a1"; // 卒業論文
    if (id === "BB11997") return "a2"; // 卒業論文演習
    if (
      id === "BB11932" || // 社会学研究法A
      id === "BB11942"
    )
      return "a3"; // 社会学研究法B
  }
}

function classifyColumnB(
  id: string,
  specialty: Specialty,
  tableYear: number,
): string | undefined {
  const bb1 = id.startsWith("BB1");
  const bb2 = id.startsWith("BB2");
  const bb3 = id.startsWith("BB3");
  const bb4 = id.startsWith("BB4");
  switch (specialty) {
    case "s":
      // TODO: 「社会調査実習、社会学演習から12単位修得すること。（必ず社会学演習を6単位以上含めること）」というB1の中にも単位数の制限がある。
      if (bb1) return "b1";
      if (bb2 || bb3 || bb4) return "b2";
      break;
    case "l":
      // TODO: 「憲法I、憲法II、民法総則、刑法総論から4単位以上習得すること。ＢＢ２の演習科目から6単位以上修得すること」というB1の中にも単位数の制限がある。
      if (bb2) return "b1";
      if (bb1 || bb3 || bb4) return "b2";
      if (
        id.startsWith("AB00") ||
        id.startsWith("AB60") ||
        id.startsWith("BC11")
      )
        return "b3";
      break;
    case "ps":
      // TODO:2025年度だけ、BB3から始まる科目（ただし、BB32を6単位以上含めること）という制限がある。
      if (tableYear == 2023 || tableYear == 2024) {
        if (id.startsWith("BB32")) return "b1";
        if (id.startsWith("BB31")) return "b2";
        if (bb1 || bb2 || bb4) return "b3";
      } else {
        if (id.startsWith("BB3")) return "b1";
        if (bb1 || bb2 || bb4) return "b2";
      }
      break;
    case "e":
      // TODO: 「(ただしミクロ経済学、マクロ経済学、経済統計論のうちから4単位以上、さらに経済学演習を8単位以上含めること)」という制限がある。
      // TODO: 「（これらのうち別途指定する科目のみ）」という制限がある。これらのうち別途指定する科目って何？
      if (bb4 || id.startsWith("BC") || id.startsWith("FH")) return "b1";
      if (bb1 || bb2 || bb3) return "b2";
      break;
  }
}

function isC1(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    // TODO: !!A!! 現代社会論はどっちでもいいのか？
    case "s":
      return (
        id === "BB11011" || // 社会学基礎論
        id === "BB11021" || // 現代社会論
        id === "BC11801" // 現代社会論
      );
    // TODO: !!A!! 法学概論はどっちでもいいのか？
    case "l":
      return (
        id === "BB20001" || // 法学概論
        id === "BC51151" || // 法学概論
        id === "BB20021" // 民事法概論
      );
    // TODO: !!A!! 国際政治史はどっちでもいいのか？
    case "ps":
      return (
        id === "BB31011" || // 政治学概論
        id === "BB31031" || // 国際政治史
        id === "BC11651" // 国際政治史
      );
    case "e":
      return (
        id === "BB41051" || // 経済学基礎論
        id === "BB41061" // 現代経済史
      );
    default:
      unreachable(specialty);
  }
}

function isD1(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "s":
      return (
        id === "BB20001" || // 法学概論
        id === "BC51151" || // 法学概論
        id === "BB20021" || // 民事法概論
        id === "BB31011" || // 政治学概論
        id === "BB31031" || // 国際政治史
        id === "BC11651" || // 国際政治史
        id === "BB41051" || // 経済学基礎論
        id === "BB41061" // 現代経済史
      );
    case "l":
      return (
        id === "BB11011" || // 社会学基礎論
        id === "BB11021" || // 現代社会論
        id === "BC11801" || // 現代社会論
        id === "BB31011" || // 政治学概論
        id === "BB31031" || // 国際政治史
        id === "BC11651" || // 国際政治史
        id === "BB41051" || // 経済学基礎論
        id === "BB41061" // 現代経済史
      );
    case "ps":
      return (
        id === "BB11011" || // 社会学基礎論
        id === "BB11021" || // 現代社会論
        id === "BC11801" || // 現代社会論
        id === "BB20001" || // 法学概論
        id === "BC51151" || // 法学概論
        id === "BB20021" || // 民事法概論
        id === "BB41051" || // 経済学基礎論
        id === "BB41061" // 現代経済史
      );
    case "e":
      return (
        id === "BB11011" || // 社会学基礎論
        id === "BB11021" || // 現代社会論
        id === "BC11801" || // 現代社会論
        id === "BB20001" || // 法学概論
        id === "BC51151" || // 法学概論
        id === "BB20021" || // 民事法概論
        id === "BB31011" || // 政治学概論
        id === "BB31031" || // 国際政治史
        id === "BC11651" // 国際政治史
      );
    default:
      unreachable(specialty);
  }
}

function isD2(id: string): boolean {
  return (
    id === "BB05011" || // 社会学の最前線
    id === "BB05021" || // 法学の最前線
    id === "BB05031" || // 政治学の最前線
    id === "BB05041" // 経済学の最前線
  );
}

function isD3(id: string): boolean {
  return (
    id === "BA91012" || // 社会学の最前線チュートリアル
    id === "BA91022" || // 法学の最前線チュートリアル
    id === "BA91032" || // 政治学の最前線チュートリアル
    id === "BA91042" // 経済学の最前線チュートリアル
  );
}

function isE1(id: string, mode: Mode): boolean {
  return (
    id === "1104102" || // ファーストイヤーセミナー 1クラス
    id === "1104202" || // ファーストイヤーセミナー 2クラス
    id === "1104302" || // ファーストイヤーセミナー 3クラス
    id === "1227131" || // 学問への誘い 1クラス
    id === "1227141" || // 学問への誘い 2クラス
    id === "1227151" || // 学問への誘い 3クラス
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

// TODO:第1外国語が英語に限定されないかもしれないから要確認
function isE3(name: string): boolean {
  return isCompulsoryEnglishByName(name); // 第1外国語
}

function isE4(id: string, name: string): boolean {
  return isSecondForeignLanguage(id, name); // 第2外国語
}

function isE5(id: string, mode: Mode): boolean {
  return (
    id === "6104101" || // 情報リテラシー(講義)
    id === "6404102" || // 情報リテラシー(演習) 1班
    id === "6404202" || // 情報リテラシー(演習) 2班
    id === "6504102" || // データサイエンス 1班
    id === "6504202" || // データサイエンス 2班
    (mode === "real" &&
      (isInfoLiteracyLecture(id) ||
        isInfoLiteracyExercise(id) ||
        isDataScience(id)))
  );
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isF2(id: string): boolean {
  return isElectivePe(id);
}

function isF3(id: string): boolean {
  return isForeignLanguage(id);
}

function isF4(id: string): boolean {
  return isJapanese(id);
}

function isF5(id: string): boolean {
  return isArt(id);
}

function isH1(id: string): boolean {
  return isKyoushoku(id);
}

function isH2(id: string, specialty: Specialty, tableYear: number): boolean {
  if (tableYear >= 2024 && id.startsWith("V")) return true;
  if (specialty === "l" && /^(AB00|AB60|BC11)/.test(id)) return false;
  return /^(BC|A|C|H|W|Y|8|99)/.test(id);
}

function isH3(id: string): boolean {
  return id.startsWith("E") || id.startsWith("F") || id.startsWith("G");
}

function isH4(id: string): boolean {
  return id.startsWith("BA") || id.startsWith("BE");
}

function classify(
  id: CourseId,
  name: string,
  specialty: Specialty,
  tableYear: number,
  mode: Mode,
): string | undefined {
  // 必修
  const a = classifyColumnA(id, specialty);
  if (a !== undefined) return a;
  if (isC1(id, specialty)) return "c1";
  if (isE1(id, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(name)) return "e3";
  if (isE4(id, name)) return "e4";
  if (isE5(id, mode)) return "e5";
  // 選択
  // d列に当てはまる科目がb列の条件にも該当してしまうため先にd列を処理
  if (isD1(id, specialty)) return "d1";
  if (isD2(id)) return "d2";
  if (isD3(id)) return "d3";
  const b = classifyColumnB(id, specialty, tableYear);
  if (b !== undefined) return b;
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isF3(id)) return "f3";
  if (isF4(id)) return "f4";
  if (isF5(id)) return "f5";
  if (isH1(id)) return "h1";
  if (isH2(id, specialty, tableYear)) return "h2";
  if (isH3(id)) return "h3";
  if (isH4(id)) return "h4";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
): Map<CourseId, string> {
  const specialty = majorToSpecialtyOrFail(opts.major);
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, specialty, opts.tableYear, "known");
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  opts: ClassifyOptions,
): Map<CourseId, string> {
  const specialty = majorToSpecialtyOrFail(opts.major);
  cs = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, specialty, opts.tableYear, "real");
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
    if (isE3(c.name)) {
      fakeCourseIdToCellId.set(c.id, "e3");
    }
  }
  return fakeCourseIdToCellId;
}

export function getRemark(
  id: CellId,
  tableYear: number,
  major: Major,
): string | undefined {
  const specialty = majorToSpecialtyOrFail(major);
  if ((specialty === "s" || specialty === "l") && id === "b1") {
    // !!F!!
    return `マスに書かれている条件は判定していません。`;
  } else if (
    ((tableYear >= 2024 && specialty === "ps") || specialty === "e") &&
    id === "b1"
  ) {
    // !!F!!
    return `()の条件は判定されません。`;
  }
  if (id === "h2" || id === "h3" || id === "h4") {
    // !!C!!
    return `専門基礎科目などで指定された科目と同様の内容の講義の場合、ここに表示されていてもここではないマスの単位としてカウントされる場合があるので注意してください。`;
  }
}

const reqSSince2024: SetupCreditRequirements = {
  cells: {
    a1: { min: 6, max: 6 },
    a2: { min: 4, max: 4 },
    a3: { min: 2, max: 2 },
    b1: { min: 30, max: 56 },
    b2: { min: 19, max: 44 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 34 },
    h3: { min: 2, max: 26 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    a: { min: 12, max: 12 },
    b: { min: 49, max: 74 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 32,
  elective: 94,
};

const reqSSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 6, max: 6 },
    a2: { min: 4, max: 4 },
    a3: { min: 2, max: 2 },
    b1: { min: 30, max: 56 },
    b2: { min: 19, max: 44 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 20 },
    h3: { min: 2, max: 20 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    a: { min: 12, max: 12 },
    b: { min: 49, max: 74 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 32,
  elective: 94,
};

const reqLSince2024: SetupCreditRequirements = {
  cells: {
    b1: { min: 40, max: 62 },
    b2: { min: 21, max: 42 },
    b3: { min: 0, max: 10 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 34 },
    h3: { min: 2, max: 26 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    b: { min: 61, max: 84 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 20,
  elective: 106,
};

const reqLSince2023: SetupCreditRequirements = {
  cells: {
    b1: { min: 40, max: 62 },
    b2: { min: 21, max: 42 },
    b3: { min: 0, max: 10 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 20 },
    h3: { min: 2, max: 10 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    b: { min: 61, max: 84 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 20,
  elective: 106,
};

const reqPsSince2025: SetupCreditRequirements = {
  cells: {
    b1: { min: 30, max: 53 },
    b2: { min: 31, max: 54 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 34 },
    h3: { min: 2, max: 26 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    b: { min: 61, max: 84 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 20,
  elective: 106,
};

const reqPsSince2024: SetupCreditRequirements = {
  cells: {
    b1: { min: 6, max: 12 },
    b2: { min: 24, max: 42 },
    b3: { min: 31, max: 54 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 34 },
    h3: { min: 2, max: 26 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    b: { min: 61, max: 84 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 20,
  elective: 106,
};

const reqPsSince2023: SetupCreditRequirements = {
  cells: {
    b1: { min: 6, max: 12 },
    b2: { min: 24, max: 42 },
    b3: { min: 31, max: 54 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 20 },
    h3: { min: 2, max: 10 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    b: { min: 61, max: 84 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 20,
  elective: 106,
};

const reqESince2024: SetupCreditRequirements = {
  cells: {
    b1: { min: 32, max: 62 },
    b2: { min: 29, max: 50 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 34 },
    h3: { min: 2, max: 26 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    b: { min: 61, max: 84 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 20,
  elective: 106,
};

const reqESince2023: SetupCreditRequirements = {
  cells: {
    b1: { min: 32, max: 62 },
    b2: { min: 29, max: 50 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 20 },
    h3: { min: 2, max: 10 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    b: { min: 61, max: 84 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 20,
  elective: 106,
};

export function getCreditRequirements(
  tableYear: number,
  major: Major,
): SetupCreditRequirements {
  const specialty = majorToSpecialtyOrFail(major);
  switch (specialty) {
    case "s":
      if (tableYear >= 2024) return reqSSince2024;
      return reqSSince2023;
    case "l":
      if (tableYear >= 2024) return reqLSince2024;
      return reqLSince2023;
    case "ps":
      if (tableYear >= 2025) return reqPsSince2025;
      if (tableYear >= 2024) return reqPsSince2024;
      return reqPsSince2023;
    case "e":
      if (tableYear >= 2024) return reqESince2024;
      return reqESince2023;
    default:
      return unreachable(specialty);
  }
}
