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
 *  filter: (id: string) => boolean;
 *  creditMin: number | undefined;
 *  creditMax: number | undefined; 
 * }} CellMetaData
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
 * @param {Element} mightTakeContainer
 * @param {Element} mightTakeTbody
 */
function updateMightTakeContainer(mightTakeContainer, mightTakeTbody) {
  if (mightTakeTbody.childElementCount === 0) {
    mightTakeContainer.classList.add("contains-no-courses");
  } else {
    mightTakeContainer.classList.remove("contains-no-courses");
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
 * @param {CourseElement[]} courseElements
 * @param {CellMetaData} cellMetaData
 */
function showCellCredits(courseElements, cellMetaData) {
  let taken_sum = 0;
  let taken_mighttaken_sum = 0;
  for (const courseElement of courseElements) {
    const state = courseElement.state;
    const credit = courseElement.course.credit;
    if (credit !== undefined && (state !== "not-taken")) {
      taken_mighttaken_sum += credit;
      if (state == "taken") {
        taken_sum += credit
      }
    }
  }
  const creditMax = cellMetaData.creditMax
  const creditMin = cellMetaData.creditMin
  const e = document.getElementById("credit-sum")
  const sums = `
  <div class="separator"></div>
  <h1>単位数</h1>
  <div id="taken-sum">履修した合計単位：${taken_sum}/${creditMin}</div>
  <div id="takne-mighttaken-sum">履修する予定の合計単位：${taken_mighttaken_sum}/${creditMin}</div>
  `
  if (e !== null) {
    e.innerHTML = sums;
  }
}

/**
 * @param {Course[]} courses
 * @param {Record<string, CellMetaData>} cellIdToCellMetaData
 */
export function setup(courses, cellIdToCellMetaData) {
  const cellIds = Object.keys(cellIdToCellMetaData);

  /** @type {Map<string, CourseElement[]>} */
  const cellIdToCourseElements = new Map();
  for (const cellId of cellIds) {
    /** @type {CourseElement[]} */
    const elements = courses
      .filter(({ id }) => cellIdToCellMetaData[cellId].filter(id))
      .map((course) => {
        // FIXME: year
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
  const leftTable = leftBar.getElementsByTagName("table")[0];
  const rightBar = mustGetElementById("right-bar");
  const rightTable = rightBar.getElementsByTagName("table")[0];
  const mightTakeTable = rightBar.getElementsByTagName("table")[1];
  const mightTakeContainer = mustGetElementById("container-might-take");

  /** @type {CourseTables} */
  const courseTables = {
    notTaken: leftTable,
    mightTake: mightTakeTable,
    taken: rightTable,
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
      const selectedCellMetaData = cellIdToCellMetaData[selectedCellId]
      showCellCredits(courseElements, selectedCellMetaData);
      updateCourseTables(courseTables, cellTbodys);
      updateMightTakeContainer(mightTakeContainer, cellTbodys.mightTake);
    });
  }

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
    updateCellTbodys(cellTbodys, courseElements);
    updateMightTakeContainer(mightTakeContainer, cellTbodys.mightTake);

    showCellCredits(courseElements, cellIdToCellMetaData[selectedCellId]);

  }
  leftBar.addEventListener("drop", (event) => {
    handleDrop(event, "not-taken");
  });
  rightBar.addEventListener("drop", (event) => {
    handleDrop(event, "might-take");
  });
}
