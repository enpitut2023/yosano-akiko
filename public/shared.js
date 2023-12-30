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
 *   creditMin: number | undefined;
 *   creditMax: number | undefined;
 * }} CellMetadata
 */

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
 * @param {CourseElement[]} courseElements
 * @param {CellMetadata} cellMetaData
 */
function showCellCredits(courseElements, cellMetaData) {
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
  const creditMax = cellMetaData.creditMax;
  const creditMin = cellMetaData.creditMin;
  mustGetElementById("credit-sum").innerHTML = `
    <h1>単位数</h1>
    <div>取得済みの単位の合計：${taken_sum}/${creditMin}</div>
    <div>履修中・履修するかもしれない授業の単位を全て取得した場合の単位の合計：${taken_mighttaken_sum}/${creditMin}</div>
  `;
}

/**
 * @param {Course[]} courses
 * @param {Record<string, CellMetadata>} cellIdToCellMetadata
 */
export function setup(courses, cellIdToCellMetadata) {
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
      const selectedCellMetaData = cellIdToCellMetadata[selectedCellId];
      updateCourseTables(courseTables, cellTbodys);
      updateCourseContainers(courseContainers, cellTbodys);
      showCellCredits(courseElements, selectedCellMetaData);
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
        const selectedCellMetaData = cellIdToCellMetadata[selectedCellId];
        showCellCredits(courseElements, selectedCellMetaData);
        updateCellTbodys(cellTbodys, courseElements);
        updateCourseContainers(courseContainers, cellTbodys);
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
  function handleDrop(event, newState) {
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
    const cellMetadata = cellIdToCellMetadata[selectedCellId];
    updateCellTbodys(cellTbodys, courseElements);
    updateCourseContainers(courseContainers, cellTbodys);
    updateCreditSum(selectedCellId, courseElements, cellMetadata);
    showCellCredits(courseElements, cellMetadata);
  }
  leftBar.addEventListener("drop", (event) => {
    handleDrop(event, "not-taken");
  });
  rightBar.addEventListener("drop", (event) => {
    handleDrop(event, "might-take");
  });
}
