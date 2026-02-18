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
  isKyoushoku,
  isNonCompulsoryEnglish,
  isSecondForeignLanguage,
} from "@/requirements/common";
import { assert } from "@/util";

function isA1(id: string): boolean {
  return (
    id === "CB21918" || // 卒業研究
    id === "CB21928" // 卒業研究 9月卒業
  );
}

function isB1(id: string): boolean {
  // ただし4単位は演習または探求の科目（科目番号の末尾2の科目を含むこと）
  return id.startsWith("CB2");
}

function isB2(id: string): boolean {
  return id.startsWith("CC") || id.startsWith("CE");
}

function isC1(id: string): boolean {
  return id === "CA10001"; // 人間学Ⅰ
}

function isC2(id: string): boolean {
  return id === "CB11081"; // 教育基礎論
}

function isC3(id: string): boolean {
  return id === "CB11091"; // 学校の経営・制度・社会
}

function isC4(id: string): boolean {
  return (
    id === "CC11211" || // 心理学概論（原則として教員免許取得予定者に限る）
    id === "CB23481" // 心理学概論　西暦奇数年度開講
  );
}

function isC5(id: string): boolean {
  return (
    id === "CA10051" || // 障害科学Ⅰ
    id === "CA10061" // 障害科学Ⅱ
  );
}

function isC6(id: string): boolean {
  return id === "CA10091"; // キャリアデザイン入門
}

function isC7(id: string): boolean {
  return id === "CB11137"; // 教育学研究法A
}

function isC8(id: string): boolean {
  return id === "CB11147"; // 教育学研究法B
}

function isC9(id: string): boolean {
  return id === "CB11051"; // 教育インターンシップ基礎論
}

function isC10(id: string): boolean {
  return id === "CB11062"; // 教育インターンシップ実践演習
}

function isC11(id: string): boolean {
  return id === "CB11151"; // 教育学実践演習
}

function isD1(id: string): boolean {
  return id.startsWith("CA") || id.startsWith("CB1");
}

function isE1(id: string, mode: "known" | "real"): boolean {
  return (
    id === "1106102" || // ファーストイヤーセミナー 1,2クラス
    id === "1227201" || // 学問への誘い 1,2クラス
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id); // 必修 体育 2単位
}

function isE3(name: string): boolean {
  return isCompulsoryEnglishByName(name); // 必修 第一外国語(英語)
}

function isE4(id: string): boolean {
  return isSecondForeignLanguage(id); // 必修 第二外国語(初修外国語)
}

function isE5(id: string, mode: "known" | "real"): boolean {
  return (
    id === "6126101" || // 情報リテラシー(講義)
    id === "6406102" || // 情報リテラシー(演習)
    id === "6506102" || // データサイエンス
    (mode === "real" &&
      (isInfoLiteracyLecture(id) ||
        isInfoLiteracyExercise(id) ||
        isDataScience(id)))
  );
}

function isF1(id: string): boolean {
  return isGakushikiban(id); // 学士基盤科目
}

function isF2(id: string): boolean {
  return (
    isElectivePe(id) || // 選択 体育
    isNonCompulsoryEnglish(id) || // 選択 外国語
    isSecondForeignLanguage(id) || // 第二外国語
    isJapanese(id) || // 選択 国語
    isArt(id) // 選択 芸術
  );
}

function isH1(id: string): boolean {
  // 他学類が開設している科目
  return (
    id.startsWith("A") ||
    id.startsWith("B") ||
    id.startsWith("E") ||
    id.startsWith("F") ||
    id.startsWith("G") ||
    id.startsWith("H") ||
    id.startsWith("V") ||
    id.startsWith("W") ||
    id.startsWith("Y") ||
    isKyoushoku(id) // 教職や博物館に関する科目
  );
}

function classify(
  id: CourseId,
  name: string,
  mode: "known" | "real",
  _year: number,
): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isC1(id)) return "c1";
  if (isC2(id)) return "c2";
  if (isC3(id)) return "c3";
  if (isC4(id)) return "c4";
  if (isC5(id)) return "c5";
  if (isC6(id)) return "c6";
  if (isC7(id)) return "c7";
  if (isC8(id)) return "c8";
  if (isC9(id)) return "c9";
  if (isC10(id)) return "c10";
  if (isC11(id)) return "c11";
  if (isE1(id, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(name)) return "e3";
  if (isE4(id)) return "e4";
  if (isE5(id, mode)) return "e5";
  // 選択
  if (isB1(id)) return "b1";
  if (isB2(id)) return "b2";
  if (isD1(id)) return "d1";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isH1(id)) return "h1";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  _opts: ClassifyOptions,
  year: number,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, "known", year);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  _opts: ClassifyOptions,
  year: number,
): Map<CourseId, string> {
  const csArray = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();

  // e4とf2に第二外国語が入るので、先にe4に3単位分入れてから残りはf2に入れる
  // TODO: 1科目2単位があったらアウト
  let e4Credits = 0;

  for (const c of csArray) {
    if (isE4(c.id)) {
      if (e4Credits < 3) {
        assert(c.credit !== undefined);
        e4Credits += c.credit;
        courseIdToCellId.set(c.id, "e4");
        continue;
      } else {
        courseIdToCellId.set(c.id, "f2");
        continue;
      }
    }

    const cellId = classify(c.id, c.name, "real", year);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  cs: FakeCourse[],
  _opts: ClassifyOptions,
  _year: number,
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
    b1: { min: 42, max: 79 },
    b2: { min: 0, max: 37 },
    c1: { min: 1, max: 1 },
    c2: { min: 2, max: 2 },
    c3: { min: 2, max: 2 },
    c4: { min: 2, max: 2 },
    c5: { min: 2, max: 2 },
    c6: { min: 1, max: 1 },
    c7: { min: 2, max: 2 },
    c8: { min: 2, max: 2 },
    c9: { min: 1, max: 1 },
    c10: { min: 1, max: 1 },
    c11: { min: 1, max: 1 },
    d1: { min: 0, max: 20 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 3, max: 3 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 38 },
    f2: { min: 0, max: 37 },
    h1: { min: 6, max: 43 },
  },
  columns: {
    a: { min: 6, max: 6 },
    b: { min: 42, max: 79 },
    c: { min: 17, max: 17 },
    d: { min: 0, max: 20 },
    e: { min: 15, max: 15 },
    f: { min: 1, max: 38 },
    h: { min: 6, max: 43 },
  },
  compulsory: 38,
  elective: 86,
};
