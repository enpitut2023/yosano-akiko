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
  isCompulsoryPe1,
  isCompulsoryPe2,
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
} from "@/conditions/common";

function isA1(id: string): boolean {
  return id === "FCC2733";
}

function isA2(id: string): boolean {
  return id === "FCC3733";
}

function isA3(id: string): boolean {
  return id === "FCC4808";
  // 留学等の特別な理由で事前に申し出た者について、「卒業研究」（10単位）を、
  // 「卒業研究Ⅰ」（５単位）及び「卒業単位Ⅱ」（５単位）の履修により修得を認める
  // 場合がある。「卒業研究Ⅰ」（５単位）、「卒業単位Ⅱ」（５単位）ともにあきこリ
  // ザードン上で発見できず。
}

function isA4(id: string): boolean {
  return (
    id === "FCC2202" || // 解析学入門
    id === "FCC2464" //解析力学
  );
}

function isB1(id: string): boolean {
  return (
    id === "FCC2231" || //量子力学序論(2025開設)
    id === "FCC2234" || //量子力学序論(2023,2024解説)
    id === "FCC2244" || //量子力学Ⅰ
    id === "FCC3134" || //量子力学Ⅱ
    id === "FCC3144" //量子力学Ⅲ
    // 他学類開設の授業で同科目名の授業あり。
  );
}

function isB2(id: string): boolean {
  return (
    id === "FCC2414" || //熱物理学
    id === "FCC3154" || //統計力学Ⅰ
    id === "FCC3164" //統計力学Ⅱ
    // 他学類開設の授業で同科目名の授業あり。
  );
}

function isB3(id: string): boolean {
  return (
    id === "FCC2374" || //専門電磁気学Ⅰ
    id === "FCC2384" || //専門電磁気学Ⅱ
    id === "FCC3094" //専門電磁気学Ⅲ
  );
}

function isB4(id: string): boolean {
  return (
    id.startsWith("FCC2") || id.startsWith("FCC3") || id.startsWith("FCC4")
  );
}

function isD1Native(id: string): boolean {
  return (
    id === "FCB1211" || //力学1(物理学類、化学類、数学類、地球学類、生物学類の学生向け)
    id === "FCB1251" || //力学2(物理学類、化学類、数学類、地球学類、生物学類の学生向け)
    id === "FCB1271" || //力学3(物理学類、化学類、数学類、地球学類、生物学類の学生向け)
    id === "FCB1311" || //電磁気学1(物理学類、化学類、数学類、地球学類、生物学類の学生向け)
    id === "FCB1341" || //電磁気学2(物理学類、化学類、数学類、地球学類、生物学類の学生向け)
    id === "FCB1371" //電磁気学3(物理学類、化学類、数学類、地球学類、生物学類の学生向け)
  );
}

function isD1Foreign(id: string): boolean {
  return (
    id === "FCB1201" || //力学1(応用理工学類・工学システム学類の学生向け)
    id === "FCB1221" || //力学1(医学類・医療科学学類の学生向け)
    id === "FCB1231" || //力学1(総合学域群の学生向け)
    id === "FCB1241" || //力学2(応用理工学類・工学システム学類の学生向け)
    id === "FCB1261" || //力学2(総合学域群の学生向け)
    id === "FCB1281" || //力学3(総合学域群の学生向け)
    id === "FCB1291" || //力学3(応用理工学類・工学システム学類の学生向け)
    id === "FCB1301" || //電磁気学1(総合学域群の学生向け)
    id === "FCB1321" || //電磁気学1(応用理工学類・工学システム学類の学生向け)
    id === "FCB1331" || //電磁気学1(医学類・医療科学類の学生向け)
    id === "FCB1351" || //電磁気学2(総合学域群の学生向け)
    id === "FCB1361" || //電磁気学2(応用理工学類・工学システム学類の学生向け)
    id === "FCB1381" || //電磁気学3(応用理工学類・工学システム学類の学生向け)
    id === "FCB1391" //電磁気学3(総合学域群の学生向け)
  );
}

function isD1(id: string, mode: "known" | "real"): boolean {
  return (
    isD1Native(id) ||
    id === "FCB1401" || // 物理学概論
    // TODO: 別学類のD1該当科目を取ってしまっていたら一応成績には反映されるだろ
    // うと判断。支援室に要確認。
    (mode === "real" && isD1Foreign(id))
  );
}

function isD2Native(id: string, tableYear: number): boolean {
  const until2023 =
    id === "FBA1471" || // 微積分I (物理学類)
    id === "FBA1511" || // 微積分II (物理学類)
    id === "FBA1551" || // 微積分III (物理学類)
    id === "FBA1901"; // 微積分I (再履修者対象. 主に数学類，物理学類，化学類，地球学類の学生)
  const since2023 =
    id === "FA01381" || //微積分1(物理学類の学生(2024年度以降入学者))
    id === "FA01481" || //微積分2(物理学類の学生(2024年度以降入学者))
    id === "FA01581" || //微積分3(物理学類の学生(2024年度以降入学者))
    id === "FA01681" || //線形代数1(物理学類の学生(2024年度以降入学者))
    id === "FA01781" || //線形代数2(物理学類の学生(2024年度以降入学者))
    id === "FA01881" || //線形代数3(物理学類の学生(2024年度以降入学者))
    id === "FA01181" || //数学リテラシー(物理学類の学生)
    id === "FA011B1" || //数学リテラシー(生物学類の学生, および数学類, 物理学類, 化学類, 地球学類の２年次以上の学生)
    id === "FA01281" || //数学リテラシー(物理学類の学生)
    id === "FA012B1"; //数学リテラシー(生物学類の学生, および数学類, 物理学類, 化学類, 地球学類の２年次以上の学生)
  if (tableYear <= 2023) {
    return until2023 || since2023;
  } else {
    return since2023;
  }
}

function isD2Foreign(id: string, tableYear: number): boolean {
  const until2023 =
    id === "FBA1461" || // 微積分I (数学類)
    id === "FBA1481" || // 微積分I (化学類)
    id === "FBA1491" || // 微積分I (地球学類)
    id === "FBA1501" || // 微積分II (数学類)
    id === "FBA1521" || // 微積分II (化学類)
    id === "FBA1531" || // 微積分II (地球学類)
    id === "FBA1541" || // 微積分III (数学類)
    id === "FBA1561" || // 微積分III (化学類)
    id === "FBA1571"; // 微積分III (地球学類)
  const since2023 =
    id === "FA01311" || //微積分1(応用理工学類(学籍番号奇数)の学生)
    id === "FA01321" || //微積分1(応用理工学類(学籍番号偶数)の学生)
    id === "FA01331" || //微積分1(工学システム学類(1,2クラス)の学生)
    id === "FA01341" || //微積分1(工学システム学類(3,4クラス)の学生)
    id === "FA01351" || //微積分1(社会工学類(1,2クラス)の学生)
    id === "FA01361" || //微積分1(社会工学類(3,4クラス)の学生)
    id === "FA01371" || //微積分1(数学類の学生(2024年度以降入学者))
    id === "FA01391" || //微積分1(化学類の学生(2024年度以降入学者))
    id === "FA013A1" || //微積分1(地球学類の学生(2024年度以降入学者))
    id === "FA013C1" || //微積分1(総合学域群の学生)
    id === "FA013D1" || //微積分1(総合学域群の学生)
    id === "FA01411" || //微積分2(応用理工学類(学籍番号奇数)の学生)
    id === "FA01421" || //微積分2(応用理工学類(学籍番号偶数)の学生)
    id === "FA01431" || //微積分2(工学システム学類(1,2クラス)の学生)
    id === "FA01441" || //微積分2(工学システム学類(3,4クラス)の学生)
    id === "FA01451" || //微積分2(社会工学類(1,2クラス)の学生)
    id === "FA01461" || //微積分2(社会工学類(3,4クラス)の学生)
    id === "FA01471" || //微積分2(数学類の学生(2024年度以降入学者))
    id === "FA01491" || //微積分2(化学類の学生(2024年度以降入学者))
    id === "FA014A1" || //微積分2(地球学類の学生(2024年度以降入学者))
    id === "FA014C1" || //微積分2(総合学域群の学生)
    id === "FA014D1" || //微積分2(総合学域群の学生)
    id === "FA01511" || //微積分3(応用理工学類(学籍番号奇数)の学生)
    id === "FA01521" || //微積分3(応用理工学類(学籍番号偶数)の学生)
    id === "FA01531" || //微積分3(工学システム学類(1,2クラス)の学生)
    id === "FA01541" || //微積分3(工学システム学類(3,4クラス)の学生)
    id === "FA01551" || //微積分3(社会工学類(1,2クラス)の学生)
    id === "FA01561" || //微積分3(社会工学類(3,4クラス)の学生)
    id === "FA01571" || //微積分3(数学類の学生(2024年度以降入学者))
    id === "FA01591" || //微積分3(化学類の学生(2024年度以降入学者))
    id === "FA015A1" || //微積分3(地球学類の学生(2024年度以降入学者))
    id === "FA015C1" || //微積分3(総合学域群の学生)
    id === "FA015D1" || //微積分3(総合学域群の学生)
    id === "FA01611" || //線形代数1(応用理工学類(学籍番号奇数)の学生)
    id === "FA01621" || //線形代数1(応用理工学類(学籍番号偶数)の学生)
    id === "FA01631" || //線形代数1(工学システム学類(1,2クラス)の学生)
    id === "FA01641" || //線形代数1(工学システム学類(3,4クラス)の学生)
    id === "FA01651" || //線形代数1(社会工学類(1,2クラス)の学生)
    id === "FA01661" || //線形代数1(社会工学類(3,4クラス)の学生)
    id === "FA01671" || //線形代数1(数学類の学生(2024年度以降入学者))
    id === "FA01691" || //線形代数1(化学類の学生(2024年度以降入学者))
    id === "FA016A1" || //線形代数1(地球学類の学生(2024年度以降入学者))
    id === "FA016C1" || //線形代数1(総合学域群の学生)
    id === "FA016D1" || //線形代数1(総合学域群の学生)
    id === "FA01711" || //線形代数2(応用理工学類(学籍番号奇数)の学生)
    id === "FA01721" || //線形代数2(応用理工学類(学籍番号偶数)の学生)
    id === "FA01731" || //線形代数2(工学システム学類(1,2クラス)の学生)
    id === "FA01741" || //線形代数2(工学システム学類(3,4クラス)の学生)
    id === "FA01751" || //線形代数2(社会工学類(1,2クラス)の学生)
    id === "FA01761" || //線形代数2(社会工学類(3,4クラス)の学生)
    id === "FA01771" || //線形代数2(数学類の学生(2024年度以降入学者))
    id === "FA01791" || //線形代数2(化学類の学生(2024年度以降入学者))
    id === "FA017A1" || //線形代数2(地球学類の学生(2024年度以降入学者))
    id === "FA017C1" || //線形代数2(総合学域群の学生)
    id === "FA017D1" || //線形代数2(総合学域群の学生)
    id === "FA01811" || //線形代数3(応用理工学類(学籍番号奇数)の学生)
    id === "FA01821" || //線形代数3(応用理工学類(学籍番号偶数)の学生)
    id === "FA01831" || //線形代数3(工学システム学類(1,2クラス)の学生)
    id === "FA01841" || //線形代数3(工学システム学類(3,4クラス)の学生)
    id === "FA01851" || //線形代数3(社会工学類(1,2クラス)の学生)
    id === "FA01861" || //線形代数3(社会工学類(3,4クラス)の学生)
    id === "FA01871" || //線形代数3(数学類の学生(2024年度以降入学者))
    id === "FA01891" || //線形代数3(化学類の学生(2024年度以降入学者))
    id === "FA018A1" || //線形代数3(地球学類の学生(2024年度以降入学者))
    id === "FA018C1" || //線形代数3(総合学域群の学生)
    id === "FA018D1" || //線形代数3(総合学域群の学生)
    id === "FA01111" || //数学リテラシー(応用理工学類(学籍番号奇数))
    id === "FA01121" || //数学リテラシー(応用理工学類(学籍番号偶数))
    id === "FA01131" || //数学リテラシー(工学システム学類(1,2クラス)の学生)
    id === "FA01141" || //数学リテラシー(工学システム学類(3,4クラス)の学生)
    id === "FA01151" || //数学リテラシー(社会工学類(1,2クラス)の学生)
    id === "FA01161" || //数学リテラシー(社会工学類(3,4クラス)の学生)
    id === "FA01171" || //数学リテラシー(数学類の学生)
    id === "FA01191" || //数学リテラシー(化学類の学生)
    id === "FA011A1" || //数学リテラシー(地球学類の学生)
    id === "FA011C1" || //数学リテラシー(総合学域群の学生)
    id === "FA011D1" || //数学リテラシー(総合学域群の学生)
    id === "FA011E1" || //数学リテラシー(総合学域群の学生)
    id === "FA01211" || //数学リテラシー(応用理工学類(学籍番号奇数))
    id === "FA01221" || //数学リテラシー(応用理工学類(学籍番号偶数))
    id === "FA01231" || //数学リテラシー(社会工学類(1,2クラス)の学生)
    id === "FA01241" || //数学リテラシー(社会工学類(3,4クラス)の学生)
    id === "FA01251" || //数学リテラシー(社会工学類(1,2クラス)の学生)
    id === "FA01261" || //数学リテラシー(社会工学類(3,4クラス)の学生)
    id === "FA01271" || //数学リテラシー(数学類の学生)
    id === "FA01291" || //数学リテラシー(化学類の学生)
    id === "FA012A1" || //数学リテラシー(地球学類の学生)
    id === "FA012C1" || //数学リテラシー(総合学域群の学生)
    id === "FA012D1" || //数学リテラシー(総合学域群の学生)
    id === "FA012E1" || //数学リテラシー(総合学域群の学生)
    id === "GA15311" || //微分積分A(情報科学類生および総合学域群生(情報科学類への移行希望者・学籍番号の下一桁が奇数)優先)
    id === "GA15321" || //微分積分A(情報科学類生および総合学域群生(情報科学類への移行希望者・学籍番号の下一桁が偶数)優先)
    id === "GA15331" || //微分積分A(情報メディア創成学類生および総合学域群生（情報メディア創成学類への移行希望者）優先)
    id === "GA15341" || //微分積分A(知識学類生および総合学域群生（知識学類への移行希望者）優先)
    id === "GA15211" || //線形代数A(情報科学類生および総合学域群生(情報科学類への移行希望者・学籍番号の下一桁が奇数)優先)
    id === "GA15221" || //線形代数A(情報科学類生および総合学域群生(情報科学類への移行希望者・学籍番号の下一桁が偶数)優先)
    id === "GA15231" || //線形代数A(情報メディア創成学類生および総合学域群生（情報メディア創成学類への移行希望者）優先)
    id === "GA15241"; //線形代数A(知識学類生および総合学域群生（知識学類への移行希望者）優先)
  if (tableYear <= 2023) {
    return until2023 || since2023;
  } else {
    return since2023;
  }
}

function isD2(id: string, mode: "known" | "real", tableYear: number): boolean {
  // 1. 「微積分1,2または微分積分A」、「線形代数1,2または線形代数A」との記述が
  // あったため、線形代数1と線形代数Aを取得していた場合はどちらかのみ加算される
  // と考えられるが、その処理はしていない。
  // 2. "FF18724","FF18734"も「線形代数A」とい名前で解説されているが、シラバス
  // によると、他学類開設の授業であり、この区分に該当する授業ではないと判断した
  // ため、記述していない。
  return (
    isD2Native(id, tableYear) ||
    // TODO: 別学類のD2該当科目を取ってしまっていたら一応成績には反映されるだろ
    // うと判断。支援室に要確認。
    (mode === "real" && isD2Foreign(id, tableYear))
  );
}

function isD3(id: string, tableYear: number): boolean {
  return (
    !isD1Foreign(id) &&
    !isD2Foreign(id, tableYear) &&
    (id.startsWith("FA") ||
      id.startsWith("FB") ||
      (id.startsWith("FC") && !id.startsWith("FCC")) ||
      id.startsWith("FE") ||
      id.startsWith("EE"))
  );
}

function isE1(id: string, mode: "known" | "real"): boolean {
  return (
    id === "1113102" || // ファーストイヤーセミナー
    id === "1227391" || // 学問への誘い
    // TODO: 別学類のE1該当科目を取ってしまっていたら一応成績には反映されるだろ
    // うと判断。支援室に要確認。
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

function isE3(name: string): boolean {
  return isCompulsoryEnglishByName(name);
}

function isE4(id: string): boolean {
  return (
    isInfoLiteracyLecture(id) || isInfoLiteracyExercise(id) || isDataScience(id)
  );
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isF2(id: string): boolean {
  return (
    isElectivePe(id) || isForeignLanguage(id) || isJapanese(id) || isArt(id)
  );
}

function isH1(id: string): boolean {
  return id.startsWith("A") || id.startsWith("B") || id.startsWith("C");
}

function isH2(id: string): boolean {
  if (isKyoushoku(id)) {
    // TODO: 事務に聞いていないので完全に合っているかは不明
    return (
      id.startsWith("9450") || // 数学科教育概論
      id.startsWith("9451") || // 数学教育内容論
      id.startsWith("9452") || // 数学授業研究
      id.startsWith("9453") || // 数学科指導法、数学教材論
      id.startsWith("9454") || // 理科教育概論
      id.startsWith("9455") || // 中等理科教育論
      id.startsWith("9456") || // 中学校理科教育論
      id.startsWith("9457") // 中学校理科教育実践論
    );
  }
  return !(
    id.startsWith("FA") ||
    id.startsWith("FB") ||
    id.startsWith("FC") ||
    id.startsWith("FE") ||
    id.startsWith("EE")
  );
}

function classify(
  id: CourseId,
  name: string,
  mode: "known" | "real",
  tableYear: number,
): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isA2(id)) return "a2";
  if (isA3(id)) return "a3";
  if (isA4(id)) return "a4";
  if (isE1(id, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(name)) return "e3";
  if (isE4(id)) return "e4";
  // 選択
  if (isB1(id)) return "b1";
  if (isB2(id)) return "b2";
  if (isB3(id)) return "b3";
  if (isB4(id)) return "b4";
  if (isD1(id, mode)) return "d1";
  if (isD2(id, mode, tableYear)) return "d2";
  if (isD3(id, tableYear)) return "d3";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
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
    a1: { min: 2, max: 2 },
    a2: { min: 6, max: 6 },
    a3: { min: 10, max: 10 },
    a4: { min: 3, max: 3 },
    b1: { min: 5, max: 11 },
    b2: { min: 5, max: 8 },
    b3: { min: 2, max: 6 },
    b4: { min: 23, max: 47 },
    d1: { min: 5, max: 7 },
    d2: { min: 4, max: 8 },
    d3: { min: 16, max: 34 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 6 },
    f2: { min: 0, max: 18 },
    h1: { min: 6, max: 8 },
    h2: { min: 0, max: 18 },
  },
  columns: {
    a: { min: 21, max: 21 },
    b: { min: 35, max: 59 },
    d: { min: 25, max: 49 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 24 },
    h: { min: 6, max: 24 },
  },
  compulsory: 33,
  elective: 91,
};

export const creditRequirementsSince2025: SetupCreditRequirements = {
  cells: {
    a1: { min: 2, max: 2 },
    a2: { min: 6, max: 6 },
    a3: { min: 10, max: 10 },
    a4: { min: 3, max: 3 },
    b1: { min: 6, max: 10 },
    b2: { min: 5, max: 8 },
    b3: { min: 2, max: 6 },
    b4: { min: 22, max: 48 },
    d1: { min: 5, max: 7 },
    d2: { min: 4, max: 8 },
    d3: { min: 16, max: 34 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 6 },
    f2: { min: 0, max: 18 },
    h1: { min: 6, max: 8 },
    h2: { min: 0, max: 18 },
  },
  columns: {
    a: { min: 21, max: 21 },
    b: { min: 35, max: 59 },
    d: { min: 25, max: 49 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 24 },
    h: { min: 6, max: 24 },
  },
  compulsory: 33,
  elective: 91,
};
