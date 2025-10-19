// @ts-check

import { courses } from "../../current-courses.js";
import { setup } from "../../shared.js";

/**
 * @param {string} id
 * @returns {boolean}
 */
function isB1(id) {
  return id.startsWith("GE6") && id !== "GE60113" && id !== "GE60123";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isB2(id) {
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
    (id.startsWith("GA1") || id.startsWith("GE2") || id.startsWith("GE3"))
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
  return id.startsWith("GC") || id.startsWith("GB");
}

setup(
  2023,
  courses,
  2025,
  "klis-science",
  {
    b1: { filter: isB1, creditMin: 16, creditMax: undefined },
    b2: { filter: isB2, creditMin: 8, creditMax: undefined },
    d1: { filter: isD1, creditMin: 32, creditMax: 52 },
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
);
