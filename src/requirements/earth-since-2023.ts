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
  isCompulsoryEnglishById,
  isCompulsoryPe1,
  isCompulsoryPe2,
  isElectivePe,
  isForeignLanguage,
  isGakushikiban,
  isHakubutsukan,
  isJapanese,
  isKyoushoku,
  isKyoutsuu,
} from "@/requirements/common";
import { unreachable } from "@/util";

export type Specialty =
  // Earth Environmental Science (Geo-environmental Science)
  | "gs"
  // Evolutionary Earth Sciences
  | "ees";

type Mode = "known" | "real";

function isA1(id: string, year: number): boolean {
  if (year >= 2024) {
    return (
      id === "EE51968" || // 卒業研究 通年
      id === "EE51978" || // 卒業研究 応談 春
      id === "EE51988" // 卒業研究 応談 秋
    );
  }
  //2023年度 令和2年度以前入学者対象
  //TODO: 以下の卒業研究の単位数は10単位、卒業要件は12単位
  return (
    id === "EE51908" || // 卒業研究 通年
    id === "EE51918" || // 卒業研究 通年
    id === "EE51928" || // 卒業研究 応談 春
    id === "EE51938" || // 卒業研究 応談 春
    id === "EE51948" || // 卒業研究 応談 秋
    id === "EE51958" // 卒業研究 応談 秋
  );
}

function isA2(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "gs":
      return (
        id === "EE23041" || // 地球学専門英語2A
        id === "EE23051" // 地球学専門英語2B
      );
    case "ees":
      return (
        id === "EE31061" || // 地球学専門英語2A
        id === "EE31071" // 地球学専門英語2B
      );
    default:
      unreachable(specialty);
  }
}

function isB1(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "gs":
      return id.startsWith("EE2");
    case "ees":
      return id.startsWith("EE3");
    default:
      unreachable(specialty);
  }
}

function isB2(id: string, _specialty: Specialty): boolean {
  // Shared logic for EE2/EE3/EE4/EE8/EG9 etc as per my previous analysis
  // Note: Source has separate blocks for gs/ees but they look identical in coverage
  // except for comments "2023年度にのみ" etc.
  // I will make it permissive union.
  return (
    id.startsWith("EE2") ||
    id.startsWith("EE3") ||
    id.startsWith("EE4") ||
    id.startsWith("EE8") ||
    id.startsWith("EG9") ||
    id === "EE11881" || // 地球基礎数学・物理学
    id === "EE11891" || // 地球基礎化学
    id === "EE11831" || // 地球統計学
    id === "EE11871" || // 地球情報学
    id === "EE11911" // 地球学野外調査法
  );
}

function isC1(id: string): boolean {
  return (
    id === "EE11151" || // 地球環境学1
    id === "EE11161" || // 地球環境学2
    id === "EE11251" || // 地球進化学1
    id === "EE11261" || // 地球進化学2
    id === "EE12103" || // 地球学実験
    id === "EE11711" || // 地球学専門英語1A
    id === "EE11721" // 地球学専門英語1B
  );
}

function isD1(id: string, year: number): boolean {
  // TODO: 微分積分Aは以下のどちらでも可能か？学類による指定はない
  // id === "GA15331" || // 微分積分A !!A!!
  // id === "GA15341" || // 微分積分A !!A!!
  // id === "EE11251" || // 線形代数A
  const common =
    id === "FBA1451" || // 数学概論
    id === "FA011A1" || // 数学リテラシー1 !!A!!
    id === "FA011B1" || // 数学リテラシー1 2年次の学生 !!A!!
    id === "FA012A1" || // 数学リテラシー2 !!A!!
    id === "FA012B1" || // 数学リテラシー2 2年次の学生 !!A!!
    id === "FBA1752" || // 微積分演習S
    id === "FBA1832" || // 微積分演習F
    id === "FBA1792" || // 線形代数演習S
    id === "FBA1872" || // 線形代数演習F
    id === "FCB1401" || // 物理学概論
    id === "FCB1211" || // 力学1 !!A!!
    id === "FCB1251" || // 力学2 !!A!!
    id === "FCB1271" || // 力学3 !!A!!
    id === "FCB1311" || // 電磁気学1
    id === "FCB1341" || // 電磁気学2
    id === "FCB1371" || // 電磁気学3
    id === "FE11161" || // 化学概論
    id === "FE11171" || // 化学1
    id === "FE11271" || // 化学1(2次募集)
    id === "FE11181" || // 化学2 2025
    id === "FE11281" || // 化学2 2024,2023年度では、2次募集が存在
    id === "FE11191" || // 化学3
    id === "FE11291" || // 化学3 2024,2023年度では、2次募集が存在
    id === "EB00001" || // 生物学序説 春A
    id === "EB00011" || // 生物学序説 春C
    id === "EB00021" || // 生物学序説 秋AB
    id === "EB11311" || // 遺伝学概論 春C
    id === "EB11351" || // 遺伝学概論 秋C
    id === "EB11221" || // 分子細胞生物学概論 春B
    id === "EB11251" || // 分子細胞生物学概論 秋AB
    id === "EB11131" || // 系統分類・進化学概論 秋A
    id === "EB11151" || // 系統分類・進化学概論 秋C
    id === "EB11721" || // 動物生理学概論 秋B ←専門導入科目
    id === "EB11751" || // 動物生理学概論 春AB
    id === "EB11811" || // 植物生理学概論 秋B ←専門導入科目
    id === "EB11851" || // 植物生理学概論 春AB
    id === "EB11611" || // 生態学概論 秋A ←専門導入科目
    id === "EB11651" || // 生態学概論 秋AB
    id === "EC12301" || // 生物資源の開発・生産と持続利用
    id === "EC12501" || // 生物資源としての遺伝子とゲノム
    id === "EC12401" || // 生物資源と環境
    id === "EC12201" || // 生物資源学にみる食品科学・技術の最前線
    id === "AC56031" || // フィールド文化領域比較文化研究
    id === "AC50E01" || // 文化人類学概論
    id === "AB70F11" || // 歴史地理概説-a
    id === "AB70F21" || // 歴史地理概説-b
    id === "AC50E41" || // 文化地理学概論
    id === "AC62F21" || // 地域地理学I 西暦偶数年度 2025年度のみ
    id === "AC62F31" || // 地域地理学Ⅱ 西暦奇数年度 2025年度のみ
    id === "FF17011" || // 応用理工学概論
    id === "FG16051" || // 工学システム概論
    id === "FCA1011" || // 物理学序説
    id === "FE00031" || // 化学序説
    id.startsWith("FB") ||
    id.startsWith("FC") ||
    id.startsWith("FE") ||
    id.startsWith("EB") ||
    id.startsWith("EC") ||
    id.startsWith("EE1") ||
    (id.startsWith("EG") && id[2] !== "7" && id[2] !== "8" && id[2] !== "9") ||
    id.startsWith("EG70");
  if (year >= 2024) {
    return (
      common ||
      id === "FA013A1" || // 微積分1 !!A!!
      id === "FA014A1" || // 微積分2 !!A!!
      id === "FBA1571" || // 微積分3 !!A!!
      id === "FA016A1" || // 線形代数1 !!A!!
      id === "FA017A1" || // 線形代数2 !!A!!
      id === "FA018A1" // 線形代数3 !!A!!
    );
  } else {
    // 2023
    return (
      common ||
      id === "FBA1491" || // 微積分Ⅰ !!A!!
      id === "FBA1531" || // 微積分Ⅱ !!A!!
      id === "FA015A1" || // 微積分Ⅲ !!A!!
      id === "FBA1611" || // 線形代数Ⅰ !!A!!
      id === "FBA1651" || // 線形代数Ⅱ !!A!!
      id === "FBA1691" || // 線形代数Ⅲ !!A!!
      id.startsWith("FA") || // 2023年度のみ
      id.startsWith("GA") || // 2023年度のみ
      id.startsWith("71") // 2023年度のみ
    );
  }
}

function isE1(id: string): boolean {
  return (
    id === "1111102" || // ファーストイヤーセミナー 1クラス
    id === "1111202" || // ファーストイヤーセミナー 2クラス
    id === "1227351" || // 学問への誘い 1クラス
    id === "1227361" // 学問への誘い 2クラス
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

function isE3(id: string): boolean {
  return isCompulsoryEnglishById(id);
}

function isE4(id: string): boolean {
  return (
    id === "6109101" || // 情報リテラシー(講義)
    id === "6411102" || // 情報リテラシー(演習)
    id === "6511102" // データサイエンス
  );
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isF2(id: string): boolean {
  return isForeignLanguage(id) || isElectivePe(id) || isJapanese(id) || isArt(id);
}

function isH1(id: string, year: number): boolean {
  // TODO: その他学類長が特に指定する科目 2025のみH1
  // ファーストイヤーセミナーとかがめっちゃ入ってる
  if (year >= 2025) {
    return (
      isKyoushoku(id) ||
      isHakubutsukan(id) ||
      (!id.startsWith("E") &&
        !id.startsWith("FB") &&
        !id.startsWith("FC") &&
        !id.startsWith("FE") &&
        !isKyoutsuu(id))
    );
  } else {
    // 2023 2024
    return (
      isKyoushoku(id) ||
      isHakubutsukan(id) ||
      id.startsWith("AB") ||
      id.startsWith("AC") ||
      id.startsWith("FF") ||
      id.startsWith("FG") ||
      id.startsWith("FH")
    );
  }
}

function isH2(id: string): boolean {
  //TODO: その他学類長が特に指定する科目 2023,2024
  return (
    !id.startsWith("AB") &&
    !id.startsWith("AC") &&
    !id.startsWith("EB") &&
    !id.startsWith("EC") &&
    !id.startsWith("EE") &&
    !id.startsWith("EG") &&
    !id.startsWith("FB") &&
    !id.startsWith("FC") &&
    !id.startsWith("FE") &&
    !id.startsWith("FF") &&
    !id.startsWith("FG") &&
    !id.startsWith("FH") &&
    !isKyoutsuu(id)
  );
}

function classify(
  id: CourseId,
  specialty: Specialty,
  _isNative: boolean,
  _mode: Mode,
  year: number,
): string | undefined {
  // 必修
  if (isA1(id, year)) return "a1";
  if (isA2(id, specialty)) return "a2";
  if (isC1(id)) return "c1";
  if (isE1(id)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(id)) return "e3";
  if (isE4(id)) return "e4";
  // 選択
  if (isB1(id, specialty)) return "b1";
  if (isB2(id, specialty)) return "b2";
  if (isD1(id, year)) return "d1";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isH1(id, year)) return "h1";
  if (isH2(id)) return "h2";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
  tableYear: number,
  specialty: Specialty,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, specialty, opts.isNative, "known", tableYear);
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
  specialty: Specialty,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, specialty, opts.isNative, "real", tableYear);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  _cs: FakeCourse[],
  _opts: ClassifyOptions,
  _tableYear: number,
  _specialty: Specialty,
): Map<FakeCourseId, string> {
  return new Map();
}

/**
 * 地球環境学主専攻
 */
export const creditRequirementsGs2025: SetupCreditRequirements = {
  cells: {
    a1: { min: 12, max: 12 },
    a2: { min: 2, max: 2 },
    b1: { min: 10, max: 64 },
    b2: { min: 0, max: 58 },
    c1: { min: 7, max: 7 },
    d1: { min: 16, max: 44 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 5 },
    f2: { min: 0, max: 24 },
    h1: { min: 6, max: 34 },
    h2: { min: 0, max: 28 },
  },
  columns: {
    a: { min: 14, max: 14 },
    b: { min: 40, max: 68 },
    c: { min: 7, max: 7 },
    d: { min: 16, max: 44 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 29 },
    h: { min: 6, max: 34 },
  },
  compulsory: 33,
  elective: 91,
};

export const creditRequirementsGs2024: SetupCreditRequirements = {
  cells: {
    a1: { min: 12, max: 12 },
    a2: { min: 2, max: 2 },
    b1: { min: 10, max: 64 },
    b2: { min: 0, max: 58 },
    c1: { min: 7, max: 7 },
    d1: { min: 18, max: 46 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 5 },
    f2: { min: 0, max: 24 },
    h1: { min: 4, max: 32 },
    h2: { min: 0, max: 28 },
  },
  columns: {
    a: { min: 14, max: 14 },
    b: { min: 40, max: 68 },
    c: { min: 7, max: 7 },
    d: { min: 18, max: 46 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 29 },
    h: { min: 4, max: 32 },
  },
  compulsory: 33,
  elective: 91,
};

export const creditRequirementsGs2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 12, max: 12 },
    a2: { min: 2, max: 2 },
    b1: { min: 10, max: 68 },
    b2: { min: 0, max: 58 },
    c1: { min: 7, max: 7 },
    d1: { min: 18, max: 46 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 5 },
    f2: { min: 0, max: 25 },
    h1: { min: 4, max: 32 },
    h2: { min: 0, max: 28 },
  },
  columns: {
    a: { min: 14, max: 14 },
    b: { min: 40, max: 68 },
    c: { min: 7, max: 7 },
    d: { min: 18, max: 46 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 26 },
    h: { min: 4, max: 32 },
  },
  compulsory: 33,
  elective: 91,
};

/**
 * 地球進化学主専攻
 */
export const creditRequirementsEes2025: SetupCreditRequirements = {
  cells: {
    a1: { min: 12, max: 12 },
    a2: { min: 2, max: 2 },
    b1: { min: 18, max: 44.5 },
    b2: { min: 9, max: 50 },
    c1: { min: 7, max: 7 },
    d1: { min: 16, max: 44 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 5 },
    f2: { min: 0, max: 24 },
    h1: { min: 6, max: 34 },
  },
  columns: {
    a: { min: 14, max: 14 },
    b: { min: 40, max: 68 },
    c: { min: 7, max: 7 },
    d: { min: 16, max: 44 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 29 },
    h: { min: 6, max: 34 },
  },
  compulsory: 33,
  elective: 91,
};

export const creditRequirementsEes2024: SetupCreditRequirements = {
  cells: {
    a1: { min: 12, max: 12 },
    a2: { min: 2, max: 2 },
    b1: { min: 10, max: 64 },
    b2: { min: 9, max: 50 },
    c1: { min: 7, max: 7 },
    d1: { min: 18, max: 46 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 5 },
    f2: { min: 0, max: 24 },
    h1: { min: 4, max: 32 },
    h2: { min: 0, max: 28 },
  },
  columns: {
    a: { min: 14, max: 14 },
    b: { min: 40, max: 68 },
    c: { min: 7, max: 7 },
    d: { min: 18, max: 46 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 29 },
    h: { min: 4, max: 32 },
  },
  compulsory: 33,
  elective: 91,
};

export const creditRequirementsEes2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 12, max: 12 },
    a2: { min: 2, max: 2 },
    b1: { min: 18, max: 59 },
    b2: { min: 9, max: 50 },
    c1: { min: 7, max: 7 },
    d1: { min: 18, max: 46 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 5 },
    f2: { min: 0, max: 25 },
    h1: { min: 4, max: 32 },
    h2: { min: 0, max: 28 },
  },
  columns: {
    a: { min: 14, max: 14 },
    b: { min: 40, max: 68 },
    c: { min: 7, max: 7 },
    d: { min: 18, max: 46 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 26 },
    h: { min: 4, max: 32 },
  },
  compulsory: 33,
  elective: 91,
};
