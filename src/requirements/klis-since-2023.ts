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
  isArt,
  isCompulsoryEnglishByName,
  isCompulsoryPe1,
  isCompulsoryPe2,
  isElectivePe,
  isForeignLanguage,
  isJapanese,
  isKyoutsuu,
  isKyoushoku,
} from "@/requirements/common";
import { unreachable } from "@/util";

export type Specialty = "science" | "system" | "rm";

function isA1(id: string): boolean {
  // 卒業研究A
  return (
    id === "GE51118" || // 春開始
    id === "GE51128" // 秋開始
  );
}

function isA2(id: string): boolean {
  // 卒業研究B
  return (
    id === "GE51218" || // 秋開始
    id === "GE51228" // 春開始
  );
}

function isA3(id: string, specialty: Specialty): boolean {
  // 20232024は主専攻による分類が異なるので要調査
  switch (specialty) {
    case "science":
      return id === "GE50712"; //専門英語B-1 知識科学主専攻生 知識情報システム主専攻の一部
    case "system":
      return id === "GE50712" || id === "GE50732";
    case "rm":
      return id === "GE50732"; // 専門英語B-3　情報資源経営主専攻　知識情報システム主専攻の一部
  }
}

function isA4(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "science":
      return id === "GE50812"; // 専門英語C-1　知識科学主専攻
    case "system":
      return id === "GE50822"; // 専門英語C-2 知識情報システム主専攻
    case "rm":
      return id === "GE50832"; //専門英語C-3 情報資源主専攻
  }
}

function isA5(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "science":
      return id === "GE60113"; // 知識科学実習A
    case "system":
      return id === "GE70113"; // 知識情報システム実習A
    case "rm":
      return id === "GE80113"; // 情報資源経営実習A
  }
}

function isA6(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "science":
      return id === "GE60123"; // 知識科学実習B
    case "system":
      return id === "GE70123"; // 知識情報システム実習B
    case "rm":
      return id === "GE80123"; //情報資源経営実習B
  }
}

const [sharedGe6CourseIds, sharedGe7CourseIds, sharedGe8CourseIds] = (() => {
  const ge6 = new Set<string>();
  const ge7 = new Set<string>();
  const ge8 = new Set<string>();

  for (const ids of [
    ["GE61801", "GE71801"], // データ構造とアルゴリズム
    ["GE61901", "GE70501"], // 情報検索システム
    ["GE62401", "GE72701"], // Machine Learning and Information Retrieval
    ["GE62501", "GE73101"], // Human Information Interaction
    ["GE72101", "GE80401"], // 経営情報システム論
  ]) {
    if (ids.some((i) => i.startsWith("GE6"))) {
      for (const id of ids) ge6.add(id);
    }
    if (ids.some((i) => i.startsWith("GE7"))) {
      for (const id of ids) ge7.add(id);
    }
    if (ids.some((i) => i.startsWith("GE8"))) {
      for (const id of ids) ge8.add(id);
    }
  }

  return [ge6, ge7, ge8];
})();

function classifyColumnB(
  id: string,
  speciality: Specialty,
): string | undefined {
  // 知識科学専攻のb2にある「GE6と共通開設の科目を除く」は、上記のデータ構造と
  // アルゴリズムのように科目番号をコードシェアする科目を除く意図で書かれている。
  // 知識科学専攻はGE6から始まる科目番号が優先的にb1に該当し、知識情報システム
  // はGE7、情報資源経営はGE8が優先される。

  let b1Prefix: string;
  let b2Pattern: RegExp;
  let avoidInB2: Set<string>;
  switch (speciality) {
    case "science":
      b1Prefix = "GE6";
      b2Pattern = /^(GA4|GE4|GE7|GE8)/;
      avoidInB2 = sharedGe6CourseIds;
      break;
    case "system":
      b1Prefix = "GE7";
      b2Pattern = /^(GA4|GE4|GE6|GE8)/;
      avoidInB2 = sharedGe7CourseIds;
      break;
    case "rm":
      b1Prefix = "GE8";
      b2Pattern = /^(GA4|GE4|GE6|GE7)/;
      avoidInB2 = sharedGe8CourseIds;
      break;
    default:
      unreachable(speciality);
  }

  if (id.startsWith(b1Prefix)) return "b1";
  if (b2Pattern.test(id) && !avoidInB2.has(id)) return "b2";
}

function isC1(id: string): boolean {
  return id === "GA14121" || id === "GA14111"; //知識情報概論
}

function isC2(id: string): boolean {
  //アカデミックスキルズ
  return (
    id === "GE12112" || // 1年1クラスと2年
    id === "GE12122" || // 1年2クラス
    id === "GE12132" || // 2年3クラス
    id === "GE12142" // 2年4クラス
  );
}

function isC3(id: string): boolean {
  // プログラミング入門A
  return (
    id === "GA18232" || // 知識学類開設
    id === "GA18212" // 情報科学類開設
  );
}

function isC4(id: string): boolean {
  // プログラミング入門B
  return (
    id === "GA18332" || // 知識学類開設
    id === "GA18312" // 情報科学類開設
  );
}

function isC5(id: string): boolean {
  return id === "GA15141"; // 情報数学A !!A!!
  // id === "GA15111" || //情報数学A coins
  // id === "GA15121"; // 情報数学A coins
}

function isC6(id: string): boolean {
  return id === "GE10911"; //統計
}

function isC7(id: string): boolean {
  return id === "GE10201"; // 哲学
}

function isC8(id: string): boolean {
  return id === "GE11612" || id === "GE11632" || id === "GE11642"; // 専門英語A1 分類は不明
}

function isC9(id: string): boolean {
  return id === "GE11712" || id === "GE11732" || id === "GE11742"; //専門英語A2 分類は不明
}

function isC10(id: string): boolean {
  // 知能情報演習I
  return (
    id === "GE11012" || // 1, 3クラス
    id === "GE11022" //2, 4クラス
  );
}

function isC11(id: string): boolean {
  // 知能情報演習II
  return (
    id === "GE11112" || // 1, 3クラス
    id === "GE11122" // 2, 4クラス
  );
}

function isC12(id: string): boolean {
  // 知能情報演習III
  return (
    id === "GE11212" || // 1, 3クラス
    id === "GE11222" // 2, 4クラス
  );
}

function isD1(id: string): boolean {
  // TODO: こういうのは名前ではじくべき？
  return (
    id !== "GA14111" && // 知識情報概論
    id !== "GA14121" &&
    id !== "GA18212" && // プログラミング入門A
    id !== "GA18222" &&
    id !== "GA18232" &&
    id !== "GA18312" && // プログラミング入門B
    id !== "GA18322" &&
    id !== "GA18332" &&
    id !== "GA15111" && // 情報数学A
    id !== "GA15121" &&
    id !== "GA15131" &&
    id !== "GA15141" &&
    (id.startsWith("GA1") || id.startsWith("GE2") || id.startsWith("GE3"))
  );
}

function isE1(id: string): boolean {
  return (
    // ファーストイヤーセミナー
    id === "1120102" || // 1クラス
    id === "1120202" || // 2クラス
    // 学問への誘い
    id === "1227631" || // 1クラス
    id === "1227641" // 2クラス
  );
}

function isE2(id: string): boolean {
  return (
    // データサイエンス
    id === "6526102" ||
    //情報リテラシー(演習)
    id === "6426102" || // 2025 統一　2024以前 1班
    id === "6426202" || // 2024以前 2班
    // 情報リテラシー(講義)
    id === "6126101" // 2クラス
  );
}

function isE3(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id); // 必修 体育
}

function isE4(name: string): boolean {
  return isCompulsoryEnglishByName(name); // 必修　外国語(英語)
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isF2(id: string): boolean {
  // TODO: 体育3,4必修をどうする？
  return (
    isElectivePe(id) || isForeignLanguage(id) || isJapanese(id) || isArt(id)
  );
}

function isH1(id: string): boolean {
  return !(
    id.startsWith("GA") ||
    id.startsWith("GB") ||
    id.startsWith("GC") ||
    id.startsWith("GE") ||
    isKyoutsuu(id) ||
    isKyoushoku(id)
  );
}

function isH2(id: string): boolean {
  return id.startsWith("GC") || id.startsWith("GB");
}

function classify(
  id: CourseId,
  name: string,
  _year: number,
  specialty: Specialty,
  _isNative: boolean,
): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isA2(id)) return "a2";
  if (isA3(id, specialty)) return "a3";
  if (isA4(id, specialty)) return "a4";
  if (isA5(id, specialty)) return "a5";
  if (isA6(id, specialty)) return "a6";
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
  if (isC12(id)) return "c12";
  if (isE1(id)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(id)) return "e3";
  if (isE4(name)) return "e4";
  // 選択
  const b = classifyColumnB(id, specialty);
  if (b !== undefined) return b;
  if (isD1(id)) return "d1";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isH2(id)) return "h2";
  if (isH1(id)) return "h1"; // 「...以外」なので最後
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  _opts: ClassifyOptions,
  year: number,
  specialty: Specialty,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, year, specialty, true);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  opts: ClassifyOptions,
  year: number,
  specialty: Specialty,
): Map<CourseId, string> {
  cs = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, year, specialty, opts.isNative);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

// TODO:
export function classifyFakeCourses(
  cs: FakeCourse[],
  _opts: ClassifyOptions,
  _year: number,
  _specialty: Specialty,
): Map<FakeCourseId, string> {
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
    a3: { min: 1, max: 1 },
    a4: { min: 1, max: 1 },
    a5: { min: 1, max: 1 },
    a6: { min: 1, max: 1 },
    b1: { min: 16, max: undefined },
    b2: { min: 8, max: undefined },
    c1: { min: 1, max: 1 },
    c2: { min: 1, max: 1 },
    c3: { min: 2, max: 2 },
    c4: { min: 1, max: 1 },
    c5: { min: 2, max: 2 },
    c6: { min: 2, max: 2 },
    c7: { min: 2, max: 2 },
    c8: { min: 1, max: 1 },
    c9: { min: 1, max: 1 },
    c10: { min: 2, max: 2 },
    c11: { min: 2, max: 2 },
    c12: { min: 2, max: 2 },
    d1: { min: 32, max: 52 },
    e1: { min: 2, max: 2 },
    e2: { min: 4, max: 4 },
    e3: { min: 2, max: 2 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: undefined },
    f2: { min: 0, max: undefined },
    h1: { min: 6, max: undefined },
    h2: { min: 0, max: undefined },
  },
  columns: {
    a: { min: 10, max: 10 },
    b: { min: 24, max: 44 },
    c: { min: 19, max: 19 },
    d: { min: 32, max: 52 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 21 },
    h: { min: 6, max: 26 },
  },
  compulsory: 41,
  elective: 83,
};
