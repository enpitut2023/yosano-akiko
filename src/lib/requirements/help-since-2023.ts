import {
  type CellId,
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
  isKyoushoku,
  isSecondForeignLanguage,
} from "./common";
import { unreachable } from "$lib/util";

export type Specialty =
  // Philosophy（哲学）
  | "p"
  // History（史学）
  | "h"
  // Archaeology and Folklore（考古学・民俗学）
  | "af"
  // Linguistics（言語学）
  | "l";

function majorToSpecialtyOrFail(m: Major): Specialty {
  if (m === "help-p") return "p";
  if (m === "help-h") return "h";
  if (m === "help-af") return "af";
  if (m === "help-l") return "l";
  throw new Error(`Bad major: ${m}`);
}

function isA1(id: string): boolean {
  return (
    // 卒業論文
    id === "AB62K38" || // 卒業論文(哲学・倫理学)
    id === "AB63K38" || // 卒業論文(宗教学)
    id === "AB71K38" || // 卒業論文(日本史学)
    id === "AB75K38" || // 卒業論文(歴史地理学)
    id === "AB83K38" || // 卒業論文(先史学・考古学)
    id === "AB83K48" || // 卒業論文(先史学・考古学)
    id === "AB86K38" || // 卒業論文(民俗学・文化人類学)
    id === "AB91K38" || // 卒業論文(一般言語学)
    id === "AB92K38" || // 卒業論文(応用言語学)
    id === "AB93K38" || // 卒業論文(日本語学)
    id === "AB95K38" || // 卒業論文(英語学)
    // 研究-a
    id === "AB62K12" || // 哲学・倫理学研究-a
    id === "AB63K12" || // 宗教学研究-a
    id === "AB71K12" || // 日本史研究-a
    id === "AB74K12" || // ユーラシア史研究-a
    id === "AB75K12" || // 歴史地理学研究-a
    id === "AB83K12" || // 先史学・考古学研究-a
    id === "AB86K12" || // 民俗学・文化人類学研究-a
    id === "AB91K12" || // 一般言語学研究-a
    id === "AB92K12" || // 応用言語学研究-a
    id === "AB93K12" || // 日本語学研究-a
    id === "AB95K12" || // 英語学研究-a
    // 研究-b
    id === "AB62K22" || // 哲学・倫理学研究-b
    id === "AB63K22" || // 宗教学研究-b
    id === "AB63K32" || // 宗教学研究-b
    id === "AB71K22" || // 日本史研究-b
    id === "AB71K32" || // 日本史研究-b
    id === "AB74K22" || // ユーラシア史研究-b
    id === "AB75K22" || // 歴史地理学研究-b
    id === "AB83K22" || // 先史学・考古学研究-b
    id === "AB83K32" || // 先史学・考古学研究-b
    id === "AB86K22" || // 民俗学・文化人類学研究-b
    id === "AB91K22" || // 一般言語学研究-b
    id === "AB92K22" || // 応用言語学研究-b
    id === "AB93K22" || // 日本語学研究-b
    id === "AB93K32" || // 日本語学研究-b
    id === "AB95K22" // 英語学研究-b
  );
}

function isB1(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "p":
      return /^(AB6[1-3]|AC5[45])/.test(id);
    case "h":
      return /^(AB7[1-5]|AB61|AB91|AC6[0-2]|EE21)/.test(id);
    case "af":
      return /^(AB8[1-6]|AC6[02])/.test(id);
    case "l":
      return /^(AB72|AB9[1-6]|AC9[7-9])/.test(id);
    default:
      unreachable(specialty);
  }
}

function isB2(id: string, specialty: Specialty, tableYear: number): boolean {
  if (tableYear >= 2024) return /^(AB[6-9]|AC[5-6]|EE21)/.test(id);
  switch (specialty) {
    case "p":
      return /^(AB[6-9]|AC54|AC55|AC60|AC62|AC64|AC65|EE21)/.test(id);
    case "h":
    case "af":
    case "l":
      return /^(AB[6-9]|AC60|AC61|AC62|EE21)/.test(id);
    default:
      unreachable(specialty);
  }
}

function classifyColumnD(
  id: string,
  specialty: Specialty,
  tableYear: number,
): string | undefined {
  // TODO: d1とd2の条件が完全に被っているので、おそらくd1に入りきらなかった単位
  // がd2に流れていく。未実装。 !!B!!
  switch (specialty) {
    case "p":
      if (
        (tableYear >= 2025 && /^(AB5|AB60|AC50|AC56|AE56)/.test(id)) ||
        /^(AB5|AB60|EE21)/.test(id)
      )
        return "d1";
      if (/^(AB5|AB60|AC50)/.test(id)) return "d2";
      break;
    case "h":
      if (
        (tableYear >= 2025 && /^(AB5|AB70|AC56|AE56)/.test(id)) ||
        /^(AB5|AB70)/.test(id)
      )
        return "d1";
      if (/^(AB5|AB70)/.test(id)) return "d2";
      break;
    case "af":
      if (
        (tableYear >= 2025 && /^(AB5|AB80|AC50|AC56|AE56)/.test(id)) ||
        /^(AB5|AB80|AC50)/.test(id)
      )
        return "d1";
      if (/^AB5/.test(id)) return "d2";
      break;
    case "l":
      if (
        (tableYear >= 2025 && /^(AB5|AB90|AC56|AE56)/.test(id)) ||
        /^(AB5|AB90)/.test(id)
      )
        return "d1";
      if (/^(AB5|AB90)/.test(id)) return "d2";
      break;
  }
}

function isE1(id: string, mode: "known" | "real"): boolean {
  return (
    id === "1101102" || // ファーストイヤーセミナー 1クラス
    id === "1101202" || // ファーストイヤーセミナー 2クラス
    id === "1101302" || // ファーストイヤーセミナー 3クラス
    id === "1101402" || // ファーストイヤーセミナー 4クラス
    id === "1101502" || // ファーストイヤーセミナー 5クラス
    id === "1227011" || // 学問への誘い 1クラス
    id === "1227021" || // 学問への誘い 2クラス
    id === "1227031" || // 学問への誘い 3クラス
    id === "1227041" || // 学問への誘い 4クラス
    id === "1227051" || // 学問への誘い 5クラス
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

function isE3(name: string): boolean {
  return isCompulsoryEnglishByName(name); // 第1外国語
}

function isE4(id: string, name: string): boolean {
  return isSecondForeignLanguage(id, name); // 第2外国語
}

function isE5(id: string, mode: "known" | "real"): boolean {
  return (
    id === "6101101" || // 情報リテラシー(講義)
    id === "6401102" || // 情報リテラシー(演習) 1班
    id === "6401202" || // 情報リテラシー(演習) 2班
    id === "6501102" || // データサイエンス 1班
    id === "6501202" || // データサイエンス 2班
    (mode === "real" &&
      (isInfoLiteracyLecture(id) ||
        isInfoLiteracyExercise(id) ||
        isDataScience(id)))
  );
}

function isE6(id: string) {
  return isJapanese(id);
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isF2(id: string): boolean {
  return isElectivePe(id) || isForeignLanguage(id) || isArt(id);
}

function isH1(id: string): boolean {
  return /^(AA2|AC|AE|B|Y)/.test(id);
}

function isH2(id: string): boolean {
  return /^(C|E|F|G|H|W)/.test(id);
}

function isH3(id: string): boolean {
  return id.startsWith("8");
}

function isH4(id: string): boolean {
  return isKyoushoku(id);
}

function isH5(id: string): boolean {
  return isHakubutsukan(id);
}

function classify(
  id: CourseId,
  name: string,
  specialty: Specialty,
  tableYear: number,
  mode: "known" | "real",
): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isE1(id, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(name)) return "e3";
  if (isE4(id, name)) return "e4";
  if (isE5(id, mode)) return "e5";
  if (isE6(id)) return "e6";
  // 選択
  // d列に当てはまる科目がb列の条件にも該当してしまうため先にd列を処理
  const d = classifyColumnD(id, specialty, tableYear);
  if (d !== undefined) return d;
  if (isB1(id, specialty)) return "b1";
  if (isB2(id, specialty, tableYear)) return "b2";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isH1(id)) return "h1";
  if (isH2(id)) return "h2";
  if (isH3(id)) return "h3";
  if (isH4(id)) return "h4";
  if (isH5(id)) return "h5";
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
  _tableYear: number,
  major: Major,
): string | undefined {
  const specialty = majorToSpecialtyOrFail(major);
  if (id === "h1" || id === "h2") {
    // !!C!!
    return `専門基礎科目などで指定された科目と同様の内容の講義の場合、ここに表示されていてもここではないマスの単位としてカウントされる場合があるので注意してください。`;
  }
}


const reqPSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 10, max: 10 },
    b1: { min: 20, max: 20 },
    b2: { min: 24, max: 58 },
    d1: { min: 11, max: 11 },
    d2: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    e6: { min: 2, max: 2 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 14 },
    h1: { min: 4, max: 32 },
    h2: { min: 2, max: 30 },
    h3: { min: 0, max: 10 },
    h4: { min: 0, max: 10 },
    h5: { min: 0, max: 10 },
  },
  columns: {
    a: { min: 10, max: 10 },
    b: { min: 44, max: 78 },
    c: { min: 0, max: 0 },
    d: { min: 11, max: 15 },
    e: { min: 18, max: 18 },
    f: { min: 1, max: 17 },
    h: { min: 6, max: 34 },
  },
  compulsory: 28,
  elective: 96,
};

const reqPSince2025: SetupCreditRequirements = {
  cells: {
    a1: { min: 10, max: 10 },
    b1: { min: 20, max: 20 },
    b2: { min: 24, max: 58 },
    d1: { min: 11, max: 11 },
    d2: { min: 0, max: 7 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    e6: { min: 2, max: 2 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 14 },
    h1: { min: 4, max: 32 },
    h2: { min: 2, max: 30 },
    h3: { min: 0, max: 10 },
    h4: { min: 0, max: 10 },
    h5: { min: 0, max: 10 },
  },
  columns: {
    a: { min: 10, max: 10 },
    b: { min: 44, max: 78 },
    c: { min: 0, max: 0 },
    d: { min: 11, max: 18 },
    e: { min: 18, max: 18 },
    f: { min: 1, max: 17 },
    h: { min: 6, max: 34 },
  },
  compulsory: 28,
  elective: 96,
};

const reqHSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 10, max: 10 },
    b1: { min: 20, max: 20 },
    b2: { min: 24, max: 58 },
    d1: { min: 11, max: 11 },
    d2: { min: 0, max: 6 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    e6: { min: 2, max: 2 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 14 },
    h1: { min: 4, max: 32 },
    h2: { min: 2, max: 30 },
    h3: { min: 0, max: 10 },
    h4: { min: 0, max: 10 },
    h5: { min: 0, max: 10 },
  },
  columns: {
    a: { min: 10, max: 10 },
    b: { min: 44, max: 78 },
    c: { min: 0, max: 0 },
    d: { min: 11, max: 17 },
    e: { min: 18, max: 18 },
    f: { min: 1, max: 17 },
    h: { min: 6, max: 34 },
  },
  compulsory: 28,
  elective: 96,
};

const reqHSince2025: SetupCreditRequirements = {
  cells: {
    a1: { min: 10, max: 10 },
    b1: { min: 20, max: 20 },
    b2: { min: 24, max: 58 },
    d1: { min: 11, max: 11 },
    d2: { min: 0, max: 9 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    e6: { min: 2, max: 2 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 14 },
    h1: { min: 4, max: 32 },
    h2: { min: 2, max: 30 },
    h3: { min: 0, max: 10 },
    h4: { min: 0, max: 10 },
    h5: { min: 0, max: 10 },
  },
  columns: {
    a: { min: 10, max: 10 },
    b: { min: 44, max: 78 },
    c: { min: 0, max: 0 },
    d: { min: 11, max: 20 },
    e: { min: 18, max: 18 },
    f: { min: 1, max: 17 },
    h: { min: 6, max: 34 },
  },
  compulsory: 28,
  elective: 96,
};

const reqAFSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 10, max: 10 },
    b1: { min: 20, max: 20 },
    b2: { min: 24, max: 58 },
    d1: { min: 11, max: 11 },
    d2: { min: 0, max: 2 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    e6: { min: 2, max: 2 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 14 },
    h1: { min: 4, max: 32 },
    h2: { min: 2, max: 30 },
    h3: { min: 0, max: 10 },
    h4: { min: 0, max: 10 },
    h5: { min: 0, max: 10 },
  },
  columns: {
    a: { min: 10, max: 10 },
    b: { min: 44, max: 78 },
    c: { min: 0, max: 0 },
    d: { min: 11, max: 13 },
    e: { min: 18, max: 18 },
    f: { min: 1, max: 17 },
    h: { min: 6, max: 34 },
  },
  compulsory: 28,
  elective: 96,
};

const reqAFSince2025: SetupCreditRequirements = {
  cells: {
    a1: { min: 10, max: 10 },
    b1: { min: 20, max: 20 },
    b2: { min: 24, max: 58 },
    d1: { min: 11, max: 11 },
    d2: { min: 0, max: 5 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    e6: { min: 2, max: 2 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 14 },
    h1: { min: 4, max: 32 },
    h2: { min: 2, max: 30 },
    h3: { min: 0, max: 10 },
    h4: { min: 0, max: 10 },
    h5: { min: 0, max: 10 },
  },
  columns: {
    a: { min: 10, max: 10 },
    b: { min: 44, max: 78 },
    c: { min: 0, max: 0 },
    d: { min: 11, max: 16 },
    e: { min: 18, max: 18 },
    f: { min: 1, max: 17 },
    h: { min: 6, max: 34 },
  },
  compulsory: 28,
  elective: 96,
};

const reqLSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 10, max: 10 },
    b1: { min: 18, max: 18 },
    b2: { min: 26, max: 60 },
    d1: { min: 11, max: 11 },
    d2: { min: 0, max: 7 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    e6: { min: 2, max: 2 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 14 },
    h1: { min: 4, max: 32 },
    h2: { min: 2, max: 30 },
    h3: { min: 0, max: 10 },
    h4: { min: 0, max: 10 },
    h5: { min: 0, max: 10 },
  },
  columns: {
    a: { min: 10, max: 10 },
    b: { min: 44, max: 78 },
    c: { min: 0, max: 0 },
    d: { min: 11, max: 18 },
    e: { min: 18, max: 18 },
    f: { min: 1, max: 17 },
    h: { min: 6, max: 34 },
  },
  compulsory: 28,
  elective: 96,
};

const reqLSince2025: SetupCreditRequirements = {
  cells: {
    a1: { min: 10, max: 10 },
    b1: { min: 18, max: 18 },
    b2: { min: 26, max: 60 },
    d1: { min: 11, max: 11 },
    d2: { min: 0, max: 10 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    e6: { min: 2, max: 2 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 14 },
    h1: { min: 4, max: 32 },
    h2: { min: 2, max: 30 },
    h3: { min: 0, max: 10 },
    h4: { min: 0, max: 10 },
    h5: { min: 0, max: 10 },
  },
  columns: {
    a: { min: 10, max: 10 },
    b: { min: 44, max: 78 },
    c: { min: 0, max: 0 },
    d: { min: 11, max: 21 },
    e: { min: 18, max: 18 },
    f: { min: 1, max: 17 },
    h: { min: 6, max: 34 },
  },
  compulsory: 28,
  elective: 96,
};

export function getCreditRequirements(
  tableYear: number,
  major: Major,
): SetupCreditRequirements {
  const specialty = majorToSpecialtyOrFail(major);
  switch (specialty) {
    case "p":
      if (tableYear >= 2025) return reqPSince2025;
      return reqPSince2023;
    case "h":
      if (tableYear >= 2025) return reqHSince2025;
      return reqHSince2023;
    case "af":
      if (tableYear >= 2025) return reqAFSince2025;
      return reqAFSince2023;
    case "l":
      if (tableYear >= 2025) return reqLSince2025;
      return reqLSince2023;
    default:
      return unreachable(specialty);
  }
}
