<script lang="ts">
  import { asset, resolve } from "$app/paths";
  import X from "lucide-svelte/icons/x";
  import { tick, untrack } from "svelte";
  import {
    akikoGetCourseLists,
    akikoGetCreditStats,
    akikoGetOccupiedSlots,
    akikoMoveCourse,
    akikoNew,
    courseIdCompare,
    coursesCreditSum,
    occupiedSlotsOverlap,
    type AkikoMoveCourseDst,
    type CellId,
    type CourseId,
    type FakeCourse,
    type ListKind,
    type ListKindOverrides,
    type MergedCourse,
    type RealCourse,
  } from "#lib/akiko.ts";
  import {
    classifyCoursesOrFail,
    creditRequirementsNewOrFail,
    type MajorConfig,
  } from "#lib/app-setup.ts";
  import { MAJOR_TO_JA } from "#lib/constants.ts";
  import { parseImportedCsv } from "#lib/csv.ts";
  import {
    courseMatchesFilters,
    filterChoicesOf,
    filtersActiveCount,
    filtersInEffect,
    wontTakeFiltersDefault,
  } from "../course-filters";
  import CourseFilters from "../CourseFilters.svelte";
  import {
    cellCreditStatsDisplay,
    creditBoundsToString,
    creditFillPercentages,
  } from "../credit-display";
  import ExportTab from "../ExportTab.svelte";
  import ImportTab from "../ImportTab.svelte";
  import Timetable from "../Timetable.svelte";
  import { timetableTabAfterPlanning, type TimetableTab } from "../timetable";
  import BottomSheet from "./BottomSheet.svelte";
  import CourseRow from "./CourseRow.svelte";
  import MobileTable from "./MobileTable.svelte";
  import { sampleGrades } from "./sample-grades";
  import { sheetSnapHeight, type SheetSnap, type SheetTab } from "./sheet";

  let { config }: { config: MajorConfig } = $props();

  // Kept in memory only, so trying the mock can't touch what the real page saved
  let realCourses = $state.raw<RealCourse[]>(
    untrack(() => sampleGrades(config.knownCourseYear)),
  );
  let fakeCourses = $state.raw<FakeCourse[]>([]);
  let listKindOverrides = $state.raw<ListKindOverrides>(new Map());
  let native = $state(true);

  const creditRequirements = $derived(
    creditRequirementsNewOrFail(
      config.getCreditRequirements(config.tableYear, config.major),
    ),
  );
  const classification = $derived(
    classifyCoursesOrFail(
      config.knownCourses,
      realCourses,
      fakeCourses,
      !native,
      config.tableYear,
      config.major,
      config.classifyKnownCourses,
      config.classifyRealCourses,
      config.classifyFakeCourses,
    ),
  );
  const akiko = $derived(
    akikoNew(
      config.knownCourses,
      config.knownCourseYear,
      realCourses,
      fakeCourses,
      listKindOverrides,
      classification.courseIdToCellId,
      classification.realCoursePositions,
      classification.fakeCoursePositions,
      creditRequirements,
    ),
  );
  const creditStats = $derived(akikoGetCreditStats(akiko));

  function useGrades(real: RealCourse[], fake: FakeCourse[]) {
    realCourses = real;
    fakeCourses = fake;
    listKindOverrides = new Map();
  }

  function importCsvFile(file: File) {
    void file.text().then((csv) => {
      const result = parseImportedCsv(csv);
      if (result.kind !== "ok") {
        alert("CSVファイルを正しく読み込めませんでした。");
        return;
      }
      useGrades(result.realCourses, result.fakeCourses);
    });
  }

  let screen = $state<"main" | "import" | "export">("main");
  let snap = $state<SheetSnap>("peek");
  let sheetTab = $state<SheetTab>("find");
  let stageHeight = $state(0);

  let selectedCellId = $state<CellId | undefined>();
  const selectedCellStats = $derived(
    selectedCellId !== undefined
      ? creditStats.cells.get(selectedCellId)
      : undefined,
  );
  const selectedCellRemark = $derived(
    selectedCellId !== undefined
      ? config.getRemark(selectedCellId, config.tableYear, config.major)
      : undefined,
  );

  // Typed by hand: ESLint can't see the types of a component's exports
  let table = $state<{ scrollCellIntoView: (cellId: CellId) => void }>();

  /** Selects the cell, lists its courses, and scrolls it into view above the sheet. */
  async function showCell(cellId: CellId) {
    selectedCellId = cellId;
    screen = "main";
    sheetTab = "find";
    if (snap !== "half") snap = "half";
    // The table's bottom margin follows the sheet
    await tick();
    table?.scrollCellIntoView(cellId);
  }

  function showSheetTab(tab: SheetTab) {
    sheetTab = tab;
    if (snap === "peek") snap = "half";
  }

  let showRemark = $state(false);
  let showNonAvailable = $state(false);
  // As chosen; `filters` leaves out the values no longer on offer
  let chosenFilters = $state(wontTakeFiltersDefault());
  let expandedCourseId = $state<CourseId | undefined>();

  const cellLists = $derived(
    akikoGetCourseLists(akiko, selectedCellId, showNonAvailable),
  );
  const occupiedSlots = $derived(akikoGetOccupiedSlots(akiko));
  const filterChoices = $derived(filterChoicesOf(cellLists.wontTake));
  const filters = $derived(filtersInEffect(chosenFilters, filterChoices));
  const findVisible = $derived(
    selectedCellId !== undefined ||
      filters.courseIdOrName !== "" ||
      filtersActiveCount(filters) > 0,
  );

  type ListedCourse = { course: MergedCourse; listKind: ListKind };

  // One list in course order, so a course stays where it is when it's added
  // or taken back out
  const candidates = $derived<ListedCourse[]>(
    [
      ...cellLists.wontTake
        .filter((c) => courseMatchesFilters(c, filters, occupiedSlots))
        .map((course) => ({ course, listKind: "wont-take" as const })),
      ...cellLists.mightTake
        .filter((c) =>
          // A planned course occupies its own slots
          courseMatchesFilters(
            c,
            { ...filters, onlyUnoccupied: false },
            occupiedSlots,
          ),
        )
        .map((course) => ({ course, listKind: "might-take" as const })),
    ].sort((a, b) => courseIdCompare(a.course.id, b.course.id)),
  );

  // A cell can have thousands of courses
  const LIMIT_STEP = 100;
  let limit = $state(LIMIT_STEP);
  $effect(() => {
    void selectedCellId;
    limit = LIMIT_STEP;
  });

  const planned = $derived(akikoGetCourseLists(akiko, undefined, false));

  let timetableYear = $state(untrack(() => config.knownCourseYear));
  let timetableTerm = $state<TimetableTab>("spring-a");
  let lastAddedCourseId = $state<CourseId | undefined>();

  function moveCourse(courseId: CourseId, dst: AkikoMoveCourseDst) {
    const moved = akikoMoveCourse(akiko, courseId, dst);
    if (moved.kind !== "moved") return;
    listKindOverrides = moved.listKindOverrides;
    if (dst !== "might-take") return;
    lastAddedCourseId = courseId;
    timetableYear = akiko.knownCourseYear;
    timetableTerm = timetableTabAfterPlanning(
      akiko.knownCourses.get(courseId)?.slots ?? [],
      timetableTerm,
    );
  }
</script>

<svelte:head>
  <title>あきこ モバイル版モック</title>
  <meta name="robots" content="noindex" />
</svelte:head>

{#snippet credit(
  label: string,
  s: {
    min: number;
    max: number | undefined;
    effectiveTaken: number;
    effectiveMightTake: number;
  },
)}
  {@const [green, yellow] = creditFillPercentages(
    s.effectiveTaken,
    s.effectiveMightTake,
    s.min,
  )}
  <div class="credit">
    <div>
      <span>{label}</span>
      <strong
        >{s.effectiveTaken}{#if s.effectiveMightTake > 0}→{s.effectiveTaken +
            s.effectiveMightTake}{/if}</strong
      >
      <span>/ {creditBoundsToString(s.min, s.max)}単位</span>
    </div>
    <div class="credit-bar" style="--green:{green}%; --yellow:{yellow}%"></div>
  </div>
{/snippet}

{#snippet row({ course, listKind }: ListedCourse, showGotoCell: boolean)}
  <CourseRow
    {course}
    {listKind}
    catalogYear={akiko.knownCourseYear}
    overlaps={listKind === "wont-take" &&
      occupiedSlotsOverlap(occupiedSlots, course.known?.slots ?? [])}
    expanded={showRemark || expandedCourseId === course.id}
    {showGotoCell}
    onToggleExpanded={() =>
      (expandedCourseId =
        expandedCourseId === course.id ? undefined : course.id)}
    onMove={(dst: AkikoMoveCourseDst) => moveCourse(course.id, dst)}
    onShowCell={(cellId: CellId) => void showCell(cellId)}
  />
{/snippet}

<div class="app">
  <div class="mock-bar">
    <span>モック：ここでの変更は保存されません</span>
    <button onclick={() => useGrades(sampleGrades(config.knownCourseYear), [])}
      >サンプル成績</button
    >
    <button onclick={() => useGrades([], [])}>成績なし</button>
  </div>

  <header>
    <a href={resolve("/")} class="akiko"
      ><img src={asset("images/akiko.png")} alt="あきこ" /></a
    >
    <div class="title">
      <strong>{MAJOR_TO_JA[config.major]}</strong>
      <span>{config.tableYear}年度入学</span>
    </div>
    <button onclick={() => (screen = "import")}>成績</button>
    <button onclick={() => (screen = "export")}>出力</button>
  </header>

  <div class="stage" bind:clientHeight={stageHeight}>
    <MobileTable
      bind:this={table}
      {config}
      {creditStats}
      {selectedCellId}
      coveredHeight={sheetSnapHeight(
        snap === "full" ? "half" : snap,
        stageHeight,
      )}
      onSelect={(cellId: CellId) => void showCell(cellId)}
    />

    <BottomSheet bind:snap containerHeight={stageHeight}>
      {#snippet peek()}
        <div class="summary">
          {#if selectedCellStats}
            {@render credit("選択中のマス", selectedCellStats)}
            <button
              class="clear"
              aria-label="マスの選択を解除"
              onclick={() => (selectedCellId = undefined)}
              ><X size={15} /></button
            >
          {:else}
            {@render credit("合計", creditStats.total)}
          {/if}
        </div>
        <div class="tabs">
          <button
            class:active={sheetTab === "find"}
            onclick={() => showSheetTab("find")}>授業を探す</button
          >
          <button
            class:active={sheetTab === "plan"}
            onclick={() => showSheetTab("plan")}
            >取る授業 {planned.mightTake.length}</button
          >
          <button
            class:active={sheetTab === "timetable"}
            onclick={() => showSheetTab("timetable")}>時間割</button
          >
        </div>
      {/snippet}

      <div class="scroll">
        {#if sheetTab === "find"}
          <CourseFilters
            bind:filters={chosenFilters}
            choices={filterChoices}
            bind:showRemark
            bind:showNonAvailable
          />
          <div class="list">
            {#if selectedCellStats}
              {@const warning =
                cellCreditStatsDisplay(selectedCellStats).warning}
              {#if warning}<p class="warning">⚠️ {warning}</p>{/if}
            {/if}
            {#if selectedCellRemark}
              <details class="remark">
                <summary>このマスの備考</summary>
                <p>{selectedCellRemark}</p>
              </details>
            {/if}
            {#if findVisible}
              <h2>
                {selectedCellId ? "当てはまる授業" : "全ての授業"}
                <small>{candidates.length}件</small>
              </h2>
              {#each candidates.slice(0, limit) as listed (listed.course.id)}
                {@render row(listed, selectedCellId === undefined)}
              {:else}
                <p class="hint">該当する授業がありません</p>
              {/each}
              {#if candidates.length > limit}
                <button class="pill" onclick={() => (limit += LIMIT_STEP)}
                  >さらに表示</button
                >
              {/if}
              {#if selectedCellId !== undefined && cellLists.taken.length > 0}
                <h2>
                  単位取得済みの授業
                  <small>{coursesCreditSum(cellLists.taken)}単位</small>
                </h2>
                {#each cellLists.taken as course (course.id)}
                  {@render row({ course, listKind: "taken" }, false)}
                {/each}
              {/if}
              {#if selectedCellId !== undefined && cellLists.fake.length > 0}
                <h2>
                  認可された授業
                  <small>{coursesCreditSum(cellLists.fake)}単位</small>
                </h2>
                {#each cellLists.fake as c (c.id)}
                  <p class="fake">
                    {c.name} ({c.takenYear})<span>{c.credit ?? "-"}単位</span>
                  </p>
                {/each}
              {/if}
            {:else}
              <p class="hint">表のマスを押すか、授業を検索してください</p>
              <div class="totals">
                {@render credit("必修", creditStats.compulsory)}
                {@render credit("選択", creditStats.elective)}
                {@render credit("合計", creditStats.total)}
              </div>
            {/if}
          </div>
        {:else if sheetTab === "plan"}
          <div class="list">
            <h2>
              取る授業
              <small
                >{planned.mightTake.length}件・{coursesCreditSum(
                  planned.mightTake,
                )}単位</small
              >
            </h2>
            {#each planned.mightTake as course (course.id)}
              {@render row({ course, listKind: "might-take" }, true)}
            {:else}
              <p class="hint">
                「授業を探す」で授業の ＋ を押すと、ここと時間割に入ります
              </p>
            {/each}
          </div>
        {:else}
          <div class="timetable">
            <Timetable
              bind:year={timetableYear}
              bind:activeTerm={timetableTerm}
              {akiko}
              highlightedCourseId={lastAddedCourseId}
              onBarClick={(courseId: CourseId) => {
                const cellId = akiko.courseIdToCellId.get(courseId);
                if (cellId !== undefined) void showCell(cellId);
              }}
              onBarDragStart={(e: DragEvent) => e.preventDefault()}
              onBarDragEnd={() => {}}
            />
          </div>
        {/if}
      </div>
    </BottomSheet>

    {#if screen !== "main"}
      <div class="screen">
        <button class="pill" onclick={() => (screen = "main")}>表に戻る</button>
        {#if screen === "import"}
          <ImportTab
            {akiko}
            {realCourses}
            {fakeCourses}
            bind:native
            onImport={importCsvFile}
            onReset={() => useGrades([], [])}
          />
        {:else}
          <ExportTab
            {akiko}
            {config}
            onShowCell={(cellId: CellId, term: TimetableTab) => {
              timetableYear = config.knownCourseYear;
              timetableTerm = term;
              void showCell(cellId);
            }}
            onPickCourses={() => {
              screen = "main";
              showSheetTab("find");
            }}
            onDownload={() => {}}
          />
        {/if}
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .app {
    --c-bg: oklch(97% 0.005 270);
    --c-surface: white;
    --c-line: oklch(88% 0.01 270);
    --c-track: oklch(92% 0.005 270);
    --c-text: oklch(25% 0.02 270);
    --c-sub: oklch(50% 0.02 270);
    --c-accent: oklch(45% 0.15 270);
    --c-accent-bg: oklch(95% 0.03 270);
    --c-brand-bg: oklch(98% 4% 350);
    --c-brand-line: oklch(92% 10% 350);
    --c-taken: rgb(51, 204, 51);
    --c-plan: rgb(255, 204, 0);
    --c-plan-bg: oklch(96% 0.07 95);
    --c-warn: oklch(50% 0.18 30);
    --c-warn-bg: oklch(95% 0.04 30);
    // The components shared with the desktop page size their text with these
    --fs-xs: 0.8em;
    --fs-sm: 0.9em;
    --fs-lg: 1.4em;

    position: fixed;
    inset: 0;
    display: grid;
    grid-template-rows: auto auto 1fr;
    font-size: 15px;
    color: var(--c-text);
    background-color: var(--c-bg);

    & button {
      color: inherit;
    }
  }

  .mock-bar {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    background-color: var(--c-text);
    color: var(--c-surface);
    font-size: var(--fs-xs);

    & > span {
      margin-right: auto;
    }

    & > button {
      padding: 0 10px;
      border: 1px solid var(--c-sub);
      border-radius: 5px;
      background: none;
      font-size: inherit;
    }
  }

  header {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 50px;
    padding: 0 10px;
    background-color: var(--c-brand-bg);
    border-bottom: 1px solid var(--c-brand-line);

    & > .akiko {
      flex: none;
      width: 35px;
      height: 35px;
      border: 1px solid var(--c-brand-line);
      border-radius: 50%;
      background-color: var(--c-surface);
      overflow: hidden;

      & > img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    & > .title {
      flex: 1;
      min-width: 0;
      display: grid;
      line-height: 1.2;

      & > strong {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      & > span {
        font-size: var(--fs-xs);
        color: var(--c-sub);
      }
    }

    & > button {
      flex: none;
      height: 35px;
      padding: 0 15px;
      border: 1px solid var(--c-line);
      border-radius: 20px;
      background-color: var(--c-surface);
      font-size: var(--fs-sm);
    }
  }

  .stage {
    position: relative;
    min-height: 0;
    overflow: hidden;
  }

  .summary {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
    height: 45px;
    padding: 0 15px;
  }

  .credit {
    display: grid;
    gap: 5px;

    & > div:first-child {
      display: flex;
      align-items: baseline;
      gap: 10px;
      font-size: var(--fs-sm);

      & > strong {
        font-size: 1.2em;
      }
    }
  }

  .credit-bar {
    height: 5px;
    border-radius: 5px;
    background: linear-gradient(
      90deg,
      var(--c-taken) 0 var(--green),
      var(--c-plan) var(--green) var(--yellow),
      var(--c-track) var(--yellow)
    );
  }

  .clear {
    all: unset;
    cursor: pointer;
    display: grid;
    place-items: center;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background-color: var(--c-track);
  }

  .tabs {
    display: flex;
    gap: 5px;
    height: 45px;
    box-sizing: border-box;
    padding: 5px 15px;
    border-bottom: 1px solid var(--c-line);

    & > button {
      all: unset;
      cursor: pointer;
      flex: 1;
      border-radius: 5px;
      text-align: center;
      font-size: var(--fs-sm);
      color: var(--c-sub);

      &.active {
        background-color: var(--c-accent-bg);
        color: var(--c-accent);
        font-weight: bold;
      }
    }
  }

  .scroll {
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .list {
    display: grid;
    gap: 5px;
    padding: 0 15px 20px;

    & > h2 {
      position: sticky;
      top: 0;
      z-index: 1;
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin: 0;
      padding: 15px 0 5px;
      background-color: var(--c-bg);
      font-size: var(--fs-sm);
      color: var(--c-sub);

      & > small {
        font-weight: normal;
      }
    }

    & > .pill {
      justify-self: center;
      margin-top: 10px;
    }
  }

  .hint {
    margin: 0;
    padding: 20px 0;
    text-align: center;
    font-size: var(--fs-sm);
    color: var(--c-sub);
  }

  .warning,
  .remark {
    margin: 15px 0 0;
    padding: 10px;
    border-radius: 10px;
    font-size: var(--fs-sm);
  }

  .warning {
    background-color: var(--c-warn-bg);
    color: var(--c-warn);
  }

  .remark {
    background-color: var(--c-surface);
    border: 1px solid var(--c-line);

    & > p {
      margin: 10px 0 0;
      white-space: pre-line;
    }
  }

  .fake {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin: 0;
    padding: 10px;
    border: 1px solid var(--c-line);
    border-radius: 10px;
    background-color: var(--c-surface);
  }

  .totals {
    display: grid;
    gap: 15px;
    padding: 15px;
    border: 1px solid var(--c-line);
    border-radius: 10px;
    background-color: var(--c-surface);
  }

  .timetable {
    display: grid;
    height: 400px;
    margin: 15px;
    border: 1px solid black;
    background-color: var(--c-surface);
  }

  .pill {
    height: 45px;
    padding: 0 20px;
    border: 1px solid var(--c-line);
    border-radius: 20px;
    background-color: var(--c-surface);
    font-size: var(--fs-sm);
  }

  .screen {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: grid;
    align-content: start;
    justify-items: start;
    gap: 15px;
    padding: 15px;
    overflow-y: auto;
    background-color: var(--c-surface);
  }
</style>
