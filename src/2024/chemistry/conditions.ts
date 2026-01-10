import { CourseId, FakeCourseId, KnownCourse } from "../../akiko";
import { SetupCreditRequirements } from "../../app-setup";
import { isGakushikiban } from "../../conditions/common";
import { isInt8Array } from "node:util/types";

function isA1(id: string): boolean {
  return (
    id === "FE13273" // 物理化学専門実験
  );
}

function isA2(id: string): boolean {
  return (
    id === "FE13133" // 無機・分析化学専門実験
  );
}

function isA3(id: string): boolean {
  return (
    id === "FE13313" // 有機化学専門実験
  );
}

function isA4(id: string): boolean {
  return (
    id === "FE14808" || // 卒研(14単位)
    id === "FE14908" //卒研(旧? 10単位)
  );
}

function isB1(id: string): boolean {
  return (
    id === "FE12301" || // 分析化学
    id === "FE12201" || // 無機化学I
    id === "FE13101" || // 無機化学II
    id === "FE13621" || // 無機元素化学
    id === "FE13611" // 放射化学
  );
}

function isB2(id: string): boolean {
  return (
    id === "FE12401" || // 物理化学I
    id === "FE12411" || // 物理化学II
    id === "FE13221" || // 物理化学III
    id === "FE13231" // 物理化学IV
  );
}

function isB3(id: string): boolean {
  return (
    id === "FE12601" || // 有機化学I
    id === "FE12611" || // 有機化学II
    id === "FE13301" || // 有機化学III
    id === "FE13311" // 有機化学IV
  );
}

function isB4(id: string): boolean {
  return (
    id.startsWith("FE12") || id.startsWith("FE13") || id.startsWith("FE14")
  );
}

function isC1(id: string): boolean {
  return (
    id === "FE11171" || // 化学1
    id === "FE11271" || // 化学1 (総合2類)
    id === "FE11181" || // 化学2
    id === "FE11281" || // 化学2 (総合2類)
    id === "FE11191" || // 化学3
    id === "FE11291" // 化学3 (総合2類)
  );
}

// D1の列は、クラス分けがある単位は成績上ではどの科目番号の扱いになるか不明なので、保留中

/*
function isD1(id: string): boolean {
  return (
    id === "FA01191" || // 数学リテラシー1
    id === "FA011B1" || // 数学リテラシー1 (2年)
    id === "FA011C1" || // 数学リテラシー1 (総合)
    id === "FA011D1" || // 数学リテラシー1 (総合)
    id === "FA011E1" || // 数学リテラシー1 (総合)
    id === "FA01291" || // 数学リテラシー2
    id === "FA012B1" || // 数学リテラシー2 (2年)
    id === "FA012C1" || // 数学リテラシー2 (総合)
    id === "FA012D1" || // 数学リテラシー2 (総合)
    id === "FA012E1" || // 数学リテラシー2 (総合)
    id === "FA01391" || // 微積分1

  );
}*/

function isD2(id: string): boolean {
  return (
    // EBから始まる専門導入
    id === "EB00001" || // 生物学序説
    id === "EB00011" || // 生物学序説
    id === "EB00021" || // 生物学序説
    id === "EB11131" || // 系統分類・進化学概論
    id === "EB11221" || // 分子細胞生物学概論
    id === "EB11311" || // 遺伝学概論
    id === "EB11611" || // 生態学概論
    id === "EB11721" || // 動物生理学概論
    id === "EB11811" || // 植物生理学概論
    // ECから始まる専門導入
    id === "EC12201" || // 生物資源学にみる食品科学・技術の最前線
    id === "EC12301" || // 生物資源の開発・生産と持続利用
    id === "EC12401" || // 生物資源と環境
    id === "EC12501" || // 生物資源としての遺伝子とゲノム
    // 残りは先頭一致
    id.startsWith("FA") ||
    id.startsWith("FB") ||
    id.startsWith("FC") ||
    id.startsWith("FE11") ||
    id.startsWith("EE")
  );
}

function isE1(id: string): boolean {
  return (
    //学問への誘い
    id === "1227411" || //1クラス
    id === "1227421" || //2クラス
    //ファーストイヤーセミナー
    id === "1114102" || //1クラス
    id === "1114202" //2クラス
  );
}

function isE2(id: string): boolean {
  return (
    // TODO: 基礎体育の時に種目が違うか、応用の時に種目が同じかチェック
    id.startsWith("21") || // 基礎体育
    id.startsWith("22") // 応用体育
  );
}

function isE3(name: string): boolean {
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

function isE4(id: string): boolean {
  // TODO:
  // 編入とかで情報を認定された人は「情報」という名前の4単位の授業を与えられる
  return (
    // 情報リテラシー講義
    id.startsWith("61") ||
    // 情報リテラシー演習
    id.startsWith("64") ||
    // データサイエンス
    id.startsWith("65")
  );
}

function isF1(id: string): boolean {
  // 学士基盤科目は高年時向けから1つ以上必要らしい、一旦保留
  return isGakushikiban(id);
}

function isH1(id: string): boolean {
  return id.startsWith("A") || id.startsWith("B");
}

function isH2(id: string): boolean {
  // 「教職科目は理科に関するもののみ」という条件もあるが、保留
  return !(
    isA1(id) ||
    isA2(id) ||
    isA3(id) ||
    isA4(id) ||
    isB1(id) ||
    isB2(id) ||
    isB3(id) ||
    isB4(id) ||
    isC1(id) ||
    isD2(id) ||
    isE1(id) ||
    isE2(id) ||
    isE3(id) ||
    isE4(id) ||
    isF1(id) ||
    isH1(id)
  );
}

export function classifyKnownCourses(cs: KnownCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    if (isA1(c.id)) {
      courseIdToCellId.set(c.id, "a1");
    } else if (isA2(c.id)) {
      courseIdToCellId.set(c.id, "a2");
    } else if (isA3(c.id)) {
      courseIdToCellId.set(c.id, "a3");
    } else if (isA4(c.id)) {
      courseIdToCellId.set(c.id, "a4");
    } else if (isC1(c.id)) {
      courseIdToCellId.set(c.id, "c1");
    } else if (isE1(c.id)) {
      courseIdToCellId.set(c.id, "e1");
    } else if (isE2(c.id)) {
      courseIdToCellId.set(c.id, "e2");
    } else if (isE3(c.name)) {
      courseIdToCellId.set(c.id, "e3");
    } else if (isE4(c.id)) {
      courseIdToCellId.set(c.id, "e4");
    }

    // 選択
    else if (isB1(c.id)) {
      courseIdToCellId.set(c.id, "b1");
    } else if (isB2(c.id)) {
      courseIdToCellId.set(c.id, "b2");
    } else if (isB3(c.id)) {
      courseIdToCellId.set(c.id, "b3");
    } else if (isB4(c.id)) {
      courseIdToCellId.set(c.id, "b4");
    } else if (isD2(c.id)) {
      courseIdToCellId.set(c.id, "d2");
    } else if (isF1(c.id)) {
      courseIdToCellId.set(c.id, "f1");
    } else if (isH1(c.id)) {
      courseIdToCellId.set(c.id, "h1");
    } else if (isH2(c.id)) {
      courseIdToCellId.set(c.id, "h2");
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(): Map<CourseId, string> {
  return new Map<CourseId, string>();
}

export function classifyFakeCourses(): Map<FakeCourseId, string> {
  return new Map<FakeCourseId, string>();
}

export const creditRequirements: SetupCreditRequirements = {
  cells: {
    a1: { min: 4.5, max: 4.5 },
    a2: { min: 4.5, max: 4.5 },
    a3: { min: 4.5, max: 4.5 },
    a4: { min: 14, max: 14 },
    b1: { min: 6, max: 6 },
    b2: { min: 6, max: 6 },
    b3: { min: 6, max: 6 },
    b4: { min: 24, max: 34 },
    c1: { min: 3, max: 3 },
    d2: { min: 5, max: 18 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 2 },
    h1: { min: 2, max: 2 },
    h2: { min: 7, max: 9 },
  },
  columns: {
    a: { min: 27.5, max: 27.5 },
    b: { min: 42, max: 52 },
    c: { min: 3, max: 3 },
    d: { min: 17, max: 30 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 2 },
    h: { min: 9, max: 11 },
  },
  compulsory: 42.5,
  elective: 81.5,
};
