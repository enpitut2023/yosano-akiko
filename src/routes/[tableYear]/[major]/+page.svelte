<script lang="ts">
  import { resolve, asset } from "$app/paths";
  import Timetable, { type TimetableTab } from "$lib/Timetable.svelte";
  import HowToImportFromTwins from "$lib/HowToImportFromTwins.svelte";
  import HowToExportForTwins from "$lib/HowToExportForTwins.svelte";
  import { SvelteAkiko } from "$lib/akiko.svelte";
  import { MAJOR_TO_JA } from "$lib/constants";
  import { parseImportedCsv } from "$lib/csv";
  import {
    columnIdIsElective,
    courseIdCompare,
    gradeIsPass,
    isCellId,
    isCourseId,
    akikoNew,
    slotToString,
    type Availability,
    type BaseCreditStats,
    type CellCreditStats,
    type CreditStats,
    type CellId,
    type ColumnCreditStats,
    type CourseId,
    type ElectiveCreditStats,
    type FakeCourse,
    type Grade,
    type RealCourse,
    cellIdToRow,
    cellIdToColumnId,
  } from "$lib/akiko";
  import {
    createCreditRequirementsOrFail,
    classifyCoursesOrFail,
  } from "$lib/app-setup";
  import {
    localDataDefault,
    localDataFromJson,
    type LocalDataV2,
  } from "$lib/local-data";
  import { browser, dev } from "$app/environment";
  import { assert } from "$lib/util.js";
  import Callout from "$lib/Callout.svelte";
  import { tick, untrack } from "svelte";

  type UiOverlapCourse = {
    id: CourseId;
    name: string;
    cellId: CellId | undefined;
  };

  type UiOverlapGroup = {
    slot: string;
    term: TimetableTab;
    courses: UiOverlapCourse[];
  };

  type UiJizentourokuCourse = UiOverlapCourse & { term: TimetableTab };

  type UiCourse = {
    id: CourseId;
    name: string;
    credit: number | undefined;
    term: string | undefined;
    when: string | undefined;
    expects: string | undefined;
    grade: Grade | undefined;
    takenYear: number | undefined;
    syllabusYear: number;
    availability: Availability;
    visible: boolean;
    remark: string;
  };

  function expectsToString(es: number[]): string {
    if (es.length === 0) return "-";
    if (es.length === 1) return es[0].toString();
    const from = es[0];
    const to = es[es.length - 1];
    for (let i = 0; i < es.length; i++) {
      if (es[i] !== from + i) return es.join("m");
    }
    return `${from}-${to}`;
  }

  let { data } = $props();

  const localDataKey = $derived(
    `${data.config.major}_${data.config.tableYear}`,
  );

  // TODO: should identify ways loading can fail and let the user know that the
  // data will be overwritten by the default value
  function localDataLoad(): LocalDataV2 {
    if (!browser) return localDataDefault();
    const json = localStorage.getItem(localDataKey);
    if (json === null) return localDataDefault();
    return localDataFromJson(json) ?? localDataDefault();
  }

  const initialLocalData = localDataLoad();
  let realCourses = $state<RealCourse[]>(initialLocalData.realCourses);
  let fakeCourses = $state<FakeCourse[]>(initialLocalData.fakeCourses);
  let isNative = $state<boolean>(initialLocalData.native);
  let selectedCellId = $state<CellId | undefined>(undefined);
  let filterString = $state("");
  let showCourseRemark = $state(true);

  const creditRequirements = $derived(
    createCreditRequirementsOrFail(
      data.config.getCreditRequirements(
        data.config.tableYear,
        data.config.major,
      ),
    ),
  );

  const svelteAkiko = $derived.by(() => {
    const localData = localDataLoad();
    const { courseIdToCellId, realCoursePositions, fakeCoursePositions } =
      classifyCoursesOrFail(
        data.config.knownCourses,
        realCourses,
        fakeCourses,
        isNative,
        data.config.tableYear,
        data.config.major,
        data.config.classifyKnownCourses,
        data.config.classifyRealCourses,
        data.config.classifyFakeCourses,
      );
    const akiko = akikoNew(
      data.config.knownCourses,
      realCourses,
      fakeCourses,
      localData.mightTakeCourseIds,
      courseIdToCellId,
      realCoursePositions,
      fakeCoursePositions,
      creditRequirements,
    );
    assert(akiko !== undefined);
    return new SvelteAkiko(akiko);
  });

  const creditStats = $derived(svelteAkiko.getCreditStats());
  const knownCoursesMap = $derived(
    new Map(data.config.knownCourses.map((c) => [c.id, c])),
  );
  const realCoursesMap = $derived(svelteAkiko.getRealCoursesMap());
  const fakeCourseMap = $derived(svelteAkiko.getFakeCoursesMap());

  $effect(() => {
    if (!browser) return;
    const localData: LocalDataV2 = {
      version: 2,
      mightTakeCourseIds,
      realCourses: Array.from(realCourses),
      fakeCourses: Array.from(fakeCourses),
      native: isNative,
    };
    localStorage.setItem(localDataKey, JSON.stringify(localData));
  });

  type Tab = "import" | "export" | "courses" | "settings";

  let timetableShowTaken = $state(true);
  let timetableYear = $state(untrack(() => data.config.knownCourseYear));
  let activeTimetableTerm = $state<TimetableTab>("spring-a");

  let barsVisible = $state(true);
  let activeTab = $state<Tab>("courses");
  let scrollX = $state(0);

  // Zoom uses two representations:
  // - zoomLevel: the actual scale multiplier (e.g. 0.7 = 70% of base size)
  // - sliderZoomLevel: a log-scale value driving the slider so equal slider
  //   distances feel like equal zoom steps. slider=0 → ZOOM_MIN,
  //   slider=1 → ZOOM_DEFAULT, slider=ZOOM_SLIDER_MAX → ZOOM_MAX.
  // Pinch/scroll gestures compute a new zoomLevel directly and convert back
  // to sliderZoomLevel via zoomToSlider to keep the slider in sync.
  const tableScale = 2048 / untrack(() => data.config.tableViewBox.width);
  const ZOOM_DEFAULT = 0.7;
  const ZOOM_MIN = 0.4;
  const ZOOM_MAX = 2;
  const ZOOM_SLIDER_MAX =
    Math.log(ZOOM_MAX / ZOOM_MIN) / Math.log(ZOOM_DEFAULT / ZOOM_MIN);
  function sliderToZoom(s: number): number {
    return Math.min(
      ZOOM_MAX,
      Math.max(ZOOM_MIN, ZOOM_MIN * Math.pow(ZOOM_DEFAULT / ZOOM_MIN, s)),
    );
  }
  function zoomToSlider(z: number): number {
    return Math.log(z / ZOOM_MIN) / Math.log(ZOOM_DEFAULT / ZOOM_MIN);
  }
  let sliderZoomLevel = $state(1);
  const zoomLevel = $derived(sliderToZoom(sliderZoomLevel));

  const cellRects = $derived(
    Object.entries(data.config.cellIdToRectRecord).map(([id, rect]) => {
      assert(isCellId(id), `Bad cell id: "${id}"`);
      return {
        id,
        x: rect.x * zoomLevel,
        y: rect.y * zoomLevel,
        width: rect.width * zoomLevel,
        height: rect.height * zoomLevel,
      };
    }),
  );

  function handleCsvUpload(event: Event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const file = input.files?.[0];
    if (!file) return;
    file.text().then((csv) => {
      const result = parseImportedCsv(csv);
      if (result.kind === "ok") {
        realCourses = result.realCourses;
        fakeCourses = result.fakeCourses;
        if (dev) debugPrintCreditStats(svelteAkiko.getCreditStats());
      } else {
        alert("CSVファイルを正しく読み込めませんでした。");
      }
    });
  }

  function debugPrintCreditStats(stats: CreditStats) {
    function fmt(s: BaseCreditStats): Record<string, number> {
      const o: Record<string, number> = {};
      if (s.rawTaken > 0) {
        if (s.overflowTaken === 0) {
          o.taken = s.rawTaken;
        } else {
          o.rawTaken = s.rawTaken;
          o.effectiveTaken = s.effectiveTaken;
        }
      }
      if (s.rawMightTake > 0) {
        if (s.overflowMightTake === 0) {
          o.mightTake = s.rawMightTake;
        } else {
          o.rawMightTake = s.rawMightTake;
          o.effectiveMightTake = s.effectiveMightTake;
        }
      }
      return o;
    }
    const cells: Record<string, object> = {};
    for (const [cellId, stat] of stats.cells) {
      const cell = fmt(stat);
      if (Object.keys(cell).length > 0) cells[cellId] = cell;
    }
    const columns: Record<string, object> = {};
    for (const [colId, stat] of stats.columns) {
      const col = fmt(stat);
      if (Object.keys(col).length > 0) columns[colId] = col;
    }
    const compulsory = fmt(stats.compulsory);
    const elective = fmt(stats.elective);
    console.log(JSON.stringify({ cells, columns, compulsory, elective }));
  }

  function getSyllabusUrl(courseId: string, year: number) {
    return `https://kdb.tsukuba.ac.jp/syllabi/${year}/${courseId}/jpn`;
  }

  function handleDragStart(
    event: DragEvent,
    courseId: string,
    listKind: "wont-take" | "might-take",
  ) {
    if (event.dataTransfer) {
      event.dataTransfer.setData("text/plain", courseId);
      event.dataTransfer.dropEffect = "move";
    }
    const target = listKind === "wont-take" ? rightBarEl : leftBarEl;
    if (target) {
      const r = target.getBoundingClientRect();
      dropGuide = {
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
      };
    }
  }

  function handleDragEnd() {
    dropGuide = undefined;
  }

  function handleDrop(event: DragEvent, dst: "wont-take" | "might-take") {
    event.preventDefault();
    const courseId = event.dataTransfer?.getData("text/plain");
    if (courseId === undefined || !isCourseId(courseId)) return;
    svelteAkiko.moveCourse(courseId, dst); // TODO: use the return value
    if (dst === "might-take") {
      timetableYear = data.config.knownCourseYear;
      const slots = knownCoursesMap.get(courseId)?.slots ?? [];
      const terms = slots
        .filter((s) => s.when.kind === "regular")
        .map((s) => s.term);
      if (
        terms.length > 0 &&
        (activeTimetableTerm === "other" ||
          !terms.includes(activeTimetableTerm))
      ) {
        activeTimetableTerm = terms[0];
      }
    }
  }

  // Sorted course lists — does NOT depend on filterString, so typing in the
  // search box won't trigger a re-sort.
  const sortedGroupedCourses = $derived.by(() => {
    if (!selectedCellId)
      return {
        wontTake: [],
        nonAvailable: [],
        mightTake: [],
        taken: [],
        fake: [],
      };
    const res = svelteAkiko.getCoursesInCell(selectedCellId);

    function toUi(id: CourseId): UiCourse {
      const kc = knownCoursesMap.get(id);
      const rc = realCoursesMap.get(id);
      return {
        id,
        name: rc?.name || kc?.name || "（不明）",
        credit: rc?.credit ?? kc?.credit,
        term: kc?.term,
        when: kc?.when,
        expects: kc !== undefined ? expectsToString(kc.expects) : undefined,
        grade: rc?.grade,
        takenYear: rc?.takenYear,
        syllabusYear:
          rc?.grade && gradeIsPass(rc.grade)
            ? rc.takenYear
            : data.config.knownCourseYear,
        availability: kc?.availability ?? "available",
        visible: false,
        remark: kc?.remark ?? "",
      };
    }

    function gradePriority(g: Grade | undefined): number {
      if (g === "wip") return 0;
      if (g === "d" || g === "fail") return 1;
      return 2;
    }
    const compareByGradeThenId = (a: UiCourse, b: UiCourse): number => {
      const gd = gradePriority(a.grade) - gradePriority(b.grade);
      if (gd !== 0) return gd;
      return courseIdCompare(a.id, b.id);
    };
    const compareById = (a: UiCourse, b: UiCourse) =>
      courseIdCompare(a.id, b.id);
    const allWontTake = res.wontTake.map(toUi).sort(compareByGradeThenId);
    return {
      wontTake: allWontTake.filter((c) => c.availability === "available"),
      nonAvailable: allWontTake.filter((c) => c.availability !== "available"),
      mightTake: res.mightTake.map(toUi).sort(compareByGradeThenId),
      taken: res.taken.map(toUi).sort(compareById),
      fake: res.fake
        .map((id) => fakeCourseMap.get(id))
        .filter((fc) => fc !== undefined),
    };
  });

  // Adds the `visible` flag — only this re-runs when filterString changes.
  const groupedCourses = $derived.by(() => {
    const addVisible = (c: UiCourse): UiCourse => {
      if (!filterString) return { ...c, visible: true };
      const kc = knownCoursesMap.get(c.id);
      const rc = realCoursesMap.get(c.id);
      const name = rc?.name || kc?.name || "";
      const f = filterString.toLowerCase();
      const visible =
        c.id.toLowerCase().includes(f) || name.toLowerCase().includes(f);
      return { ...c, visible };
    };
    return {
      wontTake: sortedGroupedCourses.wontTake.map(addVisible),
      nonAvailable: sortedGroupedCourses.nonAvailable.map(addVisible),
      mightTake: sortedGroupedCourses.mightTake.map(addVisible),
      taken: sortedGroupedCourses.taken.map(addVisible),
      fake: sortedGroupedCourses.fake,
    };
  });

  const mightTakeCourseIds = $derived(svelteAkiko.getMightTakeCourseIds());
  const takenCourseIds = $derived(svelteAkiko.getTakenCourseIds());
  const unclassifiedCourses = $derived(svelteAkiko.getUnclassifiedCourses());
  const exportForTwinsResult = $derived(svelteAkiko.exportForTwins());
  const uiJizentouroku = $derived.by((): UiJizentourokuCourse[] => {
    return exportForTwinsResult.jizentouroku.map((kc) => {
      const rc = realCoursesMap.get(kc.id);
      const firstSlot = kc.slots[0];
      const term: TimetableTab =
        firstSlot !== undefined ? firstSlot.term : "other";
      return {
        id: kc.id,
        name: rc?.name ?? kc.name,
        cellId: svelteAkiko.getCellId(kc.id),
        term,
      };
    });
  });
  const uiOverlaps = $derived.by((): UiOverlapGroup[] => {
    if (exportForTwinsResult.kind === "ok") return [];
    return exportForTwinsResult.overlaps.map((overlap) => ({
      slot: slotToString(overlap.slot),
      term: overlap.slot.term,
      courses: overlap.courses.map((kc) => {
        const rc = realCoursesMap.get(kc.id);
        return {
          id: kc.id,
          name: rc?.name ?? kc.name,
          cellId: svelteAkiko.getCellId(kc.id),
        };
      }),
    }));
  });

  function exportMightTake() {
    if (exportForTwinsResult.kind !== "ok") return;
    const content = exportForTwinsResult.toExport.map((c) => c.id).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(content);
    a.download = "科目番号一覧.csv";
    a.click();
  }

  function reset() {
    const msg =
      "インポートした成績データや「取る授業」に移動した授業などが全てリセットされます。本当にリセットしますか？";
    if (window.confirm(msg)) {
      localStorage.removeItem(localDataKey);
      window.location.reload();
    }
  }

  function gradeDisplay(g: Grade): string {
    if (g === "wip") return "（履修中）";
    if (g === "d" || g === "fail") return "（落単済み）";
    if (g === "pass") return "評価：P";
    return `評価：${g.toUpperCase()}`;
  }

  function creditBoundsToString(min: number, max: number | undefined): string {
    if (max === undefined) return `${min}~`;
    if (min === max) return min.toString();
    return `${min}~${max}`;
  }

  function cellCreditStatsDisplay(c: CellCreditStats): {
    brief: string;
    warning: string | undefined;
  } {
    let brief = "計:";
    if (c.effectiveMightTake === 0) {
      brief += c.effectiveTaken.toString();
    } else {
      brief += `${c.effectiveTaken}→${c.effectiveTaken + c.effectiveMightTake}`;
    }
    brief += "　要:" + creditBoundsToString(c.min, c.max);

    let warning: string | undefined;
    if (c.overflowTotal > 0) {
      warning = `このマスは合計で${c.max}単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で${c.rawTotal}単位なので、残りの${c.overflowTotal}単位は卒業単位に含まれません。`;
    }

    return { brief, warning };
  }

  function columnCreditStatsDisplay(c: ColumnCreditStats): {
    brief: string;
    warning: string | undefined;
  } {
    let brief = "計:";
    if (c.effectiveMightTake === 0) {
      brief += c.effectiveTaken.toString();
    } else {
      brief += `${c.effectiveTaken}→${c.effectiveTaken + c.effectiveMightTake}`;
    }
    brief += "　要:" + creditBoundsToString(c.min, c.max);

    let warning: string | undefined;
    if (c.overflowTotal > 0) {
      warning = `この列は合計で${c.max}単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で${c.rawTotal}単位なので、残りの${c.overflowTotal}単位は卒業単位に含まれません。`;
    }

    return { brief, warning };
  }

  function electiveCreditStatsDisplay(c: ElectiveCreditStats): {
    brief: string;
    warning: string | undefined;
  } {
    let brief = "選択科目計:";
    if (c.effectiveMightTake === 0) {
      brief += c.effectiveTaken.toString();
    } else {
      brief += `${c.effectiveTaken}→${c.effectiveTaken + c.effectiveMightTake}`;
    }
    brief += "　要:" + creditBoundsToString(c.min, c.max);

    let warning: string | undefined;
    if (c.overflowTotal > 0) {
      warning = `選択科目全体は合計で${c.max}単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で${c.rawTotal}単位なので、残りの${c.overflowTotal}単位は卒業単位に含まれません。`;
    }

    return { brief, warning };
  }

  function getPercentage(
    taken: number,
    mightTake: number,
    min: number,
  ): [number, number] {
    if (min === 0) return [100, 100];
    return [
      Math.min(1, taken / min) * 100,
      Math.min(1, (taken + mightTake) / min) * 100,
    ];
  }

  type UiColumnCredit = {
    colId: string;
    rect: { x: number; width: number };
    display: { brief: string; warning: string | undefined };
    green: number;
    yellow: number;
  };

  // Two-stage derivation: display strings depend only on creditStats, while
  // rects depend on cellRects (updated on every zoom). Keeping them separate
  // prevents recomputing display strings on zoom.
  const uiColumnCreditsWithoutRect = $derived.by(() => {
    const res = new Map<string, Omit<UiColumnCredit, "rect">>();
    for (const [colId, stats] of creditStats.columns) {
      if (!columnIdIsElective(colId)) continue;
      const display = columnCreditStatsDisplay(stats);
      const [green, yellow] = getPercentage(
        stats.effectiveTaken,
        stats.effectiveMightTake,
        stats.min,
      );
      res.set(colId, { colId, display, green, yellow });
    }
    return res;
  });

  const uiColumnCredits = $derived.by(() => {
    const res: UiColumnCredit[] = [];
    for (const rect of cellRects) {
      if (cellIdToRow(rect.id) !== 1) continue;
      const colId = cellIdToColumnId(rect.id);
      const entry = uiColumnCreditsWithoutRect.get(colId);
      if (entry === undefined) continue;
      res.push({ ...entry, rect });
    }
    return res;
  });

  let metaTitle = $derived(
    `あきこ - ${data.config.tableYear}年度 ${MAJOR_TO_JA[data.config.major]}`,
  );
  let metaDescription = $derived(
    `${data.config.tableYear}年度入学の${MAJOR_TO_JA[data.config.major]}の学生向け履修サポートツールです。単位の計算・授業探し・Twinsへの登録を楽に終わらせましょう！`,
  );

  let requirementsEl = $state<HTMLDivElement | undefined>();
  let leftBarEl = $state<HTMLDivElement | undefined>();
  let rightBarEl = $state<HTMLDivElement | undefined>();
  let dropGuide = $state<
    { left: number; top: number; width: number; height: number } | undefined
  >();

  let columnSpanEls = $state<Record<string, HTMLSpanElement | undefined>>({});
  let overallSpanEl = $state<HTMLSpanElement | undefined>();

  $effect(() => {
    void zoomLevel; // re-run squishing when zoom changes container widths
    const spans: HTMLSpanElement[] = [];
    for (const [colId] of creditStats.columns.entries()) {
      if (!columnIdIsElective(colId)) continue;
      const span = columnSpanEls[colId];
      if (span) spans.push(span);
    }
    if (creditStats.elective && overallSpanEl) spans.push(overallSpanEl);

    const BORDER = 1;
    const PADDING = 5;

    // Batch write: clear all transforms first
    for (const span of spans) {
      span.style.transform = "";
    }

    // Batch read: measure all at once (single reflow)
    const measurements = spans.map((span) => {
      assert(span.parentElement !== null);
      const maxWidth =
        span.parentElement.getBoundingClientRect().width -
        (BORDER + PADDING) * 2;
      const spanWidth = span.getBoundingClientRect().width;
      return { span, maxWidth, spanWidth };
    });

    // Batch write: apply all transforms
    for (const { span, maxWidth, spanWidth } of measurements) {
      if (spanWidth > 0) {
        span.style.transform = `scaleX(${Math.min(maxWidth / spanWidth, 1)})`;
      }
    }
  });

  async function handleWheel(e: WheelEvent) {
    if (!e.ctrlKey) return;
    const container = requirementsEl;
    if (!container || !container.contains(e.target as Node)) return;
    e.preventDefault();
    const rect = container.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const oldZoom = zoomLevel;
    const newZoom = Math.min(
      ZOOM_MAX,
      Math.max(ZOOM_MIN, oldZoom * Math.exp(-e.deltaY * 0.01)),
    );
    const f = newZoom / oldZoom;
    const newScrollLeft = (container.scrollLeft + cx) * f - cx;
    const newScrollTop = (container.scrollTop + cy) * f - cy;
    sliderZoomLevel = zoomToSlider(newZoom);
    await tick();
    container.scrollLeft = newScrollLeft;
    container.scrollTop = newScrollTop;
  }

  $effect(() => {
    if (!browser) return;
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  });
</script>

<svelte:head>
  <title>{metaTitle}</title>
  <meta name="description" content={metaDescription} />
  <meta property="og:title" content={metaTitle} />
  <meta property="og:description" content={metaDescription} />
  <meta
    property="og:image"
    content="https://github.com/user-attachments/assets/be6c928e-36fa-48e4-ac5b-5a0406a0adb2"
  />
</svelte:head>

{#snippet courseRow(
  c: UiCourse,
  dragSource: "wont-take" | "might-take" | undefined,
  colspan: number,
)}
  {@const draggable = dragSource !== undefined}
  <tr
    class="course"
    class:hide={!c.visible}
    {draggable}
    ondragstart={(e) => {
      if (dragSource === undefined) return;
      assert(selectedCellId !== undefined);
      handleDragStart(e, c.id, dragSource);
    }}
    ondragend={handleDragEnd}
  >
    <td class="id-name">
      <span>{c.id}</span><br />
      <a
        href={getSyllabusUrl(c.id, c.syllabusYear)}
        target="_blank"
        draggable="false"
        >{c.name}{c.grade && gradeIsPass(c.grade) ? ` (${c.takenYear})` : ""}</a
      >
      {#if c.grade}<br /><span>{gradeDisplay(c.grade)}</span>{/if}
    </td>
    <td class="credit">{c.credit ?? "-"}</td>
    <td class="term">{c.term ?? "-"}</td>
    <td class="when">{c.when ?? "-"}</td>
    <td class="expects">{c.expects ?? "-"}</td>
  </tr>
  {#if showCourseRemark}
    <tr class="course-remark" class:hide={!c.visible}>
      {#if c.remark}
        <td {colspan}>{c.remark}</td>
      {:else}
        <td {colspan} class="no-remark">（備考なし）</td>
      {/if}
    </tr>
  {/if}
{/snippet}

{#snippet courseTable(
  courses: UiCourse[],
  state: "no-cell-selected" | "no-courses" | "contains-courses",
  showTerm: boolean,
  showWhen: boolean,
  showExpects: boolean,
  dragSource: "wont-take" | "might-take" | undefined,
)}
  {#if state === "no-cell-selected"}
    <p>マスを選択してください</p>
  {:else if state === "no-courses"}
    <p>該当する授業がありません</p>
  {:else}
    {@const colspan = 2 + +showTerm + +showWhen + +showExpects}
    <table
      class:show-term={showTerm}
      class:show-when={showWhen}
      class:show-expects={showExpects}
    >
      <thead>
        <tr class="course">
          <th class="id-name">科目</th>
          <th class="credit">単位</th>
          <th class="term">学期</th>
          <th class="when">時限</th>
          <th class="expects">標準<br />履修<br />年次</th>
        </tr>
      </thead>
      <tbody>
        {#each courses as c}
          {@render courseRow(c, dragSource, colspan)}
        {/each}
      </tbody>
    </table>
  {/if}
{/snippet}

<main class:bars-hidden={!barsVisible}>
  <div id="table-view">
    <div
      id="requirements"
      bind:this={requirementsEl}
      onscroll={(e) => (scrollX = -e.currentTarget.scrollLeft)}
    >
      <img
        src={asset(`/tables/${data.config.tableYear}/${data.config.major}.svg`)}
        alt="Table"
        width={tableScale * zoomLevel * data.config.tableViewBox.width}
        height={tableScale * zoomLevel * data.config.tableViewBox.height}
        draggable="false"
      />
      <div id="title">
        <a href={resolve("/")} class="akiko"
          ><img src={asset("/images/akiko.png")} alt="あきこ" /></a
        >
        <span
          >このページは <strong>{data.config.tableYear}</strong>
          年度入学の
          <strong>{MAJOR_TO_JA[data.config.major]}</strong> の学生向けですよ〜</span
        >
        <nav>
          <a href="{resolve('/')}#app-page-links">学類一覧に戻る</a>
          <a href={resolve("/docs")}>あきこの使い方</a>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfUbueFsF6fbyJxCohNTqh5S8bYdxNgqx_HQ76RCR5TJQkpyQ/viewform?usp=dialog"
            target="_blank"
            rel="noreferrer">ご意見はこちらから</a
          >
        </nav>
      </div>
      {#each cellRects as r}
        {@const cellStats = creditStats.cells.get(r.id)}
        {#if cellStats}
          {@const [green, yellow] = getPercentage(
            cellStats.effectiveTaken,
            cellStats.effectiveMightTake,
            cellStats.min,
          )}
          <div
            class="cell"
            class:selected={selectedCellId === r.id}
            style="left:{r.x}px; top:{r.y}px; width:{r.width}px; height:{r.height}px; --green-percentage:{green}%; --yellow-percentage:{yellow}%"
            onclick={() => {
              selectedCellId = r.id;
              barsVisible = true;
              activeTab = "courses";
            }}
          ></div>
        {/if}
      {/each}
    </div>
    <div id="credit-sums-container">
      <div id="zoom-control">
        <img src={asset("/icons/zoom-in.svg")} width="15" alt="zoom" />
        <input
          type="range"
          min="0"
          max={ZOOM_SLIDER_MAX}
          step="0.01"
          bind:value={sliderZoomLevel}
        />
      </div>
      <div id="column-credit-sums" style="--x: {scrollX}px">
        {#each uiColumnCredits as { colId, rect, display, green, yellow } (colId)}
          <div
            style="left:{rect.x}px; width:{rect.width}px; --green-percentage:{green}%; --yellow-percentage:{yellow}%"
            data-message-on-click={display.warning}
            onclick={() => display.warning && alert(display.warning)}
          >
            <img src={asset("/icons/warning.svg")} width="20" alt="warning" />
            <span bind:this={columnSpanEls[colId]}>{display.brief}</span>
          </div>
        {/each}
      </div>
      {#if creditStats.elective}
        {@const s = creditStats.elective}
        {@const display = electiveCreditStatsDisplay(s)}
        {@const [green, yellow] = getPercentage(
          s.effectiveTaken,
          s.effectiveMightTake,
          s.min,
        )}
        <div
          id="overall-credit-sum"
          style="--green-percentage:{green}%; --yellow-percentage:{yellow}%"
          data-message-on-click={display.warning}
          onclick={() => display.warning && alert(display.warning)}
        >
          <img src={asset("/icons/warning.svg")} width="20" alt="warning" />
          <span bind:this={overallSpanEl}>{display.brief}</span>
        </div>
      {/if}
    </div>
  </div>

  <div id="sidebar">
    <div id="tab-header">
      <button
        class:active={activeTab === "import"}
        onclick={() => (activeTab = "import")}
        ><span class="icon" style="--src: url({asset('/icons/math.svg')})"
        ></span>単位チェック</button
      >
      <button
        class:active={activeTab === "courses"}
        onclick={() => (activeTab = "courses")}
        ><span class="icon" style="--src: url({asset('/icons/book.svg')})"
        ></span>履修を組む</button
      >
      <button
        class:active={activeTab === "export"}
        onclick={() => (activeTab = "export")}
        ><span class="icon" style="--src: url({asset('/icons/itf.svg')})"
        ></span>TWINSに出力</button
      >
      <button
        class:active={activeTab === "settings"}
        onclick={() => (activeTab = "settings")}
        ><span class="icon" style="--src: url({asset('/icons/cog.svg')})"
        ></span>設定</button
      >
    </div>

    <div id="import-tab" class:active={activeTab === "import"}>
      <div id="control">
        <label id="import-grades-button" class="button">
          <img src={asset("/icons/import.svg")} width="15px" alt="import" />
          <span>TWINSの成績データをインポート</span>
          <input
            type="file"
            id="csv"
            accept=".csv"
            onchange={handleCsvUpload}
          />
        </label>
        <div id="student-type-container" style="margin-bottom: 50px;">
          <label
            ><input
              type="radio"
              name="student-type"
              bind:group={isNative}
              value={true}
            /> <span>1年生からこの学類に所属している</span></label
          ><br />
          <label
            ><input
              type="radio"
              name="student-type"
              bind:group={isNative}
              value={false}
            /> <span>総合学域群からこの学類に移行した</span></label
          >
        </div>
        {#if unclassifiedCourses.real.length + unclassifiedCourses.fake.length > 0}
          <h2>卒業単位に含まれない授業</h2>
          <table class="show-term">
            <thead>
              <tr class="course">
                <th class="id-name">科目</th>
                <th class="credit">単位</th>
                <th class="term">評価</th>
              </tr>
            </thead>
            <tbody>
              {#each unclassifiedCourses.real as c}
                <tr class="course">
                  <td class="id-name">
                    <span>{c.id}</span><br />
                    <a href={getSyllabusUrl(c.id, c.takenYear)} target="_blank"
                      >{c.name}</a
                    >
                  </td>
                  <td class="credit">{c.credit ?? "-"}</td>
                  <td class="term">{gradeDisplay(c.grade)}</td>
                </tr>
              {/each}
              {#each unclassifiedCourses.fake as c}
                <tr class="course">
                  <td class="id-name">
                    <span>（科目番号不明）</span><br />
                    <span>{c.name}</span>
                  </td>
                  <td class="credit">{c.credit ?? "-"}</td>
                  <td class="term">-</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
        <Callout kind="info">
          成績データは、あきこの開発チームに閲覧されたり、外部に送信されたりすることはありません。
        </Callout>
        <Callout kind="warning">
          成績データのファイルは、あきこにインポートする前にExcelやNumbersなどのアプリケーションで開いたり保存しないでください。
          データの形式が壊れ、あきこに正しくインポートできなくなる場合があります。
        </Callout>
      </div>
      <HowToImportFromTwins />
    </div>

    <div id="export-tab" class:active={activeTab === "export"}>
      <div id="control">
        <button
          class="button"
          onclick={exportMightTake}
          disabled={exportForTwinsResult.kind !== "ok"}
          style="margin-bottom: 20px"
        >
          <img src={asset("/icons/export.svg")} width="15px" alt="export" />
          <span>取る授業一覧を出力</span>
        </button>
        {#if uiJizentouroku.length > 0}
          <Callout kind="warning">
            「取る授業」に事前登録対象の授業が存在します。
            事前登録対象の授業はTWINSへのアップロードではなく、別途事前登録が必要です。
          </Callout>
          <h2 style="margin-top: 10px; margin-bottom: 0">
            事前登録対象の授業
          </h2>
          <table>
            <thead>
              <tr class="course">
                <th class="id-name">科目</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {#each uiJizentouroku as course}
                <tr class="course">
                  <td class="id-name">
                    <span>{course.id}</span><br />
                    <a
                      href={getSyllabusUrl(
                        course.id,
                        data.config.knownCourseYear,
                      )}
                      target="_blank">{course.name}</a
                    >
                  </td>
                  <td>
                    {#if course.cellId !== undefined}
                      <button
                        onclick={() => {
                          selectedCellId = course.cellId;
                          activeTimetableTerm = course.term;
                          barsVisible = true;
                          activeTab = "courses";
                        }}>表示</button
                      >
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
        {#if uiOverlaps.length > 0}
          <Callout kind="warning">
            「取る授業」に時間が被っている授業が存在します。
            時間が被っている授業をTWINSに登録するすることはできないため、取る授業一覧をTWINSにアップロードするとエラーになります。
          </Callout>
          <h2 style="margin-top: 10px; margin-bottom: 0">
            時間が被っている授業
          </h2>
          <table class="show-term">
            <thead>
              <tr class="course">
                <th class="term">時限</th>
                <th class="id-name">科目</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {#each uiOverlaps as group}
                {#each group.courses as course, i}
                  <tr class="course">
                    {#if i === 0}
                      <td
                        class="term"
                        rowspan={group.courses.length}
                        style="white-space: nowrap">{group.slot}</td
                      >
                    {/if}
                    <td class="id-name">
                      <span>{course.id}</span><br />
                      <a
                        href={getSyllabusUrl(
                          course.id,
                          data.config.knownCourseYear,
                        )}
                        target="_blank">{course.name}</a
                      >
                    </td>
                    <td>
                      {#if course.cellId !== undefined}
                        <button
                          onclick={() => {
                            selectedCellId = course.cellId;
                            activeTimetableTerm = group.term;
                            barsVisible = true;
                            activeTab = "courses";
                          }}>表示</button
                        >
                      {/if}
                    </td>
                  </tr>
                {/each}
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
      <HowToExportForTwins />
    </div>

    <div id="settings-tab" class:active={activeTab === "settings"}>
      <section class="settings-section">
        <h3>時間割</h3>
        <label class="settings-row">
          <input type="checkbox" bind:checked={timetableShowTaken} />
          <span>単位取得済みの授業を表示する</span>
        </label>
        <label class="settings-row">
          <span>年度</span>
          <input
            type="number"
            bind:value={timetableYear}
            min="2020"
            max="2030"
          />
        </label>
      </section>
      <section class="settings-section">
        <h3>データ</h3>
        <div id="control">
          <button id="reset" class="button" onclick={() => reset()}>
            <img src={asset("/icons/trash.svg")} width="15px" alt="reset" />
            <span>リセット</span>
          </button>
        </div>
      </section>
    </div>

    <div id="courses-tab" class:active={activeTab === "courses"}>
      <div
        bind:this={leftBarEl}
        id="left-bar"
        ondragover={(e) => {
          e.preventDefault();
          if (e.dataTransfer !== null) e.dataTransfer.dropEffect = "move";
        }}
        ondrop={(e) => handleDrop(e, "wont-take")}
      >
        <div id="left-bar-scroll">
          <search>
            <div>
              <img src={asset("/icons/search.svg")} width="15px" alt="search" />
            </div>
            <input
              type="text"
              placeholder="科目番号・科目名で検索"
              bind:value={filterString}
            />
          </search>
          <label class="settings-row">
            <input type="checkbox" bind:checked={showCourseRemark} />
            <span>授業の備考を表示</span>
          </label>
          <h2>当てはまる授業</h2>
          {@render courseTable(
            groupedCourses.wontTake,
            !selectedCellId
              ? "no-cell-selected"
              : groupedCourses.wontTake.length === 0
                ? "no-courses"
                : "contains-courses",
            true,
            true,
            true,
            "wont-take",
          )}
          {#if groupedCourses.nonAvailable.length > 0}
            <h2>今年度開講しない授業</h2>
            {@render courseTable(
              groupedCourses.nonAvailable,
              "contains-courses",
              false,
              false,
              true,
              undefined,
            )}
          {/if}
        </div>
        <div id="cell-detail" class:no-cell-selected={!selectedCellId}>
          <h2>単位数</h2>
          {#if selectedCellId}
            {@const selectedCellStats = creditStats.cells.get(selectedCellId)}
            {#if selectedCellStats}
              {@const display = cellCreditStatsDisplay(selectedCellStats)}
              <p>
                {@html `選択されたマスの単位：${display.brief}${display.warning ? `<br>⚠️ ${display.warning}` : ""}`}
              </p>
            {/if}
            {#if data.config.getRemark}
              {@const remark = data.config.getRemark(
                selectedCellId,
                data.config.tableYear,
                data.config.major,
              )}
              {#if remark}
                <h2>備考</h2>
                <p style="white-space: pre-line">{remark}</p>
              {/if}
            {/if}
          {/if}
        </div>
      </div>

      <div
        bind:this={rightBarEl}
        id="right-bar"
        ondragover={(e) => {
          e.preventDefault();
          if (e.dataTransfer !== null) e.dataTransfer.dropEffect = "move";
        }}
        ondrop={(e) => handleDrop(e, "might-take")}
      >
        <Timetable
          year={timetableYear}
          bind:activeTerm={activeTimetableTerm}
          {mightTakeCourseIds}
          {takenCourseIds}
          showTaken={timetableShowTaken}
          {knownCoursesMap}
          {realCoursesMap}
          onBarClick={(courseId) => {
            const cellId = svelteAkiko.getCellId(courseId);
            if (cellId !== undefined) {
              selectedCellId = cellId;
              barsVisible = true;
              activeTab = "courses";
            }
          }}
          onBarDragStart={(e, courseId) =>
            handleDragStart(e, courseId, "might-take")}
          onBarDragEnd={handleDragEnd}
        />
        <div id="right-bar-scroll">
          <h2>取る授業</h2>
          {@render courseTable(
            groupedCourses.mightTake,
            !selectedCellId
              ? "no-cell-selected"
              : groupedCourses.mightTake.length === 0
                ? "no-courses"
                : "contains-courses",
            true,
            true,
            false,
            "might-take",
          )}
          <h2>単位取得済みの授業</h2>
          {@render courseTable(
            groupedCourses.taken,
            !selectedCellId
              ? "no-cell-selected"
              : groupedCourses.taken.length === 0
                ? "no-courses"
                : "contains-courses",
            false,
            false,
            false,
            undefined,
          )}
        </div>
      </div>
    </div>
  </div>
</main>

{#if dropGuide}
  <div
    id="drop-guide"
    style="left:{dropGuide.left}px; top:{dropGuide.top}px; width:{dropGuide.width}px; height:{dropGuide.height}px"
  >
    ここに授業をドロップ
  </div>
{/if}

<button
  id="bars-toggle"
  style="left: {barsVisible
    ? 'calc(100vw - 2 * var(--sidebar-width) - var(--toggle-width))'
    : 'calc(100vw - var(--toggle-width))'}"
  onclick={() => (barsVisible = !barsVisible)}
>
  {barsVisible ? "⏵" : "⏴"}
</button>

<div id="mobile-unsupported">
  <div class="mobile-unsupported-dialog">
    <img src={asset("/images/akiko.png")} alt="あきこ" />
    <span>あきこ</span>
    <span>ごめんなさいね〜</span>
  </div>
  <p>
    現在あきこはスマホの小さい画面やタッチ操作に対応しておらず、パソコンで開いていただく必要があります。
    私たちは主に単位チェックの正確性を優先して開発を進めており、スマホ対応を優先的に進める目処は立っていません。
    お手数をおかけして申し訳ございません。
  </p>
</div>

<style lang="scss">
  #mobile-unsupported {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
    background-color: white;

    @media (pointer: coarse) and (hover: none) {
      display: block;
    }

    & > p {
      margin: 30px;
    }

    & > .mobile-unsupported-dialog {
      width: 80%;
      margin: 20px auto;
      margin-bottom: 40px;

      display: grid;
      $icon-size: 70px;
      grid-template-columns: $icon-size auto;
      grid-template-rows: $icon-size auto;
      padding: 10px 20px;

      --h: 350;
      background-color: oklch(98% 4% var(--h));
      border: 1px solid oklch(92% 10% var(--h));
      border-radius: 20px;

      & > img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background-color: hsl(0, 0%, 98%);
        border: 1px solid oklch(92% 10% var(--h));
        border-radius: 50%;
      }

      & > span:first-of-type {
        place-self: center;
        margin-top: 5px;
      }

      & > span:nth-of-type(2) {
        grid-column: 2/3;
        grid-row: 1/3;
        align-self: center;
        margin-left: 30px;
      }
    }
  }

  $color-progress-taken: rgb(51, 204, 51);
  $color-progress-might-take: rgb(255, 204, 0);
  $color-hover-overlay: rgba(0, 0, 0, 0.25);

  :global(:root) {
    --sidebar-width: 370px;
    --toggle-width: 30px;
  }

  main {
    position: fixed;
    inset: 0;
    font-size: 14px;

    display: grid;
    grid-template-columns: auto calc(2 * var(--sidebar-width));
    grid-template-rows: 100vh;

    &.bars-hidden {
      grid-template-columns: auto 0;

      & > #sidebar {
        display: none;
      }
    }
  }

  #table-view {
    grid-column: 1/2;
    display: grid;
    grid-template-rows: 1fr 85px;
  }

  #requirements {
    grid-row: 1/2;
    position: relative;
    overflow: scroll;
  }

  #title {
    position: absolute;
    left: 0;
    top: 0;
    text-wrap: nowrap;
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;
    align-items: center;
    background-color: oklch(98% 4% 350);
    border-right: 1px solid;
    border-bottom: 1px solid;
    border-color: oklch(92% 10% 350);
    border-bottom-right-radius: 10px;
    padding: 10px 20px;

    & > .akiko {
      grid-column: 1/2;
      grid-row: 1/3;
      width: 60px;
      height: 60px;
      margin-right: 20px;
      background-color: hsl(0, 0%, 98%);
      border: 1px solid oklch(92% 10% 350);
      border-radius: 50%;
      overflow: hidden;

      & > img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    & > nav {
      width: 100%;
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      gap: 20px;
    }

    & > span > strong {
      font-size: 1.2em;
    }
  }

  #sidebar {
    grid-column: 2/3;
    display: grid;
    grid-template-rows: auto 1fr;
    border-left: 1px solid black;
    overflow: hidden;

    & h2 {
      margin-top: 0;
      &:not(:first-of-type) {
        margin-top: 50px;
      }
    }
  }

  #tab-header {
    display: flex;
    gap: 10px;
    padding: 10px;
    border-bottom: 1px solid black;

    & > button {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      background-color: white;
      color: #444;
      border: 1px solid currentColor;
      border-radius: 10px;

      &:hover {
        background-color: oklch(95% 0 0);
      }

      &.active {
        $c: oklch(70% 50% 270);
        background-color: $c;
        border-color: $c;
        color: white;
      }

      & > .icon {
        width: 15px;
        height: 15px;
        background-color: currentColor;
        mask-image: var(--src);
        mask-size: contain;
        mask-repeat: no-repeat;
        mask-position: center;
      }
    }
  }

  #import-tab,
  #export-tab,
  #settings-tab {
    display: none;
    grid-template-rows: 1fr;
    overflow-y: scroll;
    padding: 15px;
    padding-bottom: 50vh;

    &.active {
      display: grid;
    }
  }

  #courses-tab {
    display: none;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;

    &.active {
      display: grid;
    }
  }

  #left-bar {
    display: grid;
    grid-template-rows: 1fr auto;
    border-right: 1px dashed black;
    overflow: hidden;
  }

  #left-bar-scroll {
    overflow-y: scroll;
    padding: 0 15px;

    & h2 {
      position: sticky;
      top: 0;
      background-color: white;
      padding: 5px 0;
    }
  }

  #right-bar {
    display: grid;
    grid-template-rows: 400px 1fr;
    overflow: hidden;
  }

  #right-bar-scroll {
    overflow-y: scroll;
    padding: 0 15px;
    border-top: 1px dashed black;

    & h2 {
      position: sticky;
      top: 0;
      background-color: white;
      padding: 5px 0;
    }
  }

  #cell-detail {
    border-top: 1px dashed black;
    padding: 15px;

    &.no-cell-selected {
      display: none;
    }
  }

  .cell {
    --border-width: 3px;
    --green-percentage: 0%;
    --yellow-percentage: 0%;
    position: absolute;
    box-sizing: border-box;
    border: var(--border-width) dashed rgba(0, 0, 0, 0.2);
    cursor: pointer;

    &::before {
      content: "";
      display: block;
      position: absolute;
      inset: calc(-1 * var(--border-width));
      background: linear-gradient(
        90deg,
        $color-progress-taken 0%,
        $color-progress-taken var(--green-percentage),
        $color-progress-might-take var(--green-percentage),
        $color-progress-might-take var(--yellow-percentage),
        transparent var(--yellow-percentage),
        transparent 100%
      );
      opacity: 0.4;
    }

    &:hover {
      background-color: $color-hover-overlay;
    }

    &.selected {
      outline: 6px solid #0066ff;
      outline-offset: 4px;
      z-index: 1;
    }
  }

  .course.hide,
  .course-remark.hide {
    display: none;
  }

  .course-remark td {
    font-size: 0.85em;
    padding: 3px 5px 8px;
    background-color: hsl(0, 0%, 96%);
    border-top: 1px solid #ccc;
    overflow-wrap: anywhere;

    &.no-remark {
      color: #aaa;
    }
  }

  table,
  th,
  td {
    border: 1px solid black;
    border-collapse: collapse;
  }

  table {
    width: 100%;
    margin-bottom: 30px;

    .term,
    .when,
    .expects {
      display: none;
    }
    &.show-term .term,
    &.show-when .when,
    &.show-expects .expects {
      display: revert;
    }
  }

  th {
    white-space: nowrap;
  }

  tbody > tr {
    background-color: white;
  }

  tbody > tr[draggable="true"] {
    cursor: grab;
    &:active {
      cursor: grabbing;
    }
  }

  #bars-toggle {
    position: absolute;
    margin: 0;
    padding: 0;
    border-radius: 0 0 0 10px;
    width: var(--toggle-width);
    height: var(--toggle-width);
    font-size: 20px;
    text-align: center;
    background-color: white;
    border: unset;
    border-left: 1px solid black;
    border-bottom: 1px solid black;

    &:hover {
      background-color: #ddd;
    }
  }

  input[name="student-type"]:checked + span {
    font-weight: bold;
  }

  #control {
    margin-bottom: 50px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    & .button {
      --bg-l: 0.92;
      --bg-c: 0.05;
      --border-l: 0.85;
      --border-c: 0.1;
      --h: 270;
      display: grid;
      place-content: center;
      place-items: center;
      gap: 10px;
      grid-template-columns: auto auto;
      width: 100%;
      height: 40px;
      background-color: oklch(var(--bg-l) var(--bg-c) var(--h));
      border: 1px solid oklch(var(--border-l) var(--border-c) var(--h));
      border-radius: 10px;

      &:hover {
        background-color: oklch(var(--border-l) var(--border-c) var(--h));
      }

      &:disabled {
        --bg-l: 0.92;
        --bg-c: 0;
        --border-l: 0.85;
        --border-c: 0;
        color: oklch(0.6 0 0);

        &:hover {
          background-color: oklch(var(--bg-l) var(--bg-c) var(--h));
        }
      }
    }

    & label.button {
      box-sizing: border-box;
    }

    & #reset {
      --h: 10;
    }
  }

  #csv {
    display: none;
  }

  #student-type-container {
    padding: 10px;
    background-color: hsl(0, 0%, 97%);
    border-radius: 10px;
  }

  #left-bar-scroll > .settings-row {
    margin-bottom: 20px;
  }

  #left-bar-scroll > search {
    margin-top: 15px;
    margin-bottom: 10px;
    width: 100%;
    position: relative;

    & > div {
      position: absolute;
      left: 10px;
      top: 0;
      bottom: 0;
      display: grid;
      place-content: center;
      pointer-events: none;
    }

    & > input {
      box-sizing: border-box;
      width: 100%;
      border: 1px solid gray;
      border-radius: 10px;
      padding: 5px 10px 5px 35px;
    }
  }

  #credit-sums-container {
    grid-row: 2/3;
    overflow: hidden;
    position: relative;
  }

  #column-credit-sums {
    position: relative;
    transform: translateX(var(--x, 0));
  }

  #column-credit-sums > div,
  #overall-credit-sum {
    --green-percentage: 0%;
    --yellow-percentage: 0%;
    position: absolute;
    box-sizing: border-box;
    border: 1px solid black;
    padding: 5px;
    height: 35px;
    display: grid;
    user-select: none;
    -webkit-user-select: none;

    $alpha: 0.4;
    background: linear-gradient(
      90deg,
      rgba($color-progress-taken, $alpha) 0%,
      rgba($color-progress-taken, $alpha) var(--green-percentage),
      rgba($color-progress-might-take, $alpha) var(--green-percentage),
      rgba($color-progress-might-take, $alpha) var(--yellow-percentage),
      transparent var(--yellow-percentage),
      transparent 100%
    );

    &[data-message-on-click]:not([data-message-on-click=""]) {
      cursor: pointer;

      & > img {
        display: unset;
      }

      &:hover {
        background-color: $color-hover-overlay;
      }
    }

    & > img {
      display: none;
      position: absolute;
      left: 8px;
      top: 5.5px;
    }

    & > span {
      align-self: center;
      justify-self: right;
      transform-origin: top left;
      text-wrap: nowrap;
    }
  }

  #column-credit-sums > div {
    top: 5px;
  }

  #overall-credit-sum {
    right: 5px;
    bottom: 5px;
    width: 300px;
  }

  .settings-section {
    margin-bottom: 30px;

    & > h3 {
      margin: 0 0 10px 0;
      font-size: 13px;
      color: oklch(0.5 0 0);
    }
  }

  .settings-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background-color: hsl(0, 0%, 97%);
    border-radius: 10px;
    margin-bottom: 5px;

    & input[type="number"] {
      width: 70px;
      font-family: inherit;
      font-size: inherit;
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
  }

  #drop-guide {
    display: grid;
    position: fixed;
    background-color: rgba(255, 255, 255, 0.9);
    outline: 8px dashed hsla(0, 0%, 70%, 0.8);
    outline-offset: -20px;
    place-items: center;
    pointer-events: none;
  }

  #zoom-control {
    position: absolute;
    bottom: 5px;
    left: 5px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 15px;
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid #ccc;
    border-radius: 10px;
    font-size: 13px;

    & > input[type="range"] {
      width: 100px;
    }
  }
</style>
