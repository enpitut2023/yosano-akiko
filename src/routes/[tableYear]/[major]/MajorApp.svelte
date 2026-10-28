<script lang="ts">
  import { resolve, asset } from "$app/paths";
  import BadgeJapaneseYen from "lucide-svelte/icons/badge-japanese-yen";
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import Funnel from "lucide-svelte/icons/funnel";
  import Hand from "lucide-svelte/icons/hand";
  import Timetable from "./Timetable.svelte";
  import { type TimetableTab } from "./timetable";
  import Meta from "$lib/Meta.svelte";
  import { SvelteAkiko } from "$lib/akiko.svelte";
  import { FEEDBACK_FORM_URL, MAJOR_TO_JA } from "$lib/constants";
  import { parseImportedCsv } from "$lib/csv";
  import {
    columnIdIsElective,
    courseIdCompare,
    DOWS,
    dowCompare,
    dowToString,
    gradeIsPass,
    isCellId,
    isCourseId,
    akikoNew,
    termCompare,
    termToString,
    type Availability,
    type CellId,
    type CourseId,
    type Dow,
    type FakeCourse,
    type Grade,
    type RealCourse,
    type Slot,
    type Term,
    cellIdToRow,
    cellIdToColumnId,
  } from "$lib/akiko";
  import {
    createCreditRequirementsOrFail,
    classifyCoursesOrFail,
    type MajorConfig,
  } from "$lib/app-setup";
  import { trackEvent } from "$lib/analytics";
  import {
    localDataDefault,
    localDataFromJson,
    localDataToJson,
    type LocalDataV3,
  } from "$lib/local-data";
  import { browser, dev } from "$app/environment";
  import { assert } from "$lib/util.js";
  import { onMount, untrack } from "svelte";
  import { markSeen, seen } from "./seen";
  import {
    cellCreditStatsDisplay,
    columnCreditStatsDisplay,
    creditProgressToString,
    electiveCreditStatsDisplay,
    getPercentage,
    gradeDisplay,
  } from "./credit-display";
  import { debugPrintCreditStats } from "./debug";
  import { mobileUnsupported } from "./mobile-unsupported";
  import MobileUnsupportedNotice from "./MobileUnsupportedNotice.svelte";
  import Tutorial from "./Tutorial.svelte";
  import ImportTab from "./ImportTab.svelte";
  import ExportTab from "./ExportTab.svelte";
  import { SUPPORT_URL, syllabusUrl } from "./links";
  import { panZoom, resizeHandle } from "./gestures";
  import type { TutorialStep } from "./tutorial";

  type WontTakeFilters = {
    courseIdOrName: string;
    credit: number | undefined;
    expects: number | undefined;
    term: Term | undefined;
    dows: Dow[];
    onlyUnoccupied: boolean;
  };

  type UiCourse = {
    id: CourseId;
    name: string;
    credit: number | undefined;
    slots: string | undefined;
    expects: string | undefined;
    expectsRaw: number[];
    slotsRaw: Slot[];
    grade: Grade | undefined;
    takenYear: number | undefined;
    syllabusYear: number;
    availability: Availability;
    remark: string;
    cellId: CellId | undefined;
  };

  let { config }: { config: MajorConfig } = $props();

  const localDataKey = $derived(`${config.major}_${config.tableYear}`);

  // TODO: should identify ways loading can fail and let the user know that the
  // data will be overwritten by the default value
  function localDataLoad(): LocalDataV3 {
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
  let showCourseRemark = $state(false);
  let filtersOpen = $state(false);
  let showAllCourses = $state(false);
  let showNonAvailable = $state(false);
  let wontTakeVisibleLimit = $state(100);
  let leftBarScrollEl = $state<HTMLDivElement | undefined>();
  let wontTakeSentinelEl = $state<HTMLDivElement | undefined>();
  let wontTakeFilters = $state<WontTakeFilters>({
    courseIdOrName: "",
    credit: undefined,
    expects: undefined,
    term: undefined,
    dows: [],
    onlyUnoccupied: false,
  });

  const creditRequirements = $derived(
    createCreditRequirementsOrFail(
      config.getCreditRequirements(config.tableYear, config.major),
    ),
  );

  const svelteAkiko = $derived.by(() => {
    const localData = localDataLoad();
    const { courseIdToCellId, realCoursePositions, fakeCoursePositions } =
      classifyCoursesOrFail(
        config.knownCourses,
        realCourses,
        fakeCourses,
        isNative,
        config.tableYear,
        config.major,
        config.classifyKnownCourses,
        config.classifyRealCourses,
        config.classifyFakeCourses,
      );
    const akiko = akikoNew(
      config.knownCourses,
      realCourses,
      fakeCourses,
      localData.listKindOverrides,
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
    new Map(config.knownCourses.map((c) => [c.id, c])),
  );
  const realCoursesMap = $derived(svelteAkiko.getRealCoursesMap());
  const fakeCourseMap = $derived(svelteAkiko.getFakeCoursesMap());

  $effect(() => {
    if (!browser) return;
    const localData: LocalDataV3 = {
      version: 3,
      listKindOverrides,
      realCourses: Array.from(realCourses),
      fakeCourses: Array.from(fakeCourses),
      native: isNative,
    };
    localStorage.setItem(localDataKey, localDataToJson(localData));
  });

  type Tab = "import" | "export" | "courses" | "settings";

  let timetableShowTaken = $state(true);
  let timetableYear = $state(untrack(() => config.knownCourseYear));
  let activeTimetableTerm = $state<TimetableTab>("spring-a");

  let barsVisible = $state(true);
  let activeTab = $state<Tab>("courses");

  const SIDEBAR_MARGIN = 100;
  const SIDEBAR_WIDTH_DEFAULT = 740;
  const SIDEBAR_WIDTH_MIN = 500;

  let sidebarWidth = $state(SIDEBAR_WIDTH_DEFAULT);

  $effect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${sidebarWidth}px`,
    );
  });

  function resizeSidebar(e: PointerEvent) {
    const raw = window.innerWidth - e.clientX;
    const snapped = Math.round(raw / 5) * 5;
    sidebarWidth = Math.min(
      window.innerWidth - SIDEBAR_MARGIN,
      Math.max(SIDEBAR_WIDTH_MIN, snapped),
    );
  }

  const TIMETABLE_HEIGHT_DEFAULT = 400;
  const TIMETABLE_HEIGHT_MIN = 100;

  let timetableHeight = $state(TIMETABLE_HEIGHT_DEFAULT);

  $effect(() => {
    document.documentElement.style.setProperty(
      "--timetable-height",
      `${timetableHeight}px`,
    );
  });

  $effect(() => {
    const update = () => {
      if (rightBarEl === undefined) return;
      document.documentElement.style.setProperty(
        "--right-bar-top",
        `${rightBarEl.getBoundingClientRect().top}px`,
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  });

  function resizeTimetable(e: PointerEvent) {
    if (rightBarEl === undefined) return;
    const top = rightBarEl.getBoundingClientRect().top;
    const raw = e.clientY - top;
    const snapped = Math.round(raw / 5) * 5;
    timetableHeight = Math.min(
      window.innerHeight - top - SIDEBAR_MARGIN,
      Math.max(TIMETABLE_HEIGHT_MIN, snapped),
    );
  }

  let scrollX = $state(0);

  // Zoom uses two representations:
  // - zoomLevel: the actual scale multiplier (e.g. 0.7 = 70% of base size)
  // - sliderZoomLevel: a log-scale value driving the slider so equal slider
  //   distances feel like equal zoom steps. slider=0 → ZOOM_MIN,
  //   slider=1 → ZOOM_DEFAULT, slider=ZOOM_SLIDER_MAX → ZOOM_MAX.
  // Pinch/scroll gestures compute a new zoomLevel directly and convert back
  // to sliderZoomLevel via zoomToSlider to keep the slider in sync.
  const tableScale = 2048 / untrack(() => config.tableViewBox.width);
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
    Object.entries(config.cellIdToRectRecord).map(([id, rect]) => {
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

  function importCsvFile(file: File) {
    void file.text().then((csv) => {
      const result = parseImportedCsv(csv);
      if (result.kind !== "ok") {
        alert(
          "CSVファイルを正しく読み込めませんでした。成績データのファイルをExcelやNumbersなどのアプリケーションで開いたり保存したりすると、データの形式が壊れて読み込めなくなる場合があります。TWINSからダウンロードしたファイルをそのままインポートしてください。",
        );
        return;
      }
      applyImport(result.realCourses, result.fakeCourses);
    });
  }

  /** 成績データを取り込み、同時に「取る授業」をリセットする */
  function applyImport(
    newRealCourses: RealCourse[],
    newFakeCourses: FakeCourse[],
  ) {
    if (browser) {
      // svelteAkiko は上書きを localStorage から直接読むので、下の代入で再構築
      // が走る前に消しておく
      const localData: LocalDataV3 = {
        version: 3,
        listKindOverrides: new Map(),
        realCourses: newRealCourses,
        fakeCourses: newFakeCourses,
        native: isNative,
      };
      localStorage.setItem(localDataKey, localDataToJson(localData));
    }
    realCourses = newRealCourses;
    fakeCourses = newFakeCourses;
    trackEvent(
      "grades",
      "import-grades",
      `${config.tableYear}/${config.major}`,
    );
    if (dev) debugPrintCreditStats(svelteAkiko.getCreditStats());
    if (svelteAkiko.getUnclassifiedCourses().fake.length > 4) {
      alert(
        "申し訳ございませんが、TWINSの仕様のため編入生の認可された科目のみ単位チェック時に正しく単位を計算することができません。認可されていない通常の科目の成績は正しく計算されます。",
      );
    }
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
    // undefined means the course actually moved (see akikoMoveCourse); only
    // track real moves so no-op re-drops onto the same list don't count.
    if (svelteAkiko.moveCourse(courseId, dst) === undefined) {
      trackEvent(
        "plan",
        dst === "might-take" ? "add-course" : "remove-course",
        courseId,
      );
    }
    if (dst === "might-take") {
      timetableYear = config.knownCourseYear;
      const slots = knownCoursesMap.get(courseId)?.slots ?? [];
      const terms = slots
        .filter((s) => s.when.kind === "regular")
        .map((s) => s.term);
      if (terms.length === 0) {
        activeTimetableTerm = "other";
      } else if (
        activeTimetableTerm === "other" ||
        !terms.includes(activeTimetableTerm)
      ) {
        activeTimetableTerm = terms[0];
      }
    }
  }

  // Does not depend on wontTakeFilters
  const courseLists = $derived.by(() => {
    const cs = selectedCellId
      ? svelteAkiko.getCoursesInCell(selectedCellId)
      : svelteAkiko.getAllCourses();
    const courseCellIds = svelteAkiko.getCourseIdToCellId();

    function toUi(id: CourseId): UiCourse {
      const kc = knownCoursesMap.get(id);
      const rc = realCoursesMap.get(id);
      return {
        id,
        name: rc?.name || kc?.name || "（不明）",
        credit: rc?.credit ?? kc?.credit,
        slots: kc?.slotsString,
        expects: kc?.expectsString,
        expectsRaw: kc?.expects ?? [],
        slotsRaw: kc?.slots ?? [],
        grade: rc?.grade,
        takenYear: rc?.takenYear,
        syllabusYear:
          rc?.grade && gradeIsPass(rc.grade)
            ? rc.takenYear
            : config.knownCourseYear,
        availability: kc?.availability ?? "available",
        remark: kc?.remark ?? "",
        cellId: courseCellIds.get(id),
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
    return {
      wontTake: cs.wontTake
        .map(toUi)
        .filter((c) => showNonAvailable || c.availability === "available")
        .sort(compareByGradeThenId),
      mightTake: cs.mightTake.map(toUi).sort(compareByGradeThenId),
      taken: cs.taken.map(toUi).sort(compareById),
      fake: cs.fake
        .map((id) => fakeCourseMap.get(id))
        .filter((fc) => fc !== undefined),
    };
  });

  const occupiedSlots = $derived(svelteAkiko.getOccupiedSlots());

  /**
   * 学期と曜日のフィルタに当てはまるか。学期と曜日は同じ Slot が両方を満たす必要
   * があり、曜日を選ぶと曜時限のない授業（集中・応談など）は除外される。
   */
  function matchesSlotFilters(
    slots: Slot[],
    term: Term | undefined,
    dows: Dow[],
  ): boolean {
    if (term === undefined && dows.length === 0) return true;
    return slots.some((s) => {
      if (term !== undefined && s.term !== term) return false;
      if (dows.length === 0) return true;
      return s.when.kind === "regular" && dows.includes(s.when.dow);
    });
  }

  const filteredCourseLists = $derived.by(() => {
    let { courseIdOrName, credit, expects, term, dows, onlyUnoccupied } =
      wontTakeFilters;
    courseIdOrName = courseIdOrName.toLowerCase();
    return {
      wontTake: courseLists.wontTake.filter((c) => {
        if (courseIdOrName) {
          const kc = knownCoursesMap.get(c.id);
          const rc = realCoursesMap.get(c.id);
          const name = rc?.name || kc?.name || "";
          if (
            !c.id.toLowerCase().includes(courseIdOrName) &&
            !name.toLowerCase().includes(courseIdOrName)
          )
            return false;
        }
        if (credit !== undefined && c.credit !== credit) return false;
        if (expects !== undefined && !c.expectsRaw.includes(expects))
          return false;
        if (!matchesSlotFilters(c.slotsRaw, term, dows)) return false;
        if (onlyUnoccupied && svelteAkiko.isOccupied(occupiedSlots, c.id))
          return false;
        return true;
      }),
      mightTake: courseLists.mightTake,
      taken: courseLists.taken,
      fake: courseLists.fake,
    };
  });

  // Fake courses that landed in a cell, i.e. those that count toward graduation
  const classifiedFakeCourses = $derived(
    Array.from(svelteAkiko.getFakeCoursePositions().keys())
      .map((id) => fakeCourseMap.get(id))
      .filter((c) => c !== undefined),
  );

  const fakeCreditTotal = $derived(
    filteredCourseLists.fake.reduce((sum, c) => sum + (c.credit ?? 0), 0),
  );

  const availableCredits = $derived.by(() => {
    const credits = new Set<number>();
    for (const c of courseLists.wontTake) {
      if (c.credit !== undefined) credits.add(c.credit);
    }
    return Array.from(credits).sort((a, b) => a - b);
  });
  const availableExpects = $derived.by(() => {
    const expects = new Set<number>();
    for (const c of courseLists.wontTake) {
      for (const e of c.expectsRaw) expects.add(e);
    }
    return Array.from(expects).sort((a, b) => a - b);
  });
  const availableDows = $derived.by(() => {
    const dows = new Set<Dow>();
    for (const c of courseLists.wontTake) {
      for (const s of c.slotsRaw) {
        if (s.when.kind === "regular") dows.add(s.when.dow);
      }
    }
    return Array.from(dows).sort(dowCompare);
  });

  const TERM_GROUP_LABELS = ["モジュール", "学期", "その他"] as const;
  type TermGroupLabel = (typeof TERM_GROUP_LABELS)[number];
  // 春Aと春学期のように紛らわしい学期があるので、選択肢を分類して並べる
  const TERM_TO_GROUP: Record<Term, TermGroupLabel> = {
    "spring-a": "モジュール",
    "spring-b": "モジュール",
    "spring-c": "モジュール",
    "autumn-a": "モジュール",
    "autumn-b": "モジュール",
    "autumn-c": "モジュール",
    spring: "学期",
    autumn: "学期",
    "all-year": "学期",
    "spring-break": "その他",
    "summer-break": "その他",
  };

  const availableTerms = $derived.by(() => {
    const terms = new Set<Term>();
    for (const c of courseLists.wontTake) {
      for (const s of c.slotsRaw) terms.add(s.term);
    }
    return Array.from(terms).sort(termCompare);
  });
  const availableTermGroups = $derived(
    TERM_GROUP_LABELS.map((label) => ({
      label,
      terms: availableTerms.filter((t) => TERM_TO_GROUP[t] === label),
    })).filter((g) => g.terms.length > 0),
  );

  $effect(() => {
    if (
      wontTakeFilters.credit !== undefined &&
      !availableCredits.includes(wontTakeFilters.credit)
    ) {
      wontTakeFilters.credit = undefined;
    }
  });
  $effect(() => {
    if (
      wontTakeFilters.expects !== undefined &&
      !availableExpects.includes(wontTakeFilters.expects)
    ) {
      wontTakeFilters.expects = undefined;
    }
  });
  $effect(() => {
    if (
      wontTakeFilters.term !== undefined &&
      !availableTerms.includes(wontTakeFilters.term)
    ) {
      wontTakeFilters.term = undefined;
    }
  });
  $effect(() => {
    const kept = wontTakeFilters.dows.filter((d) => availableDows.includes(d));
    if (kept.length !== wontTakeFilters.dows.length) {
      wontTakeFilters.dows = kept;
    }
  });

  $effect(() => {
    void selectedCellId;
    wontTakeVisibleLimit = 100;
  });
  $effect(() => {
    if (!wontTakeSentinelEl || !leftBarScrollEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          wontTakeVisibleLimit < filteredCourseLists.wontTake.length
        )
          wontTakeVisibleLimit += 100;
      },
      { root: leftBarScrollEl, rootMargin: "0px 0px 200px 0px" },
    );
    observer.observe(wontTakeSentinelEl);
    return () => observer.disconnect();
  });

  const activeFilterCount = $derived(
    [
      wontTakeFilters.credit !== undefined,
      wontTakeFilters.expects !== undefined,
      wontTakeFilters.term !== undefined,
      wontTakeFilters.onlyUnoccupied,
    ].filter(Boolean).length + wontTakeFilters.dows.length,
  );
  const courseListVisible = $derived(
    showAllCourses ||
      selectedCellId !== undefined ||
      wontTakeFilters.courseIdOrName !== "" ||
      activeFilterCount > 0,
  );

  const wontTakeSliced = $derived(
    filteredCourseLists.wontTake.slice(0, wontTakeVisibleLimit),
  );

  const selectedCellStats = $derived(
    selectedCellId !== undefined
      ? creditStats.cells.get(selectedCellId)
      : undefined,
  );
  const listCreditTotals = $derived({
    mightTake: courseLists.mightTake.reduce((s, c) => s + (c.credit ?? 0), 0),
    taken: courseLists.taken.reduce((s, c) => s + (c.credit ?? 0), 0),
  });
  const graduationCredits = $derived.by(() => {
    const { compulsory: c, elective: e } = creditStats;
    return {
      min: c.min + e.min,
      max: c.max + e.max,
      effectiveTaken: c.effectiveTaken + e.effectiveTaken,
      effectiveMightTake: c.effectiveMightTake + e.effectiveMightTake,
    };
  });
  const selectedCellRemark = $derived(
    selectedCellId !== undefined
      ? config.getRemark?.(selectedCellId, config.tableYear, config.major)
      : undefined,
  );
  const mightTakeCourseIds = $derived(svelteAkiko.getMightTakeCourseIds());
  const listKindOverrides = $derived(svelteAkiko.getListKindOverrides());
  const takenCourseIds = $derived(svelteAkiko.getTakenCourseIds());
  let exportCount = $state(0);

  function reset() {
    const msg =
      "インポートした成績データや「取る授業」に移動した授業などが全てリセットされます。本当にリセットしますか？";
    if (window.confirm(msg)) {
      localStorage.removeItem(localDataKey);
      window.location.reload();
    }
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
    `あきこ - ${config.tableYear}年度 ${MAJOR_TO_JA[config.major]}`,
  );
  let metaDescription = $derived(
    `${config.tableYear}年度入学の${MAJOR_TO_JA[config.major]}の学生向け履修サポートツールです。単位の計算・授業探し・Twinsへの登録を楽に終わらせましょう！`,
  );

  let requirementsEl = $state<HTMLDivElement | undefined>();
  let leftBarEl = $state<HTMLDivElement | undefined>();
  let rightBarEl = $state<HTMLDivElement | undefined>();

  function scrollCellIntoView(cellId: CellId) {
    const rect = cellRects.find((r) => r.id === cellId);
    if (!rect || !requirementsEl) return;
    requirementsEl.scrollLeft =
      rect.x + rect.width / 2 - requirementsEl.clientWidth / 2;
    requirementsEl.scrollTop =
      rect.y + rect.height / 2 - requirementsEl.clientHeight / 2;
  }

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

  let panning = $state(false);
  // A mouse can't be told apart from a trackpad, so show it for either
  let panHintVisible = $state(false);

  onMount(() => {
    panHintVisible =
      window.matchMedia("(any-pointer: fine)").matches && !seen("panHint");
  });

  function endPan() {
    panning = false;
    panHintVisible = false;
    markSeen("panHint");
  }

  let tutorialOpen = $state(false);

  onMount(() => {
    if (!mobileUnsupported() && !seen("tutorial")) tutorialOpen = true;
  });

  function closeTutorial() {
    tutorialOpen = false;
    markSeen("tutorial");
  }

  // 操作を待つステップは、ステップに入った時点からの変化を見る
  let tutorialEntry = {
    realCourses: [] as RealCourse[],
    mightTakeCount: 0,
    exportCount: 0,
  };

  function tutorialSnapshot() {
    tutorialEntry = {
      realCourses,
      mightTakeCount: mightTakeCourseIds.length,
      exportCount,
    };
  }

  function showTab(tab: Tab) {
    barsVisible = true;
    activeTab = tab;
  }

  const tutorialSteps: TutorialStep[] = [
    {
      id: "welcome",
      title: "はじめまして〜",
      body: "あきこよ〜。卒業に必要な単位のチェックから、授業探し、TWINSへの履修登録までお手伝いするわね。実際に触りながら使い方を教えるから、一緒にやってみましょ〜",
      nextLabel: "お願いします！",
      onEnter: () => showTab("courses"),
    },
    {
      id: "tab-import",
      target: ["tab-import"],
      title: "タブで画面を切り替える",
      body: "右側の画面は、上のタブで切り替えるの。まずは「単位チェック」タブを押してみて〜",
      onEnter: () => (barsVisible = true),
      waitFor: () => activeTab === "import",
    },
    {
      id: "import",
      target: ["import-tab"],
      title: "成績データをインポート",
      body: "まずはTWINSの成績データをちょうだいね。「手順を見る」のとおりにダウンロードして、そのファイルを枠にドロップするか選んでくれたら、次に進むわよ〜",
      choices: [
        {
          label: "まだ成績ファイルを持っていない（新入生）",
          next: "tab-courses",
        },
      ],
      onEnter: tutorialSnapshot,
      waitFor: () => realCourses !== tutorialEntry.realCourses,
    },
    {
      id: "progress",
      target: ["requirements"],
      title: "マスの色で進み具合がわかる",
      body: "表のマスの緑色は、もう取れた単位の割合よ。右端まで緑になったマスは、必要な単位がそろってるってこと。必要な単位が0のマスは最初から緑だから、気にしないでね〜",
      nextLabel: "次へ",
    },
    {
      id: "tab-courses",
      target: ["tab-courses"],
      title: "授業を探しに行こう",
      body: "次は授業探しよ。「履修を組む」タブを押してね〜",
      onEnter: () => (barsVisible = true),
      waitFor: () => activeTab === "courses",
    },
    {
      id: "cell",
      target: ["requirements"],
      title: "マスを押して授業を探す",
      body: "表のマスをどれか押してみて〜。そのマスに当てはまる授業を右側に出すわね。授業が出てこなかったら、別のマスを試してみてちょうだい",
      onEnter: () => (selectedCellId = undefined),
      waitFor: () =>
        selectedCellId !== undefined && courseLists.wontTake.length > 0,
    },
    {
      id: "syllabus",
      target: ["left-bar"],
      title: "シラバスを確認する",
      body: "「当てはまる授業」に、このマスの授業を並べておいたわ。授業名を押すと、シラバスが新しいタブで開くわよ〜",
      nextLabel: "次へ",
    },
    {
      id: "drag",
      target: ["left-bar", "right-bar"],
      title: "ドラッグで時間割に追加",
      body: "取りたい授業があったら、その行を右側にドラッグしてみて。「取る授業」に入って、時間割にも出てくるわ〜",
      onEnter: tutorialSnapshot,
      waitFor: () => mightTakeCourseIds.length > tutorialEntry.mightTakeCount,
    },
    {
      id: "more",
      target: ["requirements", "left-bar", "right-bar"],
      title: "どんどん追加しよう",
      body: "その調子〜！他のマスも押して、どんどん追加しちゃいましょ。マスの黄色いところは、取る授業の単位が取れたら増える分よ。いくつか追加できたら次へを押してね",
      nextLabel: "次へ",
    },
    {
      id: "tab-export",
      target: ["tab-export"],
      title: "TWINSに出力しよう",
      body: "取る授業が決まったら、「TWINSに出力」タブを押してね〜",
      onEnter: () => (barsVisible = true),
      waitFor: () => activeTab === "export",
    },
    {
      id: "export",
      target: ["export-button"],
      title: "TWINSに出力",
      body: "「ダウンロード」を押してみて〜。取る授業の科目番号を並べたCSVファイルをダウンロードするわ。時間が被ってる授業があると押せないから、そのときは次へを押して、あとで「履修を組む」タブで直してね",
      nextLabel: "次へ",
      onEnter: tutorialSnapshot,
      waitFor: () => exportCount > tutorialEntry.exportCount,
    },
    {
      id: "register",
      target: ["export-upload"],
      title: "TWINSでまとめて履修登録",
      body: "ダウンロードしたファイルは、「手順を見る」に書いてある方法でTWINSにアップロードしてね。それだけで、まとめて履修登録できちゃうわよ〜",
      nextLabel: "次へ",
    },
    {
      id: "done",
      title: "これでばっちり！",
      body: "わからなくなったら、左上の「チュートリアル」からいつでも呼んでね〜。履修、がんばってね！",
      nextLabel: "ありがとう！",
    },
  ];
</script>

<Meta title={metaTitle} description={metaDescription} />

{#snippet courseRow(
  c: UiCourse,
  dragSource: "wont-take" | "might-take" | undefined,
  colspan: number,
)}
  {@const draggable = dragSource !== undefined}
  <tr
    class="course"
    {draggable}
    ondragstart={(e) => {
      if (dragSource === undefined) return;
      handleDragStart(e, c.id, dragSource);
    }}
    ondragend={handleDragEnd}
  >
    <td class="id-name">
      <span class="course-id">{c.id}</span>
      {#if !selectedCellId && c.cellId !== undefined}
        {@const cellId = c.cellId}
        <button
          class="goto-cell"
          onclick={() => {
            selectedCellId = cellId;
            scrollCellIntoView(cellId);
            barsVisible = true;
            activeTab = "courses";
          }}>該当マスを表示</button
        >
      {/if}
      <br />
      <a
        href={syllabusUrl(c.id, c.syllabusYear)}
        target="_blank"
        draggable="false"
        >{c.name}{c.grade && gradeIsPass(c.grade) ? ` (${c.takenYear})` : ""}</a
      >
      {#if c.grade}<br /><span>{gradeDisplay(c.grade)}</span>{/if}
      {#if c.availability !== "available"}<br /><span>（非開講）</span>{/if}
    </td>
    <td class="credit">{c.credit ?? "-"}</td>
    <td class="slots">{c.slots ?? "-"}</td>
    <td class="expects">{c.expects ?? "-"}</td>
  </tr>
  {#if showCourseRemark}
    <tr class="course-remark">
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
  state: "no-courses" | "contains-courses",
  showSlots: boolean,
  showExpects: boolean,
  dragSource: "wont-take" | "might-take" | undefined,
)}
  {#if state === "no-courses"}
    <p>該当する授業がありません</p>
  {:else}
    {@const colspan = 2 + +showSlots + +showExpects}
    <table class:show-slots={showSlots} class:show-expects={showExpects}>
      <thead>
        <tr class="course">
          <th class="id-name">科目</th>
          <th class="credit">単位</th>
          <th class="slots">時限</th>
          <th class="expects">標準<br />履修<br />年次</th>
        </tr>
      </thead>
      <tbody>
        {#each courses as c (c.id)}
          {@render courseRow(c, dragSource, colspan)}
        {/each}
      </tbody>
    </table>
  {/if}
{/snippet}

{#snippet fakeCourseTable(courses: FakeCourse[])}
  <table>
    <thead>
      <tr class="course">
        <th class="id-name">科目</th>
        <th class="credit">単位</th>
      </tr>
    </thead>
    <tbody>
      {#each courses as c (c.id)}
        <tr class="course">
          <td class="id-name">{c.name} ({c.takenYear})</td>
          <td class="credit">{c.credit ?? "-"}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/snippet}

<main class:bars-hidden={!barsVisible}>
  <div id="table-view">
    <div
      id="requirements"
      data-tutorial="requirements"
      class:panning
      bind:this={requirementsEl}
      {@attach panZoom({
        zoom: () => zoomLevel,
        setZoom: (z) =>
          (sliderZoomLevel = zoomToSlider(
            Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)),
          )),
        ignore: "#title",
        onPanStart: () => (panning = true),
        onPanEnd: endPan,
      })}
      onscroll={(e) => (scrollX = -e.currentTarget.scrollLeft)}
      onclick={() => {
        selectedCellId = undefined;
      }}
    >
      <img
        src={asset(`/tables/${config.tableYear}/${config.major}.svg`)}
        alt="Table"
        width={tableScale * zoomLevel * config.tableViewBox.width}
        height={tableScale * zoomLevel * config.tableViewBox.height}
        draggable="false"
      />
      <div id="title">
        <a href={resolve("/")} class="akiko"
          ><img src={asset("/images/akiko.png")} alt="あきこ" /></a
        >
        <span
          >このページは <strong>{config.tableYear}</strong>
          年度入学の
          <strong>{MAJOR_TO_JA[config.major]}</strong> の学生向けですよ〜</span
        >
        <nav>
          <a href="{resolve('/')}#app-page-links">学類一覧に戻る</a>
          <button class="link-button" onclick={() => (tutorialOpen = true)}
            >チュートリアル</button
          >
          <a href={FEEDBACK_FORM_URL} target="_blank" rel="noreferrer"
            >ご意見はこちらから</a
          >
          <a class="support" href={SUPPORT_URL} target="_blank" rel="noreferrer"
            ><BadgeJapaneseYen size={15} />開発を支援</a
          >
        </nav>
      </div>
      {#each cellRects as r (r.id)}
        {@const cellStats = creditStats.cells.get(r.id)}
        {#if cellStats}
          {@const [green, yellow] = getPercentage(
            cellStats.effectiveTaken,
            cellStats.effectiveMightTake,
            cellStats.min,
          )}
          <div
            class="cell"
            data-testid="cell-{r.id}"
            class:selected={selectedCellId === r.id}
            style="left:{r.x}px; top:{r.y}px; width:{r.width}px; height:{r.height}px; --green-percentage:{green}%; --yellow-percentage:{yellow}%"
            onclick={(e) => {
              e.stopPropagation();
              selectedCellId = r.id;
              barsVisible = true;
              activeTab = "courses";
            }}
          ></div>
        {/if}
      {/each}
    </div>
    {#if panHintVisible}
      <div id="pan-hint"><Hand size={15} />ドラッグで表を動かせます</div>
    {/if}
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
        data-tutorial="tab-import"
        class:active={activeTab === "import"}
        onclick={() => (activeTab = "import")}
        ><span class="icon" style="--src: url({asset('/icons/math.svg')})"
        ></span>単位チェック</button
      >
      <span class="workflow-arrow" aria-hidden="true">
        <ChevronRight size={15} />
      </span>
      <button
        data-tutorial="tab-courses"
        class:active={activeTab === "courses"}
        onclick={() => (activeTab = "courses")}
        ><span class="icon" style="--src: url({asset('/icons/book.svg')})"
        ></span>履修を組む</button
      >
      <span class="workflow-arrow" aria-hidden="true">
        <ChevronRight size={15} />
      </span>
      <button
        data-tutorial="tab-export"
        class:active={activeTab === "export"}
        onclick={() => (activeTab = "export")}
        ><span class="icon" style="--src: url({asset('/icons/itf.svg')})"
        ></span>TWINSに出力</button
      >
      <button
        class="settings"
        class:active={activeTab === "settings"}
        onclick={() => (activeTab = "settings")}
        ><span class="icon" style="--src: url({asset('/icons/cog.svg')})"
        ></span>設定</button
      >
    </div>

    <div
      id="import-tab"
      data-tutorial="import-tab"
      class:active={activeTab === "import"}
    >
      <ImportTab
        {svelteAkiko}
        {realCourses}
        {fakeCourses}
        bind:native={isNative}
        onImport={importCsvFile}
      />
    </div>

    <div id="export-tab" class:active={activeTab === "export"}>
      <ExportTab
        {svelteAkiko}
        {config}
        onShowCell={(cellId: CellId, term: TimetableTab) => {
          selectedCellId = cellId;
          scrollCellIntoView(cellId);
          activeTimetableTerm = term;
          showTab("courses");
        }}
        onPickCourses={() => showTab("courses")}
        onDownload={() => exportCount++}
      />
    </div>

    <div id="settings-tab" class:active={activeTab === "settings"}>
      <label class="settings-row">
        <input type="checkbox" bind:checked={showNonAvailable} />
        <span>今年度開講しない授業を表示する</span>
      </label>
      <label class="settings-row">
        <input type="checkbox" bind:checked={timetableShowTaken} />
        <span>時間割に単位取得済みの授業を表示する</span>
      </label>
      <label class="settings-row">
        <span>時間割の年度</span>
        <input type="number" bind:value={timetableYear} />
      </label>
      <div id="control">
        <button id="reset" class="button" onclick={() => reset()}>
          <img src={asset("/icons/trash.svg")} width="15px" alt="reset" />
          <span>リセット</span>
        </button>
      </div>
    </div>

    <div id="courses-tab" class:active={activeTab === "courses"}>
      <div
        bind:this={leftBarEl}
        id="left-bar"
        data-tutorial="left-bar"
        ondragover={(e) => {
          e.preventDefault();
          if (e.dataTransfer !== null) e.dataTransfer.dropEffect = "move";
        }}
        ondrop={(e) => handleDrop(e, "wont-take")}
      >
        <div id="filter-bar">
          <div id="filter-bar-row">
            <search>
              <input
                type="text"
                placeholder="科目番号もしくは科目名"
                bind:value={wontTakeFilters.courseIdOrName}
              />
            </search>
            <button
              type="button"
              class="filter-toggle"
              class:open={filtersOpen}
              aria-expanded={filtersOpen}
              aria-label="絞り込み条件"
              title="絞り込み条件"
              onclick={() => (filtersOpen = !filtersOpen)}
            >
              <Funnel size={20} strokeWidth={1.5} />
              {#if activeFilterCount > 0}
                <span class="filter-badge">{activeFilterCount}</span>
              {/if}
            </button>
          </div>
          {#if filtersOpen}
            <div id="filter-bar-slot-row">
              <select
                value={wontTakeFilters.credit ?? ""}
                class:placeholder={wontTakeFilters.credit === undefined}
                onchange={(e) => {
                  const v = e.currentTarget.value;
                  wontTakeFilters.credit = v === "" ? undefined : Number(v);
                }}
              >
                <option value="">全単位</option>
                {#each availableCredits as v (v)}
                  <option value={v}>{v}単位</option>
                {/each}
              </select>
              <select
                value={wontTakeFilters.expects ?? ""}
                class:placeholder={wontTakeFilters.expects === undefined}
                onchange={(e) => {
                  const v = e.currentTarget.value;
                  wontTakeFilters.expects = v === "" ? undefined : Number(v);
                }}
              >
                <option value="">全年次</option>
                {#each availableExpects as v (v)}
                  <option value={v}>{v}年次</option>
                {/each}
              </select>
              <select
                value={wontTakeFilters.term ?? ""}
                class:placeholder={wontTakeFilters.term === undefined}
                onchange={(e) => {
                  const v = e.currentTarget.value;
                  wontTakeFilters.term = v === "" ? undefined : (v as Term);
                }}
              >
                <option value="">全学期</option>
                {#each availableTermGroups as group (group.label)}
                  <optgroup label={group.label}>
                    {#each group.terms as t (t)}
                      <option value={t}>{termToString(t)}</option>
                    {/each}
                  </optgroup>
                {/each}
              </select>
              <div id="dow-chips" role="group" aria-label="曜日で絞り込む">
                {#each DOWS as d (d)}
                  {@const active = wontTakeFilters.dows.includes(d)}
                  <button
                    type="button"
                    class="dow-chip"
                    class:active
                    aria-pressed={active}
                    disabled={!availableDows.includes(d)}
                    onclick={() => {
                      wontTakeFilters.dows = active
                        ? wontTakeFilters.dows.filter((x) => x !== d)
                        : [...wontTakeFilters.dows, d];
                    }}>{dowToString(d)}</button
                  >
                {/each}
              </div>
            </div>
            <div id="filter-bar-checkboxes">
              <label class="filter-checkbox">
                <input
                  type="checkbox"
                  bind:checked={wontTakeFilters.onlyUnoccupied}
                />
                空きコマのみ表示
              </label>
              <label class="filter-checkbox">
                <input type="checkbox" bind:checked={showCourseRemark} />
                備考を表示
              </label>
            </div>
          {/if}
        </div>
        <div id="left-bar-scroll" bind:this={leftBarScrollEl}>
          {#if courseListVisible}
            <div class="section">
              <h2>
                {selectedCellId ? "当てはまる授業" : "全ての授業"}
                ({filteredCourseLists.wontTake.length}/{courseLists.wontTake
                  .length})
              </h2>
              {@render courseTable(
                wontTakeSliced,
                courseLists.wontTake.length === 0
                  ? "no-courses"
                  : "contains-courses",
                true,
                true,
                "wont-take",
              )}
              <div bind:this={wontTakeSentinelEl}></div>
            </div>
          {:else}
            <div class="course-list-hint">
              <p>表のマスを押すか、授業を検索してください</p>
              <button type="button" onclick={() => (showAllCourses = true)}
                >全ての授業を見る（{courseLists.wontTake.length}件）</button
              >
            </div>
          {/if}
        </div>
        {#if selectedCellRemark}
          <div id="cell-remark">
            <h2>備考</h2>
            <p style="white-space: pre-line">{selectedCellRemark}</p>
          </div>
        {/if}
      </div>

      <div
        bind:this={rightBarEl}
        id="right-bar"
        data-tutorial="right-bar"
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
          fakeCourses={classifiedFakeCourses}
          showTaken={timetableShowTaken}
          {knownCoursesMap}
          {realCoursesMap}
          onBarClick={(courseId: CourseId) => {
            const cellId = svelteAkiko.getCellId(courseId);
            if (cellId !== undefined) {
              selectedCellId = cellId;
              scrollCellIntoView(cellId);
              barsVisible = true;
              activeTab = "courses";
            }
          }}
          onBarDragStart={(e: DragEvent, courseId: CourseId) =>
            handleDragStart(e, courseId, "might-take")}
          onBarDragEnd={handleDragEnd}
        />
        <div id="right-bar-scroll">
          {#if selectedCellStats}
            {@const display = cellCreditStatsDisplay(selectedCellStats)}
            <div class="section">
              <h2>単位数</h2>
              <p>
                選択されたマスの単位：{display.brief}
                {#if display.warning}<br />⚠️ {display.warning}{/if}
              </p>
            </div>
          {:else if selectedCellId === undefined}
            {@const electiveWarning = electiveCreditStatsDisplay(
              creditStats.elective,
            ).warning}
            <div class="section">
              <h2>単位数</h2>
              <p>
                必修科目：{creditProgressToString(creditStats.compulsory)}<br />
                選択科目：{creditProgressToString(creditStats.elective)}<br />
                合計：{creditProgressToString(graduationCredits)}
                {#if electiveWarning}<br />⚠️ {electiveWarning}{/if}
              </p>
            </div>
          {/if}
          <div class="section">
            <div class="list-heading">
              <h2>取る授業</h2>
              {#if listCreditTotals.mightTake > 0}
                <span class="credit-total">
                  {listCreditTotals.mightTake}単位
                </span>
              {/if}
            </div>
            {#if filteredCourseLists.mightTake.length === 0}
              <p class="hint">左の一覧から授業をドラッグしてください</p>
            {:else}
              {@render courseTable(
                filteredCourseLists.mightTake,
                "contains-courses",
                true,
                false,
                "might-take",
              )}
            {/if}
          </div>
          {#if filteredCourseLists.taken.length > 0}
            <div class="section">
              <div class="list-heading">
                <h2>単位取得済みの授業</h2>
                {#if listCreditTotals.taken > 0}
                  <span class="credit-total">
                    {listCreditTotals.taken}単位
                  </span>
                {/if}
              </div>
              {@render courseTable(
                filteredCourseLists.taken,
                "contains-courses",
                false,
                false,
                undefined,
              )}
            </div>
          {/if}
          {#if filteredCourseLists.fake.length > 0}
            <div class="section">
              <div class="list-heading">
                <h2>認可された授業</h2>
                <span class="credit-total">{fakeCreditTotal}単位</span>
              </div>
              {@render fakeCourseTable(filteredCourseLists.fake)}
            </div>
          {/if}
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
    ? 'calc(100vw - var(--sidebar-width) - var(--toggle-width))'
    : 'calc(100vw - var(--toggle-width))'}"
  onclick={() => (barsVisible = !barsVisible)}
>
  {barsVisible ? "⏵" : "⏴"}
</button>

{#if barsVisible}
  <div id="sidebar-resize-handle" {@attach resizeHandle(resizeSidebar)}></div>
  <div
    id="timetable-resize-handle"
    {@attach resizeHandle(resizeTimetable)}
  ></div>
{/if}

<MobileUnsupportedNotice />

{#if tutorialOpen}
  <Tutorial steps={tutorialSteps} onClose={closeTutorial} />
{/if}

<style lang="scss">
  $color-progress-taken: rgb(51, 204, 51);
  $color-progress-might-take: rgb(255, 204, 0);
  $color-hover-overlay: rgba(0, 0, 0, 0.25);

  :global(:root) {
    --sidebar-width: 740px;
    --toggle-width: 30px;
    --timetable-height: 400px;
    --right-bar-top: 0px;
  }

  main {
    position: fixed;
    inset: 0;
    font-size: 14px;
    --fs-xs: 0.75em;
    --fs-sm: 0.9em;
    --fs-lg: 1.4em;

    display: grid;
    grid-template-columns: auto var(--sidebar-width);
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
    position: relative;
    display: grid;
    grid-template-rows: 1fr 85px;
  }

  #requirements {
    grid-row: 1/2;
    position: relative;
    overflow: scroll;
    cursor: grab;
    user-select: none;

    &.panning {
      cursor: grabbing;
    }
  }

  #pan-hint {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 15px;
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid #ccc;
    border-radius: 10px;
    font-size: var(--fs-sm);
    pointer-events: none;
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
      align-items: center;
      gap: 20px;

      & > .support {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 0 10px;
        border: 1px solid oklch(85% 0.1 85);
        border-radius: 50px;
        background-color: oklch(97% 0.05 90);
        color: oklch(45% 0.1 75);
        text-decoration: none;

        &:hover {
          background-color: oklch(93% 0.08 90);
        }
      }
    }

    & > span > strong {
      font-size: 1.2em;
    }
  }

  .link-button {
    all: unset;
    cursor: pointer;
    color: LinkText;
    text-decoration: underline;
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
    align-items: flex-end;
    gap: 10px;
    padding: 10px 10px 0;
    border-bottom: 1px solid black;

    & > .workflow-arrow {
      display: flex;
      align-self: center;
      margin: 0 -10px;
      color: #999;
    }

    & > button {
      display: flex;
      align-items: center;
      gap: 5px;
      // Overlaps the header's bottom border so the active tab joins its content
      margin-bottom: -1px;
      padding: 10px 15px;
      background-color: oklch(95% 0 0);
      color: #666;
      border: 1px solid black;
      border-radius: 10px 10px 0 0;

      &:hover {
        background-color: oklch(90% 0 0);
      }

      &.settings {
        margin-left: auto;
      }

      &.active {
        background-color: white;
        border-bottom-color: white;
        color: oklch(45% 30% 270);
        box-shadow: inset 0 3px 0 oklch(70% 50% 270);
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
  #export-tab {
    display: none;
    grid-template-rows: 1fr;
    overflow-y: scroll;
    padding: 15px;

    &.active {
      display: grid;
    }
  }

  #settings-tab {
    display: none;
    overflow-y: scroll;
    padding: 15px;
    padding-bottom: 50vh;

    &.active {
      display: flex;
      flex-direction: column;
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
    grid-template-rows: auto 1fr auto;
    border-right: 1px dashed black;
    overflow: hidden;
  }

  #left-bar-scroll {
    overflow-y: scroll;
    padding: 0 15px;
    display: flex;
    flex-direction: column;
    gap: 30px;

    & h2 {
      position: sticky;
      top: 0;
      background-color: white;
      padding: 5px 0;
      margin: 0;
    }
  }

  #filter-bar {
    border-bottom: 1px dashed black;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
  }

  #filter-bar-row {
    display: flex;
    gap: 5px;

    & > search {
      flex: 1;
      min-width: 0;
    }
  }

  .filter-toggle {
    position: relative;
    display: grid;
    place-items: center;
    padding: 5px;
    border: none;
    border-radius: 10px;
    background: none;
    color: gray;
    cursor: pointer;

    &:hover,
    &.open {
      background-color: oklch(95% 0 0);
    }
  }

  .filter-badge {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 15px;
    font-size: 10px;
    line-height: 15px;
    border-radius: 10px;
    color: white;
    background-color: oklch(60% 15% 250);
  }

  .course-list-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 30px 0;
    color: #444;

    & > button {
      font-size: var(--fs-sm);
      padding: 5px 15px;
      border: 1px solid #ccc;
      border-radius: 10px;
      background-color: white;
      cursor: pointer;

      &:hover {
        background-color: oklch(95% 0 0);
      }
    }
  }

  #right-bar-scroll .hint {
    color: #444;
  }

  #filter-bar-slot-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  #filter-bar select {
    font-size: var(--fs-sm);
    border: 1px solid gray;
    border-radius: 10px;
    padding: 5px 0px 5px 5px;
    background-color: white;
    cursor: pointer;

    &.placeholder {
      color: oklch(0.6 0 0);
    }
  }

  #dow-chips {
    display: flex;
    gap: 5px;
  }

  .dow-chip {
    font-size: var(--fs-sm);
    min-width: 30px;
    padding: 5px 0;
    border: 1px solid gray;
    border-radius: 10px;
    background-color: white;
    cursor: pointer;

    &:hover:not(:disabled) {
      background-color: oklch(95% 0 0);
    }

    &.active {
      border-color: oklch(60% 15% 250);
      background-color: oklch(90% 8% 250);
    }

    &:disabled {
      color: oklch(0.6 0 0);
      border-color: oklch(0.8 0 0);
      cursor: default;
    }
  }

  #filter-bar-checkboxes {
    display: flex;
    gap: 15px;
  }

  .filter-checkbox {
    font-size: var(--fs-sm);
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  #right-bar {
    display: grid;
    grid-template-rows: var(--timetable-height) 1fr;
    overflow: hidden;
  }

  #right-bar-scroll {
    overflow-y: scroll;
    padding: 0 15px;
    border-top: 1px dashed black;
    display: flex;
    flex-direction: column;
    gap: 30px;

    & h2 {
      margin: 0;
    }

    & h2,
    & .list-heading {
      position: sticky;
      top: 0;
      background-color: white;
      padding: 5px 0;
    }

    & .list-heading h2 {
      position: static;
      padding: 0;
    }
  }

  #left-bar-scroll,
  #right-bar-scroll {
    & p {
      margin: 0;
      margin-top: 0;
    }

    & > .section:first-child {
      margin-top: 15px;
    }

    & > .section:last-child {
      margin-bottom: 15px;
    }
  }

  #cell-remark {
    border-top: 1px dashed black;
    padding: 15px;

    & > h2 {
      margin: 0;
    }

    & > p {
      margin: 0;
      margin-top: 10px;
    }
  }

  .list-heading {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .credit-total {
    font-size: 1em;
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

  .goto-cell {
    all: unset;
    cursor: pointer;
    font-size: var(--fs-xs);
    color: oklch(0.4 0.15 250);
    text-decoration: underline;
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

    .slots,
    .expects {
      display: none;
    }
    &.show-slots .slots,
    &.show-expects .expects {
      display: revert;
    }

    & .course-id {
      vertical-align: middle;
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
    font-size: var(--fs-lg);
    text-align: center;
    background-color: white;
    border: unset;
    border-left: 1px solid black;
    border-bottom: 1px solid black;

    &:hover {
      background-color: #ddd;
    }
  }

  #sidebar-resize-handle {
    position: fixed;
    top: var(--toggle-width);
    bottom: 0;
    left: calc(100vw - var(--sidebar-width));
    width: 10px;
    transform: translateX(-5px);
    cursor: col-resize;
    z-index: 100;
  }

  #timetable-resize-handle {
    position: fixed;
    top: calc(var(--right-bar-top) + var(--timetable-height));
    left: calc(100vw - var(--sidebar-width) / 2);
    right: 0;
    height: 10px;
    transform: translateY(-5px);
    cursor: row-resize;
    z-index: 100;
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

    & #reset {
      --h: 10;
    }
  }

  #filter-bar-row > search > input {
    box-sizing: border-box;
    width: 100%;
    border: 1px solid gray;
    border-radius: 10px;
    padding: 5px 10px;
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
    font-size: var(--fs-sm);

    & > input[type="range"] {
      width: 100px;
    }
  }
</style>
