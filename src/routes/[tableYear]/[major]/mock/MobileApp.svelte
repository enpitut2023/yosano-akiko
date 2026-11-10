<script lang="ts">
  import { asset, resolve } from "$app/paths";
  import CalendarDays from "lucide-svelte/icons/calendar-days";
  import GraduationCap from "lucide-svelte/icons/graduation-cap";
  import ListChecks from "lucide-svelte/icons/list-checks";
  import Search from "lucide-svelte/icons/search";
  import { tick, untrack } from "svelte";
  import {
    akikoGetCourseLists,
    akikoGetCreditStats,
    akikoGetOccupiedSlots,
    akikoMoveCourse,
    akikoNew,
    columnIdIsElective,
    courseIdCompare,
    coursesCreditSum,
    occupiedSlotsOverlap,
    type AkikoMoveCourseDst,
    type CellId,
    type ColumnId,
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
    electiveCreditStatsDisplay,
  } from "../credit-display";
  import ExportTab from "../ExportTab.svelte";
  import ImportTab from "../ImportTab.svelte";
  import Timetable from "../Timetable.svelte";
  import { timetableTabAfterPlanning, type TimetableTab } from "../timetable";
  import BottomSheet from "./BottomSheet.svelte";
  import CourseRow from "./CourseRow.svelte";
  import MobileTable from "./MobileTable.svelte";
  import { sampleGrades, type SampleGrades } from "./sample-grades";
  import { sheetSnapHeight, type SheetSnap, type SheetTab } from "./sheet";

  let { config }: { config: MajorConfig } = $props();

  // Kept in memory only, so trying the mock can't touch what the real page saved
  let realCourses = $state.raw<RealCourse[]>(
    untrack(() => sampleGrades("typical", config.knownCourseYear)),
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

  type GradesSource = SampleGrades | "none" | "imported";
  const GRADES_SOURCES: Record<GradesSource, string> = {
    typical: "サンプル成績",
    overflowing: "上限超えの成績",
    none: "成績なし",
    imported: "読み込んだ成績",
  };
  let gradesSource = $state<GradesSource>("typical");
  function setGradesSource(source: GradesSource) {
    gradesSource = source;
    if (source === "none") useGrades([], []);
    else if (source !== "imported")
      useGrades(sampleGrades(source, config.knownCourseYear), []);
  }

  function importCsvFile(file: File) {
    void file.text().then((csv) => {
      const result = parseImportedCsv(csv);
      if (result.kind !== "ok") {
        alert("CSVファイルを正しく読み込めませんでした。");
        return;
      }
      useGrades(result.realCourses, result.fakeCourses);
      gradesSource = "imported";
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

  const overflowingColumns = $derived(
    [...creditStats.columns]
      .filter(([colId, s]) => columnIdIsElective(colId) && s.overflowTotal > 0)
      .map(([colId, stats]) => ({ colId, stats })),
  );

  type CreditProgress = {
    min: number;
    max: number | undefined;
    effectiveTaken: number;
    effectiveMightTake: number;
  };

  /** Credits still needed to reach `min`, after the planned courses too if `planned`. */
  function creditsLeft(s: CreditProgress, planned: boolean): number {
    const have = s.effectiveTaken + (planned ? s.effectiveMightTake : 0);
    return Math.max(0, s.min - have);
  }
  const electiveWarning = $derived(
    electiveCreditStatsDisplay(creditStats.elective).warning,
  );

  // Typed by hand: ESLint can't see the types of a component's exports
  let table = $state<{
    scrollCellIntoView: (cellId: CellId) => void;
    scrollColumnIntoView: (colId: ColumnId) => void;
  }>();

  /** Scrolls the column into view above the sheet, where its sum shows. */
  function showColumn(colId: ColumnId) {
    if (snap === "full") snap = "half";
    table?.scrollColumnIntoView(colId);
  }

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

  // Taken out on the 取る授業 tab but still listed there, so a mistaken tap is
  // one tap to undo; they go when the tab changes
  let unplannedOnPlanTab = $state.raw<ReadonlySet<CourseId>>(new Set());
  $effect(() => {
    void sheetTab;
    unplannedOnPlanTab = new Set();
  });

  const planList = $derived.by<ListedCourse[]>(() => {
    const unplanned =
      unplannedOnPlanTab.size === 0
        ? []
        : akikoGetCourseLists(akiko, undefined, true).wontTake.filter((c) =>
            unplannedOnPlanTab.has(c.id),
          );
    return [
      ...planned.mightTake.map((course) => ({
        course,
        listKind: "might-take" as const,
      })),
      ...unplanned.map((course) => ({
        course,
        listKind: "wont-take" as const,
      })),
    ].sort((a, b) => courseIdCompare(a.course.id, b.course.id));
  });

  let timetableYear = $state(untrack(() => config.knownCourseYear));
  let timetableTerm = $state<TimetableTab>("spring-a");
  let lastAddedCourseId = $state<CourseId | undefined>();

  function moveCourse(courseId: CourseId, dst: AkikoMoveCourseDst) {
    const moved = akikoMoveCourse(akiko, courseId, dst);
    if (moved.kind !== "moved") return;
    listKindOverrides = moved.listKindOverrides;
    if (sheetTab === "plan" && dst === "wont-take")
      unplannedOnPlanTab = new Set([...unplannedOnPlanTab, courseId]);
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
    overflowTotal: number;
  },
)}
  {@const [green, yellow] = creditFillPercentages(
    s.effectiveTaken,
    s.effectiveMightTake,
    s.min,
  )}
  <div
    class="credit"
    class:over={s.overflowTotal > 0}
    style="--green:{green}%; --yellow:{yellow}%"
  >
    <div>
      <span>{label}</span>
      <strong
        >{s.effectiveTaken}{#if s.effectiveMightTake > 0}→{s.effectiveTaken +
            s.effectiveMightTake}{/if}</strong
      >
      <span>/ {creditBoundsToString(s.min, s.max)}単位</span>
    </div>
  </div>
{/snippet}

{#snippet progress(s: CreditProgress)}
  {s.effectiveTaken}{#if s.effectiveMightTake > 0}→{s.effectiveTaken +
      s.effectiveMightTake}{/if}
{/snippet}

{#snippet meter(label: string, s: CreditProgress)}
  {@const [green, yellow] = creditFillPercentages(
    s.effectiveTaken,
    s.effectiveMightTake,
    s.min,
  )}
  <div class="meter">
    <strong>{label}</strong>
    <div class="bar" style="--green:{green}%; --yellow:{yellow}%"></div>
    <span
      ><b>{@render progress(s)}</b> / {creditBoundsToString(s.min, s.max)}</span
    >
  </div>
{/snippet}

{#snippet legend()}
  <p class="legend">
    <span class="swatch taken"></span>取得済み
    <span class="swatch plan"></span>取る授業
  </p>
{/snippet}

{#snippet creditsLeftToGraduate()}
  {@const total = creditStats.total}
  <div class="hero">
    <span>卒業まで あと</span>
    <strong
      >{creditsLeft(
        total,
        false,
      )}{#if total.effectiveMightTake > 0}→{creditsLeft(
          total,
          true,
        )}{/if}</strong
    >
    <span>単位</span>
  </div>
  <div class="meters">
    {@render meter("必修", creditStats.compulsory)}
    {@render meter("選択", creditStats.elective)}
  </div>
  {@render legend()}
{/snippet}

{#snippet fileIcon(src: string)}
  <span class="icon" style="--src: url({src})"></span>
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
    <span>モック：変更は保存されません</span>
    <select aria-label="成績" bind:value={() => gradesSource, setGradesSource}>
      {#each Object.entries(GRADES_SOURCES) as [value, label] (value)}
        <option {value} disabled={value === "imported"}>{label}</option>
      {/each}
    </select>
  </div>

  <header>
    <a href={resolve("/")} class="akiko"
      ><img src={asset("images/akiko.png")} alt="あきこ" /></a
    >
    <div class="title">
      <strong>{MAJOR_TO_JA[config.major]}</strong>
      <span>{config.tableYear}年度入学</span>
    </div>
    <button onclick={() => (screen = "import")}
      >{@render fileIcon(asset("icons/math.svg"))}成績</button
    >
    <button onclick={() => (screen = "export")}
      >{@render fileIcon(asset("icons/itf.svg"))}出力</button
    >
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
      onSelect={(cellId: CellId | undefined) => {
        if (cellId === undefined) selectedCellId = undefined;
        else void showCell(cellId);
      }}
    />

    <BottomSheet bind:snap containerHeight={stageHeight}>
      {#snippet peek()}
        <div class="summary">
          {#if selectedCellStats}
            {@render credit("選択中のマス", selectedCellStats)}
          {:else}
            <p class="peek-hint">
              表のマスを押すと、そのマスの単位と授業が出ます
            </p>
          {/if}
        </div>
        <div class="tabs">
          <button
            class:active={sheetTab === "find"}
            onclick={() => showSheetTab("find")}
            ><Search size={15} />探す</button
          >
          <button
            class:active={sheetTab === "plan"}
            onclick={() => showSheetTab("plan")}
            ><ListChecks
              size={15}
            />取る授業{#if planned.mightTake.length > 0}<span class="count"
                >{planned.mightTake.length}</span
              >{/if}</button
          >
          <button
            class:active={sheetTab === "timetable"}
            onclick={() => showSheetTab("timetable")}
            ><CalendarDays size={15} />時間割</button
          >
          <button
            class:active={sheetTab === "credits"}
            onclick={() => showSheetTab("credits")}
            ><GraduationCap size={15} />単位</button
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
            {#each planList as listed (listed.course.id)}
              {@render row(listed, true)}
            {:else}
              <p class="hint">
                「授業を探す」で授業の ＋ を押すと、ここと時間割に入ります
              </p>
            {/each}
          </div>
        {:else if sheetTab === "credits"}
          <div class="list credits">
            <h2>卒業に必要な単位</h2>
            {@render creditsLeftToGraduate()}
            {#if electiveWarning}<p class="warning">
                ⚠️ {electiveWarning}
              </p>{/if}
            {#each overflowingColumns as { colId, stats } (colId)}
              <p class="warning">
                ⚠️ 赤い枠の列は{stats.max}単位までで、{stats.overflowTotal}単位が卒業単位に入りません。
                <button class="link" onclick={() => showColumn(colId)}
                  >表で見る</button
                >
              </p>
            {/each}
            <p class="hint">列ごとの選択科目の単位は、表の下の帯に出ます</p>
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
            onReset={() => setGradesSource("none")}
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
    // From the desktop page
    --c-surface: white;
    --c-rule: black;
    --c-line: #ccc;
    --c-panel: oklch(95% 0 0);
    --c-text: black;
    --c-sub: #666;
    --c-accent: oklch(45% 30% 270);
    --c-tab-accent: oklch(70% 50% 270);
    --c-brand-bg: oklch(98% 4% 350);
    --c-brand-line: oklch(92% 10% 350);
    --c-taken: rgb(51, 204, 51);
    --c-plan: rgb(255, 204, 0);
    // The table's tints
    --c-taken-tint: rgb(51 204 51 / 0.4);
    --c-plan-tint: rgb(255 204 0 / 0.4);
    --c-warn: oklch(50% 0.18 30);
    --c-warn-bg: oklch(95% 0.04 30);
    // The components shared with the desktop page size their text with these
    --fs-xs: 0.8em;
    --fs-sm: 0.9em;
    --fs-lg: 1.4em;

    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    font-size: 15px;
    color: var(--c-text);
    background-color: var(--c-surface);

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

    & > select {
      padding: 0 5px;
      border: 1px solid var(--c-sub);
      border-radius: 5px;
      background: none;
      color: inherit;
      font-size: inherit;
      white-space: nowrap;
    }
  }

  // The desktop's tab icons, which are single-color SVGs
  .icon {
    flex: none;
    width: 15px;
    height: 15px;
    background-color: currentColor;
    mask: var(--src) center / contain no-repeat;
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
      display: flex;
      align-items: center;
      gap: 5px;
      height: 35px;
      padding: 0 10px;
      border: 1px solid var(--c-line);
      border-radius: 10px;
      background-color: var(--c-surface);
      font-size: var(--fs-sm);
    }
  }

  .stage {
    flex: 1;
    position: relative;
    min-height: 0;
    overflow: hidden;
  }

  .summary {
    display: grid;
    padding: 0 10px;
  }

  .peek-hint {
    margin: 0;
    padding: 5px 0;
    border: 1px dashed var(--c-line);
    text-align: center;
    font-size: var(--fs-sm);
    line-height: 1.6;
    color: var(--c-sub);
  }

  // Like the desktop's column sums: a box filled behind its text
  .credit {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 5px 10px;
    border: 1px solid var(--c-rule);
    background: linear-gradient(
      90deg,
      var(--c-taken-tint) 0 var(--green),
      var(--c-plan-tint) var(--green) var(--yellow),
      transparent var(--yellow)
    );
    font-size: var(--fs-sm);
    white-space: nowrap;

    & strong {
      font-size: 1.2em;
    }

    &.over {
      outline: 1px solid var(--c-warn);
      border-color: var(--c-warn);
    }
  }

  // The desktop's tabs
  .tabs {
    display: flex;
    align-items: flex-end;
    gap: 5px;
    padding: 10px 5px 0;
    border-bottom: 1px solid var(--c-rule);

    & > button {
      position: relative;
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 5px;
      min-width: 0;
      // Overlaps the bottom border so the active tab joins its content
      margin-bottom: -1px;
      padding: 10px 0;
      border: 1px solid var(--c-rule);
      border-radius: 10px 10px 0 0;
      background-color: var(--c-panel);
      color: var(--c-sub);
      font-size: var(--fs-sm);
      white-space: nowrap;

      &.active {
        border-bottom-color: var(--c-surface);
        background-color: var(--c-surface);
        box-shadow: inset 0 3px 0 var(--c-tab-accent);
        color: var(--c-accent);
      }
    }
  }

  // In the tab's corner, like the desktop's filter badge
  .count {
    position: absolute;
    top: -5px;
    right: -5px;
    box-sizing: border-box;
    min-width: 20px;
    padding: 0 5px;
    border-radius: 10px;
    background-color: oklch(60% 15% 250);
    color: white;
    font-size: 12px;
    line-height: 20px;
  }

  .scroll {
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .list {
    display: grid;
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
      background-color: var(--c-surface);
      font-size: 1.2em;

      & > small {
        font-size: var(--fs-sm);
      }
    }

    & > .pill {
      justify-self: center;
      margin-top: 15px;
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
    font-size: var(--fs-sm);
  }

  .warning {
    background-color: var(--c-warn-bg);
    color: var(--c-warn);
  }

  .remark {
    border: 1px solid var(--c-rule);

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
    border: 1px solid var(--c-rule);

    & + .fake {
      margin-top: -1px;
    }
  }

  .credits {
    gap: 15px;
  }

  .hero {
    display: flex;
    align-items: baseline;
    gap: 5px;

    & > strong {
      font-size: 2.4em;
      line-height: 1;
    }
  }

  // A name, a bar and a figure per row, the bars aligned
  .meters {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
  }

  .meter {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    align-items: center;
    font-size: var(--fs-sm);

    & > span {
      text-align: right;
      white-space: nowrap;

      & > b {
        font-size: 1.2em;
      }
    }
  }

  .bar {
    height: 15px;
    border: 1px solid var(--c-rule);
    background: linear-gradient(
      90deg,
      var(--c-taken-tint) 0 var(--green),
      var(--c-plan-tint) var(--green) var(--yellow),
      transparent var(--yellow)
    );
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0;
    font-size: var(--fs-xs);
    color: var(--c-sub);
  }

  .swatch {
    width: 10px;
    height: 10px;
    border: 1px solid var(--c-rule);

    &.taken {
      background-color: var(--c-taken-tint);
    }

    &.plan {
      margin-left: 10px;
      background-color: var(--c-plan-tint);
    }
  }

  .link {
    all: unset;
    cursor: pointer;
    color: var(--c-accent);
    text-decoration: underline;
  }

  .timetable {
    display: grid;
    height: 400px;
    margin: 15px;
    border: 1px solid var(--c-rule);
  }

  .pill {
    height: 45px;
    padding: 0 20px;
    border: 1px solid var(--c-line);
    border-radius: 10px;
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
