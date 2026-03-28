import {
  type CourseId,
  type FakeCourse,
  type FakeCourseId,
  type KnownCourse,
  type RealCourse,
  gradeIsPass,
} from "$lib/akiko";
import type { ClassifyOptions, SetupCreditRequirements } from "$lib/app-setup";
import type { Major } from "$lib/constants";
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
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
  isJapanese,
  isJapaneseAsForeignLanguage,
  isJapanExpertJapanese,
  isJiyuukamoku,
  isKyoushoku,
  isNonCompulsoryEnglish,
  isSecondForeignLanguageAdvanced,
} from "./common";
import { unreachable } from "$lib/util";

export type Specialty = "none" | "jad";
type Mode = "known" | "real";

function majorToSpecialtyOrFail(m: Major): Specialty {
  if (m === "art") return "none";
  if (m === "art-jad") return "jad";
  throw new Error(`Bad major: ${m}`);
}

function isA1(id: string): boolean {
  return (
    id === "YBA9918" || // 卒業研究A(美術史領域)
    id === "YBA9928" || // 卒業研究B(美術史領域)
    id === "YBB9918" || // 卒業研究A(芸術支援領域)
    id === "YBB9928" || // 卒業研究B(芸術支援領域)
    id === "YBC9918" || // 卒業研究A(洋画領域)
    id === "YBC9928" || // 卒業研究B(洋画領域)
    id === "YBD9918" || // 卒業研究A(版画領域)
    id === "YBD9928" || // 卒業研究B(版画領域)
    id === "YBE9918" || // 卒業研究A(日本画領域)
    id === "YBE9928" || // 卒業研究B(日本画領域)
    id === "YBF9918" || // 卒業研究A(彫塑領域)
    id === "YBF9928" || // 卒業研究B(彫塑領域)
    id === "YBG9918" || // 卒業研究A(書領域)
    id === "YBG9928" || // 卒業研究B(書領域)
    id === "YBH9918" || // 卒業研究A(工芸領域)
    id === "YBH9928" || // 卒業研究B(工芸領域)
    id === "YBJ9918" || // 卒業研究A(総合造形領域)
    id === "YBJ9928" || // 卒業研究B(総合造形領域)
    id === "YBK9918" || // 卒業研究A(構成領域)
    id === "YBK9928" || // 卒業研究B(構成領域)
    id === "YBL9918" || // 卒業研究A(ビジュアルデザイン領域)
    id === "YBL9928" || // 卒業研究B(ビジュアルデザイン領域)
    id === "YBN9918" || // 卒業研究A(情報・プロダクトデザイン領域)
    id === "YBN9928" || // 卒業研究B(情報・プロダクトデザイン領域)
    id === "YBP9918" || // 卒業研究A(環境デザイン領域)
    id === "YBP9928" || // 卒業研究B(環境デザイン領域)
    id === "YBQ9918" || // 卒業研究A(建築デザイン領域)
    id === "YBQ9928" || // 卒業研究B(建築デザイン領域)
    id === "YBW9918" || // 卒業研究A(日本芸術) 2023年のみ開講 Japan-Expertに限る
    id === "YBW9928" || // 卒業研究B(日本芸術) 2023年のみ開講 Japan-Expertに限る
    id === "YBX9918" || // 卒業研究A(特別履修)
    id === "YBX9928" // 卒業研究B(特別履修)
  );
}

function isA2(id: string): boolean {
  return (
    id === "YBA9017" || // 美術史領域研究I
    id === "YBB9017" || // 芸術支援領域研究I
    id === "YBC9017" || // 洋画領域研究I
    id === "YBD9017" || // 版画領域研究I
    id === "YBE9017" || // 日本画領域研究I
    id === "YBF9017" || // 彫塑領域研究I
    id === "YBG9017" || // 書領域研究I
    id === "YBH9017" || // 工芸領域研究I
    id === "YBJ9017" || // 総合造形領域研究I
    id === "YBK9017" || // 構成領域研究I
    id === "YBL9017" || // ビジュアルデザイン領域研究I
    id === "YBN9017" || // 情報・プロダクトデザイン領域研究I
    id === "YBP9017" || // 環境デザイン領域研究I
    id === "YBQ9017" // 建築デザイン領域研究I
  );
}

function isA3(id: string): boolean {
  return (
    id === "YBA9027" || // 美術史領域研究II
    id === "YBB9027" || // 芸術支援領域研究II
    id === "YBC9027" || // 洋画領域研究II
    id === "YBD9027" || // 版画領域研究II
    id === "YBE9027" || // 日本画領域研究II
    id === "YBF9027" || // 彫塑領域研究II
    id === "YBG9027" || // 書領域研究II
    id === "YBH9027" || // 工芸領域研究II
    id === "YBJ9027" || // 総合造形領域研究II
    id === "YBK9027" || // 構成領域研究II
    id === "YBL9027" || // ビジュアルデザイン領域研究II
    id === "YBN9027" || // 情報・プロダクトデザイン領域研究II
    id === "YBP9027" || // 環境デザイン領域研究II
    id === "YBQ9027" || // 建築デザイン領域研究II
    id === "YBX9027" // 領域研究Ⅱ（特別履修）
  );
}

function isA4(id: string): boolean {
  return (
    id === "YBA9037" || // 美術史領域特別演習I
    id === "YBB9037" || // 芸術支援領域特別演習I
    id === "YBC9037" || // 洋画領域特別演習I
    id === "YBD9037" || // 版画領域特別演習I
    id === "YBE9037" || // 日本画領域特別演習I
    id === "YBF9037" || // 彫塑領域特別演習I
    id === "YBG9037" || // 書領域特別演習I
    id === "YBH9037" || // 工芸領域特別演習I
    id === "YBJ9037" || // 総合造形領域特別演習I
    id === "YBK9037" || // 構成領域特別演習I
    id === "YBL9037" || // ビジュアルデザイン領域特別演習I
    id === "YBN9037" || // 情報・プロダクトデザイン領域特別演習I
    id === "YBP9037" || // 環境デザイン領域特別演習I
    id === "YBQ9037" || // 建築デザイン領域特別演習I
    id === "YBW9037" || // 領域特別演習Ⅰ（日本芸術）
    id === "YBX9037" // 領域特別演習Ⅰ（特別履修）
  );
}

function isA5(id: string): boolean {
  return (
    id === "YBA9047" || // 美術史領域特別演習II
    id === "YBB9047" || // 芸術支援領域特別演習II
    id === "YBC9047" || // 洋画領域特別演習II
    id === "YBD9047" || // 版画領域特別演習II
    id === "YBE9047" || // 日本画領域特別演習II
    id === "YBF9047" || // 彫塑領域特別演習II
    id === "YBG9047" || // 書領域特別演習II
    id === "YBH9047" || // 工芸領域特別演習II
    id === "YBJ9047" || // 総合造形領域特別演習II
    id === "YBK9047" || // 構成領域特別演習II
    id === "YBL9047" || // ビジュアルデザイン領域特別演習II
    id === "YBN9047" || // 情報・プロダクトデザイン領域特別演習II
    id === "YBP9047" || // 環境デザイン領域特別演習II
    id === "YBQ9047" || // 建築デザイン領域特別演習II
    id === "YBW9047" || // 領域特別演習Ⅱ（日本芸術）
    id === "YBX9047" // 領域特別演習Ⅱ（特別履修）
  );
}

function isA6(id: string): boolean {
  return (
    id === "YBA9057" || // 美術史領域特別演習III
    id === "YBB9057" || // 芸術支援領域特別演習III
    id === "YBC9057" || // 洋画領域特別演習III
    id === "YBD9057" || // 版画領域特別演習III
    id === "YBE9057" || // 日本画領域特別演習III
    id === "YBF9057" || // 彫塑領域特別演習III
    id === "YBG9057" || // 書領域特別演習III
    id === "YBH9057" || // 工芸領域特別演習III
    id === "YBJ9057" || // 総合造形領域特別演習III
    id === "YBK9057" || // 構成領域特別演習III
    id === "YBL9057" || // ビジュアルデザイン領域特別演習III
    id === "YBN9057" || // 情報・プロダクトデザイン領域特別演習III
    id === "YBP9057" || // 環境デザイン領域特別演習III
    id === "YBQ9057" || // 建築デザイン領域特別演習III
    id === "YBW9057" || // 領域特別演習Ⅲ（日本芸術）
    id === "YBX9057" // 領域特別演習Ⅲ（特別履修）
  );
}

function isA7(id: string): boolean {
  return id === "YBW2933"; // インターンシップ(日本芸術)
}

function isB1(id: string): boolean {
  return id.startsWith("YB");
}

function isB2(id: string): boolean {
  return (
    id.startsWith("AB90") ||
    id.startsWith("AB93") ||
    id.startsWith("AC50") ||
    id.startsWith("AC60")
  );
}

function isB3(id: string): boolean {
  return (
    id === "FG45901" || // 建築設備
    id === "FH45051" || // 建築関連法規
    id === "FH45061" || // 建築経済
    id === "FH45071" // 建築生産
  );
}

function isC1(id: string): boolean {
  return id === "YAX1011"; // 芸術キャリア教育
}

function isC2(id: string): boolean {
  return id === "YAX2011"; // アート&デザイン入門
}

function isC3(id: string): boolean {
  return id === "YAX2021"; // 芸術と文化
}

function isC4(id: string): boolean {
  return (
    id === "YAX2031" // 芸術と社会
  );
}

function isC5(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "none":
      return (
        id === "YAX3132" || // 英語基礎演習（芸術）A-1
        id === "YAX3142" || // 英語基礎演習（芸術）A-2
        id === "YAX3152" || // 英語基礎演習（芸術）B-1
        id === "YAX3162" || // 英語基礎演習（芸術）B-2
        id === "YAX3172" || // 英語基礎演習（芸術）C-1
        id === "YAX3182" // 英語基礎演習（芸術）C-2
      );
    case "jad":
      return id === "AE51K11"; // Japan-Expert総論
    default:
      unreachable(specialty);
  }
}

function isD1(id: string): boolean {
  return (
    id === "YAZ1211" || // 美術史概説A-1 奇数年度開講
    id === "YAZ1221" || // 美術史概説A-2 偶数年度開講
    id === "YAZ1311" || // 美術史概説B-1 奇数年度開講
    id === "YAZ1321" || // 美術史概説B-2 偶数年度開講
    id === "YAZ1411" || // デザイン史概説A
    id === "YAZ1421" // デザイン史概説B
  );
}

function isD2(id: string): boolean {
  return (
    id === "YAC1012" || // 素描基礎演習1
    id === "YAC1112" || // 油彩画基礎演習1
    id === "YAC1122" || // 油彩画基礎演習2
    id === "YAD1012" || // 版画基礎演習
    id === "YAE1022" || // 素描基礎演習2
    id === "YAE1112" || // 日本画基礎演習1
    id === "YAE1122" || // 日本画基礎演習2
    id === "YAF1012" || // 彫塑基礎演習1
    id === "YAF1022" || // 彫塑基礎演習2
    id === "YAF1032" || // 彫塑基礎演習3
    id === "YAG1012" || // 書基礎演習I-1
    id === "YAG1022" || // 書基礎演習I-2
    id === "YAH1012" || // 工芸基礎演習(ガラス)
    id === "YAH1022" || // 工芸基礎演習(陶磁)
    id === "YAH1032" || // 工芸基礎演習(木工)
    id === "YAJ1022" || // 立体加工基礎演習
    id === "YAK1012" || // 構成基礎演習
    id === "YAL1012" || // グラフィックツール基礎演習
    id === "YAL1013" || // デジタル写真基礎演習
    id === "YAL1022" || // デジタル写真基礎演習
    id === "YAN1012" || // レンダリング基礎演習
    id === "YAP1012" || // プレゼンテーション基礎演習
    id === "YAQ1012" || // 建築製図基礎演習
    id === "YAX3132" || // 英語基礎演習（芸術）A-1
    id === "YAX3142" || // 英語基礎演習（芸術）A-2
    id === "YAX3152" || // 英語基礎演習（芸術）B-1
    id === "YAX3162" || // 英語基礎演習（芸術）B-2
    id === "YAX3172" || // 英語基礎演習（芸術）C-1
    id === "YAX3182" // 英語基礎演習（芸術）C-2
  );
}

function isD3(id: string): boolean {
  return (
    id === "YAA1011" || // 美術史学概論
    id === "YAB1011" || // 芸術支援学概論
    id === "YAC1011" || // 洋画概論
    id === "YAD1011" || // 版画概論
    id === "YAE1011" || // 日本画概論
    id === "YAF1011" || // 彫塑概論
    id === "YAG1011" || // 書概論
    id === "YAH1011" || // 工芸概論
    id === "YAJ1011" || // 総合造形概論
    id === "YAK1011" || // 構成概論
    id === "YAL1011" || // ビジュアルデザイン概論
    id === "YAN1011" || // 情報・プロダクトデザイン概論
    id === "YAP1011" || // 環境デザイン概論
    id === "YAQ1011" // 建築デザイン概論
  );
}

function isD4(id: string): boolean {
  return id.startsWith("YA");
}

function isE1(id: string, mode: Mode, specialty: Specialty): boolean {
  return (
    id === "1125102" || // ファーストイヤーセミナー 1クラス
    id === "1125202" || // ファーストイヤーセミナー 2クラス
    id === "1125302" || // ファーストイヤーセミナー 3クラス
    id === "1227871" || // 学問への誘い 1クラス
    id === "1227881" || // 学問への誘い 2クラス
    id === "1227891" || // 学問への誘い 3クラス
    (specialty === "jad" && id === "1122502") || // Japan-Expertファーストイヤーセミナー
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

function isE3(name: string, specialty: Specialty, id: string): boolean {
  switch (specialty) {
    case "none":
      return isCompulsoryEnglishByName(name);
    case "jad":
      return isJapanExpertJapanese(id);
    default:
      unreachable(specialty);
  }
}

function isE4(id: string, mode: Mode): boolean {
  return (
    id === "6121101" || // 情報リテラシー(講義)
    id === "6421102" || // 情報リテラシー(演習) 1班
    id === "6421202" || // 情報リテラシー(演習) 2班
    id === "6521102" || // データサイエンス 1班
    id === "6521202" || // データサイエンス 2班
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
  return isElectivePe(id);
}

function isF3(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "none":
      return isNonCompulsoryEnglish(id);
    case "jad":
      return isJapaneseAsForeignLanguage(id);
    default:
      unreachable(specialty);
  }
}

function isF4(id: string, name: string): boolean {
  return isSecondForeignLanguageAdvanced(id, name);
}

function isF5(id: string): boolean {
  return isJapanese(id);
}

function isF6(id: string): boolean {
  return isArt(id);
}

function isH1(id: string): boolean {
  return isKyoushoku(id) || isHakubutsukan(id) || isJiyuukamoku(id);
}

function isH2(id: string): boolean {
  return /^[ABCGHVW]/.test(id);
}

function isH3(id: string): boolean {
  return /^[EF]/.test(id);
}

function isH4(id: string, specialty: Specialty): boolean {
  // Japan-Expert共通科目(芸術を除く)
  // https://jp-ex.tsukuba.ac.jp/jp/wp-content/uploads/2025/05/8c8616d34792571af67a0dd107015d9d.pdf
  return (
    specialty === "jad" &&
    (id === "AE56A11" || // 共生のための社会言語学
      id === "AE56A21" || // 共生のための日本語教育
      id === "AE56A31" || // 共生のための人類学
      id === "AE56A41" || // 共生のための歴史学
      id === "AE56A61" || // 日本文学と文化
      id === "EC12201" || // 生物資源学にみる食品科学・技術の最前線
      id === "EC12301" || // 生物資源の開発・生産と持続利用
      id === "EC12401" || // 生物資源と環境
      id === "EC12501" || // 生物資源としての遺伝子とゲノム
      id === "HC30071") // 看護生命倫理
    // id === "4004013" || // 芸術(日本画実習)
    // id === "4006012" || // 芸術(書A)
    // id === "4006022" || // 芸術(書B)
    // id === "4006032" // 芸術(書C)
  );
}

function classify(
  id: CourseId,
  name: string,
  mode: Mode,
  _tableYear: number,
  specialty: Specialty,
): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isA2(id)) return "a2";
  if (isA3(id)) return "a3";
  if (isA4(id)) return "a4";
  if (isA5(id)) return "a5";
  if (isA6(id)) return "a6";
  if (isA7(id)) return "a7";
  if (isC1(id)) return "c1";
  if (isC2(id)) return "c2";
  if (isC3(id)) return "c3";
  if (isC4(id)) return "c4";
  if (isC5(id, specialty)) return "c5";
  if (isE1(id, mode, specialty)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(name, specialty, id)) return "e3";
  if (isE4(id, mode)) return "e4";
  // 選択
  if (isD1(id)) return "d1";
  if (isD2(id)) return "d2";
  if (isD3(id)) return "d3";
  if (isD4(id)) return "d4";
  if (isB1(id)) return "b1";
  if (isB2(id)) return "b2";
  if (isB3(id)) return "b3";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isF3(id, specialty)) return "f3";
  if (isF4(id, name)) return "f4";
  if (isF5(id)) return "f5";
  if (isF6(id)) return "f6";
  if (isH4(id, specialty)) return "h4";
  if (isH1(id)) return "h1";
  if (isH2(id)) return "h2";
  if (isH3(id)) return "h3";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
): Map<CourseId, string> {
  const specialty = majorToSpecialtyOrFail(opts.major);
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, "known", opts.tableYear, specialty);
    if (cellId !== undefined) {
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
  const courseIdToCellId = new Map<CourseId, string>();
  // jadの場合、isE3とisF3が両方isJapaneseAsForeignLanguageに一致するので、
  // e3に15単位入るまで貪欲に入れて、それ以降はf3に回す。
  let e3Total = 0;
  // d2は3単位まで、それ以降はd5に回す。
  let d2Total = 0;
  // d3はartなら3単位まで、jadなら2単位まで、それ以降はd5に回す。
  let d3Total = 0;
  const d3Max = specialty === "none" ? 3 : 2;
  for (const c of cs) {
    let cellId = classify(c.id, c.name, "real", opts.tableYear, specialty);
    if (cellId !== undefined) {
      if (specialty === "jad" && cellId === "e3" && gradeIsPass(c.grade)) {
        if (e3Total < 15) {
          e3Total += c.credit ?? 0;
        } else {
          cellId = "f3";
        }
      }
      if (cellId === "d2" && gradeIsPass(c.grade)) {
        if (d2Total < 3) {
          d2Total += c.credit ?? 0;
        } else {
          cellId = "d4";
        }
      }
      if (cellId === "d3" && gradeIsPass(c.grade)) {
        if (d3Total < d3Max) {
          d3Total += c.credit ?? 0;
        } else {
          cellId = "d4";
        }
      }
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  cs: FakeCourse[],
  opts: ClassifyOptions,
): Map<FakeCourseId, string> {
  const specialty = majorToSpecialtyOrFail(opts.major);
  const fakeCourseIdToCellId = new Map<FakeCourseId, string>();
  for (const c of cs) {
    if (specialty === "none" && isE3(c.name, specialty, "")) {
      fakeCourseIdToCellId.set(c.id, "e3");
    }
  }
  return fakeCourseIdToCellId;
}

export const reqSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 6, max: 6 },
    a2: { min: 1, max: 1 },
    a3: { min: 1, max: 1 },
    a4: { min: 1, max: 1 },
    a5: { min: 1, max: 1 },
    a6: { min: 1, max: 1 },
    b1: { min: 40, max: 64 },
    b2: { min: 0, max: 15 },
    b3: { min: 0, max: 5 },
    c1: { min: 1, max: 1 },
    c2: { min: 1, max: 1 },
    c3: { min: 1, max: 1 },
    c4: { min: 1, max: 1 },
    c5: { min: 1, max: 1 },
    d1: { min: 2, max: 2 },
    d2: { min: 3, max: 3 },
    d3: { min: 3, max: 3 },
    d4: { min: 5, max: 12 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 4 },
    f4: { min: 0, max: 4 },
    f5: { min: 0, max: 2 },
    f6: { min: 0, max: 3 },
    h1: { min: 0, max: 18 },
    h2: { min: 4, max: 18 },
    h3: { min: 2, max: 14 },
  },
  columns: {
    a: { min: 11, max: 11 },
    b: { min: 50, max: 64 },
    c: { min: 5, max: 5 },
    d: { min: 13, max: 20 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 12 },
    h: { min: 6, max: 24 },
  },
  compulsory: 28,
  elective: 96,
};

export const reqJadSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 6, max: 6 },
    a2: { min: 1, max: 1 },
    a3: { min: 1, max: 1 },
    a4: { min: 1, max: 1 },
    a5: { min: 1, max: 1 },
    a6: { min: 1, max: 1 },
    a7: { min: 1, max: 1 },
    b1: { min: 40, max: 64 },
    b2: { min: 0, max: 15 },
    b3: { min: 0, max: 5 },
    c1: { min: 1, max: 1 },
    c2: { min: 1, max: 1 },
    c3: { min: 1, max: 1 },
    c4: { min: 1, max: 1 },
    c5: { min: 1, max: 1 },
    d1: { min: 2, max: 2 },
    d2: { min: 3, max: 3 },
    d3: { min: 2, max: 2 },
    d4: { min: 5, max: 12 },
    e1: { min: 3, max: 3 },
    e2: { min: 2, max: 2 },
    e3: { min: 15, max: 15 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 4 },
    f4: { min: 0, max: 4 },
    f5: { min: 0, max: 2 },
    f6: { min: 0, max: 3 },
    h1: { min: 0, max: 18 },
    h2: { min: 3, max: 18 },
    h3: { min: 2, max: 14 },
    h4: { min: 1, max: 1 },
  },
  columns: {
    a: { min: 12, max: 12 },
    b: { min: 50, max: 64 },
    c: { min: 5, max: 5 },
    d: { min: 12, max: 19 },
    e: { min: 24, max: 24 },
    f: { min: 1, max: 12 },
    h: { min: 6, max: 24 },
  },
  compulsory: 41,
  elective: 95,
};

export function getCreditRequirements(
  _tableYear: number,
  major: Major,
): SetupCreditRequirements {
  const specialty = majorToSpecialtyOrFail(major);
  switch (specialty) {
    case "none":
      return reqSince2023;
    case "jad":
      return reqJadSince2023;
    default:
      return unreachable(specialty);
  }
}
