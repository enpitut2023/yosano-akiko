<script lang="ts">
  import {
    akikoGetCourseLists,
    courseIdCompare,
    coursesCreditSum,
    occupiedSlotsOverlap,
    type Akiko,
    type AkikoMoveCourseDst,
    type CellCreditStats,
    type CellId,
    type CourseId,
    type OccupiedSlots,
  } from "#lib/akiko.ts";
  import {
    courseMatchesFilters,
    filterChoicesOf,
    filtersActiveCount,
    filtersInEffect,
    type WontTakeFilters,
  } from "../course-filters";
  import CourseFilters from "../CourseFilters.svelte";
  import { cellCreditStatsDisplay } from "../credit-display";
  import CourseRow from "./CourseRow.svelte";
  import type { ListedCourse } from "./credits";

  let {
    akiko,
    cellId,
    cellStats,
    cellRemark,
    occupiedSlots,
    chosenFilters = $bindable(),
    showRemark = $bindable(),
    showNonAvailable = $bindable(),
    expandedCourseId = $bindable(),
    labelled,
    onMove,
    onShowCell,
  }: {
    akiko: Akiko;
    /** The cell whose courses are listed, or undefined for all courses */
    cellId: CellId | undefined;
    cellStats: CellCreditStats | undefined;
    cellRemark: string | undefined;
    occupiedSlots: OccupiedSlots;
    /** As chosen; the list leaves out the values no longer on offer */
    chosenFilters: WontTakeFilters;
    showRemark: boolean;
    showNonAvailable: boolean;
    expandedCourseId: CourseId | undefined;
    /** Whether the rows' buttons say what they do */
    labelled: boolean;
    onMove: (courseId: CourseId, dst: AkikoMoveCourseDst) => void;
    onShowCell: (cellId: CellId) => void;
  } = $props();

  const cellLists = $derived(
    akikoGetCourseLists(akiko, cellId, showNonAvailable),
  );
  const filterChoices = $derived(filterChoicesOf(cellLists.wontTake));
  const filters = $derived(filtersInEffect(chosenFilters, filterChoices));
  const visible = $derived(
    cellId !== undefined ||
      filters.courseIdOrName !== "" ||
      filtersActiveCount(filters) > 0,
  );

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
    void cellId;
    limit = LIMIT_STEP;
  });

  const warning = $derived(
    cellStats && cellCreditStatsDisplay(cellStats).warning,
  );
</script>

{#snippet row({ course, listKind }: ListedCourse)}
  <CourseRow
    {course}
    {listKind}
    catalogYear={akiko.knownCourseYear}
    overlaps={listKind === "wont-take" &&
      occupiedSlotsOverlap(occupiedSlots, course.known?.slots ?? [])}
    expanded={showRemark || expandedCourseId === course.id}
    showGotoCell={cellId === undefined}
    {labelled}
    onToggleExpanded={() =>
      (expandedCourseId =
        expandedCourseId === course.id ? undefined : course.id)}
    onMove={(dst: AkikoMoveCourseDst) => onMove(course.id, dst)}
    {onShowCell}
  />
{/snippet}

<CourseFilters
  bind:filters={chosenFilters}
  choices={filterChoices}
  bind:showRemark
  bind:showNonAvailable
/>
<div class="list">
  {#if warning}<p class="warning">⚠️ {warning}</p>{/if}
  {#if cellRemark}
    <details class="remark">
      <summary>このマスの備考</summary>
      <p>{cellRemark}</p>
    </details>
  {/if}
  {#if visible}
    <h2>
      {cellId ? "当てはまる授業" : "全ての授業"}
      <small>{candidates.length}件</small>
    </h2>
    {#each candidates.slice(0, limit) as listed (listed.course.id)}
      {@render row(listed)}
    {:else}
      <p class="hint">該当する授業がありません</p>
    {/each}
    {#if candidates.length > limit}
      <button class="pill more" onclick={() => (limit += LIMIT_STEP)}
        >さらに表示</button
      >
    {/if}
    {#if cellId !== undefined && cellLists.taken.length > 0}
      <h2>
        単位取得済みの授業
        <small>{coursesCreditSum(cellLists.taken)}単位</small>
      </h2>
      {#each cellLists.taken as course (course.id)}
        {@render row({ course, listKind: "taken" })}
      {/each}
    {/if}
    {#if cellId !== undefined && cellLists.fake.length > 0}
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

<style lang="scss">
  .more {
    justify-self: center;
    margin-top: 15px;
  }

  .remark {
    margin: 15px 0 0;
    padding: 10px;
    font-size: var(--fs-sm);
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
</style>
