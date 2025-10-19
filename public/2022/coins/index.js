// @ts-check

import { courses } from "../../current-courses.js";
import { setup } from "../../shared.js";

/**
 * @param {string} id
 * @returns {boolean}
 */
function isB1(id) {
  return (
    id.startsWith("GB20") || id.startsWith("GB30") || id.startsWith("GB40")
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isB2(id) {
  return (
    id === "GB13312" || //情報特別演習I
    id === "GB13322" || //情報特別演習II
    id === "GB13332" || //情報科学特別演習
    ((id.startsWith("GB2") ||
      id.startsWith("GB3") ||
      id.startsWith("GB4") ||
      id.startsWith("GA4")) &&
      id[3] !== "0" && // B1と排反
      id[3] !== "6") // 実験類を除く
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isD1(id) {
  return (
    id === "GB11601" || // 確率論
    id === "GB11621" || // 統計学
    id === "GB12301" || // 数値計算法
    id === "GB12601" || // 論理と形式化
    id === "GB12801" || // 論理システム
    id === "GB12812" // 論理システム演習
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isD2(id) {
  return (
    id === "GB13614" || // Computer Science in English A
    id === "GB13624" // Computer Science in English B
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isD3(id) {
  return (
    id !== "GB13312" && //情報特別演習I
    id !== "GB13322" && //情報特別演習II
    id !== "GB13332" && //情報科学特別演習
    id.startsWith("GB1") &&
    !isD1(id) &&
    !isD2(id) && //同列の他セルに含まれない
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

/**
 * @param {string} id
 * @returns {boolean}
 */
function isD4(id) {
  return (
    id.startsWith("GA1") &&
    //必修を除外
    !(id.startsWith("GA15") || id.startsWith("GA18"))
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

/**
 * @param {string} id
 * @returns {boolean}
 */
function isH1(id) {
  return !(
    id.startsWith("E") ||
    id.startsWith("F") ||
    id.startsWith("G") ||
    id.startsWith("H") ||
    // 共通科目及び教職に関する科目
    id.match(/^\d/)
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isH2(id) {
  return (
    id.startsWith("E") ||
    id.startsWith("F") ||
    id.startsWith("GC") ||
    id.startsWith("GE") ||
    id.startsWith("H")
  );
}

setup(
  2022,
  courses,
  2025,
  "coins",
  {
    b1: { filter: isB1, creditMin: 16, creditMax: undefined },
    b2: { filter: isB2, creditMin: 0, creditMax: 18 },
    d1: { filter: isD1, creditMin: 8, creditMax: undefined },
    d2: { filter: isD2, creditMin: 2, creditMax: undefined },
    d3: { filter: isD3, creditMin: 4, creditMax: undefined },
    d4: { filter: isD4, creditMin: 8, creditMax: undefined },
    f1: { filter: isF1, creditMin: 1, creditMax: undefined },
    f2: { filter: isF2, creditMin: 0, creditMax: 4 },
    h1: { filter: isH1, creditMin: 6, creditMax: undefined },
    h2: { filter: isH2, creditMin: 0, creditMax: 4 },
  },
  {
    b: { creditMin: 34, creditMax: 34 },
    d: { creditMin: 26, creditMax: 26 },
    f: { creditMin: 1, creditMax: 5 },
    h: { creditMin: 6, creditMax: 10 },
  },
  71,
);
