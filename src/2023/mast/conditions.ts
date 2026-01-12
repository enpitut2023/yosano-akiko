import {
  CourseId,
  FakeCourse,
  FakeCourseId,
  KnownCourse,
  RealCourse,
} from "../../akiko";
import { ClassifyOptions, SetupCreditRequirements } from "../../app-setup";
import { isGakushikiban } from "../../conditions/common";

function isA1(id: string): boolean {
  return (
    id === "GC48708" || // こっちは特別っぽい
    id === "GC48808"
  );
}

function isA2(id: string): boolean {
  return (
    id === "GC48608" || // こっちは特別っぽい
    id === "GC48908"
  );
}

function isA3(id: string) {
  return id === "GC41103";
}

function isA4(id: string) {
  return id === "GC41203";
}

function isA5(id: string) {
  return id === "GC42102";
}

function isA6(id: string) {
  return id === "GC42202";
}

function isB1(id: string) {
  return id.startsWith("GC5") || id.startsWith("GA4");
}

function isC1(id: string) {
  return id === "GA15331";
}

function isC2(id: string) {
  return id === "GC11701";
}

function isC3(id: string) {
  return id === "GA15231";
}

function isC4(id: string) {
  return id === "GC11801";
}

function isC5(id: string) {
  return id === "GA15131";
}

function isC6(id: string) {
  return id === "GC11601";
}

function isC7(id: string) {
  return id === "GA18222";
}

function isC8(id: string) {
  return id === "GA18322";
}

function isC9(id: string) {
  return id === "GC12701";
}

function isC10(id: string) {
  return id === "GC13101";
}

function isC11(id: string) {
  return id === "GC12401";
}

function isC12(id: string) {
  return id === "GC12403";
}

function isC13(id: string) {
  return id === "GC13201";
}

function isD1(id: string) {
  return (
    id !== "GA15111" && //情報数学A
    id !== "GA15121" &&
    id !== "GA15131" &&
    id !== "GA15141" &&
    id !== "GA15211" && //線形代数A
    id !== "GA15221" &&
    id !== "GA15231" &&
    id !== "GA15241" &&
    id !== "GA15311" && //微分積分A
    id !== "GA15321" &&
    id !== "GA15331" &&
    id !== "GA15341" &&
    id !== "GA18212" && //プログラミング入門A
    id !== "GA18222" &&
    id !== "GA18232" &&
    id !== "GA18312" && //プログラミング入門B
    id !== "GA18322" &&
    id !== "GA18332" &&
    (id.startsWith("GC2") || id.startsWith("GA1"))
  );
}

function isE1(id: string) {
  return (
    id === "1119102" || // ファーストイヤーセミナー
    id === "1227611" //学問への誘い
  );
}

function isE2(id: string) {
  return (
    id === "6525102" || // データサイエンス
    id === "6425102" || // 情報リテラシー(演習)
    id === "6114101" || // 情報リテラシー(講義) 2023
    id === "6125101" // 情報リテラシー(講義) 2024, 2025
  );
}

function isE3(id: string) {
  return (
    // TODO: 基礎体育の時に種目が違うか、応用の時に種目が同じかチェック
    id.startsWith("21") || // 基礎体育
    id.startsWith("22") // 応用体育
  );
}

function isE4(name: string): boolean {
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

function isF1(id: string) {
  return (
    (id.startsWith("12") || id.startsWith("14")) &&
    // 総合科目(学士基盤科目)
    !["27", "28", "30", "90"].includes(id.substring(2, 4))
  );
}

function isF2(id: string) {
  return id.startsWith("28"); // 体育（自由科目）
}

function isF3(id: string) {
  return (
    id.startsWith("3") && // 外国語（英語）
    !(
      id.startsWith("31H") ||
      id.startsWith("31J") ||
      id.startsWith("31K") ||
      id.startsWith("31L")
    )
  );
}

function isF4(id: string) {
  return id.startsWith("5"); // 国語
}

function isF5(id: string) {
  return id.startsWith("4"); // 芸術
}

function isH1(id: string) {
  if (id.startsWith("__")) {
    return false;
  }
  return (
    !(
      id.startsWith("GA") ||
      id.startsWith("GB") ||
      id.startsWith("GC") ||
      id.startsWith("GE") ||
      // 共通科目及び教職に関する科目
      id.match(/^\d/)
    ) ||
    id.startsWith("8") ||
    id.startsWith("99")
  );
}

function isH2(id: string) {
  return (
    (id.startsWith("GB") || id.startsWith("GE")) &&
    !(
      (
        id.startsWith("GB102") || //線形代数B
        id.startsWith("GB104") || //微分積分B
        id === "GB11931" || //データ構造とアルゴリズム
        id === "GB11956" || //データ構造とアルゴリズム実験
        id === "GB11966" || //データ構造とアルゴリズム実験
        id.startsWith("GB133") || //情報特別演習（情科）
        id.startsWith("GB139") || //インターンシップ（情科）
        id === "GB17401" || //情報科学特別講義E
        id.startsWith("GB19") || //専門英語、卒業研究、特別研究（情科）
        id.startsWith("GB26") || //ソフトウェアサイエンス実験A、B
        id.startsWith("GB27") || //ソフトウェアサイエンス特別講義A、B、C、D
        id.startsWith("GB36") || //情報システム実験A、B
        id.startsWith("GB37") || //情報システム特別講義A、B、C、D
        id.startsWith("GB46") || //知能情報メディア実験A、B
        id.startsWith("GB47") || //知能情報メディア特別講義A、B、C、D
        id.startsWith("GE116") || //専門英語A1（知識）
        id.startsWith("GE117") || //専門英語A2（知識）
        id.startsWith("GE121") || //アカデミックスキルズ（知識）
        id === "GE40603" || //インターンシップ（知識）
        id === "GE40703" || //国際インターンシップ（知識）
        id.startsWith("GE42") || //国際学術演習A、B
        id.startsWith("GE50") || //知識情報持論、専門英語B-C
        id.startsWith("GE51") || //卒業研究（知識）
        id.startsWith("GE601") || //知識科学実習A、B
        id.startsWith("GE701") || //知識情報システム実習A、B
        id.startsWith("GE801")
      ) //情報資源経営実習A、B
    )
  );
}

function isH3(id: string): boolean {
  return id.startsWith("99"); //博物館に関する科目　自由科目（特設）
}

export function classifyKnownCourses(cs: KnownCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    // 必修
    if (isA1(c.id)) {
      courseIdToCellId.set(c.id, "a1");
    } else if (isA2(c.id)) {
      courseIdToCellId.set(c.id, "a2");
    } else if (isA3(c.id)) {
      courseIdToCellId.set(c.id, "a3");
    } else if (isA4(c.id)) {
      courseIdToCellId.set(c.id, "a4");
    } else if (isA5(c.id)) {
      courseIdToCellId.set(c.id, "a5");
    } else if (isA6(c.id)) {
      courseIdToCellId.set(c.id, "a6");
    } else if (isC1(c.id)) {
      courseIdToCellId.set(c.id, "c1");
    } else if (isC2(c.id)) {
      courseIdToCellId.set(c.id, "c2");
    } else if (isC3(c.id)) {
      courseIdToCellId.set(c.id, "c3");
    } else if (isC4(c.id)) {
      courseIdToCellId.set(c.id, "c4");
    } else if (isC5(c.id)) {
      courseIdToCellId.set(c.id, "c5");
    } else if (isC6(c.id)) {
      courseIdToCellId.set(c.id, "c6");
    } else if (isC7(c.id)) {
      courseIdToCellId.set(c.id, "c7");
    } else if (isC8(c.id)) {
      courseIdToCellId.set(c.id, "c8");
    } else if (isC9(c.id)) {
      courseIdToCellId.set(c.id, "c9");
    } else if (isC10(c.id)) {
      courseIdToCellId.set(c.id, "c10");
    } else if (isC11(c.id)) {
      courseIdToCellId.set(c.id, "c11");
    } else if (isC12(c.id)) {
      courseIdToCellId.set(c.id, "c12");
    } else if (isC13(c.id)) {
      courseIdToCellId.set(c.id, "c13");
    } else if (isE1(c.id)) {
      courseIdToCellId.set(c.id, "e1");
    } else if (isE2(c.id)) {
      courseIdToCellId.set(c.id, "e2");
    } else if (isE3(c.id)) {
      courseIdToCellId.set(c.id, "e3");
    } else if (isE4(c.name)) {
      courseIdToCellId.set(c.id, "e4");
    }
    // 選択
    if (isB1(c.id)) {
      courseIdToCellId.set(c.id, "b1");
    } else if (isD1(c.id)) {
      courseIdToCellId.set(c.id, "d1");
    } else if (isF1(c.id)) {
      courseIdToCellId.set(c.id, "f1");
    } else if (isF2(c.id)) {
      courseIdToCellId.set(c.id, "f2");
    } else if (isF3(c.id)) {
      courseIdToCellId.set(c.id, "f3");
    } else if (isF4(c.id)) {
      courseIdToCellId.set(c.id, "f4");
    } else if (isF5(c.id)) {
      courseIdToCellId.set(c.id, "f5");
    } else if (isH1(c.id)) {
      courseIdToCellId.set(c.id, "h1");
    } else if (isH2(c.id)) {
      courseIdToCellId.set(c.id, "h2");
    } else if (isH3(c.id)) {
      courseIdToCellId.set(c.id, "h3");
    }
  }
  return courseIdToCellId;
}

// function classifyRealCourses(cs: RealCourse[]): Map<CourseId, string> {
//   const courseIdToCellId = new Map<CourseId, string>();
//   for (const c of cs) {
//     if (isB1(c.id)) {
//       courseIdToCellId.set(c.id, "b1");
//     } else if (isD1(c.id)) {
//       courseIdToCellId.set(c.id, "d1");
//     } else if (isF1(c.id)) {
//       courseIdToCellId.set(c.id, "f1");
//     } else if (isF2(c.id)) {
//       courseIdToCellId.set(c.id, "f2");
//     } else if (isF3(c.id)) {
//       courseIdToCellId.set(c.id, "f3");
//     } else if (isF4(c.id)) {
//       courseIdToCellId.set(c.id, "f4");
//     } else if (isF5(c.id)) {
//       courseIdToCellId.set(c.id, "f5");
//     } else if (isH1(c.id)) {
//       courseIdToCellId.set(c.id, "h1");
//     } else if (isH2(c.id)) {
//       courseIdToCellId.set(c.id, "h2");
//     } else if (isH3(c.id)) {
//       courseIdToCellId.set(c.id, "h3");
//     }
//   }
//   return courseIdToCellId;
// }

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
    a1: { min: 3, max: 3 },
    a2: { min: 3, max: 3 },
    a3: { min: 3, max: 3 },
    a4: { min: 3, max: 3 },
    a5: { min: 1, max: 1 },
    a6: { min: 1, max: 1 },
    b1: { min: 20, max: 35 },
    c1: { min: 2, max: 2 },
    c2: { min: 2, max: 2 },
    c3: { min: 2, max: 2 },
    c4: { min: 2, max: 2 },
    c5: { min: 2, max: 2 },
    c6: { min: 2, max: 2 },
    c7: { min: 2, max: 2 },
    c8: { min: 1, max: 1 },
    c9: { min: 2, max: 2 },
    c10: { min: 2, max: 2 },
    c11: { min: 2, max: 2 },
    c12: { min: 1, max: 1 },
    c13: { min: 2, max: 2 },
    d1: { min: 32, max: 47 },
    e1: { min: 2, max: 2 },
    e2: { min: 4, max: 4 },
    e3: { min: 2, max: 2 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 4 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 6 },
    h1: { min: 6, max: 15 },
    h2: { min: 0, max: 9 },
    h3: { min: 0, max: 9 },
  },
  columns: {
    a: { min: 14, max: 14 },
    b: { min: 20, max: 35 },
    c: { min: 24, max: 24 },
    d: { min: 32, max: 47 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 10 },
    h: { min: 6, max: 15 },
  },
  compulsory: 50,
  elective: 74,
};
