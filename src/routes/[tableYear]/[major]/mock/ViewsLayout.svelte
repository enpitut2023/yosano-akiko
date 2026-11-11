<script lang="ts">
  import { asset, resolve } from "$app/paths";
  import Check from "lucide-svelte/icons/check";
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import Search from "lucide-svelte/icons/search";
  import X from "lucide-svelte/icons/x";
  import { tick } from "svelte";
  import {
    akikoGetCourseLists,
    akikoGetOccupiedSlots,
    akikoMoveCourse,
    cellIdToColumnId,
    columnIdIsElective,
    courseIdCompare,
    dowToString,
    occupiedSlotsOverlap,
    termToString,
    type Akiko,
    type AkikoMoveCourseDst,
    type CellId,
    type ColumnId,
    type CourseId,
    type CreditStats,
    type FakeCourse,
    type ListKindOverrides,
    type MergedCourse,
    type RealCourse,
  } from "#lib/akiko.ts";
  import type { MajorConfig } from "#lib/app-setup.ts";
  import { wontTakeFiltersDefault } from "../course-filters";
  import ExportTab from "../ExportTab.svelte";
  import ImportTab from "../ImportTab.svelte";
  import type { TimetableTab } from "../timetable";
  import BottomSheet from "./BottomSheet.svelte";
  import CourseRow from "./CourseRow.svelte";
  import CreditBox from "./CreditBox.svelte";
  import { creditsLeft, type ListedCourse } from "./credits";
  import CreditsSummary from "./CreditsSummary.svelte";
  import FindList from "./FindList.svelte";
  import MobileTable from "./MobileTable.svelte";
  import PhoneTimetable from "./PhoneTimetable.svelte";
  import { sheetSnapHeight, type SheetSnap } from "./sheet";
  import { knownCourseIsAt, type TimetableSlot } from "./slots";

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

  type Picker =
    | { kind: "cell"; cellId: CellId }
    | { kind: "slot"; slot: TimetableSlot }
    | { kind: "search" }
    | { kind: "credits" };

  let view = $state<"table" | "timetable">("table");
  let screen = $state<"main" | "import" | "export">("main");
  let picker = $state<Picker | undefined>();
  let snap = $state<SheetSnap>("half");
  let stageHeight = $state(0);
  let term = $state<TimetableTab>("spring-a");

  const selectedCellId = $derived(
    picker?.kind === "cell" ? picker.cellId : undefined,
  );
  const selectedCellStats = $derived(
    selectedCellId !== undefined
      ? creditStats.cells.get(selectedCellId)
      : undefined,
  );
  const coveredHeight = $derived(
    picker ? sheetSnapHeight(snap === "full" ? "half" : snap, stageHeight) : 0,
  );
  const gradesImported = $derived(realCourses.length + fakeCourses.length > 0);
  const total = $derived(creditStats.total);

  // Typed by hand: ESLint can't see the types of a component's exports
  let table = $state<{
    scrollCellIntoView: (cellId: CellId) => void;
    scrollColumnIntoView: (colId: ColumnId) => void;
  }>();

  function openPicker(p: Picker) {
    picker = p;
    screen = "main";
    if (snap !== "half") snap = "half";
  }

  async function showCell(cellId: CellId) {
    view = "table";
    openPicker({ kind: "cell", cellId });
    // The table's bottom margin follows the sheet
    await tick();
    table?.scrollCellIntoView(cellId);
  }

  function showColumn(colId: ColumnId) {
    picker = undefined;
    view = "table";
    table?.scrollColumnIntoView(colId);
  }

  // Ranked when the slot opens, so adding a course doesn't reorder its rows
  let slotRanks = $state.raw(new Map<CourseId, number>());

  function showSlot(slot: TimetableSlot) {
    view = "timetable";
    term = slot.term;
    slotRanks = new Map([
      ...slotLists(slot).mightTake.map((c) => [c.id, 0] as const),
      ...slotLists(slot).wontTake.map(
        (c) => [c.id, tagOf(c).tone === "need" ? 1 : 2] as const,
      ),
    ]);
    openPicker({ kind: "slot", slot });
  }

  const allCourses = $derived(akikoGetCourseLists(akiko, undefined, false));

  /** The courses at the slot, leaving out those that don't count toward graduation. */
  function slotLists(slot: TimetableSlot) {
    const at = (c: MergedCourse) => knownCourseIsAt(c.known, slot);
    return {
      mightTake: allCourses.mightTake.filter(at),
      wontTake: allCourses.wontTake.filter(
        (c) => c.cellId !== undefined && at(c),
      ),
    };
  }

  const slotList = $derived.by<ListedCourse[]>(() => {
    if (picker?.kind !== "slot") return [];
    const lists = slotLists(picker.slot);
    const rank = (c: MergedCourse) => slotRanks.get(c.id) ?? 1;
    return [
      ...lists.mightTake.map((course) => ({
        course,
        listKind: "might-take" as const,
      })),
      ...lists.wontTake.map((course) => ({
        course,
        listKind: "wont-take" as const,
      })),
    ].sort(
      (a, b) =>
        rank(a.course) - rank(b.course) ||
        courseIdCompare(a.course.id, b.course.id),
    );
  });

  /** What a course's credits would do, for a list not of one cell's courses. */
  function tagOf(c: MergedCourse): {
    text: string;
    tone: "need" | "full" | "none";
  } {
    if (c.cellId === undefined)
      return { text: "卒業単位にならない", tone: "none" };
    const cell = creditStats.cells.get(c.cellId);
    if (cell === undefined) return { text: "卒業単位にならない", tone: "none" };
    const cellLeft = creditsLeft(cell, true);
    if (cellLeft > 0)
      return { text: `マスにあと${cellLeft}単位必要`, tone: "need" };
    if (cell.max !== undefined && cell.rawTotal >= cell.max)
      return { text: "マスの上限に達している", tone: "none" };
    const colId = cellIdToColumnId(c.cellId);
    const column = creditStats.columns.get(colId);
    const columnLeft = column ? creditsLeft(column, true) : 0;
    if (columnLeft > 0)
      return { text: `列にあと${columnLeft}単位必要`, tone: "need" };
    if (columnIdIsElective(colId)) {
      const electiveLeft = creditsLeft(creditStats.elective, true);
      if (electiveLeft > 0)
        return { text: `選択にあと${electiveLeft}単位必要`, tone: "need" };
    }
    return { text: "単位は足りている", tone: "full" };
  }

  let showRemark = $state(false);
  let showNonAvailable = $state(false);
  let chosenFilters = $state(wontTakeFiltersDefault());
  let expandedCourseId = $state<CourseId | undefined>();
  const occupiedSlots = $derived(akikoGetOccupiedSlots(akiko));

  const LIMIT_STEP = 100;
  let slotLimit = $state(LIMIT_STEP);
  $effect(() => {
    void picker;
    slotLimit = LIMIT_STEP;
  });

  function moveCourse(courseId: CourseId, dst: AkikoMoveCourseDst) {
    const moved = akikoMoveCourse(akiko, courseId, dst);
    if (moved.kind !== "moved") return;
    listKindOverrides = moved.listKindOverrides;
  }
</script>

{#snippet row(listed: ListedCourse, tagged: boolean)}
  {@const { course, listKind } = listed}
  <CourseRow
    {course}
    {listKind}
    catalogYear={akiko.knownCourseYear}
    overlaps={listKind === "wont-take" &&
      occupiedSlotsOverlap(occupiedSlots, course.known?.slots ?? [])}
    expanded={expandedCourseId === course.id}
    showGotoCell
    labelled
    tag={tagged ? tagOf(course) : undefined}
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
    <nav class="steps" aria-label="手順">
      <button
        class:current={screen === "import"}
        onclick={() => (screen = "import")}
        ><span class="num" class:done={gradesImported}
          >{#if gradesImported}<Check
              size={12}
              strokeWidth={3}
            />{:else}1{/if}</span
        >成績</button
      >
      <ChevronRight size={15} />
      <button
        class:current={screen === "main"}
        onclick={() => (screen = "main")}
        ><span class="num">2</span>授業を選ぶ</button
      >
      <ChevronRight size={15} />
      <button
        class:current={screen === "export"}
        onclick={() => (screen = "export")}
        ><span class="num">3</span>TWINSへ</button
      >
    </nav>
  </header>

  {#if screen === "main"}
    <div class="toolbar">
      <div class="switch">
        <button
          class:active={view === "table"}
          onclick={() => {
            view = "table";
            if (picker?.kind === "slot") picker = undefined;
          }}>表</button
        >
        <button
          class:active={view === "timetable"}
          onclick={() => {
            view = "timetable";
            if (picker?.kind === "cell") picker = undefined;
          }}>時間割</button
        >
      </div>
      <button class="total" onclick={() => openPicker({ kind: "credits" })}>
        卒業まで あと<strong
          >{creditsLeft(
            total,
            false,
          )}{#if total.effectiveMightTake > 0}→{creditsLeft(
              total,
              true,
            )}{/if}</strong
        >単位<ChevronRight size={15} />
      </button>
      <button
        class="search"
        aria-label="授業を探す"
        onclick={() => openPicker({ kind: "search" })}
        ><Search size={20} /></button
      >
    </div>

    {#if !gradesImported}
      <div class="banner">
        <span>成績を読み込むと、取った単位が表に緑で出ます</span>
        <button onclick={() => (screen = "import")}>読み込む</button>
      </div>
    {/if}

    {#if view === "table"}
      <div class="legend">
        <span class="swatch taken"></span>取得済み
        <span class="swatch plan"></span>取る
        <span class="chip">あと2</span>足りない
      </div>
    {/if}
  {/if}

  <div class="stage" bind:clientHeight={stageHeight}>
    <MobileTable
      bind:this={table}
      {config}
      {creditStats}
      {selectedCellId}
      {coveredHeight}
      showLeft
      onSelect={(cellId: CellId | undefined) => {
        if (cellId === undefined) picker = undefined;
        else void showCell(cellId);
      }}
    />

    {#if view === "timetable"}
      <div class="timetable" style:bottom="{coveredHeight}px">
        <PhoneTimetable
          {akiko}
          bind:term
          selected={picker?.kind === "slot" ? picker.slot : undefined}
          onSlot={showSlot}
          onCourse={(courseId: CourseId) => {
            const cellId = akiko.courseIdToCellId.get(courseId);
            if (cellId !== undefined) void showCell(cellId);
          }}
        />
      </div>
    {/if}

    {#if picker}
      {@const p = picker}
      <BottomSheet bind:snap containerHeight={stageHeight}>
        {#snippet peek()}
          <div class="picker-head">
            <div>
              {#if p.kind === "cell" && selectedCellStats}
                {@const left = creditsLeft(selectedCellStats, true)}
                <CreditBox label="このマス" stats={selectedCellStats} />
                <p>
                  {left > 0
                    ? `あと${left}単位。下の授業の「取る」を押して選びます`
                    : "このマスの単位は足りています"}
                </p>
              {:else if p.kind === "slot"}
                <strong
                  >{termToString(p.slot.term)}
                  {dowToString(p.slot.dow)}{p.slot.period}限の授業</strong
                >
                <p>「取る」を押すと時間割に入ります</p>
              {:else if p.kind === "search"}
                <strong>授業を探す</strong>
              {:else}
                <strong>卒業に必要な単位</strong>
              {/if}
            </div>
            <button
              class="close"
              aria-label="閉じる"
              onclick={() => (picker = undefined)}><X size={20} /></button
            >
          </div>
        {/snippet}

        <div class="scroll">
          {#if p.kind === "cell" || p.kind === "search"}
            {@const cellId = p.kind === "cell" ? p.cellId : undefined}
            <FindList
              {akiko}
              {cellId}
              cellStats={selectedCellStats}
              cellRemark={cellId !== undefined
                ? config.getRemark(cellId, config.tableYear, config.major)
                : undefined}
              {occupiedSlots}
              bind:chosenFilters
              bind:showRemark
              bind:showNonAvailable
              bind:expandedCourseId
              labelled
              onMove={moveCourse}
              onShowCell={(cellId: CellId) => void showCell(cellId)}
            />
          {:else if p.kind === "slot"}
            <div class="list">
              <h2>この時間の授業 <small>{slotList.length}件</small></h2>
              {#each slotList.slice(0, slotLimit) as listed (listed.course.id)}
                {@render row(listed, true)}
              {:else}
                <p class="hint">この時間に卒業単位になる授業はありません</p>
              {/each}
              {#if slotList.length > slotLimit}
                <button
                  class="pill more"
                  onclick={() => (slotLimit += LIMIT_STEP)}>さらに表示</button
                >
              {/if}
              <p class="hint">卒業単位にならない授業は出ていません</p>
            </div>
          {:else}
            <CreditsSummary
              {creditStats}
              heading={false}
              onShowColumn={showColumn}
            />
          {/if}
        </div>
      </BottomSheet>
    {/if}

    {#if screen !== "main"}
      <div class="screen">
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
            onShowCell={(cellId: CellId) => void showCell(cellId)}
            onPickCourses={() => (screen = "main")}
            onDownload={() => {}}
          />
        {/if}
        <button class="pill" onclick={() => (screen = "main")}
          >② 授業を選ぶへ</button
        >
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

  header {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 45px;
    padding: 0 10px;
    background-color: var(--c-brand-bg);
    border-bottom: 1px solid var(--c-brand-line);

    & > .akiko {
      flex: none;
      width: 30px;
      height: 30px;
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
  }

  .steps {
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: var(--c-sub);

    & > button {
      all: unset;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px;
      border-radius: 10px;
      font-size: var(--fs-sm);
      white-space: nowrap;

      &.current {
        background-color: var(--c-surface);
        color: var(--c-accent);
        font-weight: bold;
      }
    }
  }

  .num {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border: 1px solid currentColor;
    border-radius: 50%;
    font-size: 12px;

    &.done {
      border-color: var(--c-taken);
      background-color: var(--c-taken);
      color: white;
    }
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 10px;
    border-bottom: 1px solid var(--c-rule);
  }

  .switch {
    flex: none;
    display: flex;
    border: 1px solid var(--c-rule);
    border-radius: 10px;
    overflow: hidden;

    & > button {
      all: unset;
      cursor: pointer;
      padding: 5px 15px;
      font-weight: bold;

      & + button {
        border-left: 1px solid var(--c-rule);
      }

      &.active {
        background-color: var(--c-text);
        color: var(--c-surface);
      }
    }
  }

  .total {
    all: unset;
    cursor: pointer;
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
    gap: 5px;
    font-size: var(--fs-sm);
    white-space: nowrap;

    & > strong {
      font-size: 1.3em;
    }

    & > :global(svg) {
      align-self: center;
      color: var(--c-sub);
    }
  }

  .search {
    all: unset;
    cursor: pointer;
    flex: none;
    display: grid;
    place-items: center;
    width: 35px;
    height: 35px;
  }

  .banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 10px;
    background-color: oklch(95% 0.03 270);
    font-size: var(--fs-sm);

    & > button {
      flex: none;
      padding: 5px 10px;
      border: 1px solid var(--c-rule);
      border-radius: 10px;
      background-color: var(--c-surface);
    }
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 35px;
    padding: 0 10px;
    border-bottom: 1px solid var(--c-line);
    font-size: var(--fs-xs);
    color: var(--c-sub);
    white-space: nowrap;
  }

  .swatch {
    flex: none;
    width: 10px;
    height: 10px;
    border: 1px solid var(--c-rule);

    &.taken {
      background-color: var(--c-taken-tint);
    }

    &.plan {
      margin-left: 5px;
      background-color: var(--c-plan-tint);
    }
  }

  // The table's badge
  .chip {
    margin-left: 5px;
    padding: 0 5px;
    border: 1px solid var(--c-warn);
    border-radius: 5px;
    color: var(--c-warn);
    font-weight: bold;
  }

  .stage {
    flex: 1;
    position: relative;
    min-height: 0;
    overflow: hidden;
  }

  // Over the table, which stays mounted to keep its zoom and scroll
  .timetable {
    position: absolute;
    inset: 0;
    background-color: var(--c-surface);
  }

  .picker-head {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 0 10px 10px;
    border-bottom: 1px solid var(--c-rule);

    & > div {
      flex: 1;
      min-width: 0;
      display: grid;
      gap: 5px;
    }

    & p {
      margin: 0;
      font-size: var(--fs-xs);
      color: var(--c-sub);
    }
  }

  .close {
    all: unset;
    cursor: pointer;
    flex: none;
    display: grid;
    place-items: center;
    width: 35px;
    height: 35px;
  }

  .scroll {
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .more {
    justify-self: center;
    margin-top: 15px;
  }

  .screen {
    position: absolute;
    inset: 0;
    z-index: 6;
    display: grid;
    align-content: start;
    justify-items: center;
    gap: 15px;
    padding: 0 15px 30px;
    overflow-y: auto;
    background-color: var(--c-surface);
  }
</style>
