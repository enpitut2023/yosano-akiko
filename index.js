import { classes } from "./classes.js";

/**
 * @param {string} s
 * @return {HTMLElement}
 */
export function stringToHtmlElement(s) {
  const t = document.createElement("template");
  t.innerHTML = s.trim();
  return t.content.firstChild;
}

/**
 * @param {string} html
 * @return {string}
 */
export function escapeHtml(html) {
  const text = document.createTextNode(html);
  const p = document.createElement("p");
  p.appendChild(text);
  return p.innerHTML;
}

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

function main() {
  const cellIdToFilter = { b1: isB1, b2: isB2 };

  /**
   * @typedef {import("./classes.js").Class} Class
   */

  /**
   * @param {Class[]} classes
   * @param {string} cellId
   * @returns {Class[] | undefined}
   */
  function classesInCell(classes, cellId) {
    const filter = cellIdToFilter[cellId];
    if (filter === undefined) {
      return;
    }
    return classes.filter(([id]) => {
      if (id === undefined) {
        return false;
      } else {
        return filter(id);
      }
    });
  }

  /**
   * @param {HTMLTableElement} table
   */
  function clearTable(table) {
    table.lastElementChild.replaceChildren();
  }

  const cells = [...document.querySelectorAll(".cell")];
  const leftBar = document.getElementById("left-bar");
  const leftTable = leftBar.getElementsByTagName("table")[0];
  const leftTableBody = leftTable.getElementsByTagName("tbody")[0];
  const rightBar = document.getElementById("right-bar");
  const rightTable = rightBar.getElementsByTagName("table")[0];
  const rightTableBody = rightTable.getElementsByTagName("tbody")[0];

  /**
   * @type {string | undefined}
   */
  let selectedCellId = undefined;
  /**
   * @type {{ [key: string]: Class[] }}
   */
  const cellIdToSelected = { b1: [], b2: [] };

  for (const cell of cells) {
    cell.addEventListener("click", (event) => {
      event.preventDefault();

      for (const c of cells) {
        if (c.id !== cell.id) {
          c.classList.remove("selected");
        } else {
          c.classList.add("selected");
        }
      }

      selectedCellId = cell.id;

      clearTable(leftTable);
      clearTable(rightTable);
      document
        .querySelector("#left-bar > .classes")
        .classList.remove("no-cell-selected");
      const selected = cellIdToSelected[cell.id];

      for (const [id, name, credit, term, when] of classesInCell(
        classes,
        cell.id,
      )) {
        if (selected.some(([i]) => i === id)) {
          continue;
        }

        const e = stringToHtmlElement(`
        <tr draggable="true" data-class-id="${id}">
          <td>${id}<br>${escapeHtml(name)}</td>
          <td>${credit}</td>
          <td>${term}</td>
          <td>${when}</td>
        </tr>
      `);
        e.addEventListener("dragstart", (event) => {
          event.dataTransfer.setData("text/plain", id);
        });
        leftTableBody.appendChild(e);
      }

      for (const cls of selected) {
        const [id, name, credit] = cls;
        const e = stringToHtmlElement(`
        <tr>
          <td>${id}<br>${escapeHtml(name)}</td>
          <td>${credit}</td>
        </tr>
      `);
        rightTableBody.appendChild(e);
      }
    });
  }

  rightBar.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });

  rightBar.addEventListener("drop", (event) => {
    event.preventDefault();
    if (selectedCellId === undefined) {
      return;
    }

    const id = event.dataTransfer.getData("text/plain");
    const cls = classes.find(([i]) => i === id);
    if (cls === undefined) {
      return;
    }

    const [_, name, credit] = cls;
    const e = stringToHtmlElement(`
    <tr>
      <td>${id}<br>${escapeHtml(name)}</td>
      <td>${credit}</td>
    </tr>
  `);
    rightTableBody.appendChild(e);
    cellIdToSelected[selectedCellId].push(cls);
    leftTableBody.querySelector(`[data-class-id="${id}"]`).remove();

    document
      .querySelector("#right-bar > .classes")
      .classList.remove("no-cell-selected");
  });
}

window.addEventListener("load", main);
