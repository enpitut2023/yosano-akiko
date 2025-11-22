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
  return id === "GE50712"; //専門英語B
}

function isA4(id: string): boolean {
  return id === "GE50812"; // 専門英語C
}

function isA5(id: string): boolean {
  return id === "GE60113"; // 知識科学実習A
}

function isA6(id: string): boolean {
  return id === "GE60123"; // 知識科学実習B
}

function isB1(id: string): boolean {
  return id.startsWith("GE6") && id !== "GE60113" && id !== "GE60123";
}

function isB2(id: string): boolean {
  return (
    id !== "GE70501" && // 情報検索システム
    id !== "GE72701" && // Machine Learning and Information Retrieval
    id !== "GE73101" && // Human Information Interaction
    id !== "GE71801" && // データ構造とアルゴリズム
    id !== "GE70113" && // 知識情報システム実習A
    id !== "GE70123" && // 知識情報システム実習B
    id !== "GE80113" && // 情報資源経営実習A
    id !== "GE80123" && // 情報資源経営実習B
    (id.startsWith("GA4") ||
      id.startsWith("GE4") ||
      id.startsWith("GE7") ||
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
  if (id.startsWith("__")) {
    return false;
  }
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

setup(
  2023,
  courses,
  2025,
  "klis-science",
  {
    a1: { filter: isA1, creditMin: 3, creditMax: 3 },
    a2: { filter: isA2, creditMin: 3, creditMax: 3 },
    a3: { filter: isA3, creditMin: 1, creditMax: 1 },
    a4: { filter: isA4, creditMin: 1, creditMax: 1 },
    a5: { filter: isA5, creditMin: 1, creditMax: 1 },
    a6: { filter: isA6, creditMin: 1, creditMax: 1 },
    b1: { filter: isB1, creditMin: 16, creditMax: undefined },
    b2: { filter: isB2, creditMin: 8, creditMax: undefined },
    c1: { filter: isC1, creditMin: 1, creditMax: 1 },
    c2: { filter: isC2, creditMin: 1, creditMax: 1 },
    c3: { filter: isC3, creditMin: 2, creditMax: 2 },
    c4: { filter: isC4, creditMin: 1, creditMax: 1 },
    c5: { filter: isC5, creditMin: 2, creditMax: 2 },
    c6: { filter: isC6, creditMin: 2, creditMax: 2 },
    c7: { filter: isC7, creditMin: 2, creditMax: 2 },
    c8: { filter: isC8, creditMin: 1, creditMax: 1 },
    c9: { filter: isC9, creditMin: 1, creditMax: 1 },
    c10: { filter: isC10, creditMin: 2, creditMax: 2 },
    c11: { filter: isC11, creditMin: 2, creditMax: 2 },
    c12: { filter: isC12, creditMin: 2, creditMax: 2 },
    d1: { filter: isD1, creditMin: 32, creditMax: 52 },
    e1: { filter: isE1, creditMin: 2, creditMax: 2 },
    e2: { filter: isE2, creditMin: 4, creditMax: 4 },
    f1: { filter: isF1, creditMin: 1, creditMax: undefined },
    f2: { filter: isF2, creditMin: 0, creditMax: undefined },
    h1: { filter: isH1, creditMin: 6, creditMax: undefined },
    h2: { filter: isH2, creditMin: 0, creditMax: undefined },
  },
  {
    b: { creditMin: 24, creditMax: 44 },
    d: { creditMin: 32, creditMax: 52 },
    f: { creditMin: 1, creditMax: 21 },
    h: { creditMin: 6, creditMax: 26 },
  },
  83,
  cellIdToRect,
);
