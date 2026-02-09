import {
  CourseId,
  FakeCourse,
  FakeCourseId,
  KnownCourse,
  RealCourse,
} from "../../akiko";
import { ClassifyOptions, SetupCreditRequirements } from "../../app-setup";

function isA1(id: string): boolean {
  return (
    id === "FH11918" || // 卒業研究A 春
    id === "FH11928" || // 卒業研究B 秋
    id === "FH11938" || // 卒業研究A 秋
    id === "FH11948" // 卒業研究B 春
    // FH11988 早期卒業研究あり
  );
}

function isB1(id: string): boolean {
  return (
    id.startsWith("FE24") || id.startsWith("FE26") || id.startsWith("FE27")
  );
  // TODO: 演習を2単位以上含む条件
}

function isB2(id: string): boolean {
  return (
    id.startsWith("FE32") ||
    id.startsWith("FE33") ||
    id.startsWith("FE34") ||
    id.startsWith("FE46") ||
    id.startsWith("FE47") ||
    id.startsWith("FE48")
  );
}

function isB3(id: string): boolean {
  return (
    id.startsWith("FH2") ||
    id.startsWith("FH3") ||
    id.startsWith("FH4") ||
    id.startsWith("FA00")
  );
}

function isC1(id: string): boolean {
  return id === "FH60012"; // 社会工学演習
}

function isC2(id: string): boolean {
  return id === "FH60341"; // 社会工学英語
}

function isC3(id: string): boolean {
  return (
    // !!A!!
    id === "FH60474" || // プログラミング入門A 2021~2024年度入学生
    id === "FH60484" || // プログラミング入門A 2025年度入学生 12クラス
    id === "FH60484" // プログラミング入門A 2025年度入学生 34クラス
  );
}

function isC4(id: string): boolean {
  return (
    // !!A!!
    id === "FH60574" || // プログラミング入門B 2021~2024年度入学生
    id === "FH60584" || //  プログラミング入門B 2025年度入学生 12クラス
    id === "FH60594" //  プログラミング入門B 2025年度入学生 34クラス
  );
}

function isD1(id: string): boolean {
  return (
    // !!A!!
    id === "FA01151" || // 数学リテラシー1 12クラス
    id === "FA01161" || // 数学リテラシー1 34クラス
    // !!A!!
    id === "FA01251" || // 数学リテラシー2　12クラス
    id === "FA01261" || // 数学リテラシー2　34クラス
    // !!A!!
    id === "FA01651" || // 線形代数1 12クラス
    id === "FA01661" || // 線形代数1 34クラス
    // !!A!!
    id === "FA01751" || // 線形代数2 12クラス
    id === "FA01761" || // 線形代数2 34クラス
    // !!A!!
    id === "FA01851" || // 線形代数3 12クラス
    id === "FA01861" || // 線形代数3 34クラス
    // !!A!!
    id === "FA01351" || // 微積分1 12クラス
    id === "FA01361" || // 微積分1 34クラス
    // !!A!!
    id === "FA01451" || // 微積分2 12クラス
    id === "FA01461" || // 微積分2 34クラス
    // !!A!!
    id === "FA01551" || // 微積分3 12クラス
    id === "FA01561" || // 微積分3 34クラス
    // !!A!!
    id === "FH60811" || // 統計学 (学籍番号の下2桁) % 3 == 0
    id === "FH60821" || // 統計学 == 1
    id === "FH60831" || // 統計学 == 2
    id === "FH61111" || // 経済学の数理
    id === "FH61121" || // 経済学の実証
    id === "FH61131" || // 会計と経営
    id === "FH61141" || // 社会と最適化
    id === "FH61151" || // 都市計画入門
    id === "FH61161" // 都市数理
  );
}

function isE1(id: string): boolean {
  return (
    id === "1117102" || //ファーストイヤーセミナー  1クラス
    id === "1117202" || //ファーストイヤーセミナー  2クラス
    id === "1117302" || //ファーストイヤーセミナー 3クラス
    id === "1117402" || //ファーストイヤーセミナー 4クラス
    id === "1227511" || // 学問への誘い 1クラス
    id === "1227521" || // 学問への誘い 2クラス
    id === "1227531" || // 学問への誘い 3クラス
    id === "1227541" // 学問への誘い 4クラス
  );
}

// coins2023のパクリ
function isE2(name: string): boolean {
  // TODO:
  // 編入とかで英語を認定された人は「英語」という名前の4単位の授業を与えられる
  name = name.trim();
  name = name.replaceAll(/\s+/g, " ");
  name = name.toLowerCase();
  return (
    name === "english reading skills i" ||
    name === "english reading skills ii" ||
    name === "english presentation skills i" ||
    name === "english presentation skills ii"
  );
}

function isE3(id: string): boolean {
  return (
    id === "6123101" || //情報リテラシー(講義)
    id === "6423102" || //情報リテラシー(演習) 1班
    id === "6423202" || //情報リテラシー(演習) 2班
    id === "6523102" || //データサイエンス 1班
    id === "6523202" //データサイエンス 2班
  );
}

function isE4(id: string): boolean {
  //TODO:  体育
  return false;
}

function isF1(id: string): boolean {
  // TODO: 学士基盤科目
  return false;
}

function isF2(id: string): boolean {
  // TODO: 体育、外国語、芸術、英語
  return false;
}

function isH1(id: string): boolean {
  return id.startsWith("A") || id.startsWith("B") || id.startsWith("C");
}

function isH2(id: string): boolean {
  return (
    (id.startsWith("E") ||
      id.startsWith("F") ||
      id.startsWith("G") ||
      id.startsWith("H")) &&
    !id.startsWith("FA0") &&
    !id.startsWith("FH")
  );
}

function isH3(id: string): boolean {
  // TODO: 上記以外の他学群又は他学類の授業科目
  return false;
}

function isH4(id: string): boolean {
  // TODO: 教職に関する科目及び博物館に関する科目，自由科目（特設）
  return false;
}

export function classifyKnownCourses(cs: KnownCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    if (isA1(c.id)) {
      courseIdToCellId.set(c.id, "a1");
    } else if (isC1(c.id)) {
      courseIdToCellId.set(c.id, "c1");
    } else if (isC2(c.id)) {
      courseIdToCellId.set(c.id, "c2");
    } else if (isC3(c.id)) {
      courseIdToCellId.set(c.id, "c3");
    } else if (isC4(c.id)) {
      courseIdToCellId.set(c.id, "c4");
    } else if (isE1(c.id)) {
      courseIdToCellId.set(c.id, "e1");
    } else if (isE2(c.id)) {
      courseIdToCellId.set(c.id, "e2");
    } else if (isE3(c.id)) {
      courseIdToCellId.set(c.id, "e3");
    } else if (isE4(c.id)) {
      courseIdToCellId.set(c.id, "e4");
    } else if (isB1(c.id)) {
      courseIdToCellId.set(c.id, "b1");
    } else if (isB2(c.id)) {
      courseIdToCellId.set(c.id, "b2");
    } else if (isB3(c.id)) {
      courseIdToCellId.set(c.id, "b3");
    } else if (isD1(c.id)) {
      courseIdToCellId.set(c.id, "d1");
    } else if (isF1(c.id)) {
      courseIdToCellId.set(c.id, "f1");
    } else if (isF2(c.id)) {
      courseIdToCellId.set(c.id, "f2");
    } else if (isH1(c.id)) {
      courseIdToCellId.set(c.id, "h1");
    } else if (isH2(c.id)) {
      courseIdToCellId.set(c.id, "h2");
    } else if (isH3(c.id)) {
      courseIdToCellId.set(c.id, "h3");
    } else if (isH4(c.id)) {
      courseIdToCellId.set(c.id, "h4");
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  opts: ClassifyOptions,
): Map<CourseId, string> {
  return new Map();
}

export function classifyFakeCourses(
  cs: FakeCourse[],
): Map<FakeCourseId, string> {
  return new Map();
}

export const creditRequirements: SetupCreditRequirements = {
  cells: {
    a1: { min: 8, max: 8 },
    b1: { min: 16, max: undefined },
    b2: { min: 8, max: undefined },
    b3: { min: 0, max: undefined },
    c1: { min: 3, max: 3 },
    c2: { min: 2, max: 2 },
    c3: { min: 2, max: 2 },
    c4: { min: 1, max: 1 },
    d1: { min: 11, max: 16 },
    e1: { min: 2, max: 2 },
    e2: { min: 4, max: 4 },
    e3: { min: 4, max: 4 },
    e4: { min: 3, max: 3 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 4 },
    h1: { min: 2, max: undefined },
    h2: { min: 2, max: undefined },
    h3: { min: 0, max: undefined },
    h4: { min: 0, max: 4 },
  },
  columns: {
    a: { min: 8, max: 8 },
    b: { min: 52, max: 77 },
    c: { min: 8, max: 8 },
    d: { min: 11, max: 16 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 7 },
    h: { min: 6, max: 20 },
  },
  compulsory: 29,
  elective: 95,
};
