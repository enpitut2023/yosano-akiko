<script lang="ts">
  import { asset, resolve } from "$app/paths";
  import CalendarDays from "lucide-svelte/icons/calendar-days";
  import GraduationCap from "lucide-svelte/icons/graduation-cap";
  import ListChecks from "lucide-svelte/icons/list-checks";
  import Search from "lucide-svelte/icons/search";
  import { tick, untrack } from "svelte";
  import {
    akikoGetCourseLists,
    akikoGetOccupiedSlots,
    akikoMoveCourse,
    courseIdCompare,
    coursesCreditSum,
    occupiedSlotsOverlap,
    type Akiko,
    type AkikoMoveCourseDst,
    type CellId,
    type ColumnId,
    type CourseId,
    type CreditStats,
    type FakeCourse,
    type ListKindOverrides,
    type RealCourse,
  } from "#lib/akiko.ts";
  import type { MajorConfig } from "#lib/app-setup.ts";
  import { MAJOR_TO_JA } from "#lib/constants.ts";
  import { wontTakeFiltersDefault } from "../course-filters";
  import ExportTab from "../ExportTab.svelte";
  import ImportTab from "../ImportTab.svelte";
  import Timetable from "../Timetable.svelte";
  import { timetableTabAfterPlanning, type TimetableTab } from "../timetable";
  import BottomSheet from "./BottomSheet.svelte";
  import CourseRow from "./CourseRow.svelte";
  import CreditBox from "./CreditBox.svelte";
  import type { ListedCourse } from "./credits";
  import CreditsSummary from "./CreditsSummary.svelte";
  import FindList from "./FindList.svelte";
  import MobileTable from "./MobileTable.svelte";
  import { sheetSnapHeight, type SheetSnap, type SheetTab } from "./sheet";

  let {
    config,
    akiko,
    creditStats,
    realCourses,
    fakeCourses,
    native = $bindable(),
    listKindOverrides = $bindable(),
    onImport,
    onReset,
  }: {
    config: MajorConfig;
    akiko: Akiko;
    creditStats: CreditStats;
    realCourses: RealCourse[];
    fakeCourses: FakeCourse[];
    native: boolean;
    listKindOverrides: ListKindOverrides;
    onImport: (file: File) => void;
    onReset: () => void;
  } = $props();

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
  let chosenFilters = $state(wontTakeFiltersDefault());
  let expandedCourseId = $state<CourseId | undefined>();

  const occupiedSlots = $derived(akikoGetOccupiedSlots(akiko));
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

<div class="layout">
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
            <CreditBox label="選択中のマス" stats={selectedCellStats} />
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
          <FindList
            {akiko}
            cellId={selectedCellId}
            cellStats={selectedCellStats}
            cellRemark={selectedCellRemark}
            {occupiedSlots}
            bind:chosenFilters
            bind:showRemark
            bind:showNonAvailable
            bind:expandedCourseId
            labelled={false}
            onMove={moveCourse}
            onShowCell={(cellId: CellId) => void showCell(cellId)}
          />
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
          <CreditsSummary {creditStats} onShowColumn={showColumn} />
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
            {onImport}
            {onReset}
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
  .layout {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
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
      padding: 10px 0;
      border: 1px solid var(--c-rule);
      // The rule under the tabs is their bottom edge. Overlapping it instead
      // misaligns by a device pixel at fractional pixel ratios.
      border-bottom: none;
      border-radius: 10px 10px 0 0;
      background-color: var(--c-panel);
      color: var(--c-sub);
      font-size: var(--fs-sm);
      white-space: nowrap;

      &.active {
        background-color: var(--c-surface);

        // Hides the rule between its sides, so it joins its content. It spills
        // past the rule both ways: an exact fit leaves an antialiased hairline
        // at fractional pixel ratios.
        &::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -2px;
          height: 4px;
          background-color: var(--c-surface);
        }
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

  .timetable {
    display: grid;
    height: 400px;
    margin: 15px;
    border: 1px solid var(--c-rule);
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
