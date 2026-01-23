// @ts-check
// import { courses } from "../../current-courses.js";
// import { setup } from "../../shared.js";

/**
 * @param {string} id
 * @returns {boolean}
 */
function isA1(id) {
  return id === "FE13273";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isA2(id) {
  return id === "FE13133";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isA3(id) {
  return id === "FE13313";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isA4(id) {
  return id === "FE14808";
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isB1(id) {
  return (
    id === "FE12301" || //分析化学
    id === "FE12201" || //無機化学I
    id === "FE13101" || //無機化学II
    id === "FE13621" || //無機元素化学
    id === "FE13611" // 放射化学
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isB2(id) {
  return (
    id === "FE12401" || //物理化学I
    id === "FE12411" || //物理化学II
    id === "FE13221" || //物理化学III
    id === "FE13231" //物理化学IV
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isB3(id) {
  return (
    id === "FE12601" || //有機化学I
    id === "FE12611" || //有機化学II
    id === "FE13301" || //有機化学III
    id === "FE13311" //有機化学IV
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isB4(id) {
  // TODO: 上の必修の除外、余った分はこっちに加算されるらしい
  return (
    id.startsWith("FE12") || id.startsWith("FE13") || id.startsWith("FE14")
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isC1(id) {
  return (
    id === "FE11171" || //化学1
    id === "FE11181" || //化学2
    id === "FE11191" // 化学3
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isD1(id) {
  return (
    id === "FA01191" || //数学リテラシー1 1年
    id === "FA011B1" || //数学リテラシー1 2年以上
    id === "FA01291" || //数学リテラシー2 1年
    id === "FA012B1" || //数学リテラシー2　2年以上
    id === "FA01391" || //微積分1
    id === "FA01491" || //微積分2
    id === "FA01591" || //微積分3
    id === "FBA1481" || //微積分I
    id === "FBA1521" || //微積分II
    id === "FBA1561" || //微積分III
    id === "FA01691" || //線形代数1
    id === "FA01791" || //線形代数2
    id === "FA01891" || //線形代数3
    id === "FBA1601" || //線形代数I
    id === "FBA1911" || //線形代数I 集中
    id === "FBA1641" || //線形代数II
    id === "FBA1681" || //線形代数III
    id === "FCB1211" || //力学1
    id === "FCB1251" || //力学2
    id === "FCB1271" || //力学3
    id === "FCB1311" || //電磁気学1
    id === "FCB1341" || //電磁気学2
    id === "FCB1371" || //電磁気学3
    id === "FBA1742" || //微積分演習S
    id === "FBA1822" || //微積分演習F
    id === "FBA1782" || //線形代数演習S
    id === "FBA1862" //線形代数演習F
    // TODO: 微分積分A, 線形代数A
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isD2(id) {
  // TODO:
  return (
    ((id.startsWith("EB") || id.startsWith("EC") || id.startsWith("EE")) &&
      true) ||
    id.startsWith("FA") ||
    id.startsWith("FB") ||
    id.startsWith("FC") ||
    id.startsWith("FE11") ||
    id.startsWith("EE")
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isE1(id) {
  return (
    id === "1114102" || // ファーストイヤーセミナー 1クラス
    id === "1114202" || // ファーストイヤーセミナー 2クラス
    id === "1227411" || // 学問への誘い 1クラス
    id === "1227421"
  ); // 学問への誘い 2クラス
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isE2(id) {
  // TODO:
  return false;
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isE3(id) {
  // TODO:
  return false;
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isE4(id) {
  return (
    id === "6112101" || // 情報リテラシー(講義)
    id === "6114101" || 
    id === "6414102"  || //　情報リテラシー(演習)
    id === "6514102" // データサイエンス
  );
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isF1(id) {
  // TODO: 
  return false;
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isH1(id) {
  return id.startsWith("A") || id.startsWith("B");
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isH2(id) {
  // TODO: 
  return false;
}

setup(
  2023,
  courses,
  2025,
  "klis-science",
  {
    a1: { filter: isA1, creditMin: 4, creditMax: 4 },
    a2: { filter: isA2, creditMin: 4, creditMax: 4 },
    a3: { filter: isA3, creditMin: 4, creditMax: 4 },
    a4: { filter: isA4, creditMin: 14, creditMax: 14 },
    b1: { filter: isB1, creditMin: 6, creditMax: 6 },
    b2: { filter: isB2, creditMin: 6, creditMax: 6 },
    b3: { filter: isB3, creditMin: 6, creditMax: 6 },
    b4: { filter: isB4, creditMin: 24, creditMax: 34 },
    c1: { filter: isC1, creditMin: 3, creditMax: 3 },
    d1: { filter: isD1, creditMin: 12, creditMax: 12 },
    d2: { filter: isD2, creditMin: 5, creditMax: 18 },
    e1: { filter: isE1, creditMin: 2, creditMax: 2 },
    e2: { filter: isE2, creditMin: 2, creditMax: 2 },
    e3: { filter: isE3, creditMin: 4, creditMax: 4 },
    e4: { filter: isE4, creditMin: 4, creditMax: 4 },
    f1: { filter: isF1, creditMin: 1, creditMax: 2 },
    h1: { filter: isH1, creditMin: 2, creditMax: 2 },
    h2: { filter: isH2, creditMin: 7, creditMax: 9 },
  },
  { a: {creditMin: 26, creditMax: 26},
    b: { creditMin: 42, creditMax: 52 },
    c: { creditMin: 3, creditMax: 3 },
    d: { creditMin: 17, creditMax: 30 },
    e: { creditMin: 12, creditMax: 12 },
    f: { creditMin: 1, creditMax: 2 },
    h: { creditMin: 9, creditMax: 11 },
  },
  83
);
