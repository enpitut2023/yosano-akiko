import { parse } from "csv-parse/sync";

function assert(b: boolean): asserts b {
  if (!b) {
    throw new Error("assertion failed");
  }
}

type Course = {
  id: string;
  name: string;
  credit: number | undefined;
  expects: string;
  term: string;
  when: string;
};

type CourseElementState = "not-taken" | "might-take" | "taken";
type CourseElement = {
  state: CourseElementState;
  course: Course;
  element: HTMLElement;
};

type CellTbodys = {
  notTaken: HTMLTableSectionElement;
  mightTake: HTMLTableSectionElement;
  taken: HTMLTableSectionElement;
};

type CourseTables = {
  notTaken: HTMLTableElement;
  mightTake: HTMLTableElement;
  taken: HTMLTableElement;
};

type CourseContainers = {
  notTaken: HTMLElement;
  mightTake: HTMLElement;
  taken: HTMLElement;
};

export type CellFilterArgs = {
  name: string;
  native: boolean;
};
type CellMetadata = {
  filter: (id: string, args: CellFilterArgs) => boolean;
  creditMin: number;
  creditMax: number | undefined;
};

type CellCreditRequirements = {
  creditMin: number;
  creditMax: number | undefined;
};
type ColumnCreditRequirements = {
  creditMin: number;
  creditMax: number;
};
type CellCredit = {
  takenSum: number;
  mightTakeSum: number;
  requirements: CellCreditRequirements;
};
type ColumnCredit = {
  takenSum: number;
  mightTakeSum: number;
  requirements: ColumnCreditRequirements;
};
type NetCredit = {
  takenSum: number;
  mightTakeSum: number;
  required: number;
};

type ImportedCourseGrade =
  | "wip"
  | "a+"
  | "a"
  | "b"
  | "c"
  | "d"
  | "pass"
  | "fail"
  | "free";
type ImportedCourse = {
  id: string;
  name: string;
  credit: number | undefined;
  takenYear: number;
  grade: ImportedCourseGrade;
};
type MaybeImportedCourse =
  | {
      id: string;
      course: Course;
      importedCourse: undefined;
    }
  | {
      id: string;
      course: undefined;
      importedCourse: ImportedCourse;
    }
  | {
      id: string;
      course: Course;
      importedCourse: ImportedCourse;
    };

function maybeImportedCourseGetName(c: MaybeImportedCourse): string {
  if (c.course !== undefined) {
    return c.course.name;
  } else {
    return c.importedCourse.name;
  }
}

type AkikoLocalData = {
  version: number;
  courseYearToMightTakeCourseIds: Map<number, string[]>;
  importedCourses: ImportedCourse[];
  native: boolean;
};

function parseLocalData(
  localDataAsJsonString: string,
): AkikoLocalData | undefined {
  // FIXME:
  const localData = JSON.parse(localDataAsJsonString);
  return {
    version: localData.version,
    courseYearToMightTakeCourseIds: new Map(
      map(
        Object.entries(localData.courseYearToMightTakeCourseIds),
        ([year, x]) => {
          return [parseInt(year as string), x as string[]];
        },
      ),
    ),
    importedCourses: localData.importedCourses,
    native: localData.native,
  };
}

function stringifyLocalData(localData: AkikoLocalData): string {
  return JSON.stringify({
    version: localData.version,
    courseYearToMightTakeCourseIds: Object.fromEntries(
      localData.courseYearToMightTakeCourseIds.entries(),
    ),
    importedCourses: localData.importedCourses,
    native: localData.native,
  });
}

class CreditSumView extends HTMLElement {
  private cellWiseTakenSumSpan: HTMLSpanElement | undefined = undefined;
  private cellWiseTakenAndMightTakeSumSpan: HTMLSpanElement | undefined =
    undefined;
  private columnWiseTakenSumSpan: HTMLSpanElement | undefined = undefined;
  private columnWiseTakenAndMightTakeSumSpan: HTMLSpanElement | undefined =
    undefined;

  constructor() {
    super();
  }

  protected connectedCallback(): void {
    this.innerHTML = `
      <h2>単位数</h2>
      <div>
        <p>マスを選択してください</p>
        <ul>
          <li>選択されているマス<ul>
              <li>取得済み：<span></span></li>
              <li>取得済み＋取る授業：<span></span></li>
            </ul>
          </li>
          <li>選択されている列の全マス<ul>
              <li>取得済み：<span></span></li>
              <li>取得済み＋取る授業：<span></span></li>
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

  public update(credits: [CellCredit, ColumnCredit] | undefined): void {
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

  private static cellCreditToMessage(cellCredit: CellCredit): {
    taken: string;
    takenAndMightTake: string;
  } {
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

  private static columnCreditToMessage(columnCredit: ColumnCredit): {
    taken: string;
    takenAndMightTake: string;
  } {
    return CreditSumView.cellCreditToMessage(columnCredit);
  }
}
window.customElements.define("credit-sum-view", CreditSumView);

class Akiko {
  requirementsTableYear: number;
  cellIdToCell: Map<string, Cell>;
  courseIdToCellId: Map<string, string>;

  constructor(
    requirementsTableYear: number,
    cellIdToCell: Map<string, Cell>,
    courseIdToCellId: Map<string, string>,
  ) {
    this.requirementsTableYear = requirementsTableYear;
    this.cellIdToCell = cellIdToCell;
    this.courseIdToCellId = courseIdToCellId;
  }

  moveCourse(
    direction: "wont-take-to-might-take" | "might-take-to-wont-take",
    courseId: string,
  ):
    | {
        kind: "unknown-course-id";
        courseId: string;
      }
    | {
        kind: "already-moved";
        courseId: string;
      }
    | undefined {
    const cellId = this.courseIdToCellId.get(courseId);
    if (cellId === undefined) {
      return { kind: "unknown-course-id", courseId };
    }
    const cell = this.cellIdToCell.get(cellId);
    assert(cell !== undefined);
    const [from, to] =
      direction === "wont-take-to-might-take"
        ? [cell.courseIdToWontTakeCourse, cell.courseIdToMightTakeCourse]
        : [cell.courseIdToMightTakeCourse, cell.courseIdToWontTakeCourse];
    const course = from.get(courseId);
    if (course === undefined) {
      assert(to.has(courseId) || cell.courseIdToTakenCourse.has(courseId));
      return { kind: "already-moved", courseId };
    }
    from.delete(courseId);
    to.set(courseId, course);
  }

  calculateCellIdToCellCredit(): Map<string, CellCredit> {
    const cellIdToCellCredit: Map<string, CellCredit> = new Map();
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

  *nonImportedMightTakeCourses(): Generator<Course> {
    for (const cell of this.cellIdToCell.values()) {
      for (const [
        course,
        importedCourse,
      ] of cell.courseIdToMightTakeCourse.values()) {
        if (
          importedCourse === undefined ||
          importedCourse.grade === "d" ||
          importedCourse.grade === "fail"
        ) {
          yield course;
        }
      }
    }
  }

  static fromCellIdToCourses(
    cellIdToCellMetadata: Map<string, CellMetadata>,
    requirementsTableYear: number,
    courses: Course[],
    importedCourses: ImportedCourse[],
    native: boolean,
  ): Akiko {
    // 同じ授業を複数回履修している場合最新の授業の成績を使う。
    // 一度落単した授業を取り直して単位を取った場合など。
    importedCourses = Array.from(importedCourses);
    importedCourses.sort((a, b) => a.takenYear - b.takenYear);

    const courseIdToMaybeImportedCourse = new Map<string, MaybeImportedCourse>(
      map(courses.values(), (course) => [
        course.id,
        { id: course.id, course, importedCourse: undefined },
      ]),
    );
    let freeCount = 0;
    for (const importedCourse of importedCourses) {
      if (importedCourse.id === "") {
        // 認可された授業がインポートされた
        importedCourse.id = `__free${freeCount}`;
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
          cellMetadata.filter(c.id, {
            name: maybeImportedCourseGetName(c),
            native,
          }),
        ),
      );
      const cell: Cell = {
        creditRequirements: {
          creditMin: cellMetadata.creditMin,
          creditMax: cellMetadata.creditMax,
        },
        courseIdToWontTakeCourse: new Map(),
        courseIdToMightTakeCourse: new Map(),
        courseIdToTakenCourse: new Map(),
      };
      for (const maybeImportedCourse of maybeImportedCourses) {
        const { id, course, importedCourse } = maybeImportedCourse;
        if (
          !cellMetadata.filter(id, {
            name: maybeImportedCourseGetName(maybeImportedCourse),
            native,
          })
        ) {
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

type Cell = {
  creditRequirements: CellCreditRequirements;
  courseIdToWontTakeCourse: Map<string, [Course, ImportedCourse | undefined]>;
  courseIdToMightTakeCourse: Map<string, [Course, ImportedCourse | undefined]>;
  courseIdToTakenCourse: Map<string, [Course | undefined, ImportedCourse]>;
};

function* map<T, U>(ts: Iterable<T>, f: (t: T) => U): Generator<U> {
  for (const t of ts) {
    yield f(t);
  }
}

function* filter<T>(
  ts: Iterable<T>,
  predicate: (t: T) => boolean,
): Generator<T> {
  for (const t of ts) {
    if (predicate(t)) {
      yield t;
    }
  }
}

function* zipMapIntersection<K, Va, Vb>(
  a: Map<K, Va>,
  b: Map<K, Vb>,
): Generator<[K, Va, Vb]> {
  for (const [key, av] of a.entries()) {
    const bv = b.get(key);
    if (bv !== undefined) {
      yield [key, av, bv];
    }
  }
}

function compareStrings(a: string, b: string): number {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
}

function isArrayOfInstanceOf<T>(
  array: unknown[],
  constructor: new (...args: unknown[]) => T,
): array is T[] {
  for (const e of array) {
    if (!(e instanceof constructor)) {
      return false;
    }
  }
  return true;
}

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

function updateCourseContainers(
  courseContainers: CourseContainers,
  cellTbodys: CellTbodys,
): void {
  for (const [courseContainer, cellTbody] of [
    [courseContainers.notTaken, cellTbodys.notTaken],
    [courseContainers.mightTake, cellTbodys.mightTake],
    [courseContainers.taken, cellTbodys.taken],
  ] as const) {
    if (cellTbody.childElementCount === 0) {
      courseContainer.classList.add("contains-no-courses");
    } else {
      courseContainer.classList.remove("contains-no-courses");
    }
  }
}

function updateCourseTables(
  courseTables: CourseTables,
  cellTbodys: CellTbodys,
): void {
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

function mustGetElementById(id: string): HTMLElement {
  const e = document.getElementById(id);
  if (e === null) {
    throw new Error(`cannot find "#${id}"`);
  }
  return e;
}

function mustGetElementByIdOfType<T extends HTMLElement>(
  id: string,
  type: new (...args: unknown[]) => T,
): T {
  const e = document.getElementById(id);
  if (!(e !== null && e instanceof type)) {
    throw new Error(`cannot find "#${id}"`);
  }
  return e;
}

function mustQuerySelector(parent: Element, selector: string): HTMLElement {
  const e = parent.querySelector(selector);
  assert(e !== null && e instanceof HTMLElement);
  return e;
}

function mustQuerySelectorOfType<T extends HTMLElement>(
  parent: Element,
  selector: string,
  type: new (...args: unknown[]) => T,
): T {
  const e = parent.querySelector(selector);
  if (!(e !== null && e instanceof type)) {
    throw new Error(`cannot find "${selector}"`);
  }
  return e;
}

function parseImportedCourseGrade(s: string): ImportedCourseGrade | undefined {
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

function isStringArray(array: unknown[]): array is string[] {
  for (const e of array) {
    if (typeof e !== "string") {
      return false;
    }
  }
  return true;
}

function parseImportedCourse(row: unknown[]): ImportedCourse | undefined {
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

type CsvToImportedCoursesResult =
  | {
      kind: "ok";
      importedCourses: ImportedCourse[];
    }
  | {
      kind: "failed-to-parse-as-csv";
    }
  | {
      kind: "unexpected-csv-content";
    };

function csvToImportedCourses(csv: string): CsvToImportedCoursesResult {
  let rows: unknown;
  try {
    rows = parse(csv, { trim: true });
  } catch {
    return { kind: "failed-to-parse-as-csv" };
  }
  if (!(Array.isArray(rows) && rows.length >= 1)) {
    return { kind: "unexpected-csv-content" };
  }

  const importedCourses: ImportedCourse[] = [];
  for (const row of rows.slice(1)) {
    const importedCourse = parseImportedCourse(row as unknown[]);
    if (importedCourse === undefined) {
      return { kind: "unexpected-csv-content" };
    }
    importedCourses.push(importedCourse);
  }
  return { kind: "ok", importedCourses };
}

function mapSum<T>(elements: Iterable<T>, f: (t: T) => number): number {
  let sum = 0;
  for (const e of elements) {
    sum += f(e);
  }
  return sum;
}

function calculateColumnIdToColumnCredit(
  cellIdToCellCredit: Map<string, CellCredit>,
  columnIdToColumnCreditRequirements: Record<string, ColumnCreditRequirements>,
): Map<string, ColumnCredit> {
  const columnIdToColumnCredit: Map<string, ColumnCredit> = new Map();
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

function calculateNetCredit(
  columnIdToColumnCredit: Map<string, ColumnCredit>,
  netRequired: number,
): NetCredit {
  const columnCredits: ColumnCredit[] = [];
  for (const [id, c] of columnIdToColumnCredit.entries()) {
    // FIXME
    if (id === "b" || id === "d" || id === "f" || id === "h") {
      columnCredits.push(c);
    }
  }
  const takenSum = mapSum(columnCredits, (c) =>
    Math.min(c.takenSum, c.requirements.creditMax),
  );
  const mightTakeSum = mapSum(columnCredits, (c) =>
    Math.min(c.mightTakeSum, c.requirements.creditMax),
  );
  return { takenSum, mightTakeSum, required: netRequired };
}

function cellIdToColumnId(cellId: string): string {
  return cellId[0];
}

function selectedCellCreditAndColumnCredit(
  selectedCellId: string,
  cellIdToCellCredit: Map<string, CellCredit>,
  columnIdToColumnCredit: Map<string, ColumnCredit>,
): [CellCredit, ColumnCredit] | undefined {
  const cellCredit = cellIdToCellCredit.get(selectedCellId);
  const columnCredit = columnIdToColumnCredit.get(
    cellIdToColumnId(selectedCellId),
  );
  if (cellCredit !== undefined && columnCredit !== undefined) {
    return [cellCredit, columnCredit];
  }
}

function lfToBr(s: string): string {
  return s.replace(/\n/g, "<br>");
}

function initializeCourseElements(
  akiko: Akiko,
  cellIdToCellTbodys: Map<string, CellTbodys>,
  courseYear: number,
): void {
  const gradeToString: { [key in ImportedCourseGrade]: string } = {
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
        const element = stringToHtmlElement(`
<tr class="course" draggable="true" data-course-id="${course.id}">
  <td class="id-name">${course.id}<br>
    <a href="https://kdb.tsukuba.ac.jp/syllabi/${courseYear}/${
      course.id
    }/jpn" target="_blank" draggable="false">${course.name}</a>
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
        const element = stringToHtmlElement(`
<tr class="course" draggable="true" data-course-id="${course.id}">
  <td class="id-name">${course.id}<br>
    <a href="https://kdb.tsukuba.ac.jp/syllabi/${courseYear}/${
      course.id
    }/jpn" target="_blank" draggable="false">${course.name}</a>
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
      const id = importedCourse.id.startsWith("__free")
        ? ""
        : importedCourse.id;
      const element = stringToHtmlElement(`
<tr class="course">
  <td class="id-name">${escapeHtml(id)}<br>
    <a href="https://kdb.tsukuba.ac.jp/syllabi/${importedCourse.takenYear}/${
      importedCourse.id
    }/jpn" target="_blank" draggable="false">${escapeHtml(
      importedCourse.name,
    )}</a>
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

function insertCourseElement(
  tbody: HTMLElement,
  courseId: string,
  courseElement: HTMLElement,
): void {
  for (const child of tbody.children) {
    assert(child instanceof HTMLTableRowElement);
    const childCourseId = child.dataset.courseId;
    assert(childCourseId !== undefined);
    if (courseId < childCourseId) {
      child.insertAdjacentElement("beforebegin", courseElement);
      return;
    }
  }
  tbody.appendChild(courseElement);
}

function updateCellGauge(
  cellIdToCellElement: Map<string, HTMLElement>,
  cellIdToCellCredit: Map<string, CellCredit>,
): void {
  for (const [, cellElement, cellCredit] of zipMapIntersection(
    cellIdToCellElement,
    cellIdToCellCredit,
  )) {
    let green: number;
    let yellow: number;
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

class Debouncer {
  timeoutId: number | undefined;

  constructor(
    readonly duration: number,
    private f: () => void,
  ) {
    this.duration = duration;
    this.f = f;
  }

  call(): void {
    if (this.timeoutId !== undefined) {
      window.clearTimeout(this.timeoutId);
    }
    this.timeoutId = window.setTimeout(this.f, this.duration);
  }
}

function columnCreditToString(c: ColumnCredit): string {
  let res = "計 ";
  if (c.mightTakeSum === 0) {
    res += c.takenSum.toString();
  } else {
    res += `${c.takenSum} → ${c.takenSum + c.mightTakeSum}`;
  }
  res += " 単位";
  return res;
}

function columnCreditIsExcessive(c: ColumnCredit): boolean {
  return c.takenSum + c.mightTakeSum > c.requirements.creditMax;
}

function columnCreditToWarning(c: ColumnCredit): string | undefined {
  if (!columnCreditIsExcessive(c)) {
    return undefined;
  }
  const sum = c.takenSum + c.mightTakeSum;
  return `この列は合計で${c.requirements.creditMax}単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で${sum}単位なので、${sum - c.requirements.creditMax}単位無駄になります。`;
}

function netCreditToString(c: NetCredit): string {
  let res = "選択科目計 ";
  if (c.mightTakeSum === 0) {
    res += `${c.takenSum}/${c.required}`;
  } else {
    res += `${c.takenSum} → ${c.takenSum + c.mightTakeSum}/${c.required}`;
  }
  res += " 単位";
  return res;
}

function netCreditIsExcessive(c: NetCredit): boolean {
  return c.takenSum + c.mightTakeSum > c.required;
}

function netCreditToWarning(c: NetCredit): string | undefined {
  if (!netCreditIsExcessive(c)) {
    return undefined;
  }
  const sum = c.takenSum + c.mightTakeSum;
  return `全体の合計で${c.required}単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で${sum}単位なので、${sum - c.required}単位無駄になります。`;
}

function creditToGreenYellowPercentages(
  c: CellCredit | ColumnCredit,
): [number, number] {
  if (c.requirements.creditMin === 0) {
    return [100, 100];
  }
  const green = c.takenSum / c.requirements.creditMin;
  const yellow = (c.takenSum + c.mightTakeSum) / c.requirements.creditMin;
  return [100 * Math.min(green, 1), 100 * Math.min(yellow, 1)];
}

function netCreditToGreenYellowPercentages(c: NetCredit): [number, number] {
  const green = c.takenSum / c.required;
  const yellow = (c.takenSum + c.mightTakeSum) / c.required;
  return [100 * Math.min(green, 1), 100 * Math.min(yellow, 1)];
}

export function setup(
  requirementsTableYear: number,
  courses: Course[],
  courseYear: number,
  department: string,
  cellIdToCellMetadataRecord: Record<string, CellMetadata>,
  columnIdToColumnCreditRequirements: Record<string, ColumnCreditRequirements>,
  netRequired: number,
): void {
  const courseIdToCourse = new Map(map(courses, (c) => [c.id, c]));

  const cellIdToCellMetadata = new Map(
    Object.entries(cellIdToCellMetadataRecord),
  );
  const cellIds = Array.from(cellIdToCellMetadata.keys());

  const requirementsElement = mustGetElementById("requirements");
  for (const cellId of cellIds) {
    const div = document.createElement("div");
    div.id = cellId;
    div.classList.add("cell");
    requirementsElement.appendChild(div);
  }

  const cellIdToCellTbodys = new Map<string, CellTbodys>(
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
  assert(isArrayOfInstanceOf(cellElements, HTMLElement));
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
  assert(creditSumView instanceof CreditSumView);

  const filterInput = mustGetElementByIdOfType("filter", HTMLInputElement);
  const filterAction = new Debouncer(500, () => {
    const showOrHide = (e: Element) => {
      assert(e instanceof HTMLElement && e.dataset.courseId !== undefined);
      const course = courseIdToCourse.get(e.dataset.courseId);
      assert(course !== undefined);
      if (course.id.includes(filter) || course.name.includes(filter)) {
        e.style.removeProperty("display");
      } else {
        e.style.setProperty("display", "none");
      }
    };
    const filter = filterInput.value.trim();
    for (const tbody of cellIdToCellTbodys.values()) {
      for (const e of tbody.notTaken.children) {
        showOrHide(e);
      }
      for (const e of tbody.mightTake.children) {
        showOrHide(e);
      }
    }
  });
  filterInput.addEventListener("input", () => {
    filterAction.call();
  });

  const localDataKey = `${department}_${requirementsTableYear}`;
  const localDataAsJson = localStorage.getItem(localDataKey);
  const localData: AkikoLocalData =
    localDataAsJson === null
      ? {
          version: 1,
          courseYearToMightTakeCourseIds: new Map(),
          importedCourses: [],
          native: true,
        }
      : (parseLocalData(localDataAsJson) ?? {
          version: 1,
          courseYearToMightTakeCourseIds: new Map(),
          importedCourses: [],
          native: true,
        });

  const studentTypeRadioNative = mustQuerySelectorOfType(
    document.body,
    'input[name="student-type"][value="native"]',
    HTMLInputElement,
  );
  const studentTypeRadioTransfer = mustQuerySelectorOfType(
    document.body,
    'input[name="student-type"][value="transfer"]',
    HTMLInputElement,
  );
  studentTypeRadioNative.checked = localData.native;
  studentTypeRadioTransfer.checked = !localData.native;
  const isNative = (): boolean => {
    const n = studentTypeRadioNative.checked;
    const t = studentTypeRadioTransfer.checked;
    if (!n && !t) {
      return true;
    }
    return n;
  };

  let akiko = Akiko.fromCellIdToCourses(
    cellIdToCellMetadata,
    requirementsTableYear,
    courses,
    localData.importedCourses,
    isNative(),
  );
  for (const courseId of localData.courseYearToMightTakeCourseIds.get(
    courseYear,
  ) ?? []) {
    akiko.moveCourse("wont-take-to-might-take", courseId);
  }

  const courseTables: CourseTables = {
    notTaken: leftTable,
    mightTake: mightTakeTable,
    taken: takenTable,
  };
  const courseContainers: CourseContainers = {
    notTaken: mustGetElementById("not-taken-course-container"),
    mightTake: mustGetElementById("might-take-course-container"),
    taken: mustGetElementById("taken-course-container"),
  };

  let selectedCellId: string | undefined = undefined;
  let cellIdToCellCredit = akiko.calculateCellIdToCellCredit();
  let columnIdToColumnCredit = calculateColumnIdToColumnCredit(
    cellIdToCellCredit,
    columnIdToColumnCreditRequirements,
  );
  let netCredit = calculateNetCredit(columnIdToColumnCredit, netRequired);

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
      assert(cellTbodys !== undefined);
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
    });
  }
  initializeCourseElements(akiko, cellIdToCellTbodys, courseYear);
  updateCellGauge(cellIdToCellElement, cellIdToCellCredit);

  const updateAkiko = (newAkiko: Akiko) => {
    akiko = newAkiko;
    for (const courseId of localData.courseYearToMightTakeCourseIds.get(
      courseYear,
    ) ?? []) {
      akiko.moveCourse("wont-take-to-might-take", courseId);
    }

    cellIdToCellCredit = akiko.calculateCellIdToCellCredit();
    columnIdToColumnCredit = calculateColumnIdToColumnCredit(
      cellIdToCellCredit,
      columnIdToColumnCreditRequirements,
    );
    netCredit = calculateNetCredit(columnIdToColumnCredit, netRequired);

    initializeCourseElements(akiko, cellIdToCellTbodys, courseYear);
    updateCellGauge(cellIdToCellElement, cellIdToCellCredit);

    if (selectedCellId !== undefined) {
      const cellTbodys = cellIdToCellTbodys.get(selectedCellId);
      assert(cellTbodys !== undefined);
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
  };

  const handleStudentTypeRadioChange = () => {
    const native = isNative();
    updateAkiko(
      Akiko.fromCellIdToCourses(
        cellIdToCellMetadata,
        requirementsTableYear,
        courses,
        localData.importedCourses,
        native,
      ),
    );
    localData.native = native;
    localStorage.setItem(localDataKey, stringifyLocalData(localData));
  };
  studentTypeRadioNative.addEventListener(
    "change",
    handleStudentTypeRadioChange,
  );
  studentTypeRadioTransfer.addEventListener(
    "change",
    handleStudentTypeRadioChange,
  );

  const csvInput = mustGetElementByIdOfType("csv", HTMLInputElement);
  assert(csvInput.type === "file");
  csvInput.addEventListener("change", async () => {
    const csvFile = csvInput.files?.[0];
    if (csvFile === undefined) {
      return;
    }
    const csv = await csvFile.text();
    const result = csvToImportedCourses(csv);
    if (result.kind === "failed-to-parse-as-csv") {
      alert("CSVファイルを正しく読み込めませんでした。");
      return;
    } else if (result.kind === "unexpected-csv-content") {
      alert("CSVファイルを成績データとして読み込めませんでした。");
      return;
    }

    updateAkiko(
      Akiko.fromCellIdToCourses(
        cellIdToCellMetadata,
        requirementsTableYear,
        courses,
        result.importedCourses,
        isNative(),
      ),
    );
    localData.importedCourses = result.importedCourses;
    localStorage.setItem(localDataKey, stringifyLocalData(localData));
    render();
  });

  mustGetElementById("export-might-take-course-ids").addEventListener(
    "click",
    () => {
      const content = Array.from(
        map(akiko.nonImportedMightTakeCourses(), ({ id }) => id + "\n"),
      ).join("");
      const e = document.createElement("a");
      e.setAttribute(
        "href",
        "data:text/csv;charset=utf-8," + encodeURIComponent(content),
      );
      e.setAttribute("download", "科目番号一覧.csv");
      e.style.display = "none";
      document.body.appendChild(e);
      e.click();
      e.remove();
    },
  );

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

  const handleDrop = (
    event: DragEvent,
    droppedOn: "wont-take" | "might-take",
  ) => {
    event.preventDefault();
    if (selectedCellId === undefined) {
      return;
    }
    const courseId = event.dataTransfer?.getData("text/plain");
    if (courseId === undefined) {
      return;
    }
    const cellTbodys = cellIdToCellTbodys.get(selectedCellId);
    assert(cellTbodys !== undefined);
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

    const courseElements = Array.from(
      document.querySelectorAll(`[data-course-id="${courseId}"]`),
    );
    assert(courseElements.length === 1);
    const courseElement = courseElements[0];
    assert(courseElement instanceof HTMLElement);
    insertCourseElement(
      droppedOn === "wont-take" ? cellTbodys.notTaken : cellTbodys.mightTake,
      courseId,
      courseElement,
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

    // FIXME:
    localData.courseYearToMightTakeCourseIds.set(
      courseYear,
      Array.from(map(akiko.nonImportedMightTakeCourses(), ({ id }) => id)),
    );
    localStorage.setItem(localDataKey, stringifyLocalData(localData));
    render();
  };
  leftBar.addEventListener("drop", (event) => {
    handleDrop(event, "wont-take");
  });
  rightBar.addEventListener("drop", (event) => {
    handleDrop(event, "might-take");
  });

  let barsVisible = true;
  const barsToggleButton = document.createElement("button");
  barsToggleButton.id = "bars-toggle";
  document.body.appendChild(barsToggleButton);

  const mainElement = document.querySelector("main");
  assert(mainElement !== null);

  const updateBarsToggleButtonPosition = () => {
    if (barsVisible) {
      barsToggleButton.textContent = "⏵";
    } else {
      barsToggleButton.textContent = "⏴";
    }
    mainElement.classList.toggle("bars-hidden", !barsVisible);
    const left =
      requirementsElement.clientWidth -
      barsToggleButton.getBoundingClientRect().width;
    barsToggleButton.style.left = `${left}px`;
  };
  updateBarsToggleButtonPosition();
  new ResizeObserver(updateBarsToggleButtonPosition).observe(
    requirementsElement,
  );

  barsToggleButton.addEventListener("click", () => {
    barsVisible = !barsVisible;
    updateBarsToggleButtonPosition();
  });

  mustGetElementById("reset").addEventListener("click", () => {
    const yes = window.confirm(
      "インポートした成績データや「取る授業」に移動した授業などが全てリセットされます。本当にリセットしますか？",
    );
    if (yes) {
      localStorage.removeItem(localDataKey);
      window.location.reload();
    }
  });

  const requirementTableElement = mustGetElementById("requirement-table");
  const columnCreditSumsElement = mustGetElementById("column-credit-sums");
  const overallCreditSumElement = mustGetElementById("overall-credit-sum");
  const overallCreditSumSpan = mustQuerySelector(
    overallCreditSumElement,
    "span",
  );
  const overallCreditSumIcon = mustQuerySelector(
    overallCreditSumElement,
    "img",
  );
  const columnToCreditSumElements = new Map<
    string,
    { root: HTMLDivElement; span: HTMLSpanElement; icon: HTMLImageElement }
  >();

  for (const column of ["b", "d", "f", "h"] /* TODO */) {
    const root = document.createElement("div");
    const icon = document.createElement("img");
    const span = document.createElement("span");
    icon.src = "../../icons/warning.svg";
    icon.width = 20;
    icon.style.display = "none";
    root.appendChild(icon);
    root.appendChild(span);
    root.addEventListener("click", () => {
      const message = root.dataset.messageOnClick;
      if (message !== undefined) {
        window.alert(message);
      }
    });
    columnCreditSumsElement.appendChild(root);
    columnToCreditSumElements.set(column, { root, span, icon });
  }
  overallCreditSumElement.addEventListener("click", () => {
    const message = overallCreditSumElement.dataset.messageOnClick;
    if (message !== undefined) {
      window.alert(message);
    }
  });

  const render = () => {
    // 単位合計
    {
      const tableRect = requirementTableElement.getBoundingClientRect();
      for (const [
        column,
        { root, span, icon },
      ] of columnToCreditSumElements.entries()) {
        const cellId = column + "1"; // TODO
        const cellElement = cellIdToCellElement.get(cellId);
        assert(cellElement !== undefined);
        const cellRect = cellElement.getBoundingClientRect();
        const columnCredit = columnIdToColumnCredit.get(column);
        assert(columnCredit !== undefined);
        root.dataset.messageOnClick = columnCreditToWarning(columnCredit);
        span.textContent = columnCreditToString(columnCredit);
        icon.style.display = columnCreditIsExcessive(columnCredit)
          ? "initial"
          : "none";
        root.style.left = `${cellRect.x - tableRect.x}px`;
        root.style.width = `${cellRect.width}px`;
        const [green, yellow] = creditToGreenYellowPercentages(columnCredit);
        root.style.setProperty("--green-percentage", `${green}%`);
        root.style.setProperty("--yellow-percentage", `${yellow}%`);
      }
      const [g, y] = netCreditToGreenYellowPercentages(netCredit);
      overallCreditSumElement.dataset.messageOnClick =
        netCreditToWarning(netCredit);
      overallCreditSumSpan.textContent = netCreditToString(netCredit);
      overallCreditSumIcon.style.display = netCreditIsExcessive(netCredit)
        ? "initial"
        : "none";
      overallCreditSumElement.style.setProperty("--green-percentage", `${g}%`);
      overallCreditSumElement.style.setProperty("--yellow-percentage", `${y}%`);
    }
  };

  requirementsElement.addEventListener("scroll", () => {
    columnCreditSumsElement.style.setProperty(
      "--x",
      `${-requirementsElement.scrollLeft}px`,
    );
  });

  render();
}
