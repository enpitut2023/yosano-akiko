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
  isElectivePe,
  isForeignLanguage,
  isGakushikiban,
  isJapanese,
} from "@/requirements/common";

export type Specialty = "normal" | "japan-expert";

function isA1(id: string): boolean {
  return (
    id === "AE10F28" || // 卒業論文春　留学または休学した学生対象＊教員と要相談 !!A!!
    id === "AE10F18" // 卒業論文秋 !!A!!
  );
}

function isB(id: string, specialty: Specialty): string | undefined {
  let offset = 0;
  switch (specialty) {
    case "normal": {
      // TODO:  //AE14を１単位必ず含む
      if (id.startsWith("AE13") || id.startsWith("AE14")) return "b1";
      offset = 0;
      break;
    }
    case "japan-expert": {
      if (id.startsWith("AE13") || id.startsWith("AE14")) return "b1";
      if (id.startsWith("AE18")) return "b2";
      offset = 1;
    }
  }
  if (id.startsWith("AE10A")) return "b" + (2 + offset);
  if (id.startsWith("AE10B")) return "b" + (3 + offset);
  if (id.startsWith("AE10C")) return "b" + (4 + offset);
  if (id.startsWith("AE10D")) return "b" + (5 + offset);
  if (id.startsWith("AE10E")) return "b" + (6 + offset);
  if (
    (id.startsWith("AB6") && !id.startsWith("AB60")) ||
    (id.startsWith("AB7") && !id.startsWith("AB70")) ||
    (id.startsWith("AB8") && !id.startsWith("AB80")) ||
    (id.startsWith("AB9") && !id.startsWith("AB90")) ||
    (id.startsWith("AC6") &&
      !id.startsWith("AB67") &&
      !id.startsWith("AB68") &&
      !id.startsWith("AB69")) ||
    (id.startsWith("BB11") && !id.startsWith("BB110")) ||
    id.startsWith("BB16") ||
    id.startsWith("BB19")
  ) {
    return "b" + (7 + offset);
  }
}

function isC1(id: string): boolean {
  return (
    id === "AE51A21" // 日本語・日本文化研究法
  );
}

function isC2(id: string, specialty: Specialty): boolean {
  return (
    //Japan-Expert（学士）プログラム日本語教師養成コースのみ
    specialty === "japan-expert" && id === "AE51K11" // Japan-Expert総論
  );
}
function isD(id: string, specialty: Specialty): string | undefined {
  if (id.startsWith("AE56")) return "d1";
  if (id.startsWith("AE53")) return "d2";
  if (id.startsWith("AE54")) return "d3";
  let offset = 0;
  if (specialty === "japan-expert") {
    offset = 1;
    if (id.startsWith("AE55")) return "d4";
  }
  if (
    id.startsWith("AE5") ||
    id.startsWith("AB50") ||
    id.startsWith("AB60") ||
    id.startsWith("AB70") ||
    id.startsWith("AB80") ||
    id.startsWith("AB90") ||
    id.startsWith("AC50") ||
    id.startsWith("AC56") ||
    id.startsWith("BB110")
  ) {
    return "d" + (4 + offset);
  }
}

function isE1(id: string, specialty: Specialty): boolean {
  return (
    id === "1103102" || // ファーストイヤーセミナー 1クラス対象 !!A!!
    id === "1227111" || // 学問への誘い 1クラス対象 !!A!!
    (id === "1122502" && specialty === "japan-expert") // Japan-Expertファーストイヤーセミナー
  );
}

function isE2(id: string): boolean {
  return (
    // TODO:3年次必修
    isCompulsoryPe1(id) || isCompulsoryPe2(id) // 必修 体育 3単位
  );
}

function isE3(id: string, name: string, specialty: Specialty): boolean {
  return (
    (isCompulsoryEnglishByName(name) && specialty === "normal") || // 必修　第一外国語(英語)
    (id.startsWith("3920") && specialty === "japan-expert") // 第一外国語（日本語）
  );
}

function isE4(id: string): boolean {
  //通常コースは第2外国語（初修外国語）
  //japan-expertコースは第2外国語（英語）
  TODO: return false;
}

function isE5(id: string): boolean {
  return (
    id === "6102101" || // 情報リテラシー(講義) !!A!!
    id === "6402202" || // 情報リテラシー(演習)  !!A!!
    id === "6502202" // データサイエンス !!A!!
  );
}

function isE6(id: string, specialty: Specialty): boolean {
  //通常コースのみ
  return (
    specialty === "normal" &&
    (id === "5102031" || // 国語Ⅰ  !!A!!
      id === "5202031") // 国語Ⅱ !!A!!
  );
}

function isF1(id: string): boolean {
  return isGakushikiban(id); // 学士基盤科目
}

function isF2(id: string): boolean {
  // TODO: //選択科目英語が含まれていない可能性あり
  //尚選択科目英語は通常コースのみ認定Japan-Expertでは含まれない
  return (
    //総合科目　体育　外国語（英語及び初修外国語）国語　芸術
    isElectivePe(id) || // 選択　体育
    isForeignLanguage(id) || // 選択　外国語
    isJapanese(id) || //選択 国語
    isArt(id) // 選択 芸術
  );
}

function isH1(id: string): boolean {
  return (
    //ABCWYで始まる科目（専門科目、専門基礎科目で指定したAB,AC,AE,BB1で始まる科目を除く）
    id.startsWith("A") ||
    id.startsWith("B") ||
    id.startsWith("C") ||
    id.startsWith("W") ||
    id.startsWith("Y")
  );
}

function isH2(id: string): boolean {
  return (
    id.startsWith("E") ||
    id.startsWith("F") ||
    id.startsWith("G") ||
    id.startsWith("H")
  );
}

function isH3(id: string): boolean {
  return id.startsWith("8") || id.startsWith("9");
}

function classify(
  id: CourseId,
  name: string,
  year: number,
  specialty: Specialty,
  isNative: boolean,
): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isC1(id)) return "c1";
  if (isC2(id, specialty)) return "c2";
  if (isE1(id, specialty)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(id, name, specialty)) return "e3";
  if (isE4(id)) return "e4";
  if (isE5(id)) return "e5";
  if (isE6(id, specialty)) return "e6";
  // 選択
  if (isB(id, specialty) !== undefined) return isB(id, specialty);
  if (isD(id, specialty) !== undefined) return isD(id, specialty);
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
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
    const cellId = classify(c.id, c.name, year, specialty, true);
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
    const cellId = classify(c.id, c.name, year, specialty, opts.isNative);
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
  specialty: Specialty,
): Map<FakeCourseId, string> {
  const fakeCourseIdToCellId = new Map<FakeCourseId, string>();
  return fakeCourseIdToCellId;
}

//日本語・日本文化学類通常コース
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

//日本語・日本文化学類Japan-Expert（学士）プログラム日本語教師養成コース
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
