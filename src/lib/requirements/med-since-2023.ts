import {
  type CellId,
  type CourseId,
  type FakeCourse,
  type FakeCourseId,
  type KnownCourse,
  type RealCourse,
} from "$lib/akiko";
import type { ClassifyOptions, SetupCreditRequirements } from "$lib/app-setup";
import type { Major } from "$lib/constants";
import {
  isCompulsoryEnglishByName,
  isCompulsoryPe1,
  isCompulsoryPe2,
  isDataScience,
  isFirstYearSeminar,
  isGakushikiban,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
} from "./common";
import { unreachable } from "$lib/util";

export type Specialty =
  | "med" // 医学類
  | "med-new" // 医学類 新医学主専攻
  | "med-2" // 医学類 2年次編入
  | "med-2-new"; // 医学類 2年次編入 新医学主専攻

type Mode = "known" | "real";

function majorToSpecialtyOrFail(m: Major): Specialty {
  if (m === "med") return "med";
  if (m === "med-new") return "med-new";
  if (m === "med-2") return "med-2";
  if (m === "med-2-new") return "med-2-new";
  throw new Error(`Bad major: ${m}`);
}

function classifyColumnA(
  id: string,
  tableYear: number,
  specialty: Specialty,
  isNative: boolean,
): string | undefined {
  const b = {
    医学統計学: id === "HB31141",
    "医療・福祉現場でのふれあい等": id === "HB31123",
    医療概論I: id === "HB31122",
    "医療概論I-B": id === "HB32122", // 総合からの移行学生対象
    医学の基礎: id === "HB31107",
    医学の基礎B: id === "HB32235",
    医科分子生物学: id === "HB21221",
    "機能・構造と病態I": id === "HB32127",
    医療概論II: id === "HB32157",
    "機能・構造と病態II": id === "HB33127",
    医療概論III: id === "HB33157",
    "クリニカル・クラークシップ準備学習": id === "HB34147",
    社会医学実習: id === "HB34153",
    "M4クリニカル・クラークシップ(Phase IA)": id === "HB34163",
    医療概論IV: id === "HB34117",
    "M5クリニカル・クラークシップ (Phase IB、Phase IIA)": id === "HB35153",
    "M6クリニカル・クラークシップ (Phase IIB)": id === "HB36173",
    "M6アドヴァンスト・エレクティヴズ": id === "HB36183",
    研究室実習: id === "HB36193",
    医療概論V: id === "HB36163",
    医学総括: id === "HB36151",
    "English Medical Terminology I": id === "HB32212",
    "English Medical Terminology II": id === "HB33212",
  } as const;
  if (tableYear >= 2024) {
    switch (specialty) {
      case "med":
        if (b["医学統計学"]) return "a1";
        if (b["医療・福祉現場でのふれあい等"]) return "a2";
        if (b["医療概論I"] || (b["医療概論I-B"] && !isNative)) return "a3";
        if (
          b["医学の基礎"] ||
          (b["医学の基礎B"] && !isNative) ||
          (b["医科分子生物学"] && !isNative)
        )
          return "a4";
        if (b["機能・構造と病態I"]) return "a5";
        if (b["医療概論II"]) return "a6";
        if (b["English Medical Terminology I"]) return "a7";
        if (b["機能・構造と病態II"]) return "a8";
        if (b["医療概論III"]) return "a9";
        if (b["English Medical Terminology II"]) return "a10";
        if (b["クリニカル・クラークシップ準備学習"]) return "a11";
        if (b["社会医学実習"]) return "a12";
        if (b["M4クリニカル・クラークシップ(Phase IA)"]) return "a13";
        if (b["医療概論IV"]) return "a14";
        if (b["M5クリニカル・クラークシップ (Phase IB、Phase IIA)"])
          return "a15";
        if (b["M6クリニカル・クラークシップ (Phase IIB)"]) return "a16";
        if (b["M6アドヴァンスト・エレクティヴズ"]) return "a17";
        if (b["医療概論V"]) return "a18";
        if (b["医学総括"]) return "a19";
        break;
      case "med-new":
        if (b["医学統計学"]) return "a1";
        if (b["医療・福祉現場でのふれあい等"]) return "a2";
        if (b["医療概論I"] || (b["医療概論I-B"] && !isNative)) return "a3";
        if (
          b["医学の基礎"] ||
          (b["医学の基礎B"] && !isNative) ||
          (b["医科分子生物学"] && !isNative)
        )
          return "a4";
        if (b["機能・構造と病態I"]) return "a5";
        if (b["医療概論II"]) return "a6";
        if (b["English Medical Terminology I"]) return "a7";
        if (b["機能・構造と病態II"]) return "a8";
        if (b["医療概論III"]) return "a9";
        if (b["English Medical Terminology II"]) return "a10";
        if (b["クリニカル・クラークシップ準備学習"]) return "a11";
        if (b["社会医学実習"]) return "a12";
        if (b["M4クリニカル・クラークシップ(Phase IA)"]) return "a13";
        if (b["医療概論IV"]) return "a14";
        if (b["M5クリニカル・クラークシップ (Phase IB、Phase IIA)"])
          return "a15";
        if (b["研究室実習"]) return "a16";
        if (b["医療概論V"]) return "a17";
        if (b["医学総括"]) return "a18";
        break;
      case "med-2":
        if (b["医学の基礎B"]) return "a1";
        if (b["機能・構造と病態I"]) return "a2";
        if (b["医療概論II"]) return "a3";
        if (b["English Medical Terminology I"]) return "a4";
        if (b["機能・構造と病態II"]) return "a5";
        if (b["医療概論III"]) return "a6";
        if (b["English Medical Terminology II"]) return "a7";
        if (b["クリニカル・クラークシップ準備学習"]) return "a8";
        if (b["社会医学実習"]) return "a9";
        if (b["M4クリニカル・クラークシップ(Phase IA)"]) return "a10";
        if (b["医療概論IV"]) return "a11";
        if (b["M5クリニカル・クラークシップ (Phase IB、Phase IIA)"])
          return "a12";
        if (b["M6クリニカル・クラークシップ (Phase IIB)"]) return "a13";
        if (b["M6アドヴァンスト・エレクティヴズ"]) return "a14";
        if (b["医療概論V"]) return "a15";
        if (b["医学総括"]) return "a16";
        break;
      case "med-2-new":
        if (b["医学の基礎B"]) return "a1";
        if (b["機能・構造と病態I"]) return "a2";
        if (b["医療概論II"]) return "a3";
        if (b["English Medical Terminology I"]) return "a4";
        if (b["機能・構造と病態II"]) return "a5";
        if (b["医療概論III"]) return "a6";
        if (b["English Medical Terminology II"]) return "a7";
        if (b["クリニカル・クラークシップ準備学習"]) return "a8";
        if (b["社会医学実習"]) return "a9";
        if (b["M4クリニカル・クラークシップ(Phase IA)"]) return "a10";
        if (b["医療概論IV"]) return "a11";
        if (b["M5クリニカル・クラークシップ (Phase IB、Phase IIA)"])
          return "a12";
        if (b["研究室実習"]) return "a13";
        if (b["医療概論V"]) return "a14";
        if (b["医学総括"]) return "a15";
        break;
      default:
        unreachable(specialty);
    }
  } else {
    switch (specialty) {
      case "med":
        if (b["医学統計学"]) return "a1";
        if (b["医療・福祉現場でのふれあい等"]) return "a2";
        if (b["医療概論I"] || (b["医療概論I-B"] && !isNative)) return "a3";
        if (
          b["医学の基礎"] ||
          (b["医学の基礎B"] && !isNative) ||
          (b["医科分子生物学"] && !isNative)
        )
          return "a4";
        if (b["機能・構造と病態I"]) return "a5";
        if (b["医療概論II"]) return "a6";
        if (b["機能・構造と病態II"]) return "a7";
        if (b["医療概論III"]) return "a8";
        if (b["クリニカル・クラークシップ準備学習"]) return "a9";
        if (b["社会医学実習"]) return "a10";
        if (b["M4クリニカル・クラークシップ(Phase IA)"]) return "a11";
        if (b["医療概論IV"]) return "a12";
        if (b["M5クリニカル・クラークシップ (Phase IB、Phase IIA)"])
          return "a13";
        if (b["M6クリニカル・クラークシップ (Phase IIB)"]) return "a14";
        if (b["M6アドヴァンスト・エレクティヴズ"]) return "a15";
        if (b["医療概論V"]) return "a16";
        if (b["医学総括"]) return "a17";
        if (b["English Medical Terminology I"]) return "a18";
        if (b["English Medical Terminology II"]) return "a19";
        break;
      case "med-new":
        if (b["医学統計学"]) return "a1";
        if (b["医療・福祉現場でのふれあい等"]) return "a2";
        if (b["医療概論I"] || (b["医療概論I-B"] && !isNative)) return "a3";
        if (
          b["医学の基礎"] ||
          (b["医学の基礎B"] && !isNative) ||
          (b["医科分子生物学"] && !isNative)
        )
          return "a4";
        if (b["機能・構造と病態I"]) return "a5";
        if (b["医療概論II"]) return "a6";
        if (b["機能・構造と病態II"]) return "a7";
        if (b["医療概論III"]) return "a8";
        if (b["クリニカル・クラークシップ準備学習"]) return "a9";
        if (b["社会医学実習"]) return "a10";
        if (b["M4クリニカル・クラークシップ(Phase IA)"]) return "a11";
        if (b["医療概論IV"]) return "a12";
        if (b["M5クリニカル・クラークシップ (Phase IB、Phase IIA)"])
          return "a13";
        if (b["研究室実習"]) return "a14";
        if (b["医療概論V"]) return "a15";
        if (b["医学総括"]) return "a16";
        if (b["English Medical Terminology I"]) return "a17";
        if (b["English Medical Terminology II"]) return "a18";
        break;
      case "med-2":
        if (b["医学の基礎B"]) return "a1";
        if (b["機能・構造と病態I"]) return "a2";
        if (b["医療概論II"]) return "a3";
        if (b["機能・構造と病態II"]) return "a4";
        if (b["医療概論III"]) return "a5";
        if (b["クリニカル・クラークシップ準備学習"]) return "a6";
        if (b["社会医学実習"]) return "a7";
        if (b["M4クリニカル・クラークシップ(Phase IA)"]) return "a8";
        if (b["医療概論IV"]) return "a9";
        if (b["M5クリニカル・クラークシップ (Phase IB、Phase IIA)"])
          return "a10";
        if (b["M6クリニカル・クラークシップ (Phase IIB)"]) return "a11";
        if (b["M6アドヴァンスト・エレクティヴズ"]) return "a12";
        if (b["医療概論V"]) return "a13";
        if (b["医学総括"]) return "a14";
        if (b["English Medical Terminology I"]) return "a15";
        if (b["English Medical Terminology II"]) return "a16";
        break;
      case "med-2-new":
        if (b["医学の基礎B"]) return "a1";
        if (b["機能・構造と病態I"]) return "a2";
        if (b["医療概論II"]) return "a3";
        if (b["機能・構造と病態II"]) return "a4";
        if (b["医療概論III"]) return "a5";
        if (b["クリニカル・クラークシップ準備学習"]) return "a6";
        if (b["社会医学実習"]) return "a7";
        if (b["M4クリニカル・クラークシップ(Phase IA)"]) return "a8";
        if (b["医療概論IV"]) return "a9";
        if (b["M5クリニカル・クラークシップ (Phase IB、Phase IIA)"])
          return "a10";
        if (b["研究室実習"]) return "a11";
        if (b["医療概論V"]) return "a12";
        if (b["医学総括"]) return "a13";
        if (b["English Medical Terminology I"]) return "a14";
        if (b["English Medical Terminology II"]) return "a15";
        break;
      default:
        unreachable(specialty);
    }
  }
}

function isC1(id: string): boolean {
  return (
    id === "HB11672" || // Clinical Communication in English I Aクラス
    id === "HB11682" || // Clinical Communication in English I Bクラス
    id === "HB11692" // Clinical Communication in English I Cクラス
  );
}

function isC2(id: string): boolean {
  return (
    id === "HB11702" || // Clinical Communication in English II Aクラス
    id === "HB11712" || // Clinical Communication in English II Bクラス
    id === "HB11722" // Clinical Communication in English II Cクラス
  );
}

function isC3(id: string, _tableYear: number, mode: Mode): boolean {
  return (
    id === "HB13222" || // TOEFL演習 2025年開講
    (mode === "real" && id === "HB33312") // TOEFL演習 2023, 2024年開講
  );
}

function isD1(id: string, specialty: Specialty, isNative: boolean): boolean {
  if (!(specialty === "med" || specialty === "med-new")) return false;
  return (
    id === "FCB1221" || // 力学1 医学生向け !!A!!
    id === "FCB1231" || // 力学1 総合生向け
    id === "FCB1331" || // 電磁気学1
    id === "HB11411" || // 生物学I
    id === "HB11421" || // 生物学II
    id === "FE11181" || // 化学2 2023,2024,2025年開講 化学類、物理学類、医学類、総合学域群第１類および第３類
    id === "FE11281" || // 化学2 2023, 2024年開講 応用理工学類、地球学類、総合学域群第２類の学生
    id === "FE11191" || // 化学3 2023,2024,2025年開講 化学類、物理学類、医学類、総合学域群第１類および第３類
    id === "FE11291" || // 化学3 2023, 2024年開講 応用理工学類、地球学類、総合学域群第２類の学生
    // 総合生のみ生物学I, IIに読み替え可能
    (!isNative && id === "HB21211") // 医科生化学
  );
}

function isE1MedMedNew(id: string, mode: Mode): boolean {
  return (
    id === "1121102" || // ファーストイヤーセミナー 1クラス
    id === "1121202" || // ファーストイヤーセミナー 2クラス
    id === "1121302" || // ファーストイヤーセミナー 3クラス
    id === "1121402" || // ファーストイヤーセミナー 4クラス
    id === "1121502" || // ファーストイヤーセミナー 5クラス
    id === "1121602" || // ファーストイヤーセミナー 6クラス
    id === "1227671" || // 学問への誘い 1クラス
    id === "1227681" || // 学問への誘い 2クラス
    id === "1227691" || // 学問への誘い 3クラス
    id === "1227701" || // 学問への誘い 4クラス
    id === "1227711" || // 学問への誘い 5クラス
    id === "1227721" || // 学問への誘い 6クラス
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE1Med2MedNew2(id: string) {
  return id === "1228211"; // 学問への誘い 2年次編入生対象
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

function isE3(name: string): boolean {
  return isCompulsoryEnglishByName(name);
}

function isE4(id: string, mode: Mode): boolean {
  return (
    id === "6117101" || // 情報リテラシー(講義) 2024 A班
    id === "6117201" || // 情報リテラシー(講義)2024年まで班で分割されていた B班
    id === "6417102" || // 情報リテラシー(演習) 1班
    id === "6417202" || // 情報リテラシー(演習) 2班
    id === "6417302" || // 情報リテラシー(演習) 3班
    id === "6517102" || // データサイエンス 1班
    id === "6517202" || // データサイエンス 2班
    id === "6517302" || // データサイエンス 3班
    (mode === "real" &&
      (isInfoLiteracyLecture(id) ||
        isInfoLiteracyExercise(id) ||
        isDataScience(id)))
  );
}

function isE5(id: string, mode: Mode): boolean {
  return (
    id === "5104011" || // 国語I 1班
    id === "5104021" || // 国語I 2班
    id === "5104031" || // 国語I 3班
    (mode === "real" && id === "5108091") // 国語I 総合学域群生のうち医学類または看護学類に移行する学生で、国語Iを未履修の者に限る
  );
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isH1(id: string): boolean {
  return id.startsWith("HB");
}

function isH2(id: string): boolean {
  return /^(F[ABCEFG]|G[ABC]|EB)/.test(id);
}

function isH3(id: string): boolean {
  return /^[AB]/.test(id);
}

function isH4(id: string): boolean {
  return /^[ABCEFGHWY]/.test(id) && !id.startsWith("HB");
}

function classify(
  id: CourseId,
  name: string,
  mode: Mode,
  tableYear: number,
  specialty: Specialty,
  isNative: boolean,
): string | undefined {
  // 必修
  const a = classifyColumnA(id, tableYear, specialty, isNative);
  if (a !== undefined) return a;
  if (isC1(id)) return "c1";
  if (isC2(id)) return "c2";
  if (isC3(id, tableYear, mode)) return "c3";
  if (isD1(id, specialty, isNative)) return "d1";
  switch (specialty) {
    case "med":
    case "med-new":
      if (isE1MedMedNew(id, mode)) return "e1";
      if (isE2(id)) return "e2";
      if (isE3(name)) return "e3";
      if (isE4(id, mode)) return "e4";
      if (isE5(id, mode)) return "e5";
      if (isF1(id)) return "f1";
      // 選択
      if (isH1(id)) return "h1";
      if (isH2(id)) return "h2";
      if (isH3(id)) return "h3";
      if (isH4(id)) return "h4";
      break;
    case "med-2":
    case "med-2-new":
      if (isE1Med2MedNew2(id)) return "e1";
      break;
    default:
      unreachable(specialty);
  }
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
      "known",
      opts.tableYear,
      specialty,
      opts.isNative,
    );
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
  for (const c of cs) {
    const cellId = classify(
      c.id,
      c.name,
      "real",
      opts.tableYear,
      specialty,
      opts.isNative,
    );
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  cs: FakeCourse[],
  _opts: ClassifyOptions,
): Map<FakeCourseId, string> {
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
  major: Major,
): string | undefined {
  const specialty = majorToSpecialtyOrFail(major);
  if (
    (tableYear >= 2024 &&
      (specialty === "med" || specialty === "med-new") &&
      id === "a14") ||
    ((specialty === "med-2" || specialty === "med-2-new") && id === "a11")
  ) {
    // !!B!!
    return `医療概論IVの中にアドヴァンストコースが含まれているとシラバスに記載があるので統合していますが、間違っている可能性があります。`;
  }
  if (id === "h2" || id === "h3" || id === "h4") {
    // !!C!!
    return `専門基礎科目などで指定された科目と同様の内容の講義の場合、ここに表示されていてもここではないマスの単位としてカウントされる場合があるので注意してください。`;
  }
}

export const reqMedMedNewSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 1, max: 1 },
    a2: { min: 2, max: 2 },
    a3: { min: 2, max: 2 },
    a4: { min: 11, max: 11 },
    a5: { min: 27, max: 27 },
    a6: { min: 2, max: 2 },
    a7: { min: 37, max: 37 },
    a8: { min: 3, max: 3 },
    a9: { min: 18, max: 18 },
    a10: { min: 2, max: 2 },
    a11: { min: 11, max: 11 },
    a12: { min: 2, max: 2 },
    a13: { min: 22, max: 22 },
    a14: { min: 4, max: 4 },
    a15: { min: 11, max: 11 },
    a16: { min: 2, max: 2 },
    a17: { min: 10, max: 2 },
    a18: { min: 1, max: 1 },
    a19: { min: 2, max: 2 },
    c1: { min: 1, max: 1 },
    c2: { min: 1, max: 1 },
    c3: { min: 1, max: 1 },
    d1: { min: 5, max: 5 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 1, max: 1 },
    f1: { min: 1, max: 1 },
    h1: { min: 1, max: 1 },
    h2: { min: 2, max: 2 },
    h3: { min: 2, max: 2 },
    h4: { min: 2, max: 2 },
  },
  columns: {
    a: { min: 170, max: 170 },
    c: { min: 3, max: 3 },
    d: { min: 5, max: 5 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 1 },
    h: { min: 7, max: 7 },
  },
  compulsory: 183,
  elective: 13,
};

export const reqMed2MedNew2Since2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 9, max: 9 },
    a2: { min: 27, max: 27 },
    a3: { min: 2, max: 2 },
    a4: { min: 1, max: 1 },
    a5: { min: 37, max: 37 },
    a6: { min: 3, max: 3 },
    a7: { min: 2, max: 2 },
    a8: { min: 18, max: 18 },
    a9: { min: 2, max: 2 },
    a10: { min: 11, max: 11 },
    a11: { min: 1, max: 1 },
    a12: { min: 1, max: 1 },
    a13: { min: 22, max: 22 },
    a14: { min: 15, max: 15 },
    a15: { min: 2, max: 2 },
    a16: { min: 10, max: 10 },
    c1: { min: 1, max: 1 },
    c2: { min: 1, max: 1 },
    c3: { min: 1, max: 1 },
    e1: { min: 1, max: 1 },
  },
  columns: {
    a: { min: 163, max: 163 },
    c: { min: 3, max: 3 },
    e: { min: 1, max: 1 },
  },
  compulsory: 167,
  elective: 0,
};

export function getCreditRequirements(
  _tableYear: number,
  major: Major,
): SetupCreditRequirements {
  const specialty = majorToSpecialtyOrFail(major);
  switch (specialty) {
    case "med":
    case "med-new":
      return reqMedMedNewSince2023;
    case "med-2":
    case "med-2-new":
      return reqMed2MedNew2Since2023;
    default:
      return unreachable(specialty);
  }
}
