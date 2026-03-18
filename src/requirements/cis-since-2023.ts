import {
  CellId,
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
  isSecondForeignLanguage,
} from "@/requirements/common";

export type Specialty = "ir" | "id";
type Mode = "known" | "real";

function isA1(id: string): boolean {
  return (
    id === "BC14908" || // 卒業論文
    id === "BC14918" // 卒業論文 5月提出予定の学生のみ対象
  );
}

// TODO:
// 国際関係学と国際開発学で条件違う
// 国際関係学…BC11、BC16より14単位以上履修すること。
// 国際開発学…BC12より14単位以上履修すること。
function isB1(id: string): boolean {
  return /^(BC1[126]|BE22)/.test(id);
}

function isB2(id: string): boolean {
  return id.startsWith("BC13");
}

function isB3(id: string): boolean {
  return id.startsWith("BC15");
}

function isC1(id: string): boolean {
  return (
    id === "BC50111" // 国際学I
  );
}

function isC2(id: string): boolean {
  return (
    id === "BC50121" // 国際学II
  );
}

function isC3(id: string): boolean {
  return (
    id === "BC50131" // 国際学III
  );
}

function isC4(id: string): boolean {
  return (
    id === "BC50141" // 国際学IV
  );
}

function isD1(id: string): boolean {
  return /^(BC51|BE21)/.test(id);
}

function isD2(id: string): boolean {
  return (
    id === "BC51314" || // English Discussion Seminar(A)
    id === "BC51324" || // English Discussion Seminar(B)
    id === "BC51334" || // English Discussion Seminar(C)
    id === "BC51344" || // English Discussion Seminar(D) 2024, 2025年度のみ
    id === "BC51574" || // English Debate 学籍番号奇数番号
    id === "BC51584" // English Debate　学籍番号偶数番号
  );
}

function isD3(id: string): boolean {
  return (
    id.startsWith("BB050") ||
    id.startsWith("FH611") ||
    id === "FG10641" || // 工学システム概論
    id.startsWith("GA12") ||
    id.startsWith("BA92")
  );
}

function isE1(id: string, mode: Mode): boolean {
  return (
    id === "1105102" || // ファーストイヤーセミナー 1クラス
    id === "1105202" || // ファーストイヤーセミナー 2クラス
    id === "1227171" || // 学問への誘い 1クラス
    id === "1227181" || // 学問への誘い 2クラス
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

// TODO: 第1外国語が英語に限定されないかもしれないから要確認 !!B!!
function isE3(name: string): boolean {
  return isCompulsoryEnglishByName(name); // 第1外国語
}

function isE4(id: string): boolean {
  return isSecondForeignLanguage(id); // 第2外国語
}

function isE5(id: string, mode: Mode): boolean {
  return (
    id === "6105101" || // 情報リテラシー(講義) !!A!!
    id === "6404102" || // 情報リテラシー(演習) 1班 !!A!!
    id === "6405102" || // 情報リテラシー(演習) 2班 !!A!!
    id === "6504102" || // データサイエンス 1班 !!A!!
    id === "6505102" || // データサイエンス 2班 !!A!!
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
  // 社会・国際学群共通科目（BA）（ただし専門基礎科目で指定する科目を除く）、特設自由科目並びに博物館に関する科目
  return id.startsWith("BA") || isJiyuukamoku(id) || isHakubutsukan(id);
}

function isH2(id: string): boolean {
  // A、BB、Cで始まる授業科目（ただし専門基礎科目で指定する科目を除く）
  return /^(A|BB|C)/.test(id);
}

function isH3(id: string): boolean {
  // E、F、G、H、W、Yで始まる授業科目（ただし専門基礎科目で指定する科目を除く）
  return /^[EFGHWY]/.test(id);
}

function isH4(id: string): boolean {
  return isKyoushoku(id);
}

function classify(id: CourseId, name: string, mode: Mode): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isC1(id)) return "c1";
  if (isC2(id)) return "c2";
  if (isC3(id)) return "c3";
  if (isC4(id)) return "c4";
  if (isE1(id, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(name)) return "e3";
  if (isE4(id)) return "e4";
  if (isE5(id, mode)) return "e5";
  // 選択
  if (isB1(id)) return "b1";
  if (isB2(id)) return "b2";
  if (isB3(id)) return "b3";
  if (isD2(id)) return "d2"; // d1に該当する科目がd2にあるので先にd2
  if (isD1(id)) return "d1";
  if (isD3(id)) return "d3";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isF3(id)) return "f3";
  if (isF4(id)) return "f4";
  if (isF5(id)) return "f5";
  if (isH1(id)) return "h1";
  if (isH2(id)) return "h2";
  if (isH3(id)) return "h3";
  if (isH4(id)) return "h4";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  _opts: ClassifyOptions,
  _tableYear: number,
  _specialty: Specialty,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, "known");
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  _opts: ClassifyOptions,
  _tableYear: number,
  _specialty: Specialty,
): Map<CourseId, string> {
  cs = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, "real");
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
    if (isE3(c.name)) {
      fakeCourseIdToCellId.set(c.id, "e3");
    }
  }
  return fakeCourseIdToCellId;
}

export function getRemark(
  id: CellId,
  _tableYear: number,
  specialty: Specialty,
): string | undefined {
  if(id === "b1"){
    // !!F!!
    return `*の条件(国際開発学主専攻の表下部参照)には対応していません。`
  }
  else if (id === "h1" || id === "h2" || id === "h3") {
    // !!C!!
    return `専門基礎科目などで指定された科目と同様の内容の講義の場合、ここに表示されていてもここではないマスの単位としてカウントされる場合があるので注意してください。`
  }
}

export const creditRequirementsSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 6, max: 6 },
    b1: { min: 32, max: 70 },
    b2: { min: 6, max: 9 },
    b3: { min: 0, max: 4 },
    c1: { min: 1, max: 1 },
    c2: { min: 1, max: 1 },
    c3: { min: 1, max: 1 },
    c4: { min: 1, max: 1 },
    d1: { min: 10, max: 28 },
    d2: { min: 4, max: 4 },
    d3: { min: 0, max: 14 },
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
    h1: { min: 0, max: 5 },
    h2: { min: 3, max: 20 },
    h3: { min: 3, max: 20 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    a: { min: 6, max: 6 },
    b: { min: 38, max: 83 },
    c: { min: 4, max: 4 },
    d: { min: 14, max: 46 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 6, max: 35 },
  },
  compulsory: 26,
  elective: 100,
};
