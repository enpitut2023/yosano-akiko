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
 * @typedef {"wip" | "a+" | "a" | "b" | "c" | "d" | "pass" | "fail" | "ok"} Grade;
 * @typedef {{
 *   id: string;
 *   grade: Grade;
 * }} GradedCourse
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
      <h1>単位数</h1>
      <div>
        <p>セルを選択してください</p>
        <ul>
          <li>選択されているセル<ul>
              <li>取得済み：<span></span></li>
              <li>取得済み＋履修中・履修するかもしれない：<span></span></li>
            </ul>
          </li>
          <li>選択されている列の全セル<ul>
              <li>取得済み：<span></span></li>
              <li>取得済み＋履修中・履修するかもしれない：<span></span></li>
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
 * @param {CellTbodys} cellTbodys
 * @param {CourseElement[]} courseElements
 */
function updateCellTbodys(cellTbodys, courseElements) {
  for (const { state, element } of courseElements) {
    switch (state) {
      case "not-taken":
        cellTbodys.notTaken.appendChild(element);
        break;
      case "might-take":
        cellTbodys.mightTake.appendChild(element);
        break;
      case "taken":
        cellTbodys.taken.appendChild(element);
        break;
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
 * @param {String} cellId
 * @param {CourseElement[]} courseElements
 * @param {CellMetadata} cellMetadata
 */
function updateCreditSum(cellId, courseElements, cellMetadata) {
  let taken_sum = 0;
  let taken_mighttaken_sum = 0;
  for (const courseElement of courseElements) {
    const state = courseElement.state;
    const credit = courseElement.course.credit;
    if (credit !== undefined && state !== "not-taken") {
      taken_mighttaken_sum += credit;
      if (state == "taken") {
        taken_sum += credit;
      }
    }
  }
  const creditMax = cellMetadata.creditMax;
  const creditMin = cellMetadata.creditMin;
  const sumEllement = document.getElementById(`${cellId}-sum`);
  if (sumEllement !== null) {
    let sums = "";
    if (taken_sum == taken_mighttaken_sum) {
      sums = `${taken_sum}/${creditMin}`;
    } else {
      sums = `
      ${taken_sum}/${creditMin}<br>
      ↓<br>
      ${taken_mighttaken_sum}/${creditMin}
      `;
    }
    sumEllement.innerHTML = sums;
  }
  if (creditMin !== undefined) {
    updateBackground(cellId, taken_mighttaken_sum, creditMin);
  }
}

/**
 * @param {string} cellId
 * @param {number} taken_mighttaken_sum
 * @param {number} creditMin
 */
function updateBackground(cellId, taken_mighttaken_sum, creditMin) {
  const cellElement = document.getElementById(cellId);
  const gageElement = document.getElementById(`${cellId}-gage`);
  if (gageElement !== null && cellElement !== null) {
    if (taken_mighttaken_sum >= creditMin) {
      cellElement.style.border = "4px dashed rgba(0, 255, 0, 0.5)";
      cellElement.style.backgroundColor = "rgba(0, 255, 0, 0.2)";
      gageElement.style.width = "";
    } else {
      const gageValue = (100 * taken_mighttaken_sum) / creditMin;
      gageElement.style.width = `${gageValue}%`;
      cellElement.style.border = "";
      cellElement.style.backgroundColor = "";
    }
  }
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
 * @param {string} courseId
 * @param {Record<string, CellMetadata>} cellIdToCellMetadata
 * @returns {string | undefined}
 */
function courseIdToCellId(courseId, cellIdToCellMetadata) {
  for (const cellId in cellIdToCellMetadata) {
    if (cellIdToCellMetadata[cellId].filter(courseId)) {
      return cellId;
    }
  }
}

/**
 * @param {Grade} g
 * @returns {CourseElementState}
 */
function gradeToCourseElementState(g) {
  switch (g) {
    case "wip":
      return "might-take";
    case "a+":
    case "a":
    case "b":
    case "c":
    case "pass":
    case "ok":
      return "taken";
    case "d":
    case "fail":
      return "not-taken";
  }
}

/**
 * @typedef {{
 *   kind: "ok";
 * } | {
 *   kind: "unknown-courses";
 *   unknownCourseIds: string[];
 * }} ApplyCourseGradesResult
 *
 * @param {Map<string, CourseElement[]>} cellIdToCourseElements
 * @param {Record<string, CellMetadata>} cellIdToCellMetadata
 * @param {GradedCourse[]} gradedCourses
 * @returns {ApplyCourseGradesResult}
 */
function applyCourseGrades(
  cellIdToCourseElements,
  cellIdToCellMetadata,
  gradedCourses,
) {
  for (const courseElements of cellIdToCourseElements.values()) {
    for (const courseElement of courseElements) {
      courseElement.state = "not-taken";
    }
  }
  /** @type {string[]} */
  const unknownCourseIds = [];
  for (const gradedCourse of gradedCourses) {
    if (gradedCourse.id === "") {
      // gradedCourseが認可された授業だった場合
      continue;
    }
    const cellId = courseIdToCellId(gradedCourse.id, cellIdToCellMetadata);
    if (cellId === undefined) {
      // gradedCourseが必修だった場合
      continue;
    }
    const courseElements = cellIdToCourseElements.get(cellId);
    if (courseElements === undefined) {
      throw new Error("should be unreachable");
    }
    const courseElement = courseElements.find(
      (e) => e.course.id === gradedCourse.id,
    );
    if (courseElement === undefined) {
      unknownCourseIds.push(gradedCourse.id);
    } else {
      courseElement.state = gradeToCourseElementState(gradedCourse.grade);
    }
  }
  for (const courseElements of cellIdToCourseElements.values()) {
    for (const courseElement of courseElements) {
      courseElement.element.draggable = courseElement.state !== "taken";
    }
  }
  if (unknownCourseIds.length === 0) {
    return { kind: "ok" };
  } else {
    return { kind: "unknown-courses", unknownCourseIds };
  }
}

/**
 * @param {string} s
 * @returns {Grade | undefined}
 */
function parseGrade(s) {
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
      return "ok";
  }
}

/**
 * @param {unknown[]} row
 * @returns {GradedCourse | undefined}
 */
function parseGradedCourse(row) {
  const id = row[2];
  const rawGrade = row[7];
  if (typeof id !== "string" || typeof rawGrade !== "string") {
    return;
  }
  const grade = parseGrade(rawGrade);
  if (grade === undefined) {
    return;
  }
  return { id, grade };
}

/**
 * @typedef {{
 *   kind: "ok";
 *   gradedCourses: GradedCourse[];
 * } | {
 *   kind: "failed-to-parse-as-csv";
 * } | {
 *   kind: "unexpected-csv-content";
 * }} CsvToGradedCoursesResult
 *
 * @param {string} csv
 * @returns {CsvToGradedCoursesResult}
 */
function csvToGradedCourses(csv) {
  /** @type {unknown} */
  let rows;
  try {
    rows = parse(csv);
  } catch {
    return { kind: "failed-to-parse-as-csv" };
  }
  if (!(Array.isArray(rows) && rows.length >= 1)) {
    return { kind: "unexpected-csv-content" };
  }

  /** @type {GradedCourse[]} */
  const gradedCourses = [];
  for (const row of rows.slice(1)) {
    const gradedCourse = parseGradedCourse(row);
    if (gradedCourse === undefined) {
      return { kind: "unexpected-csv-content" };
    }
    gradedCourses.push(gradedCourse);
  }
  return { kind: "ok", gradedCourses };
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
 * @param {Map<string, CourseElement[]>} cellIdToCourseElements
 * @param {Record<string, CellMetadata>} cellIdToCellMetadata
 * @returns {Map<string, CellCredit>}
 */
function calculateCellIdToCellCredit(
  cellIdToCourseElements,
  cellIdToCellMetadata,
) {
  /** @type {Map<string, CellCredit>} */
  const cellIdToCellCredit = new Map();
  for (const [cellId, courseElements] of cellIdToCourseElements) {
    const cellMetadata = cellIdToCellMetadata[cellId];
    const takenSum = mapSum(courseElements, (e) =>
      e.state === "taken" ? e.course.credit ?? 0 : 0,
    );
    const mightTakeSum = mapSum(courseElements, (e) =>
      e.state === "might-take" ? e.course.credit ?? 0 : 0,
    );
    cellIdToCellCredit.set(cellId, {
      takenSum,
      mightTakeSum,
      requirements: {
        creditMin: cellMetadata.creditMin,
        creditMax: cellMetadata.creditMax,
      },
    });
  }
  return cellIdToCellCredit;
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
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
      clamp(takenSum, 0, requirements.creditMax ?? Infinity),
    );
    const mightTakeSum = mapSum(
      entries,
      ([_, { mightTakeSum, requirements }]) =>
        clamp(mightTakeSum, 0, requirements.creditMax ?? Infinity),
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
 * @param {Course[]} courses
 * @param {Record<string, CellMetadata>} cellIdToCellMetadata
 * @param {Record<string, ColumnCreditRequirements>} columnIdToColumnCreditRequirements
 * @param {number} netRequired
 */
export function setup(
  courses,
  cellIdToCellMetadata,
  columnIdToColumnCreditRequirements,
  netRequired,
) {
  const cellIds = Object.keys(cellIdToCellMetadata);

  /** @type {Map<string, CourseElement[]>} */
  const cellIdToCourseElements = new Map();
  for (const cellId of cellIds) {
    /** @type {CourseElement[]} */
    const elements = courses
      .filter(({ id }) => cellIdToCellMetadata[cellId].filter(id))
      .map((course) => {
        // FIXME: year in the url
        const element = stringToHtmlElement(`
            <tr class="course" draggable="true">
              <td class="id-name">${course.id}<br>
                <a href="https://kdb.tsukuba.ac.jp/syllabi/2023/${course.id}/jpn" target="_blank">${course.name}</a>
              </td>
              <td class="credit">${course.credit}</td>
              <td class="term">${course.term}</td>
              <td class="when">${course.when}</td>
              <td class="expects">${course.expects}</td>
            </tr>
          `);
        element.addEventListener("dragstart", (event) => {
          if (!(event.target instanceof HTMLTableRowElement)) {
            return;
          }
          event.dataTransfer?.setData("text/plain", course.id);
        });
        return { state: "not-taken", course, element };
      });
    cellIdToCourseElements.set(cellId, elements);
  }

  /** @type {Map<string, CellTbodys>} */
  const cellIdToCellTbodys = new Map();
  for (const [id, courseElements] of cellIdToCourseElements.entries()) {
    /** @type {CellTbodys} */
    const tbodys = {
      notTaken: document.createElement("tbody"),
      mightTake: document.createElement("tbody"),
      taken: document.createElement("tbody"),
    };
    updateCellTbodys(tbodys, courseElements);
    cellIdToCellTbodys.set(id, tbodys);
  }

  const cellElements = [...document.querySelectorAll(".cell")];
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
  let cellIdToCellCredit = calculateCellIdToCellCredit(
    cellIdToCourseElements,
    cellIdToCellMetadata,
  );
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
      const courseElements = cellIdToCourseElements.get(selectedCellId);
      if (cellTbodys === undefined || courseElements === undefined) {
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

  const csvInput = mustGetElementById("csv");
  if (!(csvInput instanceof HTMLInputElement && csvInput.type === "file")) {
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
      const result = csvToGradedCourses(csv);
      if (result.kind === "failed-to-parse-as-csv") {
        alert("CSVファイルを正しく読み込めませんでした。");
        return;
      } else if (result.kind === "unexpected-csv-content") {
        alert("CSVファイルを成績データとして読み込めませんでした。");
        return;
      }
      const applyCourseGradesResult = applyCourseGrades(
        cellIdToCourseElements,
        cellIdToCellMetadata,
        result.gradedCourses,
      );
      if (applyCourseGradesResult.kind === "unknown-courses") {
        const ids = applyCourseGradesResult.unknownCourseIds.join("\n");
        alert(
          `未知の科目番号の授業が含まれています。間違った年次のページを開いていませんか？\n未知の科目番号一覧:\n${ids}`,
        );
      }
      cellIdToCellCredit = calculateCellIdToCellCredit(
        cellIdToCourseElements,
        cellIdToCellMetadata,
      );
      columnIdToColumnCredit = calculateColumnIdToColumnCredit(
        cellIdToCellCredit,
        columnIdToColumnCreditRequirements,
      );
      netCredit = calculateNetCredit(columnIdToColumnCredit, netRequired);
      creditSumOverlay.update(columnIdToColumnCredit, netCredit);

      for (const cellId of cellIds) {
        const cellTbodys = cellIdToCellTbodys.get(cellId);
        const courseElements = cellIdToCourseElements.get(cellId);
        if (cellTbodys === undefined || courseElements === undefined) {
          throw new Error("should be unreachable");
        }
        updateCellTbodys(cellTbodys, courseElements);
        updateCreditSum(cellId, courseElements, cellIdToCellMetadata[cellId]);
      }

      if (selectedCellId !== undefined) {
        const cellTbodys = cellIdToCellTbodys.get(selectedCellId);
        const courseElements = cellIdToCourseElements.get(selectedCellId);
        if (cellTbodys === undefined || courseElements === undefined) {
          throw new Error(`no such cell: '${selectedCellId}'`);
        }
        updateCellTbodys(cellTbodys, courseElements);
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
   * @param {CourseElementState} newState
   */
  const handleDrop = (event, newState) => {
    event.preventDefault();
    if (selectedCellId === undefined) {
      return;
    }
    const courseId = event.dataTransfer?.getData("text/plain");
    if (courseId === undefined) {
      return;
    }
    const cellTbodys = cellIdToCellTbodys.get(selectedCellId);
    const courseElements = cellIdToCourseElements.get(selectedCellId);
    if (cellTbodys === undefined || courseElements === undefined) {
      throw new Error(`no such cell: '${selectedCellId}'`);
    }
    for (const e of courseElements) {
      if (e.course.id === courseId) {
        e.state = newState;
      }
    }
    cellIdToCellCredit = calculateCellIdToCellCredit(
      cellIdToCourseElements,
      cellIdToCellMetadata,
    );
    columnIdToColumnCredit = calculateColumnIdToColumnCredit(
      cellIdToCellCredit,
      columnIdToColumnCreditRequirements,
    );
    netCredit = calculateNetCredit(columnIdToColumnCredit, netRequired);

    const cellMetadata = cellIdToCellMetadata[selectedCellId];
    updateCellTbodys(cellTbodys, courseElements);
    updateCourseContainers(courseContainers, cellTbodys);
    updateCreditSum(selectedCellId, courseElements, cellMetadata);

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
    handleDrop(event, "not-taken");
  });
  rightBar.addEventListener("drop", (event) => {
    handleDrop(event, "might-take");
  });
}
