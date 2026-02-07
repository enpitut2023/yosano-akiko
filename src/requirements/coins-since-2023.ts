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
  isDataScience,
  isElectivePe,
  isFirstYearSeminar,
  isForeignLanguage,
  isGakushikiban,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
  isJapanese,
  isKyoushoku,
  isKyoutsuu,
} from "@/requirements/common";
import { arrayRemove, assert } from "@/util";

export type Specialty = "scs" | "cs" | "mimt";

const COURSE_ID_TO_GB_COURSE_ID = new Map([
  // コンピュータグラフィックス基礎 → コンピュータグラフィックス基礎
  ["BC12624", "GB13704"],
  // CG基礎 → コンピュータグラフィックス基礎
  ["GC23304", "GB13704"],
  // オートマトンと形式言語 → オートマトンと形式言語
  ["GC50291", "GB20401"],
  // システム数理I → システム数理I
  ["GC53701", "GB22011"],
  // システム数理II → システム数理II
  ["GC53801", "GB22021"],
  // システム数理III → システム数理III
  ["GC54301", "GB22031"],
  // インタラクティブCG → インタラクティブCG
  ["BC12631", "GB22401"],
  // 情報線形代数 → 情報線形代数
  ["GC54601", "GB22501"],
  // 情報可視化 → 情報可視化
  ["GC54091", "GB22621"],
  // コンピュータネットワーク → コンピュータネットワーク
  ["BC12871", "GB30101"],
  // コンピュータネットワーク → コンピュータネットワーク
  ["GC25301", "GB30101"],
  // 人工生命概論 → 人工生命概論
  ["BC12681", "GB32301"],
  // 情報セキュリティ → 情報セキュリティ
  ["BC12651", "GB40111"],
  // ヒューマンインタフェース → ヒューマンインタフェース
  ["BC12671", "GB40301"],
  // ヒューマンインタフェース → ヒューマンインタフェース
  ["GE71101", "GB40301"],
  // 信号処理 → 信号処理
  ["BC12621", "GB40411"],
  // 機械学習 → 機械学習
  ["BC12881", "GB40501"],
  // アドバンストCG → アドバンストCG
  ["GC54904", "GB41104"],
  // 音声聴覚情報処理 → 音声聴覚情報処理
  ["BC12601", "GB41511"],
  // 自然言語処理 → 自然言語処理
  ["GC53901", "GB41611"],
  // 視覚情報科学 → 視覚情報科学
  ["GC53601", "GB41711"],
  // 知能情報メディア実験A → 知能情報メディア実験A
  ["BC12883", "GB46403"],
  // 知能情報メディア実験B → 知能情報メディア実験B
  ["BC12893", "GB46503"],
  // 情報メディア創成特別講義C → 知能情報メディア特別講義A
  ["GC59301", "GB47001"],
]);

function isA1(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "scs":
      return (
        id === "GB26403" || // ソフトウェアサイエンス実験A
        id === "GB26503" // ソフトウェアサイエンス実験B
      );
    case "cs":
      return (
        id === "GB36403" || // 情報システム実験A
        id === "GB36503" // 情報システム実験B
      );
    case "mimt":
      return (
        id === "GB46403" || // 知能情報メディア実験A
        id === "GB46503" // 知能情報メディア実験B
      );
  }
}

function isA2(id: string): boolean {
  return (
    id === "GB19848" || // 特別卒業研究A
    id === "GB19948" || // 卒業研究A
    id === "GB19988" || // 卒業研究A 秋
    id === "GB19858" || // 特別卒業研究B
    id === "GB19958" || // 卒業研究B
    id === "GB19998" // 卒業研究B　春
  );
}

function isA3(id: string): boolean {
  return (
    id === "GB19141" || // 特別専門語学A
    id === "GB19091" || // 専門語学A
    id === "GB19111" || // 専門語学A 秋
    id === "GB19151" || // 特別専門語学B
    id === "GB19101" || // 専門語学B
    id === "GB19121" // 専門語学B 春
  );
}

function isB1(id: string): boolean {
  return (
    id.startsWith("GB20") || id.startsWith("GB30") || id.startsWith("GB40")
  );
}

function isB2(id: string): boolean {
  return (
    id === "GB13312" || //情報特別演習I
    id === "GB13322" || //情報特別演習II
    id === "GB13332" || //情報科学特別演習
    id.startsWith("GB2") ||
    id.startsWith("GB3") ||
    id.startsWith("GB4")
    //   && id[3] !== "0" &&
    //   id[3] !== "6")
  );
}

function isC1(id: string): boolean {
  return (
    id === "GA15211" || //1・2クラス
    id === "GA15221" //3・4クラス
  );
}

function isC2(id: string): boolean {
  return (
    id === "GB10234" || //1・2クラス
    id === "GB10244" //3・4クラス
  );
}

function isC3(id: string): boolean {
  return (
    id === "GA15311" || //1・2クラス
    id === "GA15321" //3・4クラス
  );
}

function isC4(id: string): boolean {
  return (
    id === "GB10444" || //1・2クラス
    id === "GB10454" //3・4クラス
  );
}

function isC5(id: string): boolean {
  return (
    id === "GA15111" || //1・2クラス
    id === "GA15121" //3・4クラス
  );
}

function isC6(id: string): boolean {
  return id === "GB19061";
}

function isC7(id: string, native: boolean): boolean {
  return (
    id === "GA18212" ||
    // 移行生はFHから始まるプロ入Aをcoinsのプロ入Aとして使える
    (!native && (id === "FH60474" || id === "FH60484" || id === "FH60494"))
  );
}

function isC8(id: string, native: boolean): boolean {
  return (
    id === "GA18312" ||
    // 移行生はFHから始まるプロ入Bをcoinsのプロ入Bとして使える
    (!native && (id === "FH60574" || id === "FH60584" || id === "FH60594"))
  );
}

function isC9(id: string): boolean {
  return id === "GB11964";
}

function isC10(id: string): boolean {
  return id === "GB11931";
}

function isC11(id: string): boolean {
  return (
    id === "GB11956" || //1・2クラス
    id === "GB11966" //3・4クラス
  );
}

function isC12(id: string): boolean {
  return id === "GB10804";
}

function isC13(id: string): boolean {
  return id === "GB12017";
}

function isD1(id: string): boolean {
  return (
    id === "GB11601" || //確率論
    id === "GB11621" || //統計学
    id === "GB12301" || //数値計算法
    id === "GB12601" || //論理と形式化
    id === "GB12801" || //論理システム
    id === "GB12812" //論理システム演習
  );
}

function isD2(id: string): boolean {
  return (
    id === "GB13614" || // Computer Science in English A
    id === "GB13624" // Computer Science in English B
  );
}

function isD3(id: string): boolean {
  return (
    id !== "GB13312" && //情報特別演習I
    id !== "GB13322" && //情報特別演習II
    id !== "GB13332" && //情報科学特別演習
    id.startsWith("GB1") &&
    !id.startsWith("GB19") && //他列に含まれない
    //必修を除外
    !(
      id.startsWith("GB102") ||
      id.startsWith("GB104") ||
      id.startsWith("GB108") ||
      id.startsWith("GB119") ||
      id.startsWith("GB122") ||
      id.startsWith("GB120")
    )
  );
}

function isD4(id: string): boolean {
  return (
    id.startsWith("GA1") &&
    //必修を除外
    !(id.startsWith("GA15") || id.startsWith("GA18"))
  );
}

function isE1(id: string, mode: "known" | "real"): boolean {
  return (
    //学問への誘い
    id === "1227571" || //1クラス
    id === "1227581" || //2クラス
    id === "1227591" || //3クラス
    id === "1227601" || //4クラス
    //ファーストイヤーセミナー
    id === "1118102" || //1クラス
    id === "1118202" || //2クラス
    id === "1118302" || //3クラス
    id === "1118402" || //4クラス
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
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
  return isCompulsoryEnglishByName(name);
}

function isE4(id: string): boolean {
  // TODO: knownのcoins用科目分岐
  return (
    isInfoLiteracyLecture(id) || isInfoLiteracyExercise(id) || isDataScience(id)
  );
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isF2(id: string): boolean {
  return (
    // 体育（自由科目）、外国語、国語、芸術
    isElectivePe(id) || isForeignLanguage(id) || isJapanese(id) || isArt(id)
  );
}

function isH1(id: string): boolean {
  return !(
    id.startsWith("E") ||
    id.startsWith("F") ||
    id.startsWith("G") ||
    id.startsWith("H") ||
    isKyoutsuu(id) ||
    isKyoushoku(id)
  );
}

function isH2(id: string): boolean {
  return (
    id.startsWith("E") ||
    id.startsWith("F") ||
    id.startsWith("GC") ||
    id.startsWith("GE") ||
    id.startsWith("H")
  );
}

function classify(
  id: string,
  name: string,
  mode: "known" | "real",
  isNative: boolean,
  specialty: Specialty,
): string | undefined {
  // TODO: コードシェアの実装
  // if (mode === "known") {
  //   // コードシェアの読み替え前は表示しない
  //   if (COURSE_ID_TO_GB_COURSE_ID.has(id)) {
  //     return undefined;
  //   }
  // } else {
  //   id  = COURSE_ID_TO_GB_COURSE_ID.get(id) ?? id;
  // }

  // 必修
  if (isA1(id, specialty)) return "a1";
  if (isA2(id)) return "a2";
  if (isA3(id)) return "a3";
  if (isC1(id)) return "c1";
  if (isC2(id)) return "c2";
  if (isC3(id)) return "c3";
  if (isC4(id)) return "c4";
  if (isC5(id)) return "c5";
  if (isC6(id)) return "c6";
  if (isC7(id, isNative)) return "c7";
  if (isC8(id, isNative)) return "c8";
  if (isC9(id)) return "c9";
  if (isC10(id)) return "c10";
  if (isC11(id)) return "c11";
  if (isC12(id)) return "c12";
  if (isC13(id)) return "c13";
  if (isE1(id, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(name)) return "e3";
  if (isE4(id)) return "e4";

  // 選択
  if (isB1(id)) return "b1";
  if (isB2(id)) return "b2";
  if (isD1(id)) return "d1";
  if (isD2(id)) return "d2";
  if (isD3(id)) return "d3";
  if (isD4(id)) return "d4";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isH1(id)) return "h1";
  if (isH2(id)) return "h2";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  _opts: ClassifyOptions,
  specialty: Specialty,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, "known", true, specialty);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

const FA_LINEAR_ALGEBRA_1 = new Set([
  "FA01611",
  "FA01621",
  "FA01631",
  "FA01641",
  "FA01651",
  "FA01661",
  "FA01671",
  "FA01681",
  "FA01691",
  "FA016A1",
  "FA016C1",
  "FA016D1",
]);

const FA_LINEAR_ALGEBRA_2 = new Set([
  "FA01711",
  "FA01721",
  "FA01731",
  "FA01741",
  "FA01751",
  "FA01761",
  "FA01771",
  "FA01781",
  "FA01791",
  "FA017A1",
  "FA017C1",
  "FA017D1",
]);

// 移行生はFAから始まる線形代数1と2を両方取っているとcoinsの線形代数Aとして使える
function handleFaLinearAlgebra(
  cs: RealCourse[],
  map: Map<CourseId, string>,
): void {
  const c1 = cs.find((c) => FA_LINEAR_ALGEBRA_1.has(c.id));
  const c2 = cs.find((c) => FA_LINEAR_ALGEBRA_2.has(c.id));
  if (c1 === undefined || c2 === undefined) {
    return;
  }
  map.set(c1.id, "c1");
  map.set(c2.id, "c1");
  assert(arrayRemove(cs, c1));
  assert(arrayRemove(cs, c2));
}

const FA_CALCULUS_1 = new Set([
  "FA01311",
  "FA01321",
  "FA01331",
  "FA01341",
  "FA01351",
  "FA01361",
  "FA01371",
  "FA01381",
  "FA01391",
  "FA013A1",
  "FA013C1",
  "FA013D1",
]);

const FA_CALCULUS_2 = new Set([
  "FA01411",
  "FA01421",
  "FA01431",
  "FA01441",
  "FA01451",
  "FA01461",
  "FA01471",
  "FA01481",
  "FA01491",
  "FA014A1",
  "FA014C1",
  "FA014D1",
]);

// 移行生はFAから始まる微積分1と2を両方取っているとcoinsの微分積分Aとして使える
function handleFaCalculus(cs: RealCourse[], map: Map<CourseId, string>): void {
  const c1 = cs.find((c) => FA_CALCULUS_1.has(c.id));
  const c2 = cs.find((c) => FA_CALCULUS_2.has(c.id));
  if (c1 === undefined || c2 === undefined) {
    return;
  }
  map.set(c1.id, "c3");
  map.set(c2.id, "c3");
  assert(arrayRemove(cs, c1));
  assert(arrayRemove(cs, c2));
}

export function classifyRealCourses(
  cs: RealCourse[],
  opts: ClassifyOptions,
  specialty: Specialty,
): Map<CourseId, string> {
  cs = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();

  if (!opts.isNative) {
    handleFaLinearAlgebra(cs, courseIdToCellId);
    handleFaCalculus(cs, courseIdToCellId);
  }

  for (const c of cs) {
    const cellId = classify(c.id, c.name, "real", opts.isNative, specialty);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  cs: FakeCourse[],
  _opts: ClassifyOptions,
  _specialty: Specialty,
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
    a1: { min: 6, max: 6 },
    a2: { min: 6, max: 6 },
    a3: { min: 4, max: 4 },
    b1: { min: 16, max: undefined },
    b2: { min: 0, max: 18 },
    c1: { min: 2, max: 2 },
    c2: { min: 2, max: 2 },
    c3: { min: 2, max: 2 },
    c4: { min: 2, max: 2 },
    c5: { min: 2, max: 2 },
    c6: { min: 1, max: 1 },
    c7: { min: 2, max: 2 },
    c8: { min: 1, max: 1 },
    c9: { min: 3, max: 3 },
    c10: { min: 3, max: 3 },
    c11: { min: 2, max: 2 },
    c12: { min: 2, max: 2 },
    c13: { min: 2, max: 2 },
    d1: { min: 8, max: undefined },
    d2: { min: 2, max: undefined },
    d3: { min: 4, max: undefined },
    d4: { min: 8, max: undefined },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: undefined },
    f2: { min: 0, max: 4 },
    h1: { min: 6, max: undefined },
    h2: { min: 0, max: 4 },
  },
  columns: {
    a: { min: 16, max: 16 },
    b: { min: 34, max: 34 },
    c: { min: 26, max: 26 },
    d: { min: 26, max: 26 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 5 },
    h: { min: 6, max: 10 },
  },
  compulsory: 54,
  elective: 71,
};
