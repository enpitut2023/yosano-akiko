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
  isKyoushoku,
} from "@/requirements/common";
import { arrayRemove } from "@/util";

function isA1(id: string): boolean {
  return id === "FB14908"; // 卒業研究
}

function isA2(id: string): boolean {
  return id === "FB13901"; // 卒業予備研究
}

function isA3(id: string): boolean {
  return (
    // 数学外書輪講II
    id === "FB13501" || // 学籍番号の下5桁が10800未満
    id === "FB13511" || // 学籍番号の下5桁が11600以上
    id === "FB13521" // 学籍番号の下5桁が10800以上11600未満
  );
}

function isB1(id: string): boolean {
  return (
    id.startsWith("FB12") || id.startsWith("FB13") || id.startsWith("FB14")
  );
}

function isC1(id: string, isNative: boolean): boolean {
  return (
    id === "FA01371" || //微積分1(2024以降)
    id === "FA01471" || //微積分2(2024以降)
    //微分積分Aは総合に所属時にのみ認める
    (!isNative &&
      (id === "GA15311" || //微分積分A 情報科学類1・2クラス
        id === "GA15321" || //微分積分A 情報科学類3・4クラス
        id === "GA15331" || //微分積分A 情報メディア創成学類生および総合学域群生
        id === "GA15341")) //微分積分A 知識学類生および総合学域群生
  );
}

function isC2(id: string, isNative: boolean): boolean {
  return (
    id === "FA01671" || //線形代数1(2024以降)
    id === "FA01771" || //線形代数2(2024以降)
    //線形代数Aは総合に所属時にのみ認める
    (!isNative &&
      (id === "FF18724" || //線形代数A 応用理工学類1・2クラス
        id === "FF18734" || //線形代数A 応用理工学類3・4クラス
        id === "GA15211" || //線形代数A 情報科学類生1・2クラスおよび総合学域群生
        id === "GA15221" || //線形代数A 情報科学類生3・4クラスおよび総合学域群生
        id === "GA15231" || //線形代数A 情報メディア創成学類生および総合学域群生
        id === "GA15241")) //線形代数A 知識学類生および総合学域群生
  );
}

function isC3(id: string): boolean {
  return (
    id === "FA01171" || //数学リテラシー1(数学類1年次)
    id === "FA011B1" //数学リテラシー1(数学類, 物理学類, 化学類, 地球学類2年次)
  );
}

function isC4(id: string): boolean {
  return (
    id === "FA01271" || //数学リテラシー2(数学類1年次)
    id === "FA012B1" //数学リテラシー2(数学類, 物理学類, 化学類, 地球学類2年次)
  );
}

function isD1(id: string): boolean {
  return (
    id.startsWith("FBA") ||
    id.startsWith("FC") ||
    id.startsWith("FE") ||
    id.startsWith("EE") ||
    id === "FA01571" || //微積分3
    id === "FA01871" || //線形代数3
    id === "EB00001" || //生物学序説(秋AB)
    id === "EB00011" || //生物学序説(春C)
    id === "EB00021" || //生物学序説(春A)
    id === "EB11311" || //遺伝学概論(春C)
    id === "EB11351" || //遺伝学概論(秋C)
    id === "EB11221" || //分子細胞生物学概論(春B)
    id === "EB11251" || //分子細胞生物学概論(秋AB)
    id === "EB11131" || //系統分類・進化学概論(秋A)
    id === "EB11151" || //系統分類・進化学概論(秋C)
    id === "EB11611" || //生態学概論(秋A)
    id === "EB11651" || //生態学概論(秋AB)
    id === "EB11721" || //動物生理学概論(秋B)
    id === "EB11751" || //動物生理学概論(春AB)
    id === "EB11811" || //植物生理学概論(秋B)
    id === "EB11851" //植物生理学概論(春AB)
  );
}

function isE1(id: string): boolean {
  return (
    id === "1112102" || //ファーストイヤーセミナー
    id === "1227371" //学問への誘い
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
    id === "6112101" || //情報リテラシー(講義)
    id === "6412102" || //情報リテラシー(演習)
    id === "6512102" //データサイエンス
  );
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isF2(id: string): boolean {
  // TODO: 体育3,4必修をどうする？
  return (
    isGakushikiban(id) ||
    isElectivePe(id) ||
    isForeignLanguage(id) ||
    isJapanese(id) ||
    isArt(id)
  );
}

function isH1(id: string): boolean {
  if (isKyoushoku(id)) {
    // TODO: 事務に聞いていないので完全に合っているかは不明
    return (
      id.startsWith("9450") || // 数学科教育概論
      id.startsWith("9451") || // 数学教育内容論
      id.startsWith("9452") || // 数学授業研究
      id.startsWith("9453") // 数学科指導法、数学教材論
    );
  }
  return true;
}

function classify(
  id: CourseId,
  name: string,
  isNative: boolean,
): string | undefined {
  // 必修
  if (isA1(id)) return "a1";
  if (isA2(id)) return "a2";
  if (isA3(id)) return "a3";
  if (isC1(id, isNative)) return "c1";
  if (isC2(id, isNative)) return "c2";
  if (isC3(id)) return "c3";
  if (isC4(id)) return "c4";
  if (isE1(id)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(name)) return "e3";
  if (isE4(id)) return "e4";
  // 選択
  if (isB1(id)) return "b1";
  if (isD1(id)) return "d1";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isH1(id)) return "h1";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
  year: number,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, true);
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
): Map<CourseId, string> {
  cs = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();

  // f1とf2に学士基盤が入るので、先にf1に入る分は入れておく
  const firstGakushikiban = cs.find((c) => isGakushikiban(c.id));
  if (firstGakushikiban !== undefined) {
    courseIdToCellId.set(firstGakushikiban.id, "f1");
    arrayRemove(cs, firstGakushikiban);
  }

  for (const c of cs) {
    const cellId = classify(c.id, c.name, opts.isNative);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  cs: FakeCourse[],
  opts: ClassifyOptions,
  year: number,
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
    a1: { min: 9, max: 9 },
    a2: { min: 3, max: 3 },
    a3: { min: 2, max: 2 },
    b1: { min: 46, max: 70 },
    c1: { min: 2, max: 2 },
    c2: { min: 2, max: 2 },
    c3: { min: 1, max: 1 },
    c4: { min: 1, max: 1 },
    d1: { min: 15, max: 47 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 1 },
    f2: { min: 0, max: 16 },
    h1: { min: 6, max: 16 },
  },
  columns: {
    a: { min: 14, max: 14 },
    b: { min: 46, max: 70 },
    c: { min: 6, max: 6 },
    d: { min: 15, max: 47 },
    e: { min: 12, max: 12 },
    f: { min: 1, max: 17 },
    h: { min: 6, max: 16 },
  },
  compulsory: 32,
  elective: 92,
};
