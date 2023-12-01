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
    id === "GB13312" ||
    id === "GB13322" ||
    id === "GB13332" ||
    ((id.startsWith("GB2") || id.startsWith("GB3") || id.startsWith("GB4")) &&
      id[3] !== "0")
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isD3(id) {
  return (
    id !== "GB13312" &&
    id !== "GB13322" &&
    id !== "GB13332" &&
    id.startsWith("GB1")
  );
}

setup(courses, { b1: isB1, b2: isB2, d3: isD3});
