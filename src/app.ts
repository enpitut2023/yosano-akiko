import {
  akikoGetCreditStats,
  akikoGetMightTakeCourseIds,
  CellId,
  ColumnCreditStats,
  ColumnId,
  KnownCourse,
  CreditRequirements,
  ElectiveCreditStats,
  isCellId,
  isColumnId,
  CourseId,
  RealCourse,
  FakeCourse,
  isCourseId,
  isFakeCourseId,
  isGrade,
  akikoNew,
  FakeCourseId,
  Akiko,
  CellCreditStats,
  columnIdIsCompulsory,
} from "./akiko";
import { CourseLists } from "./course-lists";
import { parseImportedCsv } from "./csv";
import warningIcon from "./icons/warning.svg";
import { assert } from "./util";
import z from "zod";

type LocalDataV1ImportedCourse = {
  id: string;
  name: string;
  grade: "wip" | "a+" | "a" | "b" | "c" | "d" | "pass" | "fail" | "free";
  credit: number;
  takenYear: number;
};
type LocalDataV1 = {
  version: 1;
  courseYearToMightTakeCourseIds: Record<string, string[]>;
  importedCourses: LocalDataV1ImportedCourse[];
  native: boolean;
};
type LocalDataV2 = {
  version: 2;
  mightTakeCourseIds: CourseId[];
  realCourses: RealCourse[];
  fakeCourses: FakeCourse[];
  native: boolean;
};

function localDataV1ToV2(v1: LocalDataV1): LocalDataV2 {
  function tryAsFake(ic: LocalDataV1ImportedCourse): FakeCourse | undefined {
    const match = /^__free(\d+)$/.exec(ic.id);
    if (match === null) {
      return undefined;
    }
    const id = parseInt(match[1]);
    if (!isFakeCourseId(id)) {
      return undefined;
    }
    return {
      id,
      name: ic.name,
      credit: ic.credit,
      takenYear: ic.takenYear,
      grade: "free",
    };
  }

  function tryAsReal(ic: LocalDataV1ImportedCourse): RealCourse | undefined {
    if (!isCourseId(ic.id) || ic.grade === "free") {
      return undefined;
    }
    return {
      id: ic.id,
      name: ic.name,
      credit: ic.credit,
      takenYear: ic.takenYear,
      grade: ic.grade,
    };
  }

  const mightTakeCourseIds: CourseId[] = [];
  for (const ids of Object.values(v1.courseYearToMightTakeCourseIds)) {
    for (const id of ids) {
      if (isCourseId(id)) {
        mightTakeCourseIds.push(id);
      }
    }
  }

  const realCourses: RealCourse[] = [];
  const fakeCourses: FakeCourse[] = [];
  for (const ic of v1.importedCourses) {
    const fake = tryAsFake(ic);
    if (fake !== undefined) {
      fakeCourses.push(fake);
      continue;
    }
    const real = tryAsReal(ic);
    if (real !== undefined) {
      realCourses.push(real);
      continue;
    }
    console.warn("Bad v1 imported course:", ic);
  }

  return {
    version: 2,
    mightTakeCourseIds,
    realCourses,
    fakeCourses,
    native: v1.native,
  };
}

const localDataV1Parser = z.object({
  version: z.literal(1),
  courseYearToMightTakeCourseIds: z.record(z.string(), z.array(z.string())),
  importedCourses: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      grade: z.union([
        z.literal("wip"),
        z.literal("a+"),
        z.literal("a"),
        z.literal("b"),
        z.literal("c"),
        z.literal("d"),
        z.literal("pass"),
        z.literal("fail"),
      ]),
      credit: z.number(),
      takenYear: z.number(),
    }),
  ),
  native: z.boolean(),
});

const localDataV2Parser = z.object({
  version: z.literal(2),
  mightTakeCourseIds: z.array(z.string()),
  native: z.boolean(),
  realCourses: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      credit: z.number().optional(),
      takenYear: z.number(),
      grade: z.string(),
    }),
  ),
  fakeCourses: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      credit: z.number().optional(),
      takenYear: z.number(),
      grade: z.literal("free"),
    }),
  ),
});

function localDataV2Parse(x: unknown): LocalDataV2 | undefined {
  const result = localDataV2Parser.safeParse(x);
  if (!result.success) {
    return undefined;
  }

  const mightTakeCourseIds: CourseId[] = [];
  for (const id of result.data.mightTakeCourseIds) {
    if (!isCourseId(id)) {
      return undefined;
    }
    mightTakeCourseIds.push(id);
  }

  const realCourses: RealCourse[] = [];
  for (const c of result.data.realCourses) {
    if (!isCourseId(c.id) || !isGrade(c.grade)) {
      return undefined;
    }
    realCourses.push({
      id: c.id,
      name: c.name,
      credit: c.credit,
      takenYear: c.takenYear,
      grade: c.grade,
    });
  }

  const fakeCourses: FakeCourse[] = [];
  for (const c of result.data.fakeCourses) {
    if (!isFakeCourseId(c.id)) {
      return undefined;
    }
    fakeCourses.push({
      id: c.id,
      name: c.name,
      credit: c.credit,
      takenYear: c.takenYear,
      grade: c.grade,
    });
  }

  return {
    version: result.data.version,
    mightTakeCourseIds,
    native: result.data.native,
    realCourses,
    fakeCourses,
  };
}

function localDataFromJson(json: string): LocalDataV2 | undefined {
  const x: unknown = JSON.parse(json);
  const v1 = localDataV1Parser.safeParse(x);
  if (v1.success) {
    return localDataV1ToV2(v1.data);
  }
  const v2 = localDataV2Parse(x);
  if (v2 !== undefined) {
    return v2;
  }
}

function localDataDefault(): LocalDataV2 {
  return {
    version: 2,
    mightTakeCourseIds: [],
    realCourses: [],
    fakeCourses: [],
    native: true,
  };
}

function localDataLoad(key: string): LocalDataV2 | undefined {
  const json = localStorage.getItem(key);
  if (json !== null) {
    return localDataFromJson(json);
  }
}

function localDataStore(key: string, l: LocalDataV2): void {
  localStorage.setItem(key, JSON.stringify(l));
}

class CreditSumView extends HTMLElement {
  private p: HTMLElement | undefined;

  constructor() {
    super();
  }

  protected connectedCallback(): void {
    this.innerHTML = `
      <h2>単位数</h2>
      <p></p>
    `;
    const p = this.querySelector("p");
    assert(p !== null);
    this.p = p;
  }

  public update(cell: CellCreditStats | undefined): void {
    if (this.p === undefined) {
      return;
    }

    this.classList.toggle("no-cell-selected", cell === undefined);
    if (cell === undefined) {
      this.p.textContent = "マスを選択してください";
    } else {
      const { brief, warning } = cellCreditStatsDisplay(cell);
      let content = "選択されたマスの単位：" + brief;
      if (warning !== undefined) {
        content += "<br>⚠️ ";
        content += warning;
      }
      this.p.innerHTML = content;
    }
  }
}
window.customElements.define("credit-sum-view", CreditSumView);

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

function cellCreditStatsDisplay(c: CellCreditStats): {
  brief: string;
  warning: string | undefined;
} {
  let brief = "計 ";
  if (c.effectiveMightTake === 0) {
    brief += c.effectiveTaken.toString();
  } else {
    brief += `${c.effectiveTaken} → ${c.effectiveTaken + c.effectiveMightTake}`;
  }
  brief += " 単位";

  let warning: string | undefined;
  if (c.overflowTotal > 0) {
    warning = `このマスは合計で${c.max}単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で${c.rawTotal}単位なので、${c.overflowTotal}単位無駄になります。`;
  }

  return { brief, warning };
}

function columnCreditStatsDisplay(c: ColumnCreditStats): {
  brief: string;
  warning: string | undefined;
} {
  let brief = "計 ";
  if (c.effectiveMightTake === 0) {
    brief += c.effectiveTaken.toString();
  } else {
    brief += `${c.effectiveTaken} → ${c.effectiveTaken + c.effectiveMightTake}`;
  }
  brief += " 単位";

  let warning: string | undefined;
  if (c.overflowTotal > 0) {
    warning = `この列は合計で${c.max}単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で${c.rawTotal}単位なので、${c.overflowTotal}単位無駄になります。`;
  }

  return { brief, warning };
}

function electiveCreditStatsDisplay(c: ElectiveCreditStats): {
  brief: string;
  warning: string | undefined;
} {
  let brief = "選択科目計 ";
  if (c.effectiveMightTake === 0) {
    brief += c.effectiveTaken.toString();
  } else {
    brief += `${c.effectiveTaken} → ${c.effectiveTaken + c.effectiveMightTake}`;
  }
  brief += " 単位";

  let warning: string | undefined;
  if (c.overflowTotal > 0) {
    warning = `選択科目全体は合計で${c.max}単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で${c.rawTotal}単位なので、${c.overflowTotal}単位無駄になります。`;
  }

  return { brief, warning };
}

function creditToGreenYellowPercentages(
  mightTaken: number,
  taken: number,
  min: number,
): [number, number] {
  if (min === 0) {
    return [100, 100];
  }
  const green = taken / min;
  const yellow = (taken + mightTaken) / min;
  return [100 * Math.min(green, 1), 100 * Math.min(yellow, 1)];
}

type Rect = { x: number; y: number; width: number; height: number };

export type ClassifyOptions = { isNative: boolean };

export function setup(params: {
  knownCourses: KnownCourse[];
  knownCourseYear: number;
  creditRequirements: {
    cells: Record<string, { min: number; max: number | undefined }>;
    columns: Record<string, { min: number; max: number }>;
    compulsory: number;
    elective: number;
  };
  major: string;
  requirementsTableYear: number;
  cellIdToRectRecord: Record<string, Rect>;
  tableViewBox?: Rect;
  classifyKnownCourses: (
    cs: KnownCourse[],
    opts: ClassifyOptions,
  ) => Map<CourseId, string>;
  classifyRealCourses: (
    cs: RealCourse[],
    opts: ClassifyOptions,
  ) => Map<CourseId, string>;
  classifyFakeCourses: (
    cs: FakeCourse[],
    opts: ClassifyOptions,
  ) => Map<FakeCourseId, string>;
}): void {
  const localDataKey = `${params.major}_${params.requirementsTableYear}`;
  const localData = localDataLoad(localDataKey) ?? localDataDefault();

  const knownCourses = new Map(params.knownCourses.map((c) => [c.id, c]));
  const creditRequirements: CreditRequirements = {
    cells: new Map(),
    columns: new Map(),
    compulsoryMin: params.creditRequirements.compulsory,
    electiveMin: params.creditRequirements.elective,
  };
  for (const [id, cell] of Object.entries(params.creditRequirements.cells)) {
    assert(isCellId(id), `Bad cell id: "${id}"`);
    creditRequirements.cells.set(id, cell);
  }
  for (const [id, col] of Object.entries(params.creditRequirements.columns)) {
    assert(isColumnId(id), `Bad column id: "${id}"`);
    creditRequirements.columns.set(id, col);
  }

  const createAkiko = (): Akiko => {
    const sortedRealCourses = Array.from(localData.realCourses);
    sortedRealCourses.sort((a, b) => a.takenYear - b.takenYear);
    const realCourses = new Map(localData.realCourses.map((c) => [c.id, c]));
    for (const c of sortedRealCourses) {
      realCourses.set(c.id, c);
    }

    const sortedFakeCourses = Array.from(localData.fakeCourses);
    sortedFakeCourses.sort((a, b) => a.takenYear - b.takenYear);
    const fakeCourses = new Map(localData.fakeCourses.map((c) => [c.id, c]));
    for (const c of sortedFakeCourses) {
      fakeCourses.set(c.id, c);
    }

    const courseIdToCellId = new Map<CourseId, CellId>();
    const realCoursePositions = new Map<CourseId, CellId>();
    const fakeCoursePositions = new Map<FakeCourseId, CellId>();

    const classifyOptions: ClassifyOptions = { isNative: localData.native };
    for (const [courseId, cellId] of params.classifyKnownCourses(
      params.knownCourses,
      classifyOptions,
    )) {
      assert(isCellId(cellId), `Bad cell id: "${cellId}"`);
      courseIdToCellId.set(courseId, cellId);
    }
    for (const [courseId, cellId] of params.classifyRealCourses(
      localData.realCourses,
      classifyOptions,
    )) {
      assert(isCellId(cellId), `Bad cell id: "${cellId}"`);
      realCoursePositions.set(courseId, cellId);
    }
    for (const [fakeCourseId, cellId] of params.classifyFakeCourses(
      localData.fakeCourses,
      classifyOptions,
    )) {
      assert(isCellId(cellId), `Bad cell id: "${cellId}"`);
      fakeCoursePositions.set(fakeCourseId, cellId);
    }

    const akiko = akikoNew(
      knownCourses,
      realCourses,
      fakeCourses,
      localData.mightTakeCourseIds,
      courseIdToCellId,
      realCoursePositions,
      fakeCoursePositions,
      creditRequirements,
    );
    assert(akiko !== undefined);
    return akiko;
  };

  let akiko = createAkiko();
  let selectedCellId: CellId | undefined = undefined;
  let filterString = "";

  const cellIdToRect = new Map<CellId, Rect>();
  for (const [id, rect] of Object.entries(params.cellIdToRectRecord)) {
    assert(isCellId(id), `Bad cell id: "${id}"`);
    cellIdToRect.set(id, rect);
  }

  const requirementsTableElement = mustGetElementByIdOfType(
    "requirement-table",
    HTMLImageElement,
  );
  if (params.tableViewBox !== undefined) {
    assert(params.tableViewBox.x === 0 && params.tableViewBox.y === 0); // TODO
    const scale = 2048 / params.tableViewBox.width;
    requirementsTableElement.width = scale * params.tableViewBox.width;
    requirementsTableElement.height = scale * params.tableViewBox.height;
    for (const rect of cellIdToRect.values()) {
      rect.x *= scale;
      rect.y *= scale;
      rect.width *= scale;
      rect.height *= scale;
    }
  }

  const requirementsElement = mustGetElementById("requirements");
  const cellIdToCellElement = new Map<CellId, HTMLDivElement>();

  for (const [id, rect] of cellIdToRect.entries()) {
    if (!creditRequirements.cells.has(id)) {
      // TODO
      continue;
    }
    const div = document.createElement("div");
    div.id = id;
    div.classList.add("cell");
    div.style.left = `${rect.x}px`;
    div.style.top = `${rect.y}px`;
    div.style.width = `${rect.width}px`;
    div.style.height = `${rect.height}px`;
    requirementsElement.appendChild(div);
    cellIdToCellElement.set(id, div);
    div.addEventListener("click", (event) => {
      event.preventDefault();
      selectedCellId = id;
      render();
    });
  }

  const leftBar = mustGetElementById("left-bar");
  const rightBar = mustGetElementById("right-bar");
  const creditSumView = document.getElementsByTagName("credit-sum-view")?.[0];
  assert(creditSumView instanceof CreditSumView);

  const filterInput = mustGetElementByIdOfType("filter", HTMLInputElement);
  const filterAction = new Debouncer(500, () => {
    filterString = filterInput.value.trim();
    render();
  });
  filterInput.addEventListener("input", () => {
    filterAction.call();
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

  const handleStudentTypeRadioChange = () => {
    localData.native = studentTypeRadioNative.checked;
    localDataStore(localDataKey, localData);
    akiko = createAkiko();
    render();
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
    const result = parseImportedCsv(csv);
    if (result.kind === "failed-to-parse-as-csv") {
      alert("CSVファイルを正しく読み込めませんでした。");
      return;
    } else if (result.kind === "unexpected-csv-content") {
      alert("CSVファイルを成績データとして読み込めませんでした。");
      return;
    }

    localData.realCourses = result.realCourses;
    localData.fakeCourses = result.fakeCourses;
    localDataStore(localDataKey, localData);
    akiko = createAkiko();

    render();
  });

  mustGetElementById("export-might-take-course-ids").addEventListener(
    "click",
    () => {
      const content = akikoGetMightTakeCourseIds(akiko).join("\n");
      const a = document.createElement("a");
      a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(content);
      a.download = "科目番号一覧.csv";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
  );

  let barsVisible = true;
  const barsToggleButton = mustGetElementById("bars-toggle");
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

  const columnCreditSumsElement = mustGetElementById("column-credit-sums");
  const overallCreditSumElement = mustGetElementById("overall-credit-sum");
  const overallCreditSumSpan = mustQuerySelector(
    overallCreditSumElement,
    "span",
  );
  const columnToCreditSumElements = new Map<
    ColumnId,
    { root: HTMLDivElement; span: HTMLSpanElement }
  >();

  const handleMoveToWontTake = (id: CourseId) => {
    const pos = akiko.coursePositions.get(id);
    assert(pos !== undefined);
    pos.listKind = "wont-take";
    localData.mightTakeCourseIds = akikoGetMightTakeCourseIds(akiko);
    localDataStore(localDataKey, localData);
    render();
  };
  const handleMoveToMightTake = (id: CourseId) => {
    const pos = akiko.coursePositions.get(id);
    assert(pos !== undefined);
    pos.listKind = "might-take";
    localData.mightTakeCourseIds = akikoGetMightTakeCourseIds(akiko);
    localDataStore(localDataKey, localData);
    render();
  };
  const courseLists = new CourseLists(
    akiko,
    params.knownCourseYear,
    mustGetElementById("wont-take-table"),
    mustGetElementById("might-take-table"),
    mustGetElementById("taken-table"),
    mustGetElementById("fake-table"),
    mustGetElementById("wont-take-course-container"),
    mustGetElementById("might-take-course-container"),
    mustGetElementById("taken-course-container"),
    mustGetElementById("fake-course-container"),
    leftBar,
    rightBar,
    mustGetElementById("drop-guide"),
    handleMoveToWontTake,
    handleMoveToMightTake,
  );

  for (const column of creditRequirements.columns.keys()) {
    if (columnIdIsCompulsory(column)) {
      continue;
    }
    const root = document.createElement("div");
    const icon = document.createElement("img");
    const span = document.createElement("span");
    icon.src = warningIcon;
    icon.width = 20;
    root.appendChild(icon);
    root.appendChild(span);
    root.addEventListener("click", () => {
      const message = root.dataset.messageOnClick;
      if (message !== undefined && message !== "") {
        window.alert(message);
      }
    });
    columnCreditSumsElement.appendChild(root);
    columnToCreditSumElements.set(column, { root, span });
  }
  overallCreditSumElement.addEventListener("click", () => {
    const message = overallCreditSumElement.dataset.messageOnClick;
    if (message !== undefined && message !== "") {
      window.alert(message);
    }
  });
  requirementsElement.addEventListener("scroll", () => {
    const x = -requirementsElement.scrollLeft;
    columnCreditSumsElement.style.setProperty("--x", `${x}px`);
  });

  const render = () => {
    const creditStats = akikoGetCreditStats(akiko);

    // マス
    for (const [id, element] of cellIdToCellElement) {
      element.classList.toggle("selected", id === selectedCellId);
      const cellCredit = creditStats.cells.get(id);
      assert(cellCredit !== undefined);
      const [green, yellow] = creditToGreenYellowPercentages(
        cellCredit.effectiveMightTake,
        cellCredit.effectiveTaken,
        cellCredit.min,
      );
      element.style.setProperty("--green-percentage", `${green}%`);
      element.style.setProperty("--yellow-percentage", `${yellow}%`);
    }
    if (selectedCellId !== undefined) {
      for (const e of document.querySelectorAll(".no-cell-selected")) {
        e.classList.remove("no-cell-selected");
      }
    }

    // 授業一覧
    courseLists.setAkiko(akiko);
    courseLists.filter(filterString);
    courseLists.setSelectedCellId(selectedCellId);

    // 単位合計
    {
      if (selectedCellId === undefined) {
        creditSumView.update(undefined);
      } else {
        const cell = creditStats.cells.get(selectedCellId);
        assert(cell !== undefined);
        creditSumView.update(cell);
      }

      for (const [
        column,
        { root, span },
      ] of columnToCreditSumElements.entries()) {
        const cellId = column + "1";
        assert(isCellId(cellId));
        const cellRect = cellIdToRect.get(cellId);
        const columnCredit = creditStats.columns.get(column);
        assert(cellRect !== undefined);
        assert(columnCredit !== undefined);
        const d = columnCreditStatsDisplay(columnCredit);
        root.dataset.messageOnClick = d.warning ?? "";
        span.textContent = d.brief;
        root.style.left = `${cellRect.x}px`;
        root.style.width = `${cellRect.width}px`;
        const [green, yellow] = creditToGreenYellowPercentages(
          columnCredit.effectiveMightTake,
          columnCredit.effectiveTaken,
          columnCredit.min,
        );
        root.style.setProperty("--green-percentage", `${green}%`);
        root.style.setProperty("--yellow-percentage", `${yellow}%`);
      }

      const d = electiveCreditStatsDisplay(creditStats.elective);
      const [g, y] = creditToGreenYellowPercentages(
        creditStats.elective.effectiveMightTake,
        creditStats.elective.effectiveTaken,
        creditStats.elective.min,
      );
      overallCreditSumElement.dataset.messageOnClick = d.warning ?? "";
      overallCreditSumSpan.textContent = d.brief;
      overallCreditSumElement.style.setProperty("--green-percentage", `${g}%`);
      overallCreditSumElement.style.setProperty("--yellow-percentage", `${y}%`);
    }
  };

  // 総合からの移行
  studentTypeRadioNative.checked = localData.native;
  studentTypeRadioTransfer.checked = !localData.native;

  render();
}
