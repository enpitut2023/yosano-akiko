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
  isCompulsoryEnglishById,
  isCompulsoryEnglishByName,
  isCompulsoryPe1,
  isCompulsoryPe2,
  isCompulsoryPe3,
  isDataScience,
  isElectivePe,
  isForeignLanguage,
  isGakushikiban,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isJapanese,
  isSecondForeignLanguage,
} from "@/requirements/common";
import { unreachable } from "@/util";

export type Specialty = "none" | "jltt";
type Mode = "known" | "real";

function isA1(id: string): boolean {
  return (
    id === "AE10F28" || // 卒業論文春　留学または休学した学生対象＊教員と要相談 !!A!!
    id === "AE10F18" // 卒業論文秋 !!A!!
  );
}

function classifyColumnB(id: string, specialty: Specialty): string | undefined {
  let offset = 0;
  switch (specialty) {
    case "none": {
      // TODO: AE14を１単位必ず含む
      if (id.startsWith("AE13") || id.startsWith("AE14")) return "b1";
      break;
    }
    case "jltt": {
      if (id.startsWith("AE13") || id.startsWith("AE14")) return "b1";
      if (id.startsWith("AE18")) return "b2";
      offset = 1;
      break;
    }
    default:
      unreachable(specialty);
  }
  if (id.startsWith("AE10A")) return "b" + (2 + offset);
  if (id.startsWith("AE10B")) return "b" + (3 + offset);
  if (id.startsWith("AE10C")) return "b" + (4 + offset);
  if (id.startsWith("AE10D")) return "b" + (5 + offset);
  if (id.startsWith("AE10E")) return "b" + (6 + offset);
  if (/^(AB[6-9][1-9]|AC6[0-6]|BB11[1-9]|BB1[69])/.test(id)) {
    return "b" + (7 + offset);
  }
}

function isC1(id: string): boolean {
  return id === "AE51A21"; // 日本語・日本文化研究法
}

function isC2(id: string, specialty: Specialty): boolean {
  return specialty === "jltt" && id === "AE51K11"; // Japan-Expert総論
}

function classifyColumnD(id: string, specialty: Specialty): string | undefined {
  if (id.startsWith("AE56")) return "d1";
  if (id.startsWith("AE53")) return "d2";
  if (id.startsWith("AE54")) return "d3";
  let offset = 0;
  if (specialty === "jltt") {
    offset = 1;
    if (id.startsWith("AE55")) return "d4";
  }
  if (/^(AE5|AB[5-9]0|AC5[06]|BB110)/.test(id)) return "d" + (4 + offset);
}

function isE1(id: string, specialty: Specialty): boolean {
  return (
    id === "1103102" || // ファーストイヤーセミナー 1クラス対象 !!A!!
    id === "1227111" || // 学問への誘い 1クラス対象 !!A!!
    (specialty === "jltt" && id === "1122502") // Japan-Expertファーストイヤーセミナー
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id) || isCompulsoryPe3(id);
}

function isE3(id: string, name: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "none":
      return isCompulsoryEnglishByName(name);
    case "jltt":
      // TODO: 5-1.pdfによると3920から始まるものはJapan-Expert用の外国語として
      // の日本語授業だが、そもそも39から始まるものが外国語としての日本語。今は
      // 広くとっておく。!!B!!
      return id.startsWith("39");
    default:
      unreachable(specialty);
  }
}

function isE4(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "none":
      // TODO: 第二外国語（初修外国語）は必修ではない英語も含まない？ !!B!!
      return isSecondForeignLanguage(id);
    case "jltt":
      // TODO: JEの第二外国語（英語）は日本人の必修英語と一緒？ !!B!!
      return isCompulsoryEnglishById(id);
    default:
      unreachable(specialty);
  }
}

function isE5(id: string, mode: Mode): boolean {
  return (
    id === "6102101" || // 情報リテラシー(講義) !!A!!
    id === "6402202" || // 情報リテラシー(演習)  !!A!!
    id === "6502202" || // データサイエンス !!A!!
    (mode === "real" &&
      (isInfoLiteracyLecture(id) ||
        isInfoLiteracyExercise(id) ||
        isDataScience(id)))
  );
}

function isE6(id: string, specialty: Specialty): boolean {
  if (specialty === "none") {
    return (
      id === "5102031" || // 国語I (日日、総学1,2組対象) !!A!!
      id === "5202031" // 国語II (日日、総学1,2組対象) !!A!!
    );
  }
  return false;
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isF2(id: string, specialty: Specialty): boolean {
  if (
    // 「日本画実習」「書A・B・C」は、共通科目の「芸術」とはならない。
    specialty === "jltt" &&
    (id === "YBE1112" || // 日本画演習１
      id === "YBE1122" || // 日本画演習２
      id === "4006012" || // 芸術(書A)
      id === "4006022" || // 芸術(書B)
      id === "4006032") // 芸術(書C)
  ) {
    return false;
  }
  // TODO: 外国語がらみが曖昧でおそらく間違っている
  return (
    isElectivePe(id) || isForeignLanguage(id) || isJapanese(id) || isArt(id)
  );
}

function isH1(id: string): boolean {
  //ABCWYで始まる科目（専門科目、専門基礎科目で指定したAB,AC,AE,BB1で始まる科目を除く）
  return /^[ABCWY]/.test(id);
}

function isH2(id: string): boolean {
  return /^[EFGH]/.test(id);
}

function isH3(id: string): boolean {
  return /^[89]/.test(id);
}

function classify(
  id: CourseId,
  name: string,
  _year: number,
  specialty: Specialty,
  _isNative: boolean,
  mode: Mode,
): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isC1(id)) return "c1";
  if (isC2(id, specialty)) return "c2";
  if (isE1(id, specialty)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(id, name, specialty)) return "e3";
  if (isE4(id, specialty)) return "e4";
  if (isE5(id, mode)) return "e5";
  if (isE6(id, specialty)) return "e6";
  // 選択
  const b = classifyColumnB(id, specialty);
  if (b !== undefined) return b;
  const d = classifyColumnD(id, specialty);
  if (d !== undefined) return d;
  if (isF1(id)) return "f1";
  if (isF2(id, specialty)) return "f2";
  if (isH1(id)) return "h1";
  if (isH2(id)) return "h2";
  if (isH3(id)) return "h3";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
  year: number,
  specialty: Specialty,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(
      c.id,
      c.name,
      year,
      specialty,
      opts.isNative,
      "known",
    );
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
  specialty: Specialty,
): Map<CourseId, string> {
  cs = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(
      c.id,
      c.name,
      year,
      specialty,
      opts.isNative,
      "real",
    );
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
  _year: number,
  specialty: Specialty,
): Map<FakeCourseId, string> {
  const fakeCourseIdToCellId = new Map<FakeCourseId, string>();
  for (const c of cs) {
    if (isCompulsoryEnglishByName(c.name)) {
      fakeCourseIdToCellId.set(c.id, specialty === "none" ? "e3" : "e4");
    }
  }
  return fakeCourseIdToCellId;
}

export const creditRequirementsNormal: SetupCreditRequirements = {
  cells: {
    a1: { min: 6, max: 6 },
    b1: { min: 35, max: 55 },
    b2: { min: 1, max: 1 },
    b3: { min: 3, max: 3 },
    b4: { min: 3, max: 3 },
    b5: { min: 3, max: 3 },
    b6: { min: 3, max: 3 },
    b7: { min: 0, max: 20 },
    c1: { min: 1, max: 1 },
    d1: { min: 4, max: 4 },
    d2: { min: 3, max: 3 },
    d3: { min: 3, max: 3 },
    d4: { min: 6, max: 20 },
    e1: { min: 2, max: 2 },
    e2: { min: 3, max: 3 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    e6: { min: 2, max: 2 },
    f1: { min: 1, max: 1 },
    f2: { min: 0, max: 10 },
    h1: { min: 4, max: 32 },
    h2: { min: 2, max: 30 },
    h3: { min: 0, max: 14 },
  },
  columns: {
    a: { min: 6, max: 6 },
    b: { min: 48, max: 75 },
    c: { min: 1, max: 1 },
    d: { min: 16, max: 30 },
    e: { min: 19, max: 19 },
    f: { min: 1, max: 11 },
    h: { min: 6, max: 34 },
  },
  compulsory: 26,
  elective: 98,
};

export const creditRequirementsJapanExpert: SetupCreditRequirements = {
  cells: {
    a1: { min: 6, max: 6 },
    b1: { min: 32, max: 52 },
    b2: { min: 3, max: 3 },
    b3: { min: 1, max: 1 },
    b4: { min: 3, max: 3 },
    b5: { min: 3, max: 3 },
    b6: { min: 3, max: 3 },
    b7: { min: 3, max: 3 },
    b8: { min: 0, max: 20 },
    c1: { min: 1, max: 1 },
    c2: { min: 1, max: 1 },
    d1: { min: 4, max: 4 },
    d2: { min: 3, max: 3 },
    d3: { min: 3, max: 3 },
    d4: { min: 1, max: 1 },
    d5: { min: 5, max: 19 },
    e1: { min: 3, max: 3 },
    e2: { min: 3, max: 3 },
    e3: { min: 15, max: 15 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 1 },
    f2: { min: 0, max: 10 },
    h1: { min: 4, max: 32 },
    h2: { min: 2, max: 30 },
    h3: { min: 0, max: 14 },
  },
  columns: {
    a: { min: 6, max: 6 },
    b: { min: 48, max: 75 },
    c: { min: 2, max: 2 },
    d: { min: 16, max: 30 },
    e: { min: 29, max: 29 },
    f: { min: 1, max: 11 },
    h: { min: 6, max: 34 },
  },
  compulsory: 37,
  elective: 98,
};
