// @ts-check

import { parse } from "./vendor/csv-parse.js";

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   credit: number | undefined;
 *   expects: string;
 *   term: string;
 *   when: string;
 * }} Course
 *
 * @typedef {"not-taken" | "might-take" | "taken"} CourseElementState
 * @typedef {{
 *   state: CourseElementState;
 *   course: Course;
 *   element: HTMLElement;
 * }} CourseElement
 *
 * @typedef {{
 *   notTaken: HTMLTableSectionElement;
 *   mightTake: HTMLTableSectionElement;
 *   taken: HTMLTableSectionElement;
 * }} CellTbodys
 *
 * @typedef {{
 *   notTaken: HTMLTableElement;
 *   mightTake: HTMLTableElement;
 *   taken: HTMLTableElement;
 * }} CourseTables
 *
 * @typedef {{
 *   notTaken: HTMLElement;
 *   mightTake: HTMLElement;
 *   taken: HTMLElement;
 * }} CourseContainers
 *
 * @typedef {{
 *   filter: (id: string) => boolean;
 *   creditMin: number;
 *   creditMax: number | undefined;
 * }} CellMetadata
 *
 * @typedef {{
 *   creditMin: number;
 *   creditMax: number | undefined;
 * }} CellCreditRequirements
 * @typedef {{
 *   creditMin: number;
 *   creditMax: number;
 * }} ColumnCreditRequirements
 * @typedef {{
 *   takenSum: number;
 *   mightTakeSum: number;
 *   requirements: CellCreditRequirements;
 * }} CellCredit
 * @typedef {{
 *   takenSum: number;
 *   mightTakeSum: number;
 *   requirements: ColumnCreditRequirements;
 * }} ColumnCredit
 * @typedef {{
 *   takenSum: number;
 *   mightTakeSum: number;
 *   required: number;
 * }} NetCredit
 */

/**
 * @typedef {"wip" | "a+" | "a" | "b" | "c" | "d" | "pass" | "fail" | "free"} ImportedCourseGrade;
 * @typedef {{
 *   id: string;
 *   name: string;
 *   credit: number | undefined;
 *   takenYear: number;
 *   grade: ImportedCourseGrade;
 * }} ImportedCourse
 * @typedef {{
 *   id: string;
 *   course: Course;
 *   importedCourse: undefined;
 * } | {
 *   id: string;
 *   course: undefined;
 *   importedCourse: ImportedCourse;
 * } | {
 *   id: string;
 *   course: Course;
 *   importedCourse: ImportedCourse;
 * }} MaybeImportedCourse
 */

class CreditSumView extends HTMLElement {
  /** @private @type {HTMLSpanElement | undefined} */
  cellWiseTakenSumSpan = undefined;
  /** @private @type {HTMLSpanElement | undefined} */
  cellWiseTakenAndMightTakeSumSpan = undefined;
  /** @private @type {HTMLSpanElement | undefined} */
  columnWiseTakenSumSpan = undefined;
  /** @private @type {HTMLSpanElement | undefined} */
  columnWiseTakenAndMightTakeSumSpan = undefined;

  constructor() {
    super();
  }

  /**
   * @protected
   */
  connectedCallback() {
    this.innerHTML = `
      <h2>単位数</h2>
      <div>
        <p>マスを選択してください</p>
        <ul>
          <li>選択されているマス<ul>
              <li>取得済み：<span></span></li>
              <li>取得済み＋取るかもしれない：<span></span></li>
            </ul>
          </li>
          <li>選択されている列の全マス<ul>
              <li>取得済み：<span></span></li>
              <li>取得済み＋取るかもしれない：<span></span></li>
            </ul>
          </li>
        </ul>
      </div>
    `;
    [
      this.cellWiseTakenSumSpan,
      this.cellWiseTakenAndMightTakeSumSpan,
      this.columnWiseTakenSumSpan,
      this.columnWiseTakenAndMightTakeSumSpan,
    ] = this.getElementsByTagName("span");
  }

  /**
   * @public
   * @param {[ CellCredit, ColumnCredit ] | undefined} credits
   */
  update(credits) {
    if (
      this.cellWiseTakenSumSpan === undefined ||
      this.cellWiseTakenAndMightTakeSumSpan === undefined ||
      this.columnWiseTakenSumSpan === undefined ||
      this.columnWiseTakenAndMightTakeSumSpan === undefined
    ) {
      return;
    }

    this.classList.toggle("no-cell-selected", credits === undefined);
    if (credits !== undefined) {
      const [cellCredit, columnCredit] = credits;
      const cellMessage = CreditSumView.cellCreditToMessage(cellCredit);
      const columnMessage = CreditSumView.columnCreditToMessage(columnCredit);
      this.cellWiseTakenSumSpan.innerHTML = cellMessage.taken;
      this.cellWiseTakenAndMightTakeSumSpan.innerHTML =
        cellMessage.takenAndMightTake;
      this.columnWiseTakenSumSpan.innerHTML = columnMessage.taken;
      this.columnWiseTakenAndMightTakeSumSpan.innerHTML =
        columnMessage.takenAndMightTake;
    }
  }

  /**
   * @private
   * @param {CellCredit} cellCredit
   * @returns {{ taken: string, takenAndMightTake: string }}
   */
  static cellCreditToMessage(cellCredit) {
    const { takenSum, mightTakeSum, requirements } = cellCredit;
    const takenAndMightTakeSum = takenSum + mightTakeSum;
    let taken = `${takenSum}/${requirements.creditMin}`;
    let takenAndMightTake = `${takenAndMightTakeSum}/${requirements.creditMin}`;
    if (takenSum > (requirements.creditMax ?? Infinity)) {
      taken += `（⚠️${requirements.creditMax}単位まで有効）`;
    }
    if (takenAndMightTakeSum > (requirements.creditMax ?? Infinity)) {
      takenAndMightTake += `（⚠️${requirements.creditMax}単位まで有効）`;
    }
    return { taken, takenAndMightTake };
  }

  /**
   * @private
   * @param {ColumnCredit} columnCredit
   * @returns {{ taken: string, takenAndMightTake: string }}
   */
  static columnCreditToMessage(columnCredit) {
    return CreditSumView.cellCreditToMessage(columnCredit);
  }
}
window.customElements.define("credit-sum-view", CreditSumView);

class CreditSumOverlay extends HTMLElement {
  /** @private @type {Map<string, HTMLDivElement>} */
  columnIdToColumnDiv = new Map();
  /** @private */
  netDiv = document.createElement("div");

  constructor() {
    super();
  }

  /**
   * @protected
   */
  connectedCallback() {
    for (const div of this.getElementsByTagName("div")) {
      if (div.classList.contains("column")) {
        this.columnIdToColumnDiv.set(div.id, div);
      }
    }

    this.netDiv.id = "net";
    this.appendChild(this.netDiv);
  }

  /**
   * @public
   * @param {Map<string, ColumnCredit>} columnIdToColumnCredit
   * @param {NetCredit} netCredit
   */
  update(columnIdToColumnCredit, netCredit) {
    for (const [_, columnCredit, columnDiv] of zipMapIntersection(
      columnIdToColumnCredit,
      this.columnIdToColumnDiv,
    )) {
      columnDiv.textContent =
        CreditSumOverlay.columnCreditToMessage(columnCredit);
    }
    this.netDiv.textContent = CreditSumOverlay.netCreditToMessage(netCredit);
  }

  /**
   * @private
   * @param {ColumnCredit} columnCredit
   * @returns {string}
   */
  static columnCreditToMessage(columnCredit) {
    const { takenSum, mightTakeSum, requirements } = columnCredit;
    const takenAndMightTakeSum = takenSum + mightTakeSum;
    if (takenSum === takenAndMightTakeSum) {
      return takenSum.toString();
    } else {
      let message = `${takenSum} → ${takenAndMightTakeSum}`;
      if (takenAndMightTakeSum > requirements.creditMax) {
        message = "⚠️ " + message;
      }
      return message;
    }
  }

  /**
   * @private
   * @param {NetCredit} netCredit
   * @returns {string}
   */
  static netCreditToMessage(netCredit) {
    const { takenSum, mightTakeSum, required } = netCredit;
    const takenAndMightTakeSum = takenSum + mightTakeSum;
    if (takenSum === takenAndMightTakeSum) {
      return `${takenSum}/${required}`;
    }
    let message = `${takenSum} → ${takenAndMightTakeSum}/${required}`;
    if (takenAndMightTakeSum > required) {
      message = "⚠️ " + message;
    }
    return message;
  }
}
window.customElements.define("credit-sum-overlay", CreditSumOverlay);

class Akiko {
  /**
   * @typedef {{
   *   creditRequirements: CellCreditRequirements;
   *   courseIdToWontTakeCourse: Map<string, [Course, ImportedCourse | undefined]>;
   *   courseIdToMightTakeCourse: Map<string, [Course, ImportedCourse | undefined]>;
   *   courseIdToTakenCourse: Map<string, [Course | undefined, ImportedCourse]>;
   * }} Cell
   */

  /** @type {number} */
  requirementsTableYear;
  /** @type {Map<string, Cell>} */
  cellIdToCell;
  /** @type {Map<string, string>} */
  courseIdToCellId;

  /**
   * @param {number} requirementsTableYear
   * @param {Map<string, Cell>} cellIdToCell
   * @param {Map<string, string>} courseIdToCellId
   */
  constructor(requirementsTableYear, cellIdToCell, courseIdToCellId) {
    this.requirementsTableYear = requirementsTableYear;
    this.cellIdToCell = cellIdToCell;
    this.courseIdToCellId = courseIdToCellId;
  }

  /**
   * @param {"wont-take-to-might-take" | "might-take-to-wont-take"} direction
   * @param {string} courseId
   * @returns {{
   *   kind: "unknown-course-id";
   *   courseId: string;
   * } | {
   *   kind: "already-moved";
   *   courseId: string;
   * } | undefined}
   */
  moveCourse(direction, courseId) {
    const cellId = this.courseIdToCellId.get(courseId);
    if (cellId === undefined) {
      return { kind: "unknown-course-id", courseId };
    }
    const cell = this.cellIdToCell.get(cellId);
    if (cell === undefined) {
      throw new Error(`bad cell id: '${cellId}'`);
    }
    const [from, to] =
      direction === "wont-take-to-might-take"
        ? [cell.courseIdToWontTakeCourse, cell.courseIdToMightTakeCourse]
        : [cell.courseIdToMightTakeCourse, cell.courseIdToWontTakeCourse];
    const course = from.get(courseId);
    if (course === undefined) {
      if (to.has(courseId)) {
        return { kind: "already-moved", courseId };
      } else {
        throw new Error(`lost track of course '${courseId}'`);
      }
    }
    from.delete(courseId);
    to.set(courseId, course);
  }

  /**
   * @returns {Map<string, CellCredit>}
   */
  calculateCellIdToCellCredit() {
    /** @type {Map<string, CellCredit>} */
    const cellIdToCellCredit = new Map();
    for (const [cellId, cell] of this.cellIdToCell.entries()) {
      cellIdToCellCredit.set(cellId, {
        takenSum: mapSum(
          cell.courseIdToTakenCourse.values(),
          ([_, c]) => c.credit ?? 0,
        ),
        mightTakeSum: mapSum(
          cell.courseIdToMightTakeCourse.values(),
          ([c, _]) => c.credit ?? 0,
        ),
        requirements: {
          creditMin: cell.creditRequirements.creditMin,
          creditMax: cell.creditRequirements.creditMax,
        },
      });
    }
    return cellIdToCellCredit;
  }

  /**
   * @param {Map<string, CellMetadata>} cellIdToCellMetadata
   * @param {number} requirementsTableYear
   * @param {Course[]} courses
   * @param {ImportedCourse[]} importedCourses
   * @returns {Akiko}
   */
  static fromCellIdToCourses(
    cellIdToCellMetadata,
    requirementsTableYear,
    courses,
    importedCourses,
  ) {
    /** @type {Map<string, MaybeImportedCourse>} */
    const courseIdToMaybeImportedCourse = new Map(
      map(courses.values(), (course) => [
        course.id,
        { id: course.id, course, importedCourse: undefined },
      ]),
    );
    for (const importedCourse of importedCourses) {
      if (importedCourse.id === "") {
        // TODO: 認可された授業がインポートされた
        continue;
      }
      // TODO: requirementsTableYearより過去の授業が来た場合対応
      const maybeImportedCourse = courseIdToMaybeImportedCourse.get(
        importedCourse.id,
      );
      if (maybeImportedCourse === undefined) {
        courseIdToMaybeImportedCourse.set(importedCourse.id, {
          id: importedCourse.id,
          course: undefined,
          importedCourse,
        });
      } else {
        maybeImportedCourse.importedCourse = importedCourse;
      }
    }

    const akiko = new Akiko(requirementsTableYear, new Map(), new Map());
    for (const [cellId, cellMetadata] of cellIdToCellMetadata.entries()) {
      const maybeImportedCourses = Array.from(
        filter(courseIdToMaybeImportedCourse.values(), (c) =>
          cellMetadata.filter(c.id),
        ),
      );
      /** @type {Cell} */
      const cell = {
        creditRequirements: {
          creditMin: cellMetadata.creditMin,
          creditMax: cellMetadata.creditMax,
        },
        courseIdToWontTakeCourse: new Map(),
        courseIdToMightTakeCourse: new Map(),
        courseIdToTakenCourse: new Map(),
      };
      for (const { id, course, importedCourse } of maybeImportedCourses) {
        if (!cellMetadata.filter(id)) {
          continue;
        }
        if (course !== undefined && importedCourse !== undefined) {
          switch (importedCourse.grade) {
            case "wip": {
              cell.courseIdToMightTakeCourse.set(id, [course, importedCourse]);
              break;
            }
            case "a+":
            case "a":
            case "b":
            case "c":
            case "pass":
            case "free": {
              cell.courseIdToTakenCourse.set(id, [course, importedCourse]);
              break;
            }
            case "d":
            case "fail": {
              cell.courseIdToWontTakeCourse.set(id, [course, importedCourse]);
              break;
            }
          }
        } else if (importedCourse === undefined) {
          cell.courseIdToWontTakeCourse.set(id, [course, undefined]);
        } else {
          cell.courseIdToTakenCourse.set(id, [undefined, importedCourse]);
        }
      }
      akiko.cellIdToCell.set(cellId, cell);
      for (const { id } of maybeImportedCourses) {
        akiko.courseIdToCellId.set(id, cellId);
      }
    }
    return akiko;
  }
}

/**
 * @template T, U
 * @param {Iterable<T>} ts
 * @param {(t: T) => U} f
 * @returns {Generator<U>}
 */
function* map(ts, f) {
  for (const t of ts) {
    yield f(t);
  }
}

/**
 * @template T
 * @param {Iterable<T>} ts
 * @param {(t: T) => boolean} predicate
 * @returns {Generator<T>}
 */
function* filter(ts, predicate) {
  for (const t of ts) {
    if (predicate(t)) {
      yield t;
    }
  }
}

/**
 * @template K, Va, Vb
 * @param {Map<K, Va>} a
 * @param {Map<K, Vb>} b
 * @returns {Generator<[K, Va, Vb]>}
 */
function* zipMapIntersection(a, b) {
  for (const [key, av] of a.entries()) {
    const bv = b.get(key);
    if (bv !== undefined) {
      yield [key, av, bv];
    }
  }
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function compareStrings(a, b) {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
}

/**
 * @template {{}} T
 * @param {unknown[]} array
 * @param {new (...args: unknown[]) => T} constructor
 * @returns {array is T[]}
 */
function isArrayOfInstanceOf(array, constructor) {
  for (const e of array) {
    if (!(e instanceof constructor)) {
      return false;
    }
  }
  return true;
}

/**
 * @param {string} s
 * @return {HTMLElement}
 */
export function stringToHtmlElement(s) {
  const t = document.createElement("template");
  t.innerHTML = s;
  const child = t.content.firstElementChild;
  if (!(child instanceof HTMLElement)) {
    throw new Error();
  }
  return child;
}

/**
 * @param {string} html
 * @return {string}
 */
export function escapeHtml(html) {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * @param {CourseContainers} courseContainers
 * @param {CellTbodys} cellTbodys
 */
function updateCourseContainers(courseContainers, cellTbodys) {
  for (const [courseContainer, cellTbody] of /** @type {const} */ ([
    [courseContainers.notTaken, cellTbodys.notTaken],
    [courseContainers.mightTake, cellTbodys.mightTake],
    [courseContainers.taken, cellTbodys.taken],
  ])) {
    if (cellTbody.childElementCount === 0) {
      courseContainer.classList.add("contains-no-courses");
    } else {
      courseContainer.classList.remove("contains-no-courses");
    }
  }
}

/**
 * @param {CourseTables} courseTables
 * @param {CellTbodys} cellTbodys
 */
function updateCourseTables(courseTables, cellTbodys) {
  for (const e of courseTables.notTaken.getElementsByTagName("tbody")) {
    e.remove();
  }
  for (const e of courseTables.mightTake.getElementsByTagName("tbody")) {
    e.remove();
  }
  for (const e of courseTables.taken.getElementsByTagName("tbody")) {
    e.remove();
  }
  courseTables.notTaken.appendChild(cellTbodys.notTaken);
  courseTables.mightTake.appendChild(cellTbodys.mightTake);
  courseTables.taken.appendChild(cellTbodys.taken);
}

/**
 * @param {string} id
 * @returns {HTMLElement}
 */
function mustGetElementById(id) {
  const e = document.getElementById(id);
  if (e === null) {
    throw new Error(`cannot find "#${id}"`);
  }
  return e;
}

/**
 * @template {HTMLElement} T
 * @param {string} id
 * @param {new (...args: unknown[]) => T} type
 * @returns {T}
 */
function mustGetElementByIdOfType(id, type) {
  const e = document.getElementById(id);
  if (!(e !== null && e instanceof type)) {
    throw new Error(`cannot find "#${id}"`);
  }
  return e;
}

/**
 * @param {string} s
 * @returns {ImportedCourseGrade | undefined}
 */
function parseImportedCourseGrade(s) {
  switch (s) {
    case "履修中":
      return "wip";
    case "A+":
      return "a+";
    case "A":
      return "a";
    case "B":
      return "b";
    case "C":
      return "c";
    case "D":
      return "d";
    case "P":
      return "pass";
    case "F":
      return "fail";
    case "認":
      return "free";
  }
}

/**
 * @param {unknown[]} array
 * @returns {array is string[]}
 */
function isStringArray(array) {
  for (const e of array) {
    if (typeof e !== "string") {
      return false;
    }
  }
  return true;
}

/**
 * @param {unknown[]} row
 * @returns {ImportedCourse | undefined}
 */
function parseImportedCourse(row) {
  if (!(isStringArray(row) && row.length === 11)) {
    return;
  }
  for (let i = 0; i < row.length; i++) {
    row[i] = row[i].trim();
  }
  // 学籍番号, 学生氏名, 科目番号, 科目名, 単位数, 春学期, 秋学期, 総合評価, 科目区分, 開講年度, 開講区分
  const [, , id, name, rawCredit, , , rawGrade, , rawYearTaken, ,] = row;
  const grade = parseImportedCourseGrade(rawGrade);
  if (grade === undefined) {
    return;
  }
  const credit = parseFloat(rawCredit);
  if (isNaN(credit)) {
    return;
  }
  const takenYear = parseInt(rawYearTaken);
  if (isNaN(takenYear)) {
    return;
  }
  return { id, name, grade, credit, takenYear };
}

/**
 * @typedef {{
 *   kind: "ok";
 *   importedCourses: ImportedCourse[];
 * } | {
 *   kind: "failed-to-parse-as-csv";
 * } | {
 *   kind: "unexpected-csv-content";
 * }} CsvToImportedCoursesResult
 *
 * @param {string} csv
 * @returns {CsvToImportedCoursesResult}
 */
function csvToImportedCourses(csv) {
  /** @type {unknown} */
  let rows;
  try {
    rows = parse(csv, { trim: true });
  } catch {
    return { kind: "failed-to-parse-as-csv" };
  }
  if (!(Array.isArray(rows) && rows.length >= 1)) {
    return { kind: "unexpected-csv-content" };
  }

  /** @type {ImportedCourse[]} */
  const importedCourses = [];
  for (const row of rows.slice(1)) {
    const importedCourse = parseImportedCourse(row);
    if (importedCourse === undefined) {
      return { kind: "unexpected-csv-content" };
    }
    importedCourses.push(importedCourse);
  }
  return { kind: "ok", importedCourses };
}

/**
 * @template T
 * @param {Iterable<T>} elements
 * @param {(t: T) => number} f
 * @returns {number}
 */
function mapSum(elements, f) {
  let sum = 0;
  for (const e of elements) {
    sum += f(e);
  }
  return sum;
}

/**
 * @param {Map<string, CellCredit>} cellIdToCellCredit
 * @param {Record<string, ColumnCreditRequirements>} columnIdToColumnCreditRequirements
 * @returns {Map<string, ColumnCredit>}
 */
function calculateColumnIdToColumnCredit(
  cellIdToCellCredit,
  columnIdToColumnCreditRequirements,
) {
  /** @type {Map<string, ColumnCredit>} */
  const columnIdToColumnCredit = new Map();
  for (const [columnId, columnCreditRequirements] of Object.entries(
    columnIdToColumnCreditRequirements,
  )) {
    const entries = Array.from(cellIdToCellCredit.entries()).filter(([id, _]) =>
      id.startsWith(columnId),
    );
    const takenSum = mapSum(entries, ([_, { takenSum, requirements }]) =>
      Math.min(takenSum, requirements.creditMax ?? Infinity),
    );
    const mightTakeSum = mapSum(
      entries,
      ([_, { mightTakeSum, requirements }]) =>
        Math.min(mightTakeSum, requirements.creditMax ?? Infinity),
    );
    columnIdToColumnCredit.set(columnId, {
      takenSum,
      mightTakeSum,
      requirements: columnCreditRequirements,
    });
  }
  return columnIdToColumnCredit;
}

/**
 * @param {Map<string, ColumnCredit>} columnIdToColumnCredit
 * @param {number} netRequired
 * @returns {NetCredit}
 */
function calculateNetCredit(columnIdToColumnCredit, netRequired) {
  const columnCredits = Array.from(columnIdToColumnCredit.values());
  const takenSum = mapSum(columnCredits, (c) =>
    Math.min(c.takenSum, c.requirements.creditMax),
  );
  const mightTakeSum = mapSum(columnCredits, (c) =>
    Math.min(c.mightTakeSum, c.requirements.creditMax),
  );
  return { takenSum, mightTakeSum, required: netRequired };
}

/**
 * @param {string} cellId
 * @returns {string}
 */
function cellIdToColumnId(cellId) {
  return cellId[0];
}

/**
 * @param {string} selectedCellId
 * @param {Map<string, CellCredit>} cellIdToCellCredit
 * @param {Map<string, ColumnCredit>} columnIdToColumnCredit
 * @returns {[CellCredit, ColumnCredit] | undefined}
 */
function selectedCellCreditAndColumnCredit(
  selectedCellId,
  cellIdToCellCredit,
  columnIdToColumnCredit,
) {
  const cellCredit = cellIdToCellCredit.get(selectedCellId);
  const columnCredit = columnIdToColumnCredit.get(
    cellIdToColumnId(selectedCellId),
  );
  if (cellCredit !== undefined && columnCredit !== undefined) {
    return [cellCredit, columnCredit];
  }
}

/**
 * @param {string} s
 * @returns {string}
 */
function lfToBr(s) {
  return s.replace(/\n/g, "<br>");
}

/**
 * @param {Akiko} akiko
 * @param {Map<string, CellTbodys>} cellIdToCellTbodys
 */
function initializeCourseElements(akiko, cellIdToCellTbodys) {
  /** @type {{ [key in ImportedCourseGrade]: string }} */
  const gradeToString = {
    wip: "履修中",
    "a+": "A+",
    a: "A",
    b: "B",
    c: "C",
    d: "落単済",
    pass: "P",
    fail: "落単済",
    free: "認可",
  };

  for (const [_, cell, cellTbodys] of zipMapIntersection(
    akiko.cellIdToCell,
    cellIdToCellTbodys,
  )) {
    const wontTakeCourses = Array.from(cell.courseIdToWontTakeCourse.values());
    wontTakeCourses.sort(([a], [b]) => compareStrings(a.id, b.id));
    const wontTakeCourseElements = wontTakeCourses.map(
      ([course, importedCourse]) => {
        const grade =
          importedCourse === undefined
            ? ""
            : `（${gradeToString[importedCourse.grade]}）`;
        // FIXME: year in the url
        const element = stringToHtmlElement(`
<tr class="course" draggable="true" data-course-id="${course.id}">
  <td class="id-name">${course.id}<br>
    <a href="https://kdb.tsukuba.ac.jp/syllabi/2023/${
      course.id
    }/jpn" target="_blank">${course.name}</a>
    <span>${grade}</span>
  </td>
  <td class="credit">${course.credit ?? "-"}</td>
  <td class="term">${lfToBr(course.term)}</td>
  <td class="when">${lfToBr(course.when)}</td>
  <td class="expects">${course.expects}</td>
</tr>
`);
        element.addEventListener("dragstart", (event) => {
          if (!(event.target instanceof HTMLTableRowElement)) {
            return;
          }
          event.dataTransfer?.setData("text/plain", course.id);
        });
        return element;
      },
    );

    const mightTakeCourses = Array.from(
      cell.courseIdToMightTakeCourse.values(),
    );
    mightTakeCourses.sort(([a], [b]) => compareStrings(a.id, b.id));
    const mightTakeCourseElements = mightTakeCourses.map(
      ([course, importedCourse]) => {
        const grade =
          importedCourse === undefined
            ? ""
            : `（${gradeToString[importedCourse.grade]}）`;
        // FIXME: year in the url
        const element = stringToHtmlElement(`
<tr class="course" draggable="true" data-course-id="${course.id}">
  <td class="id-name">${course.id}<br>
    <a href="https://kdb.tsukuba.ac.jp/syllabi/2023/${
      course.id
    }/jpn" target="_blank">${course.name}</a>
    <span>${grade}</span>
  </td>
  <td class="credit">${course.credit ?? "-"}</td>
  <td class="term">${lfToBr(course.term)}</td>
  <td class="when">${lfToBr(course.when)}</td>
  <td class="expects">${course.expects}</td>
</tr>
`);
        element.addEventListener("dragstart", (event) => {
          if (!(event.target instanceof HTMLTableRowElement)) {
            return;
          }
          event.dataTransfer?.setData("text/plain", course.id);
        });
        return element;
      },
    );

    const takenCourses = Array.from(cell.courseIdToTakenCourse.values());
    takenCourses.sort(([, a], [, b]) => compareStrings(a.id, b.id));
    const takenCourseElements = takenCourses.map(([course, importedCourse]) => {
      const element = stringToHtmlElement(`
<tr class="course">
  <td class="id-name">${escapeHtml(importedCourse.id)}<br>
    <a href="https://kdb.tsukuba.ac.jp/syllabi/${importedCourse.takenYear}/${
      importedCourse.id
    }/jpn" target="_blank">${escapeHtml(importedCourse.name)}</a>
    <span>(${escapeHtml(importedCourse.takenYear.toString())})</span><br>
    <span>評価：${escapeHtml(gradeToString[importedCourse.grade])}</span>
  </td>
  <td class="credit">${escapeHtml(
    importedCourse.credit?.toString() ?? "-",
  )}</td>
  <td class="term">${lfToBr(course?.term ?? "-")}</td>
  <td class="when">${lfToBr(course?.when ?? "-")}</td>
  <td class="expects">${course?.expects ?? "-"}</td>
</tr>
`);
      return element;
    });

    cellTbodys.notTaken.replaceChildren(...wontTakeCourseElements);
    cellTbodys.mightTake.replaceChildren(...mightTakeCourseElements);
    cellTbodys.taken.replaceChildren(...takenCourseElements);
  }
}

/**
 * @param {HTMLElement} tbody
 * @param {string} courseId
 * @param {HTMLElement} courseElement
 */
function insertCourseElement(tbody, courseId, courseElement) {
  for (const child of tbody.children) {
    if (!(child instanceof HTMLTableRowElement)) {
      throw new Error("cell tbody should only contain <tr>s");
    }
    const childCourseId = child.dataset.courseId;
    if (childCourseId === undefined) {
      throw new Error("'data-course-id' not set");
    }
    if (courseId < childCourseId) {
      child.insertAdjacentElement("beforebegin", courseElement);
      return;
    }
  }
  tbody.appendChild(courseElement);
}

/**
 * @param {Map<string, HTMLElement>} cellIdToCellElement
 * @param {Map<string, CellCredit>} cellIdToCellCredit
 */
function updateCellGauge(cellIdToCellElement, cellIdToCellCredit) {
  for (const [, cellElement, cellCredit] of zipMapIntersection(
    cellIdToCellElement,
    cellIdToCellCredit,
  )) {
    /** @type {number} */
    let green;
    /** @type {number} */
    let yellow;
    if (cellCredit.requirements.creditMin === 0) {
      green = 1;
      yellow = 1;
    } else {
      green = cellCredit.takenSum / cellCredit.requirements.creditMin;
      yellow =
        (cellCredit.takenSum + cellCredit.mightTakeSum) /
        cellCredit.requirements.creditMin;
    }
    cellElement.style.setProperty("--green-percentage", `${100 * green}%`);
    cellElement.style.setProperty("--yellow-percentage", `${100 * yellow}%`);
  }
}

/**
 * @param {number} requirementsTableYear
 * @param {Course[]} courses
 * @param {Record<string, CellMetadata>} cellIdToCellMetadataRecord
 * @param {Record<string, ColumnCreditRequirements>} columnIdToColumnCreditRequirements
 * @param {number} netRequired
 */
export function setup(
  requirementsTableYear,
  courses,
  cellIdToCellMetadataRecord,
  columnIdToColumnCreditRequirements,
  netRequired,
) {
  const cellIdToCellMetadata = new Map(
    Object.entries(cellIdToCellMetadataRecord),
  );
  const cellIds = Array.from(cellIdToCellMetadata.keys());

  /** @type {Map<string, CellTbodys>} */
  const cellIdToCellTbodys = new Map(
    cellIds.map((id) => [
      id,
      {
        notTaken: document.createElement("tbody"),
        mightTake: document.createElement("tbody"),
        taken: document.createElement("tbody"),
      },
    ]),
  );

  const cellElements = [...document.querySelectorAll(".cell")];
  if (!isArrayOfInstanceOf(cellElements, HTMLElement)) {
    throw new Error("cell elements must be HTMLElements");
  }
  const cellIdToCellElement = new Map(map(cellElements, (e) => [e.id, e]));

  const leftBar = mustGetElementById("left-bar");
  const leftTable = mustGetElementByIdOfType(
    "not-taken-table",
    HTMLTableElement,
  );
  const rightBar = mustGetElementById("right-bar");
  const takenTable = mustGetElementByIdOfType("taken-table", HTMLTableElement);
  const mightTakeTable = mustGetElementByIdOfType(
    "might-take-table",
    HTMLTableElement,
  );
  const creditSumView = document.getElementsByTagName("credit-sum-view")?.[0];
  if (!(creditSumView instanceof CreditSumView)) {
    throw new Error();
  }
  const creditSumOverlay =
    document.getElementsByTagName("credit-sum-overlay")?.[0];
  if (!(creditSumOverlay instanceof CreditSumOverlay)) {
    throw new Error();
  }

  let akiko = Akiko.fromCellIdToCourses(
    cellIdToCellMetadata,
    requirementsTableYear,
    courses,
    [],
  );

  /** @type {CourseTables} */
  const courseTables = {
    notTaken: leftTable,
    mightTake: mightTakeTable,
    taken: takenTable,
  };
  /** @type {CourseContainers} */
  const courseContainers = {
    notTaken: mustGetElementById("not-taken-course-container"),
    mightTake: mustGetElementById("might-take-course-container"),
    taken: mustGetElementById("taken-course-container"),
  };

  /** @type {string | undefined} */
  let selectedCellId = undefined;
  let cellIdToCellCredit = akiko.calculateCellIdToCellCredit();
  let columnIdToColumnCredit = calculateColumnIdToColumnCredit(
    cellIdToCellCredit,
    columnIdToColumnCreditRequirements,
  );
  let netCredit = calculateNetCredit(columnIdToColumnCredit, netRequired);

  creditSumOverlay.update(columnIdToColumnCredit, netCredit);

  for (const cellElement of cellElements) {
    cellElement.addEventListener("click", (event) => {
      event.preventDefault();

      for (const c of cellElements) {
        if (c.id !== cellElement.id) {
          c.classList.remove("selected");
        } else {
          c.classList.add("selected");
        }
      }

      if (selectedCellId === undefined) {
        for (const e of document.querySelectorAll(".no-cell-selected")) {
          e.classList.remove("no-cell-selected");
        }
      }
      selectedCellId = cellElement.id;
      const cellTbodys = cellIdToCellTbodys.get(selectedCellId);
      if (cellTbodys === undefined) {
        throw new Error(`no such cell: '${selectedCellId}'`);
      }
      updateCourseTables(courseTables, cellTbodys);
      updateCourseContainers(courseContainers, cellTbodys);

      const selectedCredits = selectedCellCreditAndColumnCredit(
        selectedCellId,
        cellIdToCellCredit,
        columnIdToColumnCredit,
      );
      if (selectedCredits !== undefined) {
        creditSumView.update(selectedCredits);
      }
      creditSumOverlay.update(columnIdToColumnCredit, netCredit);
    });
  }
  initializeCourseElements(akiko, cellIdToCellTbodys);
  updateCellGauge(cellIdToCellElement, cellIdToCellCredit);

  const csvInput = mustGetElementByIdOfType("csv", HTMLInputElement);
  if (!(csvInput.type === "file")) {
    throw new Error('"#csv" must be a file input element');
  }
  csvInput.addEventListener("change", () => {
    const csvFile = csvInput.files?.[0];
    if (csvFile === undefined) {
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const csv = reader.result;
      if (typeof csv !== "string") {
        throw new Error("readAsText() must produce string");
      }
      const result = csvToImportedCourses(csv);
      if (result.kind === "failed-to-parse-as-csv") {
        alert("CSVファイルを正しく読み込めませんでした。");
        return;
      } else if (result.kind === "unexpected-csv-content") {
        alert("CSVファイルを成績データとして読み込めませんでした。");
        return;
      }
      akiko = Akiko.fromCellIdToCourses(
        cellIdToCellMetadata,
        requirementsTableYear,
        courses,
        result.importedCourses,
      );
      cellIdToCellCredit = akiko.calculateCellIdToCellCredit();
      columnIdToColumnCredit = calculateColumnIdToColumnCredit(
        cellIdToCellCredit,
        columnIdToColumnCreditRequirements,
      );
      netCredit = calculateNetCredit(columnIdToColumnCredit, netRequired);
      creditSumOverlay.update(columnIdToColumnCredit, netCredit);

      initializeCourseElements(akiko, cellIdToCellTbodys);
      updateCellGauge(cellIdToCellElement, cellIdToCellCredit);

      if (selectedCellId !== undefined) {
        const cellTbodys = cellIdToCellTbodys.get(selectedCellId);
        if (cellTbodys === undefined) {
          throw new Error(`no such cell: '${selectedCellId}'`);
        }
        updateCourseContainers(courseContainers, cellTbodys);

        const selectedCredits = selectedCellCreditAndColumnCredit(
          selectedCellId,
          cellIdToCellCredit,
          columnIdToColumnCredit,
        );
        if (selectedCredits !== undefined) {
          creditSumView.update(selectedCredits);
        }
      }
    });
    reader.readAsText(csvFile);
  });

  leftBar.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (event.dataTransfer !== null) {
      event.dataTransfer.dropEffect = "move";
    }
  });
  rightBar.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (event.dataTransfer !== null) {
      event.dataTransfer.dropEffect = "move";
    }
  });

  /**
   * @param {DragEvent} event
   * @param {"wont-take" | "might-take"} droppedOn
   */
  const handleDrop = (event, droppedOn) => {
    event.preventDefault();
    if (selectedCellId === undefined) {
      return;
    }
    const courseId = event.dataTransfer?.getData("text/plain");
    if (courseId === undefined) {
      return;
    }
    const cellTbodys = cellIdToCellTbodys.get(selectedCellId);
    if (cellTbodys === undefined) {
      throw new Error(`no such cell: '${selectedCellId}'`);
    }
    akiko.moveCourse(
      droppedOn === "wont-take"
        ? "might-take-to-wont-take"
        : "wont-take-to-might-take",
      courseId,
    );
    cellIdToCellCredit = akiko.calculateCellIdToCellCredit();
    columnIdToColumnCredit = calculateColumnIdToColumnCredit(
      cellIdToCellCredit,
      columnIdToColumnCreditRequirements,
    );
    netCredit = calculateNetCredit(columnIdToColumnCredit, netRequired);

    const cellMetadata = cellIdToCellMetadata[selectedCellId];
    insertCourseElement(
      droppedOn === "wont-take" ? cellTbodys.notTaken : cellTbodys.mightTake,
      courseId,
      document.querySelectorAll(`[data-course-id="${courseId}"]`)[0],
    );
    updateCourseContainers(courseContainers, cellTbodys);
    updateCellGauge(cellIdToCellElement, cellIdToCellCredit);

    const selectedCredits = selectedCellCreditAndColumnCredit(
      selectedCellId,
      cellIdToCellCredit,
      columnIdToColumnCredit,
    );
    if (selectedCredits !== undefined) {
      creditSumView.update(selectedCredits);
    }
    creditSumOverlay.update(columnIdToColumnCredit, netCredit);
  };
  leftBar.addEventListener("drop", (event) => {
    handleDrop(event, "wont-take");
  });
  rightBar.addEventListener("drop", (event) => {
    handleDrop(event, "might-take");
  });
}
