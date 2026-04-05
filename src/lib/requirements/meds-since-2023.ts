import {
  type CourseId,
  type FakeCourse,
  type CellId,
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
  isJapaneseAsForeignLanguage,
} from "$lib/requirements/common";
import { unreachable } from "$lib/util";

type Specialty = "ms" | "ims" | "mspis";

function majorToSpecialtyOrFail(m: Major): Specialty {
  if (m === "meds-ms") return "ms";
  if (m === "meds-ims") return "ims";
  if (m === "meds-mspis") return "mspis";
  throw new Error(`Bad major: ${m}`);
}

type Mode = "known" | "real";

function classifyColumnAMs(id: string): string | undefined {
  // !!A!!はその他の科目が全て国際医療科学主専攻G30コース学生向け
  if (
    id === "HE30001" || // 臨床病態学 2023年以降
    id === "HE40151" // 臨床病態学 2022年度入学者までが対象 2023年のみ開講
  )
    return "a1";
  if (id === "HE30031") return "a2"; // 病態検査学
  if (id === "HE30021") return "a3"; // 臨床薬理学 !!A!!
  if (id === "HE30033") return "a4"; // 臨床薬理学実習
  if (id === "HE31001") return "a5"; // 病理組織学
  if (id === "HE31013") return "a6"; // 病理組織学実習
  if (id === "HE31021") return "a7"; // 細胞検査学
  if (id === "HE31031") return "a8"; // 血液検査学 !!A!!
  if (id === "HE31043") return "a9"; // 血液検査学実習
  if (id === "HE32002") return "a10"; // 生化学成分検査学
  if (id === "HE32013") return "a11"; // 生化学成分検査学実習
  if (id === "HE32021") return "a12"; // 凝固・線溶学 !!A!!
  if (id === "HE32051") return "a13"; // 遺伝子検査学 !!A!!
  if (id === "HE32053") return "a14"; // 遺伝子検査学実習
  if (id === "HE32061") return "a15"; // RI検査技術学
  if (
    id === "HE33001" || // 病原微生物学
    id === "HE40011" // 病原微生物学 医療科学類 留学生に限る
  )
    return "a16";
  if (id === "HE33043") return "a17"; // 病原微生物学実習I
  if (id === "HE33063") return "a18"; // 病原微生物学実習II
  if (id === "HE32071") return "a19"; // 医学物理学概論
  if (id === "HE33041") return "a20"; // 免疫検査学 !!A!!
  if (id === "HE33053") return "a21"; // 免疫検査学実習
  if (id === "HE33061") return "a22"; // 輸血学
  if (id === "HE33073") return "a23"; // 輸血学実習
  if (id === "HE34131") return "a24"; // ゲノム医科学
  if (id === "HE34001") return "a25"; // 生理機能検査学
  if (id === "HE34013") return "a26"; // 生理機能検査学実習
  if (id === "HE34035") return "a27"; // 画像検査学
  if (id === "HE35081") return "a28"; // 検査機器学
  if (id === "HE35011") return "a29"; // 検査情報管理学
  if (id === "HE35061") return "a30"; // 医学検査学
  if (id === "HE35071") return "a31"; // 医療科学概論
  if (id === "HE35053") return "a32"; // 医学検査学実習
  if (id === "HE35041") return "a33"; // 医学検査学フロンティア
  if (id === "HE39505") return "a34"; // 医療安全管理学
  if (
    id === "HE39003" || // 臨床実習 7単位 2023年のみ開講 平成30年度以前入学の医療科学類学生に限る
    id === "HE39013" || // 臨床実習 8単位 2023,2024,2025年開講
    id === "HE39033" // 臨床実習 12単位 !!B!!
  )
    return "a35";
  if (id === "HE39023") return "a36"; // 卒業研究 医療科学類医療科学主専攻学生に限る
}

function classifyColumnBMs(id: string, tableYear: number): string | undefined {
  // TODO: その他学類長が指定する科目 !!B!!
  if (
    id === "HE34101" || // 先端脳科学
    id === "HE34004" || // 神経科学特論
    id === "HE36111" || // 細胞・発生工学
    id === "HE36161" || // ためになる血液学
    id === "HE36121" || // ためになる内分泌代謝学
    id === "HE40161" || // 血管生物学のトピックス
    id === "HE36191" || // バイオインフォマティクス !!A!!
    (tableYear >= 2024 &&
      (id === "HE36201" || // 自己免疫疾患・アレルギー疾患の病態と臨床
        id === "HE36221" || // 実践的オンラインコンテンツ・ツール活用論
        id === "HE36211")) || // 検査医学とスポーツ医学の密接な接点
    id === "HE37101" || // 医療工学
    id === "HE37141" || // 人工臓器学
    id === "HE36151" || // 胚操作・動物実験法(実験動物学)
    (tableYear >= 2026 && id === "HE37151") || // 発生工学と再生医療
    (2023 <= tableYear && tableYear <= 2024 && id === "HE35051") || // 多職種連携医療学概論
    (tableYear >= 2025 && id === "HE39012") || // ケア・コロキウム
    id === "HE35002" || // 生体機能診断ワークショップ
    id === "HE41181" || // 健幸医科学グループワーク
    (tableYear >= 2025 && id === "HE24021") || // 医科学のための英語I 2025年度しか開講なし !!B!!
    id === "HE24002" || // 主体性演習
    (tableYear >= 2025 && id === "HE32081") // 法医学概論
  )
    return "b1";
}

function classifyColumnCMs(id: string): string | undefined {
  if (id === "HC21081") return "c1"; // 人体構造学
  if (id === "HE20013") return "c2"; // 人体構造学実習
  if (id === "HC21071") return "c3"; // 人体機能学
  if (id === "HE20033") return "c4"; // 人体機能学実習
  if (id === "HB21211") return "c5"; // 医科生化学
  if (id === "HE20053") return "c6"; // 生化学実習
  if (id === "HB21221") return "c7"; // 医科分子生物学
  if (id === "HE21041") return "c8"; // 基礎医学総論
  if (id === "HE21021") return "c9"; // 微生物学 !!A!!
  if (id === "HE21033") return "c10"; // 微生物学実習
  if (id === "HE22001") return "c11"; // 保健衛生論
  if (id === "HE22011") return "c12"; // 医療法制
  if (id === "HE22021") return "c13"; // 計量生物学
  if (id === "HE23021") return "c14"; // 医用工学
  if (id === "HE23033") return "c15"; // 医用工学実習
  if (id === "HE23041") return "c16"; // 電磁気学I
  if (id === "HE35021") return "c17"; // 医療情報管理学
  if (id === "HE24221") return "c18"; // 医科学英語論文講読の基礎
}

function isD1Ms(id: string): boolean {
  // TODO: その他学類長が指定する科目 !!B!!
  return (
    id === "HE20142" || // イメージング総論
    id === "HE21101" || // 生命倫理学
    id === "HE21001" || // 医学史
    id === "HE21051" || // 医療・生命科学とテクノロジー
    id === "HC22101" || // 医療経済学
    id === "HE22121" || // 医療経済学 HC22101と同一
    id === "HE23053" // キャリアデザイン研修
  );
}

function isD2Ms(id: string): boolean {
  return (
    id === "HE41170" || // 国際生命医科学研修 Iと書いてあるけどIがつく科目なし !!B!!
    id === "HE41190" || // 国際生命医科学研修II
    id === "HE41200" || // 国際生命医科学研修III
    id === "8070307" || // 国際パートナーシップ研修(中南米)
    id === "8290107" || // 国際パートナーシップ研修(東南アジア)
    id === "HE41175" || // 国際生命医科学 Iと書いてあるけどIがつく科目なし !!B!!
    id === "HE41215" || // 国際生命医科学II
    id === "HE41225" || // 国際生命医科学III
    id === "HE22031" // 実践英語(TOEFL対策)
  );
}

function classifyColumnAImsMspis(id: string): string | undefined {
  if (id === "HE41181") return "a1"; // 健幸医科学グループワーク
  if (
    id === "HE40061" || // 医科学専門語学 I
    id === "HE40071" // 医科学専門語学 II
  )
    return "a2";
  if (id === "HE40081") return "a3"; // 医療科学特論I
  if (id === "HE40091") return "a4"; // 医療科学特論II
  if (
    id === "HE40102" || // 医科学演習 医療科学類国際医療科学主専攻学生に限る
    id === "HE40263" // 医科学演習 国際医療科学主専攻G30コース学生に限る
  )
    return "a5";
  if (
    id === "HE40112" || // 研究演習 医療科学類国際医療科学主専攻学生に限る
    id === "HE40272" // 研究演習 国際医療科学主専攻G30コース学生に限る
  )
    return "a6";
  if (
    id === "HE40113" || // 卒業研究 医療科学類国際医療科学主専攻学生に限る
    id === "HE40273" // 卒業研究 国際医療科学主専攻G30コース学生に限る
  )
    return "a7";
}

function classifyColumnBImsMspis(
  id: string,
  tableYear: number,
): string | undefined {
  if (
    id === "HE32051" || // 遺伝子検査学
    id === "HE41241" || // 遺伝子検査学 国際医療科学主専攻G30コース学生向け
    id === "HE32021" || // 凝固・線溶学
    id === "HE36161" || // ためになる血液学
    id === "HE36121" || // ためになる内分泌代謝学
    id === "HE40161" || // 血管生物学のトピックス
    ((tableYear === 2024 || tableYear === 2025) &&
      (id === "HE36221" || // 実践的オンラインコンテンツ・ツール活用論
        id === "HE36201" || // 自己免疫疾患・アレルギー疾患の病態と臨床
        id === "HE36211")) || // 検査医学とスポーツ医学の密接な接点
    (tableYear >= 2026 && id === "HE32081") || //  法医学概論
    id === "HE36191" || // バイオインフォマティクス !!A!!
    id === "HE34131" || // ゲノム医科学
    id === "HE32002" || // 生化学成分検査学
    id === "HE32061" || // RI検査技術学
    id === "HE40011" || // 病原微生物学 留学生に限る
    id === "HE33001" || // 病原微生物学
    id === "HE40201" || // 免疫検査学 国際医療科学主専攻G30コース学生向け
    id === "HE33041" || // 免疫検査学
    id === "HE33061" || // 輸血学
    id === "HE32071" || // 医学物理学概論
    id === "HE35061" || // 医学検査学
    id === "HE35053" || // 医学検査学実習
    id === "HE34101" || // 先端脳科学
    id === "HE34004" || // 神経科学特論
    id === "HE31001" || // 病理組織学
    id === "HE40131" || // 血液検査学 国際医療科学主専攻G30コース学生向け
    id === "HE31031" || // 血液検査学
    id === "HE34001" || // 生理機能検査学
    id === "HE35081" || // 検査機器学
    id === "HE30001" || // 臨床病態学
    id === "HE40151" || // 臨床病態学 2022年度入学者までが対象
    id === "HE40231" || // 臨床薬理学 国際医療科学主専攻G30コース学生向け !!A!!
    id === "HE30021" || // 臨床薬理学
    id === "HE36151" || // 胚操作・動物実験法(実験動物学)
    id === "HE36111" || // 細胞・発生工学
    (tableYear >= 2026 && id === "HE37151") || // 発生工学と再生医療
    id === "HE37101" || // 医療工学
    id === "HE37141" || // 人工臓器学
    id === "HE35011" || // 検査情報管理学
    id === "HE34035" || // 画像検査学
    id === "HE30031" || // 病態検査学
    id === "HE31021" || // 細胞検査学
    id === "HE39003" || // 臨床実習 平成30年度以前入学の医療科学類学生に限る 2023年のみ開講
    id === "HE39013" || // 臨床実習 2023,2024,2025年開講
    id === "HE39033" || // 臨床実習 令和4年度以降入学者用 2025年のみ開講
    id === "HE39012" || // ケア・コロキウム
    id === "HE35041" || // 医学検査学フロンティア
    id === "HE30033" || // 臨床薬理学実習
    id === "HE33073" || // 輸血学実習
    id === "HE34013" || // 生理機能検査学実習
    id === "HE31043" || // 血液検査学実習
    id === "HE32013" || // 生化学成分検査学実習
    id === "HE31013" || // 病理組織学実習
    id === "HE32053" || // 遺伝子検査学実習
    id === "HE33043" || // 病原微生物学実習I
    id === "HE33063" || // 病原微生物学実習II
    id === "HE33053" || // 免疫検査学実習
    id === "HE39505" || // 医療安全管理学
    (tableYear <= 2025 && id === "HE35051") || // 多職種連携医療学概論
    id === "HE35071" || // 医療科学概論
    id === "HE35002" || // 生体機能診断ワークショップ
    (tableYear >= 2025 && id === "HE24021") || // 医科学のための英語I 2025年度しか開講なし !!B!!
    id === "HE24002" // 主体性演習
  )
    return "b1";
}

function classifyColumnCImsMspis(id: string): string | undefined {
  if (id === "HE24221") return "c1"; // 医科学英語論文講読の基礎
}

function classifyColumnDImsMspis(id: string): string | undefined {
  // TODO: その他学類長が指定する科目 !!B!!
  if (
    id === "HE20142" || // イメージング総論
    id === "HC21081" || // 人体構造学
    id === "HE20013" || // 人体構造学実習
    id === "HC21071" || // 人体機能学
    id === "HE20033" || // 人体機能学実習
    id === "HB21211" || // 医科生化学
    id === "HE20053" || // 生化学実習
    id === "HB21221" || // 医科分子生物学
    id === "HE21001" || // 医学史
    id === "HE21051" || // 医療・生命科学とテクノロジー
    id === "HE21041" || // 基礎医学総論
    id === "HE21021" || // 微生物学 !!A!!
    id === "HE21033" || // 微生物学実習
    id === "HE22001" || // 保健衛生論
    id === "HE22011" || // 医療法制
    id === "HE22021" || // 計量生物学
    id === "HE23021" || // 医用工学
    id === "HE23033" || // 医用工学実習
    id === "HE23041" || // 電磁気学I
    id === "HE35021" || // 医療情報管理学
    id === "HE21101" || // 生命倫理学
    id === "HC22101" || // 医療経済学
    id === "HE22121" || // 医療経済学
    id === "HE23053" || // キャリアデザイン研修
    id === "HE22031" || // 実践英語(TOEFL対策)
    id === "HE41170" || // 国際生命医科学研修
    id === "HE41190" || // 国際生命医科学研修II
    id === "HE41200" || // 国際生命医科学研修III
    id === "8070307" || // 国際パートナーシップ研修(中南米)
    id === "8290107" || // 国際パートナーシップ研修(東南アジア)
    id === "HE41175" || // 国際生命医科学
    id === "HE41215" || // 国際生命医科学II
    id === "HE41225" // 国際生命医科学III
  )
    return "d1";
}

function isE1(id: string, mode: Mode): boolean {
  return (
    id === "1123102" || // ファーストイヤーセミナー
    id === "1227901" || // 学問への誘い
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

function isE3(id: string, name: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "ms":
    case "ims":
      return isCompulsoryEnglishByName(name);
    case "mspis":
      return isJapaneseAsForeignLanguage(id);
    default:
      unreachable(specialty);
  }
}

function isE4(id: string, mode: Mode): boolean {
  return (
    id === "6118101" || // 情報リテラシー(講義) 2024,2025年開講 看護、医療対象
    id === "6119101" || // 情報リテラシー(講義) 2023年開講 医療科学, 総学第3類A班
    id === "6419102" || // 情報リテラシー(演習)
    id === "6519102" || // データサイエンス
    (mode === "real" &&
      (isInfoLiteracyLecture(id) ||
        isInfoLiteracyExercise(id) ||
        isDataScience(id)))
  );
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isG1(id: string): boolean {
  return id === "HE13011"; // 科学実験の基礎
}

function isG2(id: string): boolean {
  return id === "HE13001"; // 医療科学キャリアセミナー
}

function isH1(id: string): boolean {
  return /^[ABCDVWY]/.test(id);
}

function isH2(id: string): boolean {
  return /^[EFGH]/.test(id);
}

function classify(
  id: CourseId,
  name: string,
  specialty: Specialty,
  mode: Mode,
  tableYear: number,
): string | undefined {
  switch (specialty) {
    case "ms": {
      const a = classifyColumnAMs(id);
      if (a !== undefined) return a;
      const c = classifyColumnCMs(id);
      if (c !== undefined) return c;
      const b = classifyColumnBMs(id, tableYear);
      if (b !== undefined) return b;
      if (isD1Ms(id)) return "d1";
      if (isD2Ms(id)) return "d2";
      break;
    }
    case "ims":
    case "mspis": {
      const a = classifyColumnAImsMspis(id);
      if (a !== undefined) return a;
      const c = classifyColumnCImsMspis(id);
      if (c !== undefined) return c;
      const b = classifyColumnBImsMspis(id, tableYear);
      if (b !== undefined) return b;
      const d = classifyColumnDImsMspis(id);
      if (d !== undefined) return d;
      break;
    }
    default:
      unreachable(specialty);
  }

  // 必修
  if (isE1(id, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(id, name, specialty)) return "e3";
  if (isE4(id, mode)) return "e4";
  if (isG1(id)) return "g1";
  if (isG2(id)) return "g2";

  // 選択
  if (isF1(id)) return "f1";
  if (isH1(id)) return "h1";
  if (isH2(id)) return "h2";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
): Map<CourseId, string> {
  const specialty = majorToSpecialtyOrFail(opts.major);
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, specialty, "known", opts.tableYear);
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
    const cellId = classify(c.id, c.name, specialty, "real", opts.tableYear);
    if (cellId !== undefined) {
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
    if (
      (specialty === "ms" || specialty === "ims") &&
      isCompulsoryEnglishByName(c.name)
    ) {
      fakeCourseIdToCellId.set(c.id, "e3");
    }
  }
  return fakeCourseIdToCellId;
}

export function getRemark(
  id: CellId,
  _tableYear: number,
  major: Major,
): string | undefined {
  const specialty = majorToSpecialtyOrFail(major);
  if (specialty === "ims" && id === "b1") {
    return `*と**の条件は判定していません。`;
  }
}

const reqMsSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 2, max: 2 },
    a2: { min: 3, max: 3 },
    a3: { min: 1, max: 1 },
    a4: { min: 1, max: 1 },
    a5: { min: 2, max: 2 },
    a6: { min: 2, max: 2 },
    a7: { min: 2, max: 2 },
    a8: { min: 2, max: 2 },
    a9: { min: 1, max: 1 },
    a10: { min: 3, max: 3 },
    a11: { min: 2, max: 2 },
    a12: { min: 1, max: 1 },
    a13: { min: 1, max: 1 },
    a14: { min: 1, max: 1 },
    a15: { min: 1, max: 1 },
    a16: { min: 2, max: 2 },
    a17: { min: 1, max: 1 },
    a18: { min: 1, max: 1 },
    a19: { min: 1, max: 1 },
    a20: { min: 2, max: 2 },
    a21: { min: 1, max: 1 },
    a22: { min: 1, max: 1 },
    a23: { min: 1, max: 1 },
    a24: { min: 1, max: 1 },
    a25: { min: 4, max: 4 },
    a26: { min: 2, max: 2 },
    a27: { min: 3, max: 3 },
    a28: { min: 1, max: 1 },
    a29: { min: 1, max: 1 },
    a30: { min: 1, max: 1 },
    a31: { min: 1, max: 1 },
    a32: { min: 1, max: 1 },
    a33: { min: 2, max: 2 },
    a34: { min: 2, max: 2 },
    a35: { min: 12, max: 12 },
    a36: { min: 4, max: 4 },
    b1: { min: 6, max: 6 },
    c1: { min: 2, max: 2 },
    c2: { min: 1, max: 1 },
    c3: { min: 2, max: 2 },
    c4: { min: 1, max: 1 },
    c5: { min: 2, max: 2 },
    c6: { min: 1, max: 1 },
    c7: { min: 2, max: 2 },
    c8: { min: 2, max: 2 },
    c9: { min: 2, max: 2 },
    c10: { min: 1, max: 1 },
    c11: { min: 2, max: 2 },
    c12: { min: 1, max: 1 },
    c13: { min: 1, max: 1 },
    c14: { min: 1, max: 1 },
    c15: { min: 1, max: 1 },
    c16: { min: 1, max: 1 },
    c17: { min: 1, max: 1 },
    c18: { min: 1, max: 1 },
    d1: { min: 4, max: 4 },
    d2: { min: 1, max: 1 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 1 },
    g1: { min: 1, max: 1 },
    g2: { min: 1, max: 1 },
    h1: { min: 3, max: 3 },
    h2: { min: 3, max: 3 },
  },
  columns: {
    a: { min: 70, max: 70 },
    b: { min: 6, max: 6 },
    c: { min: 25, max: 25 },
    d: { min: 5, max: 5 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 1 },
    g: { min: 2, max: 2 },
    h: { min: 6, max: 6 },
  },
  compulsory: 109,
  elective: 18,
};

const reqImsMspisSince2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 1, max: 1 },
    a2: { min: 6, max: 6 },
    a3: { min: 1, max: 1 },
    a4: { min: 1, max: 1 },
    a5: { min: 1, max: 1 },
    a6: { min: 2, max: 2 },
    a7: { min: 8, max: 8 },
    b1: { min: 55, max: 55 },
    c1: { min: 1, max: 1 },
    d1: { min: 27, max: 27 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 1 },
    g1: { min: 1, max: 1 },
    g2: { min: 1, max: 1 },
    h1: { min: 3, max: 3 },
    h2: { min: 3, max: 3 },
  },
  columns: {
    a: { min: 20, max: 20 },
    b: { min: 55, max: 55 },
    c: { min: 1, max: 1 },
    d: { min: 27, max: 27 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 1 },
    g: { min: 2, max: 2 },
    h: { min: 6, max: 6 },
  },
  compulsory: 35,
  elective: 89,
};

export function getCreditRequirements(
  _tableYear: number,
  major: Major,
): SetupCreditRequirements {
  const specialty = majorToSpecialtyOrFail(major);
  switch (specialty) {
    case "ms":
      return reqMsSince2023;
    case "ims":
    case "mspis":
      return reqImsMspisSince2023;
    default:
      return unreachable(specialty);
  }
}
