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
  isGakushikiban,
  isHumanSciencesCoreCurriculum,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
  isJapanese,
  isKyoushoku,
  isNonCompulsoryEnglish,
  isSecondForeignLanguage,
} from "@/requirements/common";
import { assert } from "@/util";

function classifyColumnA(id: string): string | undefined {
  if (id === "CC21291") return "a1"; // 知覚・認知心理学
  if (id === "CC21221") return "a2"; // 学習・言語心理学
  if (id === "CC21311") return "a3"; // 感情・人格心理学
  if (id === "CC21321") return "a4"; // 神経・生理心理学
  if (id === "CC21231") return "a5"; // 社会・集団・家族心理学
  if (id === "CC21241") return "a6"; // 発達心理学
  if (id === "CC21211") return "a7"; // 臨床心理学概論
  if (id === "CC21958") return "a8"; // 卒業研究セミナー
  if (
    id === "CC21918" || // 卒業研究
    id === "CC21928" // 卒業研究 2023, 2024のみ9月卒業はこっち
  )
    return "a9";
}

function isB1(id: string): boolean {
  return id.startsWith("CC");
}

function isB2(id: string): boolean {
  return id.startsWith("CB") || id.startsWith("CE");
}

function classifyColumnC(id: string): string | undefined {
  if (id === "CA10001") return "c1"; // 人間学Ⅰ
  if (
    id === "CC11211" || // 心理学概論
    id === "CB23481" // 心理学概論 2023, 2024のみ開講 原則として教員免許取得予定者に限る
  )
    return "c2";
  if (
    id === "CB11081" || // 教育基礎論
    id === "CB11091" // 学校の経営・制度・社会
  )
    return "c3";
  if (
    id === "CA10051" || // 障害科学Ⅰ
    id === "CA10061" // 障害科学Ⅱ
  )
    return "c4";
  if (id === "CA10091") return "c5"; // キャリアデザイン入門
  if (id === "CC11221") return "c6"; // 心理学研究法
  if (id === "CC11231") return "c7"; // 心理学統計法Ⅰ
  if (id === "CC11241") return "c8"; // 心理学統計法Ⅱ
  if (id === "CC11253") return "c9"; // 心理学統計法実習
  if (id === "CC11182") return "c10"; // 心理学英語セミナー
  if (id === "CC11273") return "c11"; // 心理学実験
  if (id === "CC11283") return "c12"; // 心理学研究実習Ⅰ
}

function isD1(id: string): boolean {
  return isHumanSciencesCoreCurriculum(id);
}

function isD2(id: string): boolean {
  return id === "CC11293"; // 心理学研究実習Ⅱ
}

function isE1(id: string, mode: "known" | "real"): boolean {
  return (
    id === "1107102" || // ファーストイヤーセミナー 1クラス
    id === "1107202" || // ファーストイヤーセミナー 2クラス
    id === "1227211" || // 学問への誘い 1クラス
    id === "1227221" || // 学問への誘い 2クラス
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
    id === "6107101" || // 情報リテラシー(講義)
    id === "6407102" || // 情報リテラシー(演習)
    id === "6507102" || // データサイエンス
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
    isNonCompulsoryEnglish(id) || // 第一外国語(必修以外の英語)
    isSecondForeignLanguage(id) || // 第二外国語(必修で選択した以外の外国語)
    isJapanese(id) || // 国語
    isArt(id) // 芸術
  );
}

function isH1(id: string): boolean {
  return (
    // 他学類が開設している科目
    id.startsWith("A") ||
    id.startsWith("B") ||
    id.startsWith("E") ||
    id.startsWith("F") ||
    id.startsWith("G") ||
    id.startsWith("H") ||
    id.startsWith("V") ||
    id.startsWith("W") ||
    id.startsWith("Y") ||
    // 教職や博物館に関する科目
    isKyoushoku(id)
  );
}

function classify(
  id: CourseId,
  name: string,
  mode: "known" | "real",
  _year: number,
): string | undefined {
  // 必修
  const a = classifyColumnA(id);
  if (a !== undefined) return a;
  const c = classifyColumnC(id);
  if (c !== undefined) return c;
  if (isD2(id)) return "d2";
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
    a1: { min: 2, max: 2 },
    a2: { min: 2, max: 2 },
    a3: { min: 2, max: 2 },
    a4: { min: 2, max: 2 },
    a5: { min: 2, max: 2 },
    a6: { min: 2, max: 2 },
    a7: { min: 2, max: 2 },
    a8: { min: 2, max: 2 },
    a9: { min: 6, max: 6 },
    b1: { min: 21, max: 58 },
    b2: { min: 0, max: 37 },
    c1: { min: 1, max: 1 },
    c2: { min: 2, max: 2 },
    c3: { min: 2, max: 2 },
    c4: { min: 2, max: 2 },
    c5: { min: 1, max: 1 },
    c6: { min: 2, max: 2 },
    c7: { min: 2, max: 2 },
    c8: { min: 2, max: 2 },
    c9: { min: 1, max: 1 },
    c10: { min: 2, max: 2 },
    c11: { min: 2, max: 2 },
    c12: { min: 3, max: 3 },
    d1: { min: 0, max: 10 },
    d2: { min: 0, max: 3 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 3, max: 3 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 28 },
    f2: { min: 0, max: 27 },
    h1: { min: 6, max: 33 },
  },
  columns: {
    a: { min: 22, max: 22 },
    b: { min: 21, max: 58 },
    c: { min: 22, max: 22 },
    d: { min: 0, max: 13 },
    e: { min: 15, max: 15 },
    f: { min: 1, max: 28 },
    h: { min: 6, max: 33 },
  },
  compulsory: 59,
  elective: 65,
};
