<script lang="ts">
  import {
    mergedCourseIsUnavailable,
    type CellId,
    type CourseId,
    type MergedCourse,
  } from "$lib/akiko";
  import { gradeDisplay } from "./credit-display";
  import SyllabusLink from "./SyllabusLink.svelte";

  let {
    courses,
    catalogYear,
    showSlots,
    showExpects,
    showRemark,
    showGotoCell,
    onShowCell,
    onDragStart,
    onDragEnd,
  }: {
    courses: MergedCourse[];
    catalogYear: number;
    showSlots: boolean;
    showExpects: boolean;
    showRemark: boolean;
    /** Whether each course has a 該当マスを表示 button */
    showGotoCell: boolean;
    onShowCell: (cellId: CellId) => void;
    /** Rows are draggable only with it */
    onDragStart?: (e: DragEvent, courseId: CourseId) => void;
    onDragEnd?: () => void;
  } = $props();

  const colspan = $derived(2 + +showSlots + +showExpects);
</script>

<table>
  <thead>
    <tr class="course">
      <th class="id-name">科目</th>
      <th class="credit">単位</th>
      {#if showSlots}<th class="slots">時限</th>{/if}
      {#if showExpects}<th class="expects">標準<br />履修<br />年次</th>{/if}
    </tr>
  </thead>
  <tbody>
    {#each courses as c (c.id)}
      <tr
        class="course"
        draggable={onDragStart !== undefined}
        ondragstart={(e) => onDragStart?.(e, c.id)}
        ondragend={() => onDragEnd?.()}
      >
        <td class="id-name">
          <span class="course-id">{c.id}</span>
          {#if showGotoCell && c.cellId !== undefined}
            {@const cellId = c.cellId}
            <button class="goto-cell" onclick={() => onShowCell(cellId)}
              >該当マスを表示</button
            >
          {/if}
          <br />
          <SyllabusLink course={c} {catalogYear} />
          {#if c.real}<br /><span>{gradeDisplay(c.real.grade)}</span>{/if}
          {#if mergedCourseIsUnavailable(c)}<br /><span>（非開講）</span>{/if}
        </td>
        <td class="credit">{c.credit ?? "-"}</td>
        {#if showSlots}<td class="slots">{c.known?.slotsString ?? "-"}</td>{/if}
        {#if showExpects}
          <td class="expects">{c.known?.expectsString ?? "-"}</td>
        {/if}
      </tr>
      {#if showRemark}
        <tr class="course-remark">
          {#if c.known?.remark}
            <td {colspan}>{c.known.remark}</td>
          {:else}
            <td {colspan} class="no-remark">（備考なし）</td>
          {/if}
        </tr>
      {/if}
    {/each}
  </tbody>
</table>

<style lang="scss">
  @use "./course-table";

  .course-id {
    vertical-align: middle;
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

  tbody > tr[draggable="true"] {
    cursor: grab;
    &:active {
      cursor: grabbing;
    }
  }
</style>
