// @ts-check

import { courses } from "../../current-courses.js";
import { setup } from "../../shared.js";

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
  2024,
  "mast",
  {
    b1: { filter: isB1, creditMin: 20, creditMax: 35 },
    d1: { filter: isD1, creditMin: 32, creditMax: 47 },
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
    b: { creditMin: 20, creditMax: 35 },
    d: { creditMin: 32, creditMax: 47 },
    f: { creditMin: 1, creditMax: 10 },
    h: { creditMin: 6, creditMax: 15 },
  },
  74,
);
