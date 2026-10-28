<script lang="ts">
  import {
    akikoGetCourseLists,
    akikoGetOccupiedSlots,
    akikoMoveCourse,
    creditSum,
    isCourseId,
    type Akiko,
    type CellId,
    type CourseId,
    type CreditStats,
    type ListKindOverrides,
  } from "$lib/akiko";
  import { trackEvent } from "$lib/analytics";
  import {
    courseMatchesFilters,
    filterChoicesOf,
    filtersActiveCount,
    filtersInEffect,
    wontTakeFiltersDefault,
  } from "./course-filters";
  import CourseFilters from "./CourseFilters.svelte";
  import CourseTable from "./CourseTable.svelte";
  import {
    cellCreditStatsDisplay,
    creditProgressToString,
    electiveCreditStatsDisplay,
  } from "./credit-display";
  import FakeCourseTable from "./FakeCourseTable.svelte";
  import { resizeHandle } from "./gestures";
  import Timetable from "./Timetable.svelte";
  import { timetableTabAfterPlanning, type TimetableTab } from "./timetable";

  let {
    akiko,
    creditStats,
    selectedCellId,
    cellRemark,
    showNonAvailable,
    timetableShowTaken,
    timetableYear = $bindable(),
    timetableTerm = $bindable(),
    onShowCell,
    onMove,
  }: {
    akiko: Akiko;
    creditStats: CreditStats;
    /** Lists only this cell's courses when set */
    selectedCellId: CellId | undefined;
    cellRemark: string | undefined;
    showNonAvailable: boolean;
    timetableShowTaken: boolean;
    timetableYear: number;
    timetableTerm: TimetableTab;
    onShowCell: (cellId: CellId) => void;
    /** Called with the overrides once the user moves a course */
    onMove: (listKindOverrides: ListKindOverrides) => void;
  } = $props();

  let showRemark = $state(false);
  let showAllCourses = $state(false);
  // As chosen; `filters` leaves out the values no longer on offer
  let wontTakeFilters = $state(wontTakeFiltersDefault());

  const courseLists = $derived(
    akikoGetCourseLists(akiko, selectedCellId, showNonAvailable),
  );
  const occupiedSlots = $derived(akikoGetOccupiedSlots(akiko));
  const filterChoices = $derived(filterChoicesOf(courseLists.wontTake));
  const filters = $derived(filtersInEffect(wontTakeFilters, filterChoices));
  const filteredWontTake = $derived(
    courseLists.wontTake.filter((c) =>
      courseMatchesFilters(c, filters, occupiedSlots),
    ),
  );
  const courseListVisible = $derived(
    showAllCourses ||
      selectedCellId !== undefined ||
      filters.courseIdOrName !== "" ||
      filtersActiveCount(filters) > 0,
  );

  // 当てはまる授業 can have thousands of rows, so they're added as the user
  // scrolls down to them
  let wontTakeVisibleLimit = $state(100);
  let leftBarScrollEl = $state<HTMLDivElement | undefined>();
  let wontTakeSentinelEl = $state<HTMLDivElement | undefined>();
  const wontTakeSliced = $derived(
    filteredWontTake.slice(0, wontTakeVisibleLimit),
  );
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
          wontTakeVisibleLimit < filteredWontTake.length
        )
          wontTakeVisibleLimit += 100;
      },
      { root: leftBarScrollEl, rootMargin: "0px 0px 200px 0px" },
    );
    observer.observe(wontTakeSentinelEl);
    return () => observer.disconnect();
  });

  const listCreditTotals = $derived({
    mightTake: creditSum(courseLists.mightTake),
    taken: creditSum(courseLists.taken),
    fake: creditSum(courseLists.fake),
  });
  const selectedCellStats = $derived(
    selectedCellId !== undefined
      ? creditStats.cells.get(selectedCellId)
      : undefined,
  );

  let leftBarEl = $state<HTMLDivElement | undefined>();
  let rightBarEl = $state<HTMLDivElement | undefined>();
  let dropGuide = $state<
    { left: number; top: number; width: number; height: number } | undefined
  >();

  function handleDragStart(
    event: DragEvent,
    courseId: CourseId,
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

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer !== null) e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event: DragEvent, dst: "wont-take" | "might-take") {
    event.preventDefault();
    const courseId = event.dataTransfer?.getData("text/plain");
    if (courseId === undefined || !isCourseId(courseId)) return;
    const moved = akikoMoveCourse(akiko, courseId, dst);
    if (moved.kind === "moved") {
      onMove(moved.listKindOverrides);
      trackEvent(
        "plan",
        dst === "might-take" ? "add-course" : "remove-course",
        courseId,
      );
    }
    if (dst === "might-take") {
      timetableYear = akiko.knownCourseYear;
      timetableTerm = timetableTabAfterPlanning(
        akiko.knownCourses.get(courseId)?.slots ?? [],
        timetableTerm,
      );
    }
  }

  const TIMETABLE_HEIGHT_MIN = 100;
  // Leaves room for the lists below
  const TIMETABLE_MARGIN_BOTTOM = 100;

  let timetableHeight = $state(400);

  function resizeTimetable(e: PointerEvent) {
    if (rightBarEl === undefined) return;
    const top = rightBarEl.getBoundingClientRect().top;
    const snapped = Math.round((e.clientY - top) / 5) * 5;
    timetableHeight = Math.min(
      window.innerHeight - top - TIMETABLE_MARGIN_BOTTOM,
      Math.max(TIMETABLE_HEIGHT_MIN, snapped),
    );
  }
</script>

<div
  bind:this={leftBarEl}
  id="left-bar"
  data-tutorial="left-bar"
  ondragover={handleDragOver}
  ondrop={(e) => handleDrop(e, "wont-take")}
>
  <CourseFilters
    bind:filters={wontTakeFilters}
    choices={filterChoices}
    bind:showRemark
  />
  <div id="left-bar-scroll" bind:this={leftBarScrollEl}>
    {#if courseListVisible}
      <div class="section">
        <h2>
          {selectedCellId ? "当てはまる授業" : "全ての授業"}
          ({filteredWontTake.length}/{courseLists.wontTake.length})
        </h2>
        {#if courseLists.wontTake.length === 0}
          <p>該当する授業がありません</p>
        {:else}
          <CourseTable
            courses={wontTakeSliced}
            catalogYear={akiko.knownCourseYear}
            {showRemark}
            showGotoCell={selectedCellId === undefined}
            {onShowCell}
            showSlots
            showExpects
            onDragStart={(e: DragEvent, courseId: CourseId) =>
              handleDragStart(e, courseId, "wont-take")}
            onDragEnd={handleDragEnd}
          />
        {/if}
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
  {#if cellRemark}
    <div id="cell-remark">
      <h2>備考</h2>
      <p style="white-space: pre-line">{cellRemark}</p>
    </div>
  {/if}
</div>

<div
  bind:this={rightBarEl}
  id="right-bar"
  data-tutorial="right-bar"
  style="grid-template-rows: {timetableHeight}px 1fr"
  ondragover={handleDragOver}
  ondrop={(e) => handleDrop(e, "might-take")}
>
  <Timetable
    year={timetableYear}
    bind:activeTerm={timetableTerm}
    {akiko}
    showTaken={timetableShowTaken}
    onBarClick={(courseId: CourseId) => {
      const cellId = akiko.courseIdToCellId.get(courseId);
      if (cellId !== undefined) onShowCell(cellId);
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
          合計：{creditProgressToString(creditStats.total)}
          {#if electiveWarning}<br />⚠️ {electiveWarning}{/if}
        </p>
      </div>
    {/if}
    <div class="section">
      <div class="list-heading">
        <h2>取る授業</h2>
        {#if listCreditTotals.mightTake > 0}
          <span class="credit-total">{listCreditTotals.mightTake}単位</span>
        {/if}
      </div>
      {#if courseLists.mightTake.length === 0}
        <p class="hint">左の一覧から授業をドラッグしてください</p>
      {:else}
        <CourseTable
          courses={courseLists.mightTake}
          catalogYear={akiko.knownCourseYear}
          {showRemark}
          showGotoCell={selectedCellId === undefined}
          {onShowCell}
          showSlots
          showExpects={false}
          onDragStart={(e: DragEvent, courseId: CourseId) =>
            handleDragStart(e, courseId, "might-take")}
          onDragEnd={handleDragEnd}
        />
      {/if}
    </div>
    {#if courseLists.taken.length > 0}
      <div class="section">
        <div class="list-heading">
          <h2>単位取得済みの授業</h2>
          {#if listCreditTotals.taken > 0}
            <span class="credit-total">{listCreditTotals.taken}単位</span>
          {/if}
        </div>
        <CourseTable
          courses={courseLists.taken}
          catalogYear={akiko.knownCourseYear}
          {showRemark}
          showGotoCell={selectedCellId === undefined}
          {onShowCell}
          showSlots={false}
          showExpects={false}
        />
      </div>
    {/if}
    {#if courseLists.fake.length > 0}
      <div class="section">
        <div class="list-heading">
          <h2>認可された授業</h2>
          <span class="credit-total">{listCreditTotals.fake}単位</span>
        </div>
        <FakeCourseTable courses={courseLists.fake} />
      </div>
    {/if}
  </div>
  <div
    id="timetable-resize-handle"
    style="top: {timetableHeight}px"
    {@attach resizeHandle(resizeTimetable)}
  ></div>
</div>

{#if dropGuide}
  <div
    id="drop-guide"
    style="left:{dropGuide.left}px; top:{dropGuide.top}px; width:{dropGuide.width}px; height:{dropGuide.height}px"
  >
    ここに授業をドロップ
  </div>
{/if}

<style lang="scss">
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

  #right-bar {
    position: relative;
    display: grid;
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

    & .hint {
      color: #444;
    }
  }

  #left-bar-scroll,
  #right-bar-scroll {
    & p {
      margin: 0;
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

  #timetable-resize-handle {
    position: absolute;
    left: 0;
    right: 0;
    height: 10px;
    transform: translateY(-5px);
    cursor: row-resize;
    z-index: 100;
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
</style>
