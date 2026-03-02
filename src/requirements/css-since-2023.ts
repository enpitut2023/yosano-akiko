import {
  CourseId,
  FakeCourse,
  FakeCourseId,
  KnownCourse,
  RealCourse,
} from "@/akiko";
import { ClassifyOptions, SetupCreditRequirements } from "@/app-setup";
import {
  isCompulsoryEnglishByName,
  isSecondForeignLanguage,
  isCompulsoryPe1,
  isCompulsoryPe2,
  isDataScience,
  isFirstYearSeminar,
  isGakushikiban,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
  isKyoushoku,
  isElectivePe,
  isForeignLanguage,
  isJapanese,
  isJiyuukamoku,
  isHakubutsukan,
  isArt,
} from "@/requirements/common";
import { unreachable } from "@/util";

export type Specialty =
  // Sociology（社会学）
  | "s"
  // Law（法学）
  | "l"
  // Political Science（政治学）
  | "ps"
  // Economics（経済学）
  | "e";


// TODO:
// 全ての主専攻で2023→2024,2025で、h2にVから始まる科目が追加され、単位数の上限が20→34まで増えた。
// 全ての主専攻で2023→2024,2025で、h3の単位数の上限が10→26まで増えた。
// TODO:
// ps（政治学）の2023,2024→2025で、b1,b2がまとめてb1となっている。（BB32、BB31→BB3）


function isA1(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "s":
      return (
        id === "BB11998" // 卒業論文
      );
    case "l":
    case "ps":
    case "e":
      return false;
    default:
      unreachable(specialty);
  }
}

function isA2(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "s":
      return (
        id === "BB11997" // 卒業論文演習
      );
    case "l":
    case "ps":
    case "e":
      return false;
    default:
      unreachable(specialty);
  }
}

function isA3(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "s":
      return (
        id === "BB11932" || // 社会学研究法A
        id === "BB11942" // 社会学研究法B
      );
    case "l":
    case "ps":
    case "e":
      return false;
    default:
      unreachable(specialty);
  }
}

function isB1(id: string, specialty: Specialty, tableYear: number): boolean {
  switch (specialty) {
    // TODO:BB1から始まる科目が該当するのだが、「社会調査実習、社会学演習から12単位修得すること。（必ず社会学演習を6単位以上含めること）」というB1の中にも単位数の制限がある。
    case "s":
      return (
        id.startsWith("BB1")
      );
    // TODO:BB2から始まる科目が該当するのだが、「憲法I、憲法II、民法総則、刑法総論から4単位以上習得すること。ＢＢ２の演習科目から6単位以上修得すること」というB1の中にも単位数の制限がある。
    case "l":
      return (
        id.startsWith("BB2")
      );
    // TODO:2025年度だけ、BB3から始まる科目（ただし、BB32を6単位以上含めること）という制限がある。
    case "ps":
      if (tableYear == 2023 || tableYear == 2024) {
        // 2023, 2024
        return (
          id.startsWith("BB32")
        );
      } else {
        // 2025
        return (
          id.startsWith("BB3")
        )
      };


    // TODO:BB4から始まる科目が該当するのだが、「(ただしミクロ経済学、マクロ経済学、経済統計論のうちから4単位以上、さらに経済学演習を8単位以上含めること)」という制限がある。
    // TODO:BC,FHから始まる科目が該当するのだが、「（これらのうち別途指定する科目のみ）」という制限がある。これらのうち別途指定する科目って何？
    case "e":
      return (
        id.startsWith("BB4") ||
        id.startsWith("BC") ||
        id.startsWith("FH")
      );
    default:
      unreachable(specialty);
  }
}

function isB2(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    // BB2,BB3,BB4から始まる科目。（専門基礎科目として指定されている科目を除く）
    case "s":
      return (
        (id.startsWith("BB2") ||
          id.startsWith("BB3") ||
          id.startsWith("BB4")) &&
        !isC1(id, specialty) &&
        !isD1(id, specialty) &&
        !isD2(id)
      );
    // BB1,BB3,BB4から始まる科目。（専門基礎科目として指定されている科目を除く）
    case "l":
      return (
        (id.startsWith("BB1") ||
          id.startsWith("BB3") ||
          id.startsWith("BB4")) &&
        !isC1(id, specialty) &&
        !isD1(id, specialty) &&
        !isD2(id)
      );
    case "ps":
      return (
        id.startsWith("BB31")
      );
    // BB1,BB2,BB3から始まる科目。（専門基礎科目として指定されている科目を除く）
    case "e":
      return (
        (id.startsWith("BB1") ||
          id.startsWith("BB2") ||
          id.startsWith("BB3")) &&
        !isC1(id, specialty) &&
        !isD1(id, specialty) &&
        !isD2(id)
      );
    default:
      unreachable(specialty);
  }
}

function isB3(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "s":
      return false;
    case "l":
      return (
        id.startsWith("AB00") ||
        id.startsWith("AB60") ||
        id.startsWith("BC11")
      );
    // BB1,BB2,BB4から始まる科目。（専門基礎科目として指定されている科目を除く）
    case "ps":
      return (
        id.startsWith("BB1") ||
        id.startsWith("BB2") ||
        id.startsWith("BB4") &&
        !isC1(id, specialty) &&
        !isD1(id, specialty) &&
        !isD2(id)
      );
    case "e":
      return false;
    default:
      unreachable(specialty);
  }
}

function isC1(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    // TODO:現代社会論はどっちでもいいのか？
    case "s":
      return (
        id === "BB11011" || // 社会学基礎論
        id === "BB11021" || // 現代社会論
        id === "BC11801" // 現代社会論
      );
    // TODO:法学概論はどっちでもいいのか？
    case "l":
      return (
        id === "BB20001" || // 法学概論
        id === "BC51151" || // 法学概論
        id === "BB20021" // 民事法概論
      );
    // TODO:国際政治史はどっちでもいいのか？
    case "ps":
      return (
        id === "BB31011" || // 政治学概論
        id === "BB31031" || // 国際政治史
        id === "BC11651" // 国際政治史
      );
    case "e":
      return (
        id === "BB41051" || // 経済学基礎論
        id === "BB41061" // 現代経済史
      );
    default:
      unreachable(specialty);
  }
}

function isD1(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "s":
      return (
        id === "BB20001" || // 法学概論
        id === "BC51151" || // 法学概論
        id === "BB20021" || // 民事法概論
        id === "BB31011" || // 政治学概論
        id === "BB31031" || // 国際政治史
        id === "BC11651" || // 国際政治史
        id === "BB41051" || // 経済学基礎論
        id === "BB41061" // 現代経済史
      );
    case "l":
      return (
        id === "BB11011" || // 社会学基礎論
        id === "BB11021" || // 現代社会論
        id === "BC11801" || // 現代社会論
        id === "BB31011" || // 政治学概論
        id === "BB31031" || // 国際政治史
        id === "BC11651" || // 国際政治史
        id === "BB41051" || // 経済学基礎論
        id === "BB41061" // 現代経済史
      );
    case "ps":
      return (
        id === "BB11011" || // 社会学基礎論
        id === "BB11021" || // 現代社会論
        id === "BC11801" || // 現代社会論
        id === "BB20001" || // 法学概論
        id === "BC51151" || // 法学概論
        id === "BB20021" || // 民事法概論
        id === "BB41051" || // 経済学基礎論
        id === "BB41061" // 現代経済史
      );
    case "e":
      return (
        id === "BB11011" || // 社会学基礎論
        id === "BB11021" || // 現代社会論
        id === "BC11801" || // 現代社会論
        id === "BB20001" || // 法学概論
        id === "BC51151" || // 法学概論
        id === "BB20021" || // 民事法概論
        id === "BB31011" || // 政治学概論
        id === "BB31031" || // 国際政治史
        id === "BC11651" // 国際政治史
      );
    default:
      unreachable(specialty);
  }
}

function isD2(id: string): boolean {
  return (
    id === "BB05011" || // 社会学の最前線
    id === "BB05021" || // 法学の最前線
    id === "BB05031" || // 政治学の最前線
    id === "BB05041" // 経済学の最前線
  );
}


function isD3(id: string): boolean {
  return (
    id === "BA91012" || // 社会学の最前線チュートリアル
    id === "BA91022" || // 法学の最前線チュートリアル
    id === "BA91032" || // 政治学の最前線チュートリアル
    id === "BA91042" // 経済学の最前線チュートリアル
  );
}

function isE1(id: string, mode: "known" | "real"): boolean {
  return (
    id === "1104102" || // ファーストイヤーセミナー 1クラス
    id === "1104202" || // ファーストイヤーセミナー 2クラス
    id === "1104302" || // ファーストイヤーセミナー 3クラス
    id === "1227131" || // 学問への誘い 1クラス
    id === "1227141" || // 学問への誘い 2クラス
    id === "1227151" || // 学問への誘い 3クラス
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

// TODO:第1外国語が英語に限定されないかもしれないから要確認
function isE3(name: string): boolean {
  return isCompulsoryEnglishByName(name); // 第1外国語
}

function isE4(id: string): boolean {
  return isSecondForeignLanguage(id); // 第2外国語
}

function isE5(id: string, mode: "known" | "real"): boolean {
  return (
    id === "6104101" || // 情報リテラシー(講義) !!A!!
    id === "6404102" || // 情報リテラシー(演習) 1班 !!A!!
    id === "6404202" || // 情報リテラシー(演習) 2班 !!A!!
    id === "6504102" || // データサイエンス 1班 !!A!!
    id === "6504202" || // データサイエンス 2班 !!A!!
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

function isF3(id: string): boolean {
  return isForeignLanguage(id);
}

function isF4(id: string): boolean {
 return isJapanese(id);
}

function isF5(id: string): boolean {
  return isArt(id);
}

function isH1(id: string): boolean {
  //教職に関する科目
  return isKyoushoku(id);
}

function isH2(id: string, specialty: Specialty, tableYear: number): boolean {
  switch (specialty) {
    // Ａ、ＢＣ、Ｃ、Ｈ、Ｗ、Ｙ、８、９９から始まる科目
    case "s":
      if (tableYear == 2023) {
        // 2023
        return (
          id.startsWith("A") ||
          id.startsWith("BC") ||
          id.startsWith("C") ||
          id.startsWith("H") ||
          id.startsWith("W") ||
          id.startsWith("Y") ||
          id.startsWith("8") ||
          id.startsWith("99")
        );
      } else {
        // 2024,2025
        return (
          id.startsWith("A") ||
          id.startsWith("BC") ||
          id.startsWith("C") ||
          id.startsWith("H") ||
          id.startsWith("W") ||
          id.startsWith("Y") ||
          id.startsWith("V") ||
          id.startsWith("8") ||
          id.startsWith("99")
        );
      };

    // Ａ、ＢＣ、Ｃ、Ｈ、Ｗ、Ｙ、８、９９から始まる科目(ＡＢ００、ＡＢ６０、ＢＣ１１は除く)
    case "l":
      if (tableYear == 2023) {
        // 2023
        return (
          (id.startsWith("A") && !(id.startsWith("AB00") || id.startsWith("AB60"))) ||
          (id.startsWith("BC") && !(id.startsWith("BC11"))) ||
          id.startsWith("C") ||
          id.startsWith("H") ||
          id.startsWith("W") ||
          id.startsWith("Y") ||
          id.startsWith("8") ||
          id.startsWith("99")
        );
      } else {
        // 2024,2025
        return (
          (id.startsWith("A") && !(id.startsWith("AB00") || id.startsWith("AB60"))) ||
          (id.startsWith("BC") && !(id.startsWith("BC11"))) ||
          id.startsWith("C") ||
          id.startsWith("H") ||
          id.startsWith("W") ||
          id.startsWith("Y") ||
          id.startsWith("V") ||
          id.startsWith("8") ||
          id.startsWith("99")
        )
      };
    // Ａ、ＢＣ、Ｃ、Ｈ、Ｗ、Ｙ、８、９９から始まる科目
    case "ps":
      if (tableYear == 2023) {
        // 2023
        return (
          id.startsWith("A") ||
          id.startsWith("BC") ||
          id.startsWith("C") ||
          id.startsWith("H") ||
          id.startsWith("W") ||
          id.startsWith("Y") ||
          id.startsWith("8") ||
          id.startsWith("99")
        );
      } else {
        // 2024,2025
        return (
          id.startsWith("A") ||
          id.startsWith("BC") ||
          id.startsWith("C") ||
          id.startsWith("H") ||
          id.startsWith("W") ||
          id.startsWith("Y") ||
          id.startsWith("V") ||
          id.startsWith("8") ||
          id.startsWith("99")
        )
      };

    // Ａ、ＢＣ、Ｃ、Ｈ、Ｗ、Ｙ、８、９９（専門科目として指定されている科目を除く）
    // TODO:BCのうち別途指定する科目のみ除くっぽい
    case "e":
      if (tableYear == 2023) {
        // 2023
        return (
          id.startsWith("A") ||
          (id.startsWith("BC") && !(id.startsWith("BC00000"))) ||
          id.startsWith("C") ||
          id.startsWith("H") ||
          id.startsWith("W") ||
          id.startsWith("Y") ||
          id.startsWith("8") ||
          id.startsWith("99")
        );
      } else {
        // 2024,2025
        return (
          id.startsWith("A") ||
          (id.startsWith("BC") && !(id.startsWith("BC00000"))) ||
          id.startsWith("C") ||
          id.startsWith("H") ||
          id.startsWith("W") ||
          id.startsWith("Y") ||
          id.startsWith("V") ||
          id.startsWith("8") ||
          id.startsWith("99")
        )
      };
    default:
      unreachable(specialty);
  }
}


function isH3(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    // Ｅ、Ｆ、Ｇから始まる科目
    case "s":
      return (
        id.startsWith("E") ||
        id.startsWith("F") ||
        id.startsWith("G")
      );
    // Ｅ、Ｆ、Ｇから始まる科目
    case "l":
      return (
        id.startsWith("E") ||
        id.startsWith("F") ||
        id.startsWith("G")
      );
    // Ｅ、Ｆ、Ｇから始まる科目
    case "ps":
      return (
        id.startsWith("E") ||
        id.startsWith("F") ||
        id.startsWith("G")
      );
    // Ｅ、Ｆ、Ｇから始まる科目（専門科目として指定されている科目を除く）
    // TODO:FH全てじゃなくて別途指定する科目のみかも
    case "e":
      return (
        id.startsWith("E") ||
        (id.startsWith("F") && !(id.startsWith("FH"))) ||
        id.startsWith("G") 
      );
    default:
      unreachable(specialty);
  }
}

function isH4(id: string): boolean {
  // ＢＡ（専門基礎科目として指定されている科目を除く）、 ＢＥから始まる科目
  return (
    (id.startsWith("BA") && !(id === "BA91012" || id === "BA91022" || id === "BA91032" || id === "BA91042")) ||
    id.startsWith("BE")
  );
}

function classify(
  id: CourseId,
  name: string,
  specialty: Specialty,
  tableYear: number,
  mode: "known" | "real",
): string | undefined {
  // 必修
  if (isA1(id, specialty)) return "a1";
  if (isA2(id, specialty)) return "a2";
  if (isA3(id, specialty)) return "a3";
  if (isC1(id, specialty)) return "c1";
  if (isE1(id, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(name)) return "e3";
  if (isE4(id)) return "e4";
  if (isE5(id, mode)) return "e5";
  // 選択
  if (isB1(id, specialty, tableYear)) return "b1";
  if (isB2(id, specialty)) return "b2";
  if (isB3(id, specialty)) return "b3";
  if (isD1(id, specialty)) return "d1";
  if (isD2(id)) return "d2";
  if (isD3(id)) return "d3";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isF3(id)) return "f3";
  if (isF4(id)) return "f4";
  if (isF5(id)) return "f5";
  if (isH1(id)) return "h1";
  if (isH2(id, specialty, tableYear)) return "h2";
  if (isH3(id, specialty)) return "h3";
  if (isH4(id)) return "h4";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  _opts: ClassifyOptions,
  tableYear: number,
  specialty: Specialty,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, specialty, tableYear, "known");
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  _opts: ClassifyOptions,
  tableYear: number,
  specialty: Specialty,
): Map<CourseId, string> {
  cs = Array.from(cs);
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, c.name, specialty, tableYear, "real");
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  cs: FakeCourse[],
  _opts: ClassifyOptions,
  _year: number,
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

export const creditRequirementsS20242025: SetupCreditRequirements = {
  cells: {
    a1: { min: 6, max: 6 },
    a2: { min: 4, max: 4 },
    a3: { min: 2, max: 2 },
    b1: { min: 30, max: 56 },
    b2: { min: 19, max: 44 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 34 },
    h3: { min: 2, max: 26 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    a: { min: 12, max: 12 },
    b: { min: 49, max: 74 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 32,
  elective: 94,
};

export const creditRequirementsS2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 6, max: 6 },
    a2: { min: 4, max: 4 },
    a3: { min: 2, max: 2 },
    b1: { min: 30, max: 56 },
    b2: { min: 19, max: 44 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 20 },
    h3: { min: 2, max: 20 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    a: { min: 12, max: 12 },
    b: { min: 49, max: 74 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 32,
  elective: 94,
};

// TODO:aが無い主専攻なので書いてないけど大丈夫？
export const creditRequirementsL20242025: SetupCreditRequirements = {
  cells: {
    b1: { min: 40, max: 62 },
    b2: { min: 21, max: 42 },
    b3: { min: 0, max: 10 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 34 },
    h3: { min: 2, max: 26 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    b: { min: 61, max: 84 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 20,
  elective: 106,
};

export const creditRequirementsL2023: SetupCreditRequirements = {
  cells: {
    b1: { min: 40, max: 62 },
    b2: { min: 21, max: 42 },
    b3: { min: 0, max: 10 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 20 },
    h3: { min: 2, max: 10 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    b: { min: 61, max: 84 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 20,
  elective: 106,
};

// TODO:aが無い主専攻なので書いてないけど大丈夫？
export const creditRequirementsPs2025: SetupCreditRequirements = {
  cells: {
    b1: { min: 30, max: 53 },
    b2: { min: 31, max: 54 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 34 },
    h3: { min: 2, max: 26 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    b: { min: 61, max: 84 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 20,
  elective: 106,
};

export const creditRequirementsPs2024: SetupCreditRequirements = {
  cells: {
    b1: { min: 6, max: 12 },
    b2: { min: 24, max: 42 },
    b3: { min: 31, max: 54 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 34 },
    h3: { min: 2, max: 26 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    b: { min: 61, max: 84 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 20,
  elective: 106,
};

export const creditRequirementsPs2023: SetupCreditRequirements = {
  cells: {
    b1: { min: 6, max: 12 },
    b2: { min: 24, max: 42 },
    b3: { min: 31, max: 54 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 20 },
    h3: { min: 2, max: 10 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    b: { min: 61, max: 84 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 20,
  elective: 106,
};

// TODO:aが無い主専攻なので書いてないけど大丈夫？
export const creditRequirementsE20242025: SetupCreditRequirements = {
  cells: {
    b1: { min: 32, max: 62 },
    b2: { min: 29, max: 50 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 34 },
    h3: { min: 2, max: 26 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    b: { min: 61, max: 84 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 20,
  elective: 106,
};

export const creditRequirementsE2023: SetupCreditRequirements = {
  cells: {
    b1: { min: 32, max: 62 },
    b2: { min: 29, max: 50 },
    c1: { min: 4, max: 4 },
    d1: { min: 6, max: 12 },
    d2: { min: 2, max: 4 },
    d3: { min: 0, max: 4 },
    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 2 },
    f3: { min: 0, max: 6 },
    f4: { min: 0, max: 2 },
    f5: { min: 0, max: 2 },
    h1: { min: 0, max: 8 },
    h2: { min: 10, max: 20 },
    h3: { min: 2, max: 10 },
    h4: { min: 0, max: 12 },
  },
  columns: {
    b: { min: 61, max: 84 },
    c: { min: 4, max: 4 },
    d: { min: 8, max: 20 },
    e: { min: 16, max: 16 },
    f: { min: 1, max: 15 },
    h: { min: 12, max: 36 },
  },
  compulsory: 20,
  elective: 106,
};