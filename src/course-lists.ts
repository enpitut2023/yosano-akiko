import {
  Akiko,
  akikoIsCourseVisible,
  CellId,
  CourseId,
  courseIdCompare,
  Grade,
  gradeIsPass,
  isCellId,
  isCourseId,
} from "./akiko";
import { assert, stringCompare, unreachable } from "./util";

function stringToHtmlElement(s: string): HTMLElement {
  const t = document.createElement("template");
  t.innerHTML = s;
  const child = t.content.firstElementChild;
  assert(child instanceof HTMLElement);
  return child;
}

function escapeHtml(html: string): string {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createSyllabusUrl(year: string, courseId: string): string {
  return `https://kdb.tsukuba.ac.jp/syllabi/${year}/${courseId}/jpn`;
}

function courseElementNew(params: {
  courseId: CourseId;
  name: string;
  courseYear: string;
  takenYear?: string;
  grade?: Grade;
  credit?: string;
  term?: string;
  when?: string;
  expects?: string;
}): HTMLElement {
  function gradeToString(g: Grade): string {
    switch (g) {
      case "wip":
        return "（履修中）";
      case "a+":
        return "評価：A+";
      case "a":
        return "評価：A";
      case "b":
        return "評価：B";
      case "c":
        return "評価：C";
      case "pass":
        return "評価：P";
      case "d":
      case "fail":
        return "（落単済み）";
      default:
        unreachable(g);
    }
  }

  let name: string;
  if (
    params.grade !== undefined &&
    gradeIsPass(params.grade) &&
    params.takenYear !== undefined
  ) {
    name = escapeHtml(`${params.name} (${params.takenYear})`);
    const href = createSyllabusUrl(params.takenYear, params.courseId);
    name = `<a href="${href}" target="_blank" draggable="false">${name}</a>`;
  } else {
    name = escapeHtml(params.name);
    const href = createSyllabusUrl(params.courseYear, params.courseId);
    name = `<a href="${href}" target="_blank" draggable="false">${name}</a>`;
  }

  let grade = "";
  if (params.grade !== undefined) {
    grade = `<br><span>${gradeToString(params.grade)}</span>`;
  }

  return stringToHtmlElement(`
<tr class="course" data-course-id="${params.courseId}">
  <td class="id-name">
    <span>${params.courseId}</span><br>
    <span>${name}</span>${grade}
  </td>
  <td class="credit">${params.credit ?? "-"}</td>
  <td class="term">${params.term ?? "-"}</td>
  <td class="when">${params.when ?? "-"}</td>
  <td class="expects">${params.expects ?? "-"}</td>
</tr>
`);
}

function fakeCourseElementNew(params: {
  name: string;
  takenYear?: string;
  credit?: string;
}): HTMLElement {
  let name = params.name;
  if (params.takenYear !== undefined) {
    name += ` (${params.takenYear})`;
  }
  name = escapeHtml(name);

  const e = stringToHtmlElement(`
<tr class="course">
  <td class="id-name">
    <span>${name}</span>
  </td>
  <td class="credit">${params.credit ?? "-"}</td>
  <td class="term"></td>
  <td class="when"></td>
  <td class="expects"></td>
</tr>
`);
  e.dataset.courseName = params.name;
  return e;
}

function courseElementMustGetCourseId(e: HTMLElement): CourseId {
  const id = e.dataset.courseId;
  assert(id !== undefined && isCourseId(id));
  return id;
}

function fakeCourseElementMustGetCourseName(e: HTMLElement): string {
  const name = e.dataset.courseName;
  assert(name !== undefined);
  return name;
}

function courseElementCompare(
  akiko: Akiko,
  a: HTMLElement,
  b: HTMLElement,
): number {
  const aId = courseElementMustGetCourseId(a);
  const bId = courseElementMustGetCourseId(b);
  const aGrade = akiko.realCourses.get(aId);
  const bGrade = akiko.realCourses.get(bId);
  if (aGrade !== undefined && bGrade === undefined) {
    return -1;
  } else if (aGrade === undefined && bGrade !== undefined) {
    return 1;
  }
  return courseIdCompare(aId, bId);
}

function sortCourseElements(akiko: Akiko, es: HTMLElement[]): void {
  es.sort((a, b) => courseElementCompare(akiko, a, b));
}

function sortFakeCourseElements(es: HTMLElement[]): void {
  es.sort((a, b) =>
    stringCompare(
      fakeCourseElementMustGetCourseName(a),
      fakeCourseElementMustGetCourseName(b),
    ),
  );
}

function setTransferData(
  dt: DataTransfer,
  courseId: CourseId,
  cellId: CellId,
): void {
  dt.setData("text/plain", `${courseId},${cellId}`);
}

function getTransferData(dt: DataTransfer): [CourseId, CellId] | undefined {
  const chunks = dt.getData("text/plain").split(",");
  if (chunks.length !== 2) {
    return undefined;
  }
  const [courseId, cellId] = chunks;
  if (isCourseId(courseId) && isCellId(cellId)) {
    return [courseId, cellId];
  }
}

type Cell = {
  wontTakeTbody: HTMLElement;
  mightTakeTbody: HTMLElement;
  takenTbody: HTMLElement;
  fakeTbody: HTMLElement;
};

export class CourseLists {
  private cells = new Map<CellId, Cell>();
  private courseIdToCourseElement = new Map<CourseId, HTMLElement>();

  private selectedCellId: CellId | undefined;
  private lastIdOrName: string | undefined;

  constructor(
    private akiko: Akiko,
    private knownCourseYear: number,
    private wontTakeTable: HTMLElement,
    private mightTakeTable: HTMLElement,
    private takenTable: HTMLElement,
    private fakeTable: HTMLElement,
    private wontTakeContainer: HTMLElement,
    private mightTakeContainer: HTMLElement,
    private takenContainer: HTMLElement,
    private fakeContainer: HTMLElement,
    private wontTakeDropTarget: HTMLElement,
    private mightTakeDropTarget: HTMLElement,
    private dropGuide: HTMLElement,
    private handleMoveToWontTake: (id: CourseId) => void,
    private handleMoveToMightTake: (id: CourseId) => void,
  ) {
    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      if (event.dataTransfer !== null) {
        event.dataTransfer.dropEffect = "move";
      }
    };
    wontTakeDropTarget.addEventListener("dragover", handleDragOver);
    mightTakeDropTarget.addEventListener("dragover", handleDragOver);

    wontTakeDropTarget.addEventListener("drop", (event) => {
      this.handleDrop(event, true);
    });
    mightTakeDropTarget.addEventListener("drop", (event) => {
      this.handleDrop(event, false);
    });

    this.setAkikoForce(akiko);
  }

  private updateContainers(): void {
    if (this.selectedCellId === undefined) {
      this.wontTakeContainer.dataset.state = "no-cell-selected";
      this.mightTakeContainer.dataset.state = "no-cell-selected";
      this.takenContainer.dataset.state = "no-cell-selected";
      this.fakeContainer.dataset.state = "no-cell-selected";
    } else {
      const cell = this.cells.get(this.selectedCellId);
      assert(cell !== undefined);
      this.wontTakeContainer.dataset.state =
        cell.wontTakeTbody.childElementCount === 0
          ? "no-courses"
          : "contains-courses";
      this.mightTakeContainer.dataset.state =
        cell.mightTakeTbody.childElementCount === 0
          ? "no-courses"
          : "contains-courses";
      this.takenContainer.dataset.state =
        cell.takenTbody.childElementCount === 0
          ? "no-courses"
          : "contains-courses";
      this.fakeContainer.dataset.state =
        cell.fakeTbody.childElementCount === 0
          ? "no-courses"
          : "contains-courses";
    }
  }

  private showDropGuide(id: CourseId): boolean {
    const pos = this.akiko.coursePositions.get(id);
    assert(pos !== undefined);
    let dropTarget: HTMLElement;
    switch (pos.listKind) {
      case "wont-take":
        dropTarget = this.mightTakeDropTarget;
        break;
      case "might-take":
        dropTarget = this.wontTakeDropTarget;
        break;
      case "taken":
        return false;
      default:
        unreachable(pos.listKind);
    }
    const rect = dropTarget.getBoundingClientRect();
    this.dropGuide.style.left = `${rect.x}px`;
    this.dropGuide.style.top = `${rect.y}px`;
    this.dropGuide.style.width = `${rect.width}px`;
    this.dropGuide.style.height = `${rect.height}px`;
    this.dropGuide.classList.remove("hidden");
    return true;
  }

  private hideDropGuide(): void {
    this.dropGuide.classList.add("hidden");
  }

  private handleDrop(event: DragEvent, droppedOnWontTake: boolean): void {
    if (event.dataTransfer === null) {
      return;
    }
    const data = getTransferData(event.dataTransfer);
    assert(data !== undefined);
    const [toMoveCourseId, cellId] = data;

    const cell = this.cells.get(cellId);
    assert(cell !== undefined);
    const dstTbody = droppedOnWontTake
      ? cell.wontTakeTbody
      : cell.mightTakeTbody;

    const toMove = this.courseIdToCourseElement.get(toMoveCourseId);
    assert(toMove !== undefined);

    let inserted = false;
    for (const element of dstTbody.children) {
      assert(element instanceof HTMLElement);
      if (courseElementCompare(this.akiko, element, toMove) > 0) {
        element.insertAdjacentElement("beforebegin", toMove);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      dstTbody.appendChild(toMove);
    }
    this.updateContainers();

    if (droppedOnWontTake) {
      this.handleMoveToWontTake(toMoveCourseId);
    } else {
      this.handleMoveToMightTake(toMoveCourseId);
    }
  }

  private setAkikoForce(akiko: Akiko): void {
    this.akiko = akiko;

    this.wontTakeTable.children.item(1)?.remove();
    this.mightTakeTable.children.item(1)?.remove();
    this.takenTable.children.item(1)?.remove();
    this.fakeTable.children.item(1)?.remove();
    this.cells.clear();
    this.courseIdToCourseElement.clear();
    this.selectedCellId = undefined;
    this.lastIdOrName = undefined;
    this.updateContainers();

    const cellIdToCourseElements = new Map<
      CellId,
      {
        wontTake: HTMLElement[];
        mightTake: HTMLElement[];
        taken: HTMLElement[];
        fake: HTMLElement[];
      }
    >();
    for (const [courseId, { cellId, listKind }] of akiko.coursePositions) {
      let courseElements = cellIdToCourseElements.get(cellId);
      if (courseElements === undefined) {
        courseElements = { wontTake: [], mightTake: [], taken: [], fake: [] };
        cellIdToCourseElements.set(cellId, courseElements);
      }

      const kc = akiko.knownCourses.get(courseId);
      const rc = akiko.realCourses.get(courseId);
      const element = courseElementNew({
        courseId,
        name: kc?.name ?? rc?.name ?? "（不明）",
        courseYear: this.knownCourseYear.toString(),
        takenYear: rc?.takenYear?.toString(),
        grade: rc?.grade,
        credit: kc?.credit?.toString() ?? rc?.credit?.toString(),
        term: kc?.term,
        when: kc?.when,
        expects: kc?.expects,
      });

      if (listKind === "wont-take" || listKind === "might-take") {
        element.draggable = true;
        element.addEventListener("dragstart", (event) => {
          if (event.dataTransfer !== null) {
            setTransferData(event.dataTransfer, courseId, cellId);
            this.showDropGuide(courseId);
          }
        });
        element.addEventListener("dragend", () => {
          console.log("here");
          this.hideDropGuide();
        });
      }

      this.courseIdToCourseElement.set(courseId, element);
      switch (listKind) {
        case "wont-take":
          courseElements.wontTake.push(element);
          break;
        case "might-take":
          courseElements.mightTake.push(element);
          break;
        case "taken":
          courseElements.taken.push(element);
          break;
        default:
          unreachable(listKind);
      }
    }

    for (const [fakeCourseId, cellId] of akiko.fakeCoursePositions) {
      let courseElements = cellIdToCourseElements.get(cellId);
      if (courseElements === undefined) {
        courseElements = { wontTake: [], mightTake: [], taken: [], fake: [] };
        cellIdToCourseElements.set(cellId, courseElements);
      }
      const fc = akiko.fakeCourses.get(fakeCourseId);
      if (fc === undefined) {
        continue;
      }
      const element = fakeCourseElementNew({
        name: fc.name,
        takenYear: fc.takenYear.toString(),
        credit: fc.credit?.toString(),
      });
      courseElements.fake.push(element);
    }

    for (const [cellId, courseElements] of cellIdToCourseElements) {
      sortCourseElements(this.akiko, courseElements.wontTake);
      sortCourseElements(this.akiko, courseElements.mightTake);
      sortCourseElements(this.akiko, courseElements.taken);
      sortFakeCourseElements(courseElements.fake);
      const cell: Cell = {
        wontTakeTbody: document.createElement("tbody"),
        mightTakeTbody: document.createElement("tbody"),
        takenTbody: document.createElement("tbody"),
        fakeTbody: document.createElement("tbody"),
      };
      for (const e of courseElements.wontTake) {
        cell.wontTakeTbody.appendChild(e);
      }
      for (const e of courseElements.mightTake) {
        cell.mightTakeTbody.appendChild(e);
      }
      for (const e of courseElements.taken) {
        cell.takenTbody.appendChild(e);
      }
      for (const e of courseElements.fake) {
        cell.fakeTbody.appendChild(e);
      }
      this.cells.set(cellId, cell);
    }
  }

  setAkiko(akiko: Akiko): void {
    if (this.akiko === akiko) {
      return;
    }
    this.setAkikoForce(akiko);
  }

  setSelectedCellId(id: CellId | undefined): boolean {
    if (id === this.selectedCellId) {
      return true;
    }

    if (this.selectedCellId !== undefined) {
      const oldCell = this.cells.get(this.selectedCellId);
      assert(oldCell !== undefined);
      oldCell.wontTakeTbody.remove();
      oldCell.mightTakeTbody.remove();
      oldCell.takenTbody.remove();
      oldCell.fakeTbody.remove();
    }
    this.selectedCellId = id;

    if (id !== undefined) {
      const newCell = this.cells.get(id);
      if (newCell === undefined) {
        return false;
      }
      this.wontTakeTable.appendChild(newCell.wontTakeTbody);
      this.mightTakeTable.appendChild(newCell.mightTakeTbody);
      this.takenTable.appendChild(newCell.takenTbody);
      this.fakeTable.appendChild(newCell.fakeTbody);
    }
    this.updateContainers();

    return true;
  }

  filter(idOrName: string): void {
    if (this.lastIdOrName === idOrName) {
      return;
    }
    this.lastIdOrName = idOrName;

    for (const [courseId, courseElement] of this.courseIdToCourseElement) {
      const pos = this.akiko.coursePositions.get(courseId);
      assert(pos !== undefined);
      const visible = akikoIsCourseVisible(this.akiko, courseId, idOrName);
      courseElement.classList.toggle("hide-in-wont-take", !visible);
    }
  }
}
