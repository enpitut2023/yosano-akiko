import { KnownCourse, CourseId, RealCourse, FakeCourseId } from "../../akiko";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRect from "./cell-id-to-rect.json";

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

function isA3(id: string): boolean {
  //専門英語B
  return (
    id === "GE50712" || // 知識科学全員と情報システムの一部
    id === "GE50722" || // 2025年開講せず。2024までは情報システムの全員
    id === "GE50732" //情報資源経営全員と情報システムの一部
  );
}

function isA4(id: string): boolean {
  return id === "GE50822"; // 専門英語C
}

function isA5(id: string): boolean {
  return id === "GE70113"; // 知識情報システム実習A
}

function isA6(id: string): boolean {
  return id === "GE70123"; // 知識情報システム実習B
}

function isB1(id: string): boolean {
  return id.startsWith("GE7") && id !== "GE70113" && id !== "GE70123";
}

function isB2(id: string): boolean {
  return (
    id !== "GE80401" && // 経営情報システム論
    id !== "GE61901" && // 情報検索システム
    id !== "GE62401" && // Machine Learning and Information Retrieval
    id !== "GE62501" && // Human Information Interaction
    id !== "GE61801" && // データ構造とアルゴリズム
    (id.startsWith("GA4") ||
      id.startsWith("GE4") ||
      id.startsWith("GE6") ||
      id.startsWith("GE8"))
  );
}

function isC1(id: string): boolean {
  return id === "GA14121" || id === "GA14111"; //知識情報概論
}

function isC2(id: string): boolean {
  return (
    id === "GE12112" || id === "GE12122" || id === "GE12132" || id === "GE12142"
  ); //アカデミックスキルズ
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
  return id === "GA15141"; // 情報数学A
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
  return id === "GE11612" || id === "GE11632" || id === "GE11642"; // 専門英語A1
}

function isC9(id: string): boolean {
  return id === "GE11712" || id === "GE11732" || id === "GE11742"; //専門英語A2
}

function isC10(id: string): boolean {
  return id === "GE11012" || id === "GE11022"; // 知能情報演習I
}

function isC11(id: string): boolean {
  return id === "GE11112" || id === "GE11122"; // 知能情報演習II
}

function isC12(id: string): boolean {
  return id === "GE11212" || id === "GE11222"; // 知能情報演習III
}

function isD1(id: string): boolean {
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

function isF1(id: string): boolean {
  return (
    (id.startsWith("12") || id.startsWith("14")) &&
    // 総合科目(学士基盤科目)
    !["27", "28", "30", "90"].includes(id.substring(2, 4))
  );
}

function isF2(id: string): boolean {
  return (
    // 体育（自由科目）、外国語、国語、芸術
    (id.startsWith("28") ||
      id.startsWith("3") ||
      id.startsWith("4") ||
      id.startsWith("5")) &&
    // 必修の外国語を除外
    !(
      id.startsWith("31H") ||
      id.startsWith("31J") ||
      id.startsWith("31K") ||
      id.startsWith("31L")
    )
  );
}

function isH1(id: string): boolean {
  return (
    !(
      id.startsWith("GA") ||
      id.startsWith("GB") ||
      id.startsWith("GC") ||
      id.startsWith("GE") ||
      // 共通科目及び教職に関する科目
      id.match(/^\d/)
    ) ||
    id.startsWith("8") ||
    id.startsWith("99")
  );
}

function isH2(id: string): boolean {
  return id.startsWith("GC") || id.startsWith("GB");
}

function classifyKnownCourses(cs: KnownCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    // 必修
    if (isA1(c.id)) {
      courseIdToCellId.set(c.id, "a1");
    } else if (isA2(c.id)) {
      courseIdToCellId.set(c.id, "a2");
    } else if (isA3(c.id)) {
      courseIdToCellId.set(c.id, "a3");
    } else if (isA4(c.id)) {
      courseIdToCellId.set(c.id, "a4");
    } else if (isA5(c.id)) {
      courseIdToCellId.set(c.id, "a5");
    } else if (isA6(c.id)) {
      courseIdToCellId.set(c.id, "a6");
    } else if (isC1(c.id)) {
      courseIdToCellId.set(c.id, "c1");
    } else if (isC2(c.id)) {
      courseIdToCellId.set(c.id, "c2");
    } else if (isC3(c.id)) {
      courseIdToCellId.set(c.id, "c3");
    } else if (isC4(c.id)) {
      courseIdToCellId.set(c.id, "c4");
    } else if (isC5(c.id)) {
      courseIdToCellId.set(c.id, "c5");
    } else if (isC6(c.id)) {
      courseIdToCellId.set(c.id, "c6");
    } else if (isC7(c.id)) {
      courseIdToCellId.set(c.id, "c7");
    } else if (isC8(c.id)) {
      courseIdToCellId.set(c.id, "c8");
    } else if (isC9(c.id)) {
      courseIdToCellId.set(c.id, "c9");
    } else if (isC10(c.id)) {
      courseIdToCellId.set(c.id, "c10");
    } else if (isC11(c.id)) {
      courseIdToCellId.set(c.id, "c11");
    } else if (isC12(c.id)) {
      courseIdToCellId.set(c.id, "c12");
    } else if (isE1(c.id)) {
      courseIdToCellId.set(c.id, "e1");
    } else if (isE2(c.id)) {
      courseIdToCellId.set(c.id, "e2");
    }
    // 選択
    else if (isB1(c.id)) {
      courseIdToCellId.set(c.id, "b1");
    } else if (isB2(c.id)) {
      courseIdToCellId.set(c.id, "b2");
    } else if (isD1(c.id)) {
      courseIdToCellId.set(c.id, "d1");
    } else if (isF1(c.id)) {
      courseIdToCellId.set(c.id, "f1");
    } else if (isF2(c.id)) {
      courseIdToCellId.set(c.id, "f2");
    } else if (isH1(c.id)) {
      courseIdToCellId.set(c.id, "h1");
    } else if (isH2(c.id)) {
      courseIdToCellId.set(c.id, "h2");
    }
  }
  return courseIdToCellId;
}

function classifyRealCourses(cs: RealCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    // 必修
    if (isA1(c.id)) {
      courseIdToCellId.set(c.id, "a1");
    } else if (isA2(c.id)) {
      courseIdToCellId.set(c.id, "a2");
    } else if (isA3(c.id)) {
      courseIdToCellId.set(c.id, "a3");
    } else if (isA4(c.id)) {
      courseIdToCellId.set(c.id, "a4");
    } else if (isA5(c.id)) {
      courseIdToCellId.set(c.id, "a5");
    } else if (isA6(c.id)) {
      courseIdToCellId.set(c.id, "a6");
    } else if (isC1(c.id)) {
      courseIdToCellId.set(c.id, "c1");
    } else if (isC2(c.id)) {
      courseIdToCellId.set(c.id, "c2");
    } else if (isC3(c.id)) {
      courseIdToCellId.set(c.id, "c3");
    } else if (isC4(c.id)) {
      courseIdToCellId.set(c.id, "c4");
    } else if (isC5(c.id)) {
      courseIdToCellId.set(c.id, "c5");
    } else if (isC6(c.id)) {
      courseIdToCellId.set(c.id, "c6");
    } else if (isC7(c.id)) {
      courseIdToCellId.set(c.id, "c7");
    } else if (isC8(c.id)) {
      courseIdToCellId.set(c.id, "c8");
    } else if (isC9(c.id)) {
      courseIdToCellId.set(c.id, "c9");
    } else if (isC10(c.id)) {
      courseIdToCellId.set(c.id, "c10");
    } else if (isC11(c.id)) {
      courseIdToCellId.set(c.id, "c11");
    } else if (isC12(c.id)) {
      courseIdToCellId.set(c.id, "c12");
    } else if (isE1(c.id)) {
      courseIdToCellId.set(c.id, "e1");
    } else if (isE2(c.id)) {
      courseIdToCellId.set(c.id, "e2");
    }
    // 選択
    else if (isB1(c.id)) {
      courseIdToCellId.set(c.id, "b1");
    } else if (isB2(c.id)) {
      courseIdToCellId.set(c.id, "b2");
    } else if (isD1(c.id)) {
      courseIdToCellId.set(c.id, "d1");
    } else if (isF1(c.id)) {
      courseIdToCellId.set(c.id, "f1");
    } else if (isF2(c.id)) {
      courseIdToCellId.set(c.id, "f2");
    } else if (isH1(c.id)) {
      courseIdToCellId.set(c.id, "h1");
    } else if (isH2(c.id)) {
      courseIdToCellId.set(c.id, "h2");
    }
  }
  return courseIdToCellId;
}

function classifyFakeCourses(): Map<FakeCourseId, string> {
  const fakeCourseIdToCellId = new Map<FakeCourseId, string>();
  return fakeCourseIdToCellId;
}

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: {
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
  },
  major: "klis-system",
  requirementsTableYear: 2023,
  cellIdToRectRecord: cellIdToRect,
  classifyKnownCourses,
  classifyRealCourses,
  classifyFakeCourses,
});
