import { courses } from "../../courses.js";
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
    ((id.startsWith("GB2") || id.startsWith("GB3") || id.startsWith("GB4")) &&
      id[3] !== "0")
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isD1(id) {
  return (
    id === "GB11601" && //確率論
    id === "GB11621" && //統計学
    id === "GB12301" && //数値計算法
    id === "GB12601" && //論理と形式化
    id === "GB12801" && //論理システム
    id === "GB12812" //論理システム演習
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

setup(courses, { b1: isB1, b2: isB2, d1: isD1, d3: isD3, d4: isD4});
