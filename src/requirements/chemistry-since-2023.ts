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
  isCompulsoryEnglishByName,
  isCompulsoryPe1,
  isCompulsoryPe2,
  isInfoLiteracyLecture,
  isInfoLiteracyExercise,
  isDataScience,
  isIzanai,
  isFirstYearSeminar,
} from "@/requirements/common";

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

function isD1(id: string, tableYear: number): boolean {
  return (
    // 2023, 2024のみ
    ((tableYear === 2023 || tableYear === 2024) &&
      (id === "FA01191" || // 数学リテラシー1 !!A!!
        id === "FA011B1" || // 数学リテラシー1 (2年) !!A!!
        id === "FA011C1" || // 数学リテラシー1 (総合) !!A!!
        id === "FA011D1" || // 数学リテラシー1 (総合) !!A!!
        id === "FA011E1" || // 数学リテラシー1 (総合) !!A!!
        id === "FA01291" || // 数学リテラシー2 !!A!!
        id === "FA012B1" || // 数学リテラシー2 (2年) !!A!!
        id === "FA012C1" || // 数学リテラシー2 (総合) !!A!!
        id === "FA012D1" || // 数学リテラシー2 (総合) !!A!!
        id === "FA012E1" || // 数学リテラシー2 (総合) !!A!!
        id === "FBA1742" || //  微積分演習S(化学類対象) !!A!!
        id === "FBA1822" || //  微積分演習F(化学類対象) !!A!!
        id === "FBA1782" || //  線形代数演習S
        id === "FBA1862")) || //  線形代数演習F
    // 2023年のみ
    (tableYear === 2023 &&
      (id === "FBA1481" || // 微積分I (化学類対象)  !!A!!
        id === "FBA1901" || // 微積分I (再履修者対象) !!A!!
        id === "FBA1521" || // 微積分II(化学類対象) !!A!!
        id === "FBA1561" || // 微積分III(化学類対象) !!A!!
        id === "FBA1601" || // 線形代数I (化学類対象) !!A!!
        id === "FBA1911" || // 線形代数I (再履修者対象)  !!A!!
        id === "FBA1641" || // 線形代数II (化学類対象) !!A!!
        id === "FBA1681")) || // 線形代数III (化学類対象) !!A!!
    // 2023 2024 2025
    id === "FA01391" || // 微積分1 !!A!!
    id === "FA01491" || // 微積分2 !!A!!
    id === "FA01591" || // 微積分3 !!A!!
    id === "GA15311" || // 微分積分A(coins生 1・2クラス 総合生(coins志望)優先) !!A!!
    id === "GA15321" || // 微分積分A(coins生 1・2クラス 総合生(coins志望)優先) !!A!!
    id === "GA15331" || // 微分積分A(2023 mastのみ 2024~ mastと総合生(mast志望)優先) !!A!!
    id === "GA15341" || // 微分積分A(klis 総合生(klis志望)優先)
    id === "FA01691" || // 線形代数1 (2024~ 化学類はこの番号でなければならない) !!A!!
    id === "FA01791" || // 線形代数2 (2024~ 化学類はこの番号でなければならない) !!A!!
    id === "FA01891" || // 線形代数3 (2024~ 化学類はこの番号でなければならない) !!A!!
    id === "FF18724" || //  線形代数A(おそらくcoens 1・2クラス) !!A!!
    id === "FF18734" || //  線形代数A(おそらくcoens 3・4クラス) !!A!!
    id === "GA15211" || //  線形代数A(coins 1・2クラス) !!A!!
    id === "GA15221" || //  線形代数A(coins 3・4クラス) !!A!!
    id === "GA15231" || //  線形代数A(mast 総合生(mast志望)優先) !!A!!
    id === "GA15241" || //  線形代数A(klis 総合生(klis志望)優先) !!A!!
    id === "FCB1211" || //  力学1(物理学類、化学類、数学類、地球学類、生物学類 原則平成31年度以降入学者) !!A!!
    id === "FCB1251" || //  力学2(物理学類、化学類、数学類、地球学類、生物学類 原則平成31年度以降入学者) !!A!!
    id === "FCB1271" || //  力学3(物理学類、化学類、数学類、地球学類、生物学類 原則平成31年度以降入学者) !!A!!
    id === "FCB1311" || //  電磁気学1(物理学類、化学類、数学類、地球学類、生物学類 原則平成31年度以降入学者) !!A!!
    id === "FCB1341" || //  電磁気学2(物理学類、化学類、数学類、地球学類、生物学類 原則平成31年度以降入学者) !!A!!
    id === "FCB1371" //  電磁気学3(物理学類、化学類、数学類、地球学類、生物学類 原則平成31年度以降入学者) !!A!!

    // 2023年度入学生が成績として反映される可能性があるもの(2023の化学類対象の科目が存在しないため)
    // FA01311 微積分1
    // FA01321 微積分1
    // FA01331 微積分1
    // FA01341 微積分1
    // FA01351 微積分1
    // FA01361 微積分1
    // FA013C1 微積分1
    // FA013D1 微積分1
    // FA01411 微積分2
    // FA01421 微積分2
    // FA01431 微積分2
    // FA01441 微積分2
    // FA01451 微積分2
    // FA01461 微積分2
    // FA014C1 微積分2
    // FA014D1 微積分2
    // FA01511 微積分3
    // FA01521 微積分3
    // FA01531 微積分3
    // FA01541 微積分3
    // FA01551 微積分3
    // FA01561 微積分3
    // FA015C1 微積分3
    // FA015D1 微積分3
    // FA01611 線形代数1
    // FA01621 線形代数1
    // FA01631 線形代数1
    // FA01641 線形代数1
    // FA01651 線形代数1
    // FA01661 線形代数1
    // FA016C1 線形代数1
    // FA016D1 線形代数1
    // FA01711 線形代数2
    // FA01721 線形代数2
    // FA01731 線形代数2
    // FA01741 線形代数2
    // FA01751 線形代数2
    // FA01761 線形代数2
    // FA017C1 線形代数2
    // FA017D1 線形代数2
    // FA01811 線形代数3
    // FA01821 線形代数3
    // FA01831 線形代数3
    // FA01841 線形代数3
    // FA01851 線形代数3
    // FA01861 線形代数3
    // FA018C1 線形代数3
    // FA018D1 線形代数3
  );
}

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

function isE1(id: string, tableYear: number, mode: "real" | "known"): boolean {
  return (
    //学問への誘い
    id === "1227411" || //1クラス
    id === "1227421" || //2クラス
    //ファーストイヤーセミナー
    id === "1114102" || //1クラス
    id === "1114202" || //2クラス
    (tableYear === 2025 && id === "1414014") || //事例に学ぶ環境安全衛生と化学物質
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

function isE3(name: string): boolean {
  return isCompulsoryEnglishByName(name);
}

function isE4(id: string, mode: "known" | "real"): boolean {
  switch (mode) {
    case "known":
      return (
        id === "6112101" || //  情報リテラシー(講義) 2024~ 数学、化学対象
        id === "6114101" || //  情報リテラシー(講義) 2023 化学、創成、物理対象
        id === "6414102" || //  情報リテラシー(演習) 化学対象
        id === "6514102" //  データサイエンス 化学対象
      );
    case "real":
      return (
        isInfoLiteracyLecture(id) ||
        isInfoLiteracyExercise(id) ||
        isDataScience(id)
      );
  }
}

function isF1(id: string): boolean {
  // TODO:
  // 2024 学士基盤科目は高年時向けから1つ以上必要
  return isGakushikiban(id);
}

function isH1(id: string): boolean {
  return id.startsWith("A") || id.startsWith("B");
}

function isH2(id: string): boolean {
  // TODO: 「教職科目は理科に関するもののみ」という条件もあるが、保留
  return true;
}

function classify(
  id: CourseId,
  name: string,
  mode: "known" | "real",
  tableYear: number,
): string | undefined {
  if (isA1(id)) return "a1";
  if (isA2(id)) return "a2";
  if (isA3(id)) return "a3";
  if (isA4(id)) return "a4";
  if (isC1(id)) return "c1";
  if (isE1(id, tableYear, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(name)) return "e3";
  if (isE4(id, mode)) return "e4";

  // 選択
  if (isB1(id)) return "b1";
  if (isB2(id)) return "b2";
  if (isB3(id)) return "b3";
  if (isB4(id)) return "b4";
  if (isD1(id, tableYear)) return "d1";
  if (isD2(id)) return "d2";
  if (isF1(id)) return "f1";
  if (isH1(id)) return "h1";
  if (isH2(id)) return "h2";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
  tableYear: number,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, "known", tableYear);
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
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, "real", tableYear);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  cs: FakeCourse[],
  opts: ClassifyOptions,
  tableYear: number,
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
    a1: { min: 4.5, max: 4.5 },
    a2: { min: 4.5, max: 4.5 },
    a3: { min: 4.5, max: 4.5 },
    a4: { min: 14, max: 14 },
    b1: { min: 6, max: 6 },
    b2: { min: 6, max: 6 },
    b3: { min: 6, max: 6 },
    b4: { min: 24, max: 34 },
    c1: { min: 3, max: 3 },
    d1: { min: 12, max: 12 },
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

export const creditRequirementsSince2025: SetupCreditRequirements = {
  cells: {
    a1: { min: 4, max: 4 },
    a2: { min: 4, max: 4 },
    a3: { min: 4, max: 4 },
    a4: { min: 14, max: 14 },
    b1: { min: 6, max: 6 },
    b2: { min: 6, max: 6 },
    b3: { min: 6, max: 6 },
    b4: { min: 24, max: 34 },
    c1: { min: 3, max: 3 },
    d1: { min: 8, max: 8 },
    d2: { min: 9, max: 22 },
    e1: { min: 3, max: 3 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 1 },
    h1: { min: 2, max: 2 },
    h2: { min: 7, max: 9 },
  },
  columns: {
    a: { min: 26, max: 26 },
    b: { min: 42, max: 52 },
    c: { min: 3, max: 3 },
    d: { min: 17, max: 30 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 1 },
    h: { min: 9, max: 11 },
  },
  compulsory: 42,
  elective: 82,
};
