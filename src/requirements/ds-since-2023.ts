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
  isHakubutsukan,
  isHumanSciencesCoreCurriculum,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
  isJapanese,
  isJiyuukamoku,
  isKyoushoku,
  isNonCompulsoryEnglish,
  isSecondForeignLanguage,
} from "@/requirements/common";
import { arrayRemove, assert, defined } from "@/util";

type Mode = "known" | "real";

function isA1(id: string): boolean {
  return id === "CE21918"; // 卒業研究I
}

function isA2(id: string): boolean {
  return (
    id === "CE21928" || // 卒業研究II
    id === "CE21948" // 卒業研究II 9月卒業
  );
}

function isB1(id: string): boolean {
  return (
    id === "CE21411" || // 視覚障害児の心理・生理・病理
    id === "CE21421" || // 聴覚障害児の心理・生理・病理
    id === "CE21431" || // 知的障害児の心理・生理・病理
    id === "CE21441" || // 肢体不自由児の心理・生理・病理
    id === "CE21451" || // 病弱児の心理・生理・病理
    id === "CE31481" || // 医学概論I
    id === "CE31491" || // 医学概論II
    id === "CE31701" || // 保健医療論
    id === "CE31281" || // 相談援助の基盤と専門職I
    id === "CE31291" || // 相談援助の基盤と専門職II
    id === "CE31401" || // 相談援助の理論と方法I
    id === "CE31411" // 相談援助の理論と方法II
  );
}

function isB2(id: string): boolean {
  // TODO: 「短期留学生対象科目を除く」とあるが、CEから始まる科目（障害科学類の
  // 科目）のうち短期留学生に言及している科目が見当たらない。 !!B!!
  return id.startsWith("CE");
}

function isB3(id: string): boolean {
  return id.startsWith("CB") || id.startsWith("CC");
}

function classifyColumnC(id: string, tableYear: number): string | undefined {
  if (id === "CA10001") return "c1"; // 人間学I
  if (id === "CA10051") return "c2"; // 障害科学I
  if (id === "CA10061") return "c3"; // 障害科学II
  if (id === "CA10091") return "c4"; // キャリアデザイン入門
  if (id === "CA10161") return "c5"; // Current Topics in Disability Sciences
  if (id === "CB11081" || id === "CB11091") return "c6"; // 教育基礎論, 学校の経営・制度・社会
  // TODO: 教職のやつは障害科学類生は取れないのか !!B!!
  // CB23481 心理学概論 原則として、教員免許状取得予定者に限る
  if (id === "CC11211") return "c7"; // 心理学概論
  if (id === "CE11011") return "c8"; // 障害科学実践入門
  if (id === "CE11021") return "c9"; // 障害原理論I
  if (id === "CE11121") return "c10"; // 障害者福祉論I
  if (id === "CE11131") return "c11"; // 障害者福祉論II
  if (id === "CE12014") return "c12"; // 障害科学セミナー
  if (id === "CE11141") return "c13"; // 障害者教育基礎理論I
  if (id === "CE11151") return "c14"; // 障害者教育基礎理論II
  if (tableYear >= 2025) {
    if (id === "CC11231") return "c15"; // 心理学統計法I
  } else {
    if (id === "CC11241") return "c15"; // 心理学統計法II
  }
  if (id === "CE11101") return "c16"; // 障害科学研究法入門
  if (id === "CE11113") return "c17"; // 障害科学研究法実習
}

function isD1(id: string): boolean {
  return isHumanSciencesCoreCurriculum(id);
}

function isE1(id: string, mode: Mode): boolean {
  return (
    id === "1108102" || // ファーストイヤーセミナー 1クラス
    id === "1108202" || // ファーストイヤーセミナー 2クラス
    id === "1227231" || // 学問への誘い 1クラス
    id === "1227241" || //  学問への誘い 2クラス
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
    id === "6107101" || // 情報リテラシー(講義)
    id === "6408102" || // 情報リテラシー(演習)
    id === "6508102" || // データサイエンス
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
  return (
    isElectivePe(id) ||
    isNonCompulsoryEnglish(id) ||
    isSecondForeignLanguage(id) ||
    isJapanese(id) ||
    isArt(id)
  );
}

function isH1(id: string): boolean {
  return (
    /^[ABEFGHVWY]/.test(id) ||
    isKyoushoku(id) ||
    isHakubutsukan(id) ||
    isJiyuukamoku(id)
  );
}

function classify(
  id: CourseId,
  name: string,
  tableYear: number,
  _isNative: boolean,
  mode: Mode,
): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isA2(id)) return "a2";
  const c = classifyColumnC(id, tableYear);
  if (c !== undefined) return c;
  if (isE1(id, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(name)) return "e3";
  if (isE4(id)) return "e4";
  if (isE5(id, mode)) return "e5";
  // 選択
  if (isB1(id)) return "b1";
  if (isB2(id)) return "b2";
  if (isB3(id)) return "b3";
  if (isD1(id)) return "d1";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isH1(id)) return "h1";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
  tableYear: number,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, tableYear, opts.isNative, "known");
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
  cs = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();

  // e4とf2に第二外国語が入るので、先にe4に3単位分入れてから残りはf2に入れる。
  // なるべく3単位ちょうど入るようにする。
  // TODO: 3単位ちょうどにできない場合の処理 !!B!!
  const e4CandidatesWorth1: RealCourse[] = [];
  const e4CandidatesWorth2: RealCourse[] = [];
  const e4CandidatesWorth3: RealCourse[] = [];
  for (const c of cs) {
    if (isE4(c.id)) {
      if (c.credit === 1) e4CandidatesWorth1.push(c);
      if (c.credit === 2) e4CandidatesWorth2.push(c);
      if (c.credit === 3) e4CandidatesWorth3.push(c);
    }
  }

  const e4Courses: RealCourse[] = [];
  const n1 = e4CandidatesWorth1.length;
  const n2 = e4CandidatesWorth2.length;
  const n3 = e4CandidatesWorth3.length;
  if (n3 >= 1) {
    e4Courses.push(defined(e4CandidatesWorth3.pop()));
  } else if (n2 >= 1 && n1 >= 1) {
    e4Courses.push(defined(e4CandidatesWorth2.pop()));
    e4Courses.push(defined(e4CandidatesWorth1.pop()));
  } else if (n1 >= 3) {
    for (let i = 0; i < 3; i++) {
      e4Courses.push(defined(e4CandidatesWorth1.pop()));
    }
  } else {
    const e4Candidates = cs.filter((c) => isE4(c.id));
    e4Candidates.sort((a, b) => (a.credit ?? 0) - (b.credit ?? 0));
    let total = 0;
    for (const c of e4Candidates) {
      total += c.credit ?? 0;
      e4Courses.push(c);
      if (total >= 3) {
        break;
      }
    }
  }

  for (const c of e4Courses) {
    assert(arrayRemove(cs, c));
    courseIdToCellId.set(c.id, "e4");
  }

  for (const c of cs) {
    let cellId = classify(c.id, c.name, tableYear, opts.isNative, "real");
    if (cellId !== undefined) {
      if (cellId === "e4") cellId = "f2";
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

export const creditRequirementsSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 2, max: 2 },
    a2: { min: 4, max: 4 },
    b1: { min: 8, max: 8 },
    b2: { min: 24, max: 71 },
    b3: { min: 0, max: 40 },
    c1: { min: 1, max: 1 },
    c2: { min: 2, max: 2 },
    c3: { min: 2, max: 2 },
    c4: { min: 1, max: 1 },
    c5: { min: 1, max: 1 },
    c6: { min: 2, max: 2 },
    c7: { min: 2, max: 2 },
    c8: { min: 2, max: 2 },
    c9: { min: 2, max: 2 },
    c10: { min: 1, max: 1 },
    c11: { min: 1, max: 1 },
    c12: { min: 1, max: 1 },
    c13: { min: 1, max: 1 },
    c14: { min: 1, max: 1 },
    c15: { min: 2, max: 2 },
    c16: { min: 2, max: 2 },
    c17: { min: 1, max: 1 },
    d1: { min: 0, max: 10 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 3, max: 3 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 40 },
    f2: { min: 0, max: 39 },
    h1: { min: 6, max: 45 },
  },
  columns: {
    a: { min: 6, max: 6 },
    b: { min: 32, max: 71 },
    c: { min: 25, max: 25 },
    d: { min: 0, max: 10 },
    e: { min: 15, max: 15 },
    g: { min: 1, max: 40 },
    h: { min: 6, max: 45 },
  },
  compulsory: 46,
  elective: 78,
};
