import {
  CourseId,
  FakeCourse,
  FakeCourseId,
  KnownCourse,
  RealCourse,
} from "@/akiko";
import { ClassifyOptions, SetupCreditRequirements } from "@/app-setup";
import {
  isGakushikiban,
  isHakubutsukan,
  isJiyuukamoku,
  isKyoutsuu,
} from "@/conditions/common";
import {
  isCompulsoryEnglishByName,
  isKyoushoku,
} from "@/conditions/common/2025";
import { assert } from "@/util";

function assertYear(year: number): void {
  assert(2023 <= year && year <= 2025);
}

function isA1(id: string): boolean {
  // 卒業研究A
  return (
    id === "GC48708" || // 秋学期
    id === "GC48808" // 春学期
  );
}

function isA2(id: string): boolean {
  // 卒業研究B
  return (
    id === "GC48608" || // 春学期
    id === "GC48908"
  );
}

function isA3(id: string) {
  return id === "GC41103"; // 情報メディア実験A
}

function isA4(id: string) {
  return id === "GC41203"; // 情報メディア実験B
}

function isA5(id: string) {
  return id === "GC42102"; // 専門英語A
}

function isA6(id: string) {
  return id === "GC42202"; // 専門英語B
}

function isB1(id: string) {
  return id.startsWith("GC5") || id.startsWith("GA4");
}

function isC1(id: string) {
  return id === "GA15331"; // 微分積分A
}

function isC2(id: string) {
  return id === "GC11701"; // 微分積分B
}

function isC3(id: string) {
  return id === "GA15231"; // 線形代数A
}

function isC4(id: string) {
  return id === "GC11801"; // 線形代数B
}

function isC5(id: string) {
  return id === "GA15131"; // 情報数学A
}

function isC6(id: string) {
  return id === "GC11601"; // 確率と統計
}

function isC7(id: string) {
  return id === "GA18222"; // プログラミング入門A
}

function isC8(id: string) {
  return id === "GA18322"; // プログラミング入門B
}

function isC9(id: string) {
  return id === "GC12701"; // プログラミング
}

function isC10(id: string) {
  return id === "GC13101"; // コンピュータシステムとOS
}

function isC11(id: string) {
  return id === "GC12401"; // データ構造とアルゴリズム
}

function isC12(id: string) {
  return id === "GC12403"; // データ構造とアルゴリズム実習
}

function isC13(id: string) {
  return id === "GC13201"; // データ工学概論
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
  return isCompulsoryEnglishByName(name);
}

function isF1(id: string) {
  return isGakushikiban(id);
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
  return !(/^G[ABCE]/.test(id) || isKyoutsuu(id) || isKyoushoku(id));
}

function isH2(id: string) {
  return id.startsWith("GB") || id.startsWith("GE");
}

function isH3(id: string): boolean {
  return isHakubutsukan(id) || isJiyuukamoku(id);
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
  year: number,
): Map<CourseId, string> {
  assertYear(year);
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
    else if (isB1(c.id)) {
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
    } else if (isH2(c.id)) {
      courseIdToCellId.set(c.id, "h2");
    } else if (isH3(c.id)) {
      courseIdToCellId.set(c.id, "h3");
    } else if (isH1(c.id)) {
      // H1の条件は「...以外」なので最後
      courseIdToCellId.set(c.id, "h1");
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  opts: ClassifyOptions,
  year: number,
): Map<CourseId, string> {
  assertYear(year);
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
    else if (isB1(c.id)) {
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
    } else if (isH2(c.id)) {
      courseIdToCellId.set(c.id, "h2");
    } else if (isH3(c.id)) {
      courseIdToCellId.set(c.id, "h3");
    } else if (isH1(c.id)) {
      // H1の条件は「...以外」なので最後
      courseIdToCellId.set(c.id, "h1");
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  cs: FakeCourse[],
  opts: ClassifyOptions,
  year: number,
): Map<FakeCourseId, string> {
  assertYear(year);
  const fakeCourseIdToCellId = new Map<FakeCourseId, string>();
  for (const c of cs) {
    if (isE4(c.name)) {
      fakeCourseIdToCellId.set(c.id, "e4");
    }
  }
  return fakeCourseIdToCellId;
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
