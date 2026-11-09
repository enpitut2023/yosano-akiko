import {
  type CourseId,
  type FakeCourse,
  type CellId,
  type FakeCourseId,
  type KnownCourse,
  type RealCourse,
} from "#lib/akiko.ts";
import type {
  ClassifyOptions,
  SetupCreditRequirements,
} from "#lib/app-setup.ts";
import type { Major } from "#lib/constants.ts";
import {
  isArt,
  isCompulsoryEnglishByName,
  isCompulsoryPe1,
  isCompulsoryPe2,
  isCompulsoryPe3,
  isDataScience,
  isElectivePe,
  isFirstYearSeminar,
  isForeignLanguage,
  isGakushikiban,
  isHakubutsukan,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
  isJapanese,
  isJiyuukamoku,
  isKyoushoku,
  isKyoutsuu,
  type Mode,
  UNLISTED,
  unlisted,
} from "#lib/requirements/common.ts";
import { unreachable } from "#lib/util.ts";

type Specialty =
  // Applied Physics
  | "ap"
  //  Electronics and Quantum Engineering
  | "eqe"
  // Material Science and Engineering
  | "mse"
  // Material and Molecular Engineering
  | "mme";

function majorToSpecialtyOrFail(m: Major): Specialty {
  if (m === "coens-ap") return "ap";
  if (m === "coens-eqe") return "eqe";
  if (m === "coens-mse") return "mse";
  if (m === "coens-mme") return "mme";
  throw new Error(`Bad major: ${m}`);
}

function isA1(id: string): boolean {
  return (
    id === "FF19401" // 基礎実験学
  );
}

function isA2(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "ap":
      return (
        id === "FF20113" || // 応用物理専攻実験A 1班対象
        id === "FF20123" || // 応用物理専攻実験A 2班対象
        id === "FF20133" || // 応用物理専攻実験B 1班対象
        id === "FF20143" // 応用物理専攻実験B 2班対象
      );
    case "eqe":
      return (
        id === "FF30113" || // 電子・量子工学専攻実験A 1班対象
        id === "FF30123" || // 電子・量子工学専攻実験A 2班対象
        id === "FF30133" || // 電子・量子工学専攻実験B 1班対象
        id === "FF30143" // 電子・量子工学専攻実験B 2班対象
      );
    case "mse":
      return (
        id === "FF40113" || // 物性工学専攻実験A 1班対象
        id === "FF40123" || // 物性工学専攻実験A 2班対象
        id === "FF40133" || // 物性工学専攻実験B 1班対象
        id === "FF40143" // 物性工学専攻実験B 2班対象
      );
    case "mme":
      return (
        id === "FF50113" || // 物性・分子工学専攻実験A 1班対象
        id === "FF50123" || // 物性・分子工学専攻実験A 2班対象
        id === "FF50133" || // 物性・分子工学専攻実験B 1班対象
        id === "FF50143" // 物性・分子工学専攻実験B 2班対象
      );
    default:
      unreachable(specialty);
  }
}

function isA3(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "ap":
      return (
        id === "FF29928" || // 卒業研究A 春学期 応用物理主専攻
        id === "FF29938" || // 卒業研究A 秋学期 応用物理主専攻
        id === "FF29948" || // 卒業研究B 春学期 応用物理主専攻
        id === "FF29958" // 卒業研究B 秋学期 応用物理主専攻
      );
    case "eqe":
      return (
        id === "FF39928" || // 卒業研究A 春学期 電子・量子工学主専攻
        id === "FF39938" || // 卒業研究A 秋学期 電子・量子工学主専攻
        id === "FF39948" || // 卒業研究B 春学期 電子・量子工学主専攻
        id === "FF39958" // 卒業研究B 秋学期 電子・量子工学主専攻
      );
    case "mse":
      return (
        id === "FF49928" || // 卒業研究A 春学期 物性工学主専攻
        id === "FF49938" || // 卒業研究A 秋学期 物性工学主専攻
        id === "FF49948" || // 卒業研究B 春学期 物性工学主専攻
        id === "FF49958" // 卒業研究B 秋学期 物性工学主専攻
      );
    case "mme":
      return (
        id === "FF59928" || // 卒業研究A 春学期 物性・分子工学主専攻
        id === "FF59938" || // 卒業研究A 秋学期 物性・分子工学主専攻
        id === "FF59948" || // 卒業研究B 春学期 物性・分子工学主専攻
        id === "FF59958" // 卒業研究B 秋学期 物性・分子工学主専攻
      );
    default:
      unreachable(specialty);
  }
}

function isB1(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "ap":
      return id.startsWith("FF25");
    case "eqe":
      return id.startsWith("FF35");
    case "mse":
      return id.startsWith("FF45");
    case "mme":
      return id.startsWith("FF55");
    default:
      unreachable(specialty);
  }
}

function isB2(id: string, specialty: Specialty): boolean {
  if (id.startsWith("FF16")) return true;
  switch (specialty) {
    case "ap":
      return id.startsWith("FF26");
    case "eqe":
      return id.startsWith("FF36");
    case "mse":
      return id.startsWith("FF46");
    case "mme":
      return id.startsWith("FF56");
    default:
      unreachable(specialty);
  }
}

function isB3(id: string, specialty: Specialty): boolean {
  if (
    id === "FF13103" || // インターンシップI
    id === "FF13203" || // インターンシップII
    id === "FF14003" || // 応用理工学特別実習I
    id === "FF14103" || // 応用理工学特別実習II
    id === "FF22001" || // 応用物理特論
    id === "FF32201" || // 電子・量子工学特論
    id === "FF42001" || // 物性工学特論
    id === "FF52101" || // 物質・分子工学特論
    id.startsWith("FA00")
  ) {
    return true;
  }
  switch (specialty) {
    case "ap":
      //応用理工学類の専門科目のうち、応用物理主専攻で開設していない科目
      return id.startsWith("FF") && !id.startsWith("FF2");
    case "eqe":
      //応用理工学類の専門科目のうち、電子・量子主専攻で開設していない科目
      return id.startsWith("FF") && !id.startsWith("FF3");
    case "mse":
      //応用理工学類の専門科目のうち、物性工学主専攻で開設していない科目
      return id.startsWith("FF") && !id.startsWith("FF4");
    case "mme":
      //応用理工学類の専門科目のうち、物質・分子工学主専攻で開設していない科目
      return id.startsWith("FF") && !id.startsWith("FF5");
    default:
      unreachable(specialty);
  }
}

function isC1(id: string, tableYear: number): boolean {
  if (id === "FF17011") return true; // 応用理工学概論
  if (tableYear >= 2024) return false;
  return id === "FF18764" || isD2(id); // FF18764: 微積分1 (2023年度のみ救済として開講)
}

function isC1Unlisted(
  id: string,
  name: string,
  tableYear: number,
  fromSougou: boolean,
): boolean {
  if (tableYear >= 2024) return false;
  return isD2Unlisted(name) || (fromSougou && isNote6(id));
}

function isC2(id: string): boolean {
  return (
    id === "FF18804" || // 熱力学 1・2クラス
    id === "FF18814" || // 熱力学 3・4クラス
    id === "FF18664" || // 解析学A 1・2クラス
    id === "FF18674" || // 解析学A 3・4クラス
    id === "FF18684" || // 解析学B 1・2クラス
    id === "FF18694" || // 解析学B 3・4クラス
    id === "FF18704" || // 解析学C 1・2クラス
    id === "FF18714" || // 解析学C 3・4クラス
    id === "FF18724" || // 線形代数A 1・2クラス !!A!!
    id === "FF18734" || // 線形代数A 3・4クラス !!A!!
    id === "FF18744" || // 線形代数B 1・2クラス !!A!!
    id === "FF18754" || // 線形代数B 3・4クラス !!A!!
    id === "FF18784" || // 力学A 1・2クラス
    id === "FF18794" || // 力学A 3・4クラス
    id === "FF18604" || // 電磁気学A 1・2クラス
    id === "FF18614" || // 電磁気学A 3・4クラス
    id === "FF18624" || // 電磁気学B 1・2クラス
    id === "FF18634" || // 電磁気学B 3・4クラス
    id === "FF18644" || // 電磁気学C 1・2クラス
    id === "FF18654" || // 電磁気学C 3・4クラス
    id === "FF18761" || // 化学A
    id === "FF18771" || // 化学B
    id === "FF19303" || // 応用理工物理学実験 2班対象
    id === "FF19313" || // 応用理工物理学実験 1班対象
    id === "FF19203" || // 応用理工化学実験 1班対象
    id === "FF19213" // 応用理工化学実験 2班対象
  );
}

// 2026.3.26 成績は名前で見る
function isC2Unlisted(name: string): boolean {
  return name === "線形代数A" || name === "線形代数B";
}

function isC3(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "ap":
      return (
        id === "FF20051" || // 専門英語1
        id === "FF20061" || // 専門英語2
        id === "FF20071" // 専門英語3
      );
    case "eqe":
      return (
        id === "FF30051" || // 専門英語1
        id === "FF30061" || // 専門英語2
        id === "FF30071" // 専門英語3
      );
    case "mse":
      return (
        id === "FF40051" || // 専門英語1
        id === "FF40061" || // 専門英語2
        id === "FF40071" // 専門英語3
      );
    case "mme":
      return (
        id === "FF50051" || // 専門英語1
        id === "FF50061" || // 専門英語2
        id === "FF50071" // 専門英語3
      );
    default:
      unreachable(specialty);
  }
}

function isD1(id: string): boolean {
  return id.startsWith("FF15");
}

// TODO: 注6をこう解釈しているが、応用理工学類の確認待ち。
// - 微分積分A(2単位)は微積分1,2(各1単位)の2単位として数えている
// - 微分積分Aと微積分1,2の両方を取っていれば両方数えている。両方は単位にならない
//   なら、微積分1,2を取っている学生の微分積分Aは数えないようにする(線形代数Aと
//   線形代数1,2も同じ)
// - 移行前に修得したかは成績からはわからないので確認していない
// - 移行生でない学生は情報学群の線形代数Aもc2の線形代数Aとして名前で数えている
//   (isC2Unlisted)。違えばisC2Unlistedから外す
/**
 * 注6: 移行生に限り、情報学群開設の微分積分Aを微積分1,2へ、線形代数Aを線形代数1,2へ
 * 読み替えられる。読み替え先はd2(2023年度はc1)
 */
function isNote6(id: string): boolean {
  return (
    id === "GA15311" || // 微分積分A 情報科学類1・2クラス
    id === "GA15321" || // 微分積分A 情報科学類3・4クラス
    id === "GA15331" || // 微分積分A 情報メディア創成学類
    id === "GA15341" || // 微分積分A 知識情報・図書館学類
    id === "GA15211" || // 線形代数A 情報科学類1・2クラス
    id === "GA15221" || // 線形代数A 情報科学類3・4クラス
    id === "GA15231" || // 線形代数A 情報メディア創成学類
    id === "GA15241" // 線形代数A 知識情報・図書館学類
  );
}

// 2024年度以降のd2。2023年度はc1に含む
function isD2(id: string): boolean {
  return (
    id === "FA01111" || // 数学リテラシー1 学籍番号奇数 !!A!!
    id === "FA01121" || // 数学リテラシー1 学籍番号偶数 !!A!!
    id === "FA01211" || // 数学リテラシー2 学籍番号奇数 !!A!!
    id === "FA01221" || // 数学リテラシー2 学籍番号偶数 !!A!!
    id === "FA01311" || // 微積分1 学籍番号奇数 !!A!!
    id === "FA01321" || // 微積分1 学籍番号偶数 !!A!!
    id === "FA01411" || // 微積分2 学籍番号奇数 !!A!!
    id === "FA01421" || // 微積分2 学籍番号偶数 !!A!!
    id === "FA01511" || // 微積分3 学籍番号奇数 !!A!!
    id === "FA01521" || // 微積分3 学籍番号偶数 !!A!!
    id === "FA01611" || // 線形代数1 学籍番号奇数 !!A!!
    id === "FA01621" || // 線形代数1 学籍番号偶数 !!A!!
    id === "FA01711" || // 線形代数2 学籍番号奇数 !!A!!
    id === "FA01721" || // 線形代数2 学籍番号偶数 !!A!!
    id === "FA01811" || // 線形代数3 学籍番号奇数 !!A!!
    id === "FA01821" || // 線形代数3 学籍番号偶数 !!A!!
    id === "FCB1201" || // 力学1 !!A!!
    id === "FCB1241" || // 力学2 !!A!!
    id === "FCB1291" || // 力学3 !!A!!
    id === "FCB1321" || // 電磁気学1 !!A!!
    id === "FCB1361" || // 電磁気学2 !!A!!
    id === "FCB1381" || // 電磁気学3 !!A!!
    id === "FE11171" || // 化学1 !!A!!
    id === "FE11181" || // 化学2 !!A!!
    id === "FE11191" // 化学3 !!A!!
  );
}

// 2026.3.26 成績は名前で見る
function isD2Unlisted(name: string): boolean {
  return (
    name === "数学リテラシー1" ||
    name === "数学リテラシー2" ||
    name === "微積分1" ||
    name === "微積分2" ||
    name === "微積分3" ||
    name === "線形代数1" ||
    name === "線形代数2" ||
    name === "線形代数3" ||
    name === "力学1" ||
    name === "力学2" ||
    name === "力学3" ||
    name === "電磁気学1" ||
    name === "電磁気学2" ||
    name === "電磁気学3" ||
    name === "化学1" ||
    name === "化学2" ||
    name === "化学3"
  );
}

function isE1(id: string): boolean {
  return (
    id === "1115102" || // ファーストイヤーセミナー 1クラス
    id === "1115202" || // ファーストイヤーセミナー 2クラス
    id === "1115302" || // ファーストイヤーセミナー 3クラス
    id === "1227431" || // 学問への誘い 1クラス
    id === "1227441" || // 学問への誘い 2クラス
    id === "1227451" // 学問への誘い 3クラス
  );
}

function isE1Unlisted(id: string): boolean {
  return isFirstYearSeminar(id) || isIzanai(id);
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id) || isCompulsoryPe3(id);
}

function isE3(name: string): boolean {
  return isCompulsoryEnglishByName(name);
}

function isE4(id: string): boolean {
  return (
    id === "6115101" || // 情報リテラシー(講義)
    id === "6415102" || // 情報リテラシー(演習) 1班
    id === "6415202" || // 情報リテラシー(演習) 2班
    id === "6515102" || // データサイエンス 1班
    id === "6515202" // データサイエンス 2班
  );
}

function isE4Unlisted(id: string): boolean {
  return (
    isInfoLiteracyLecture(id) || isInfoLiteracyExercise(id) || isDataScience(id)
  );
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isF2(id: string): boolean {
  // TODO: 英語(選択・自由科目)、外国語(英語以外)の定義
  return isForeignLanguage(id) || isJapanese(id) || isArt(id);
}

function isF3(id: string): boolean {
  // TODO: 必修のあふれたやつも入れる
  return isElectivePe(id);
}

function isH1(id: string): boolean {
  return !isKyoutsuu(id) && !id.startsWith("FA") && !id.startsWith("FF");
}

function isH2(id: string): boolean {
  return isKyoushoku(id) || isHakubutsukan(id) || isJiyuukamoku(id);
}

const COMPULSORY_NAMES = new Set([
  "基礎実験学",
  "応用物理専攻実験A",
  "応用物理専攻実験B",
  "電子・量子工学専攻実験A",
  "電子・量子工学専攻実験B",
  "物性工学専攻実験A",
  "物性工学専攻実験B",
  "物性・分子工学専攻実験A",
  "物性・分子工学専攻実験B",
  "卒業研究A",
  "卒業研究B",
  "応用理工学概論",
  "熱力学",
  "解析学A",
  "解析学B",
  "解析学C",
  "線形代数A",
  "線形代数B",
  "力学A",
  "電磁気学A",
  "電磁気学B",
  "電磁気学C",
  "化学A",
  "化学B",
  "応用理工化学実験",
  "応用理工物理学実験",
  "専門英語1",
  "専門英語2",
  "専門英語3",
  "ファーストイヤーセミナー",
  "学問への誘い",
  "情報リテラシー(講義)",
  "情報リテラシー(演習)",
  "データサイエンス",
]);

function classify(
  id: CourseId,
  name: string,
  tableYear: number,
  specialty: Specialty,
  fromSougou: boolean,
  mode: Mode,
): string | typeof UNLISTED | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isA2(id, specialty)) return "a2";
  if (isA3(id, specialty)) return "a3";
  if (isC1(id, tableYear)) return "c1";
  if (isC1Unlisted(id, name, tableYear, fromSougou))
    return unlisted("c1", mode);
  // 注6の線形代数Aは名前でisC2UnlistedやCOMPULSORY_NAMESにも当たるので、d2でも
  // それより先に見る
  if (tableYear >= 2024 && fromSougou && isNote6(id)) {
    return unlisted("d2", mode);
  }
  if (isC2(id)) return "c2";
  if (isC2Unlisted(name)) return unlisted("c2", mode);
  if (isC3(id, specialty)) return "c3";
  if (isE1(id)) return "e1";
  if (isE1Unlisted(id)) return unlisted("e1", mode);
  if (isE2(id)) return "e2";
  if (isE3(name)) return "e3";
  if (isE4(id)) return "e4";
  if (isE4Unlisted(id)) return unlisted("e4", mode);
  if (COMPULSORY_NAMES.has(name)) return undefined;

  // 選択
  if (isD1(id)) return "d1";
  if (tableYear >= 2024) {
    if (isD2(id)) return "d2";
    if (isD2Unlisted(name)) return unlisted("d2", mode);
  }
  if (isB1(id, specialty)) return "b1";
  if (isB2(id, specialty)) return "b2";
  if (isB3(id, specialty)) return "b3";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isF3(id)) return "f3";
  if (isH2(id)) return "h2";
  if (isH1(id)) return "h1"; // 「...以外」なので最後
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
): Map<CourseId, string> {
  const specialty = majorToSpecialtyOrFail(opts.major);
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(
      c.id,
      c.name,
      opts.tableYear,
      specialty,
      opts.fromSougou,
      "known",
    );
    if (cellId !== undefined && cellId !== UNLISTED) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  opts: ClassifyOptions,
): Map<CourseId, string> {
  const specialty = majorToSpecialtyOrFail(opts.major);
  cs = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(
      c.id,
      c.name,
      opts.tableYear,
      specialty,
      opts.fromSougou,
      "real",
    );
    if (cellId !== undefined && cellId !== UNLISTED) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  cs: FakeCourse[],
  opts: ClassifyOptions,
): Map<FakeCourseId, string> {
  majorToSpecialtyOrFail(opts.major);
  const fakeCourseIdToCellId = new Map<FakeCourseId, string>();
  for (const c of cs) {
    if (isE3(c.name)) {
      fakeCourseIdToCellId.set(c.id, "e3");
    }
  }
  return fakeCourseIdToCellId;
}

export function getRemark(
  id: CellId,
  tableYear: number,
  _major: Major,
): string | undefined {
  if (id === "a2" || id === "a3") {
    // !!F!!
    return `カッコの条件には対応していません。`;
  }
  if (
    (tableYear <= 2023 && id === "c1") ||
    (tableYear >= 2024 && id === "d2")
  ) {
    return `注6(表下部参照)の情報学群開設の「微分積分A」「線形代数A」の読み替えは、移行前に修得したかどうかを確認せずに数えています。`;
  } else if (id === "e3" || id === "f2") {
    // !!E!!
    return `注3(表下部参照)には対応していません。`;
  } else if (id === "h1") {
    // !!C!!
    return `専門基礎科目などで指定された科目と同様の内容の講義の場合、ここに表示されていてもここではないマスの単位としてカウントされる場合があるので注意してください。`;
  }
}

const reqSince2024: SetupCreditRequirements = {
  cells: {
    a1: { min: 1, max: 1 },
    a2: { min: 4, max: 4 },
    a3: { min: 8, max: 8 },
    b1: { min: 12, max: 16 },
    b2: { min: 23, max: 27 },
    b3: { min: 0, max: 4 },
    c1: { min: 1, max: 1 },
    c2: { min: 19, max: 19 },
    c3: { min: 3, max: 3 },
    d1: { min: 6, max: 9 },
    d2: { min: 15, max: 17 },
    e1: { min: 2, max: 2 },
    e2: { min: 3, max: 3 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 1 },
    f2: { min: 0, max: 4 },
    f3: { min: 0, max: 1 },
    h1: { min: 12, max: 16 },
    h2: { min: 0, max: 4 },
  },
  columns: {
    a: { min: 13, max: 13 },
    b: { min: 35, max: 39 },
    c: { min: 23, max: 23 },
    d: { min: 21, max: 26 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 5 },
    h: { min: 12, max: 16 },
  },
  compulsory: 49,
  elective: 75,
};

const reqSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 1, max: 1 },
    a2: { min: 4, max: 4 },
    a3: { min: 8, max: 8 },
    b1: { min: 12, max: 16 },
    b2: { min: 23, max: 27 },
    b3: { min: 0, max: 4 },
    c1: { min: 18, max: 18 },
    c2: { min: 19, max: 19 },
    c3: { min: 3, max: 3 },
    d1: { min: 6, max: 9 },
    e1: { min: 2, max: 2 },
    e2: { min: 3, max: 3 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 1 },
    f2: { min: 0, max: 4 },
    f3: { min: 0, max: 1 },
    h1: { min: 12, max: 16 },
    h2: { min: 0, max: 4 },
  },
  columns: {
    a: { min: 13, max: 13 },
    b: { min: 35, max: 39 },
    c: { min: 40, max: 40 },
    d: { min: 6, max: 9 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 5 },
    h: { min: 12, max: 16 },
  },
  compulsory: 66,
  elective: 58,
};

export function getCreditRequirements(
  tableYear: number,
  _major: Major,
): SetupCreditRequirements {
  if (tableYear >= 2024) return reqSince2024;
  if (tableYear >= 2023) return reqSince2023;
  throw new Error(`Bad table year: ${tableYear}`);
}
