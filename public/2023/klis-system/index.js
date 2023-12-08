import { courses } from "../courses.js";
import { setup } from "../../shared.js";

/**
 * @param {string} id
 * @returns {boolean}
 */
function isB1(id) {
  return (
    id.startsWith("GE7") &&
    id !== "GE70113" &&
    id !== "GE70123"
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
    ((id.startsWith("GA4") || id.startsWith("GE4") || id.startsWith("GE6") || id.startsWith("GE8")))
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isD1(id) {
  return (
    id === "GB11601" || //確率論
    id === "GB11621" || //統計学
    id === "GB12301" || //数値計算法
    id === "GB12601" || //論理と形式化
    id === "GB12801" || //論理システム
    id === "GB12812" //論理システム演習
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
    id.startsWith("GB1")
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isD4(id) {
  return id.startsWith("GA1");
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isE1(id) {
  return (
    id.startsWith("11") &&
    // 総合科目(ファーストイヤーセミナー・学問への誘い)
    ["27", "28"].includes(id)
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isE2(id) {
  return false; // 体育
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isE3(id) {
  return false; // 外国語(英語)
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isE4(id) {
  return id.startsWith("6"); // 情報
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
  return id.match(/^[2-5]/); // 体育・外国語・国語・芸術
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

setup(courses, {
  b1: isB1,
  b2: isB2,
  d1: isD1,
  d2: isD2,
  d3: isD3,
  d4: isD4,
  f1: isF1,
  f2: isF2,
  h1: isH1,
  h2: isH2,
});
