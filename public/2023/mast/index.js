// @ts-check

import { courses } from "../../current-courses.js";
import { setup } from "../../shared.js";


/**
 * @typedef {import("../../shared.js").CellFilterArgs} CellFilterArgs
 */

/**
 * @param {string} id
 * @returns {boolean}
 */
function isA1(id) {
  return (
    id === "GC48708" || // こっちは特別っぽい
    id === "GC48808"
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isA2(id) {
  return (
    id === "GC48608" || // こっちは特別っぽい
    id === "GC48908"
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isA3(id) {
  return id === "GC41103";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isA4(id) {
  return id === "GC41203";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isA5(id) {
  return id === "GC42102";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isA6(id) {
  return id === "GC42202";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isB1(id) {
  return id.startsWith("GC5") || id.startsWith("GA4");
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isC1(id) {
  return id === "GA15331";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isC2(id) {
  return id === "GC11701";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isC3(id) {
  return id === "GA15231";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isC4(id) {
  return id === "GC11801";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isC5(id) {
  return id === "GA15131";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isC6(id) {
  return id === "GC11601";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isC7(id) {
  return id === "GA18222";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isC8(id) {
  return id === "GA18322";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isC9(id) {
  return id === "GC12701";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isC10(id) {
  return id === "GC13101";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isC11(id) {
  return id === "GC12401";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isC12(id) {
  return id === "GC12403";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isC13(id) {
  return id === "GC13201";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isD1(id) {
  return (
    id !== "GA15111" && //情報数学A
    id !== "GA15121" &&
    id !== "GA15131" &&
    id !== "GA15141" &&
    id !== "GA15211" && //線形代数A
    id !== "GA15221" &&
    id !== "GA15231" &&
    id !== "GA15241" &&
    id !== "GA15311" && //微分積分A
    id !== "GA15321" &&
    id !== "GA15331" &&
    id !== "GA15341" &&
    id !== "GA18212" && //プログラミング入門A
    id !== "GA18222" &&
    id !== "GA18232" &&
    id !== "GA18312" && //プログラミング入門B
    id !== "GA18322" &&
    id !== "GA18332" &&
    (id.startsWith("GC2") || id.startsWith("GA1"))
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isE1(id) {
  return (
    id === "1119102" || // ファーストイヤーセミナー
    id === "1227611" //学問への誘い
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isE2(id) {
  return (
    id === "6525102" || // データサイエンス
    id === "6425102" || // 情報リテラシー(演習)
    id === "6114101" || // 情報リテラシー(講義) 2023
    id === "6125101" // 情報リテラシー(講義) 2024, 2025
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isE3(id) {
  return (
    // TODO: 基礎体育の時に種目が違うか、応用の時に種目が同じかチェック
    id.startsWith("21") || // 基礎体育
    id.startsWith("22") // 応用体育
  );
}

/**
 * @param {string} id
 * @param {CellFilterArgs} args
 * @returns {boolean}
 */
function isE4(id, args) {
  // TODO:
  // 編入とかで英語を認定された人は「英語」という名前の4単位の授業を与えられる
  let name = args.name;
  name = name.trim();
  name = name.replaceAll(/\s+/g, " ");
  name = name.toLowerCase();
  return (
    name === "english reading skills i" ||
    name === "english reading skills ii" ||
    name === "english presentation skills i" ||
    name === "english presentation skills ii"
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isF1(id) {
  return (
    (id.startsWith("12") || id.startsWith("14")) &&
    // 総合科目(学士基盤科目)
    !["27", "28", "30", "90"].includes(id.substring(2, 4))
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isF2(id) {
  return id.startsWith("28"); // 体育（自由科目）
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isF3(id) {
  return (
    id.startsWith("3") && // 外国語（英語）
    !(
      id.startsWith("31H") ||
      id.startsWith("31J") ||
      id.startsWith("31K") ||
      id.startsWith("31L")
    )
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isF4(id) {
  return id.startsWith("5"); // 国語
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isF5(id) {
  return id.startsWith("4"); // 芸術
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isH1(id) {
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

/**
 * @param {string} id
 * @returns {boolean}
 */
function isH2(id) {
  return (
    (id.startsWith("GB") || id.startsWith("GE")) &&
    !(
      (
        id.startsWith("GB102") || //線形代数B
        id.startsWith("GB104") || //微分積分B
        id === "GB11931" || //データ構造とアルゴリズム
        id === "GB11956" || //データ構造とアルゴリズム実験
        id === "GB11966" || //データ構造とアルゴリズム実験
        id.startsWith("GB133") || //情報特別演習（情科）
        id.startsWith("GB139") || //インターンシップ（情科）
        id === "GB17401" || //情報科学特別講義E
        id.startsWith("GB19") || //専門英語、卒業研究、特別研究（情科）
        id.startsWith("GB26") || //ソフトウェアサイエンス実験A、B
        id.startsWith("GB27") || //ソフトウェアサイエンス特別講義A、B、C、D
        id.startsWith("GB36") || //情報システム実験A、B
        id.startsWith("GB37") || //情報システム特別講義A、B、C、D
        id.startsWith("GB46") || //知能情報メディア実験A、B
        id.startsWith("GB47") || //知能情報メディア特別講義A、B、C、D
        id.startsWith("GE116") || //専門英語A1（知識）
        id.startsWith("GE117") || //専門英語A2（知識）
        id.startsWith("GE121") || //アカデミックスキルズ（知識）
        id === "GE40603" || //インターンシップ（知識）
        id === "GE40703" || //国際インターンシップ（知識）
        id.startsWith("GE42") || //国際学術演習A、B
        id.startsWith("GE50") || //知識情報持論、専門英語B-C
        id.startsWith("GE51") || //卒業研究（知識）
        id.startsWith("GE601") || //知識科学実習A、B
        id.startsWith("GE701") || //知識情報システム実習A、B
        id.startsWith("GE801")
      ) //情報資源経営実習A、B
    )
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */

function isH3(id) {
  return id.startsWith("99"); //博物館に関する科目　自由科目（特設）
}

setup(
  2023,
  courses,
  2025,
  "mast",
  {
    a1: { filter: isA1, creditMin: 3, creditMax: 3 },
    a2: { filter: isA2, creditMin: 3, creditMax: 3 },
    a3: { filter: isA3, creditMin: 3, creditMax: 3 },
    a4: { filter: isA4, creditMin: 3, creditMax: 3 },
    a5: { filter: isA5, creditMin: 1, creditMax: 1 },
    a6: { filter: isA6, creditMin: 1, creditMax: 1 },
    b1: { filter: isB1, creditMin: 20, creditMax: 35 },
    c1: { filter: isC1, creditMin: 2, creditMax: 2 },
    c2: { filter: isC2, creditMin: 2, creditMax: 2 },
    c3: { filter: isC3, creditMin: 2, creditMax: 2 },
    c4: { filter: isC4, creditMin: 2, creditMax: 2 },
    c5: { filter: isC5, creditMin: 2, creditMax: 2 },
    c6: { filter: isC6, creditMin: 2, creditMax: 2 },
    c7: { filter: isC7, creditMin: 2, creditMax: 2 },
    c8: { filter: isC8, creditMin: 1, creditMax: 1 },
    c9: { filter: isC9, creditMin: 2, creditMax: 2 },
    c10: { filter: isC10, creditMin: 2, creditMax: 2 },
    c11: { filter: isC11, creditMin: 2, creditMax: 2 },
    c12: { filter: isC12, creditMin: 1, creditMax: 1 },
    c13: { filter: isC13, creditMin: 2, creditMax: 2 },
    d1: { filter: isD1, creditMin: 32, creditMax: 47 },
    e1: { filter: isE1, creditMin: 2, creditMax: 2 },
    e2: { filter: isE2, creditMin: 4, creditMax: 4 },
    e3: { filter: isE3, creditMin: 2, creditMax: 2 },
    e4: { filter: isE4, creditMin: 4, creditMax: 4 },
    f1: { filter: isF1, creditMin: 1, creditMax: 4 },
    f2: { filter: isF2, creditMin: 0, creditMax: 2 },
    f3: { filter: isF3, creditMin: 0, creditMax: 6 },
    f4: { filter: isF4, creditMin: 0, creditMax: 2 },
    f5: { filter: isF5, creditMin: 0, creditMax: 6 },
    h1: { filter: isH1, creditMin: 6, creditMax: 15 },
    h2: { filter: isH2, creditMin: 0, creditMax: 9 },
    h3: { filter: isH3, creditMin: 0, creditMax: 9 },
  },
  {
    a: { creditMin: 14, creditMax: 14 },
    b: { creditMin: 20, creditMax: 35 },
    c: { creditMin: 24, creditMax: 24 },
    d: { creditMin: 32, creditMax: 47 },
    e: { creditMin: 12, creditMax: 12 },
    f: { creditMin: 1, creditMax: 10 },
    h: { creditMin: 6, creditMax: 15 },
  },
  74
);
