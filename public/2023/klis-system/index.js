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
    id !== "GE80401" && // 経営情報システム論
    id !== "GE61901" && // 情報検索システム
    id !== "GE62401" && // Machine Learning and Information Retrieval
    id !== "GE62501" && // Human Information Interaction
    id !== "GE61801" && // データ構造とアルゴリズム
    ((id.startsWith("GA4") || id.startsWith("GE4") || id.startsWith("GE6") || id.startsWith("GE8")))
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isD1(id) {
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
    ((id.startsWith("GA1") || id.startsWith("GE2") || id.startsWith("GE3")))
  );
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
    id.startsWith("GA") ||
    id.startsWith("GB") ||
    id.startsWith("GC") ||
    id.startsWith("GE") ||
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
    id.startsWith("GC") ||
    id.startsWith("GB")
  );
}

setup(courses, {
  b1: {filter: isB1, creditMin: 16, creditMax: undefined},
  b2: {filter: isB2, creditMin: 8, creditMax: undefined},
  d1: {filter: isD1, creditMin: 32, creditMax: 52},
  f1: {filter: isF1, creditMin: 1, creditMax: undefined},
  f2: {filter: isF2, creditMin: 0, creditMax: undefined},
  h1: {filter: isH1, creditMin: 6, creditMax: undefined},
  h2: {filter: isH2, creditMin: 0, creditMax: undefined}
});
