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
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
  isJapanese,
  isKyoutsuu,
  isSecondForeignLanguage,
} from "@/requirements/common";

type Mode = "known" | "real";

function isA1(id: string): boolean {
  return (
    id === "AC70028" || // 卒業論文 春学期 9月卒業予定者対象
    id === "AC70038" // 卒業論文 秋学期 3月卒業予定者対象
  );
}

function isA2(id: string): boolean {
  return (
    id === "AC70002" || // 卒業論文演習 春学期 9月卒業予定者対象
    id === "AC70012" // 卒業論文演習 秋学期 3月卒業予定者対象
  );
}

function isB1(id: string): boolean {
  return id.startsWith("AC67");
}

function isB2(id: string): boolean {
  if (id.startsWith("AC6") && !id.startsWith("AC67")) {
    return true;
  }
  if (
    id === "AB98A11" ||
    id === "AB98A21" ||
    id === "AB98B11" ||
    id === "AB98B21" ||
    id === "AB98F52" ||
    id === "AB98G72" ||
    id === "AB98G82"
  ) {
    return true;
  }
  if (
    id === "AB85A11" ||
    id === "AB85A21" ||
    id === "AB84E12" ||
    id === "AB84E52" ||
    id === "EE21301" ||
    id === "EE21321" ||
    id === "EE21411" ||
    id === "EE21401"
  ) {
    return true;
  }
  if (id === "AB61") return true;
  if (id.startsWith("AB62") && !id.startsWith("AB62K")) return true;
  if (id.startsWith("AB63") && !id.startsWith("AB63K")) return true;
  if (id === "AE13G41") return true;
  return false;
  // TODO: 演習または実習として開設された科目を8単位以上含めること。また、所属
  // する領域の科目から10単位以上を修得するものとする。なお、比較文化学類長が各
  // 領域の専門科目として指定した科目(他の学群及び学類の科目を含む)については42
  // ～74単位中の14単位まで、また、当該領域の専門科目としては10単位以上のうち4
  // 単位まで履修することができる
}

function isC1(id: string): boolean {
  return id.startsWith("AC52");
}

function isD1(id: string): boolean {
  return id.startsWith("AC56");
}

function isD2(id: string): boolean {
  return id.startsWith("AC50");
}

function isD3(id: string): boolean {
  return id.startsWith("AC51");
}

function isD4(id: string): boolean {
  return id.startsWith("AC53");
}

function isD5(id: string): boolean {
  return id.startsWith("AC54") || id.startsWith("AC55") || id === "AB98F4";
}

function isE1(id: string, mode: Mode): boolean {
  return (
    id === "1102102" || // ファーストイヤーセミナー 春AB 比文1クラス対象.
    id === "1102202" || // ファーストイヤーセミナー 春AB 比文2クラス対象.
    id === "1102302" || // ファーストイヤーセミナー 春AB 比文3クラス対象.
    id === "1227071" || // 学問への誘い 春A 比文1クラス対象.
    id === "1227081" || // 学問への誘い 春A 比文2クラス対象.
    id === "1227091" || // 学問への誘い 春A 比文3クラス対象.
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

function isE3(name: string): boolean {
  return isCompulsoryEnglishByName(name);
}

function isE4(id: string): boolean {
  return isSecondForeignLanguage(id);
}

function isE5(id: string, mode: Mode): boolean {
  return (
    id === "6102101" || // 情報リテラシー(講義) 春A
    id === "6402102" || // 情報リテラシー(演習) 春B 比文1班
    id === "6402202" || // 情報リテラシー(演習) 春B 比文2班
    id === "6502102" || // データサイエンス 秋AB 比文1班
    id === "6502202" || // データサイエンス 秋AB 比文2班
    (mode === "real" &&
      (isInfoLiteracyLecture(id) ||
        isInfoLiteracyExercise(id) ||
        isDataScience(id)))
  );
}

function isE6(id: string): boolean {
  return isJapanese(id);
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
  return isArt(id);
}

function isH1(id: string): boolean {
  return /^(AA2|A[BE]|B|Y)/.test(id);
}

function isH2(id: string): boolean {
  return /^[CEFGHW]/.test(id);
}

function isH3(id: string): boolean {
  // 上記以外の他学群又は他学類の授業科目
  // TODO: 適当に思いつくものは除いておきたい
  return !isKyoutsuu(id);
}

function classify(
  id: CourseId,
  name: string,
  mode: Mode,
  _isNative: boolean,
): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isA2(id)) return "a2";
  if (isC1(id)) return "c1";
  if (isE1(id, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(name)) return "e3";
  if (isE4(id)) return "e4";
  if (isE5(id, mode)) return "e5";
  if (isE6(id)) return "e6";
  // 選択
  if (isB1(id)) return "b1";
  if (isB2(id)) return "b2";
  if (isD1(id)) return "d1";
  if (isD2(id)) return "d2";
  if (isD3(id)) return "d3";
  if (isD4(id)) return "d4";
  if (isD5(id)) return "d5";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isF3(id)) return "f3";
  if (isF4(id)) return "f4";
  if (isH1(id)) return "h1";
  if (isH2(id)) return "h2";
  if (isH3(id)) return "h3"; // 「...以外」なので最後
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
  _tableYear: number,
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
  _tableYear: number,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, "real", opts.isNative);
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
): Map<FakeCourseId, string> {
  const fakeCourseIdToCellId = new Map<FakeCourseId, string>();
  for (const c of cs) {
    if (isE3(c.name)) {
      fakeCourseIdToCellId.set(c.id, "e3");
    }
  }
  return fakeCourseIdToCellId;
}

export const creditRequirements: SetupCreditRequirements = {
  cells: {
    a1: { min: 6, max: 6 },
    a2: { min: 3, max: 3 },
    b1: { min: 2, max: 2 },
    b2: { min: 42, max: 74 },
    c1: { min: 2, max: 2 },
    d1: { min: 3, max: 6 },
    d2: { min: 4, max: 24 },
    d3: { min: 2, max: 17 },
    d4: { min: 1, max: 6 },
    d5: { min: 1, max: 13 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    e6: { min: 2, max: 2 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 8 },
    f4: { min: 0, max: 6 },
    h1: { min: 4, max: 36 },
    h2: { min: 2, max: 34 },
    h3: { min: 0, max: 32 },
  },
  columns: {
    a: { min: 9, max: 9 },
    b: { min: 44, max: 76 },
    c: { min: 2, max: 2 },
    d: { min: 11, max: 43 },
    e: { min: 18, max: 18 },
    f: { min: 1, max: 19 },
    h: { min: 6, max: 38 },
  },
  compulsory: 29,
  elective: 95,
};
