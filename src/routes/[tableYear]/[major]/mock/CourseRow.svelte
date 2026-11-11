<script lang="ts">
  import Check from "lucide-svelte/icons/check";
  import Plus from "lucide-svelte/icons/plus";
  import TriangleAlert from "lucide-svelte/icons/triangle-alert";
  import {
    mergedCourseIsUnavailable,
    type AkikoMoveCourseDst,
    type CellId,
    type ListKind,
    type MergedCourse,
  } from "#lib/akiko.ts";
  import { gradeDisplay } from "../credit-display";
  import { syllabusUrl } from "../links";

  let {
    course,
    listKind,
    catalogYear,
    overlaps,
    expanded,
    showGotoCell,
    labelled = false,
    tag,
    onToggleExpanded,
    onMove,
    onShowCell,
  }: {
    course: MergedCourse;
    listKind: ListKind;
    catalogYear: number;
    /** Whether a course in 取る授業 is at the same time */
    overlaps: boolean;
    /** Whether the remark and the links show */
    expanded: boolean;
    showGotoCell: boolean;
    /** Whether the button says what it does, not only shows ＋ or ✓ */
    labelled?: boolean;
    /** Where the course's credits go, for a list not of one cell's courses */
    tag?: { text: string; tone: "need" | "full" | "none" };
    onToggleExpanded: () => void;
    onMove: (dst: AkikoMoveCourseDst) => void;
    onShowCell: (cellId: CellId) => void;
  } = $props();

  const planned = $derived(listKind === "might-take");
  const unavailable = $derived(mergedCourseIsUnavailable(course));
  const details = $derived(
    [
      course.credit !== undefined ? `${course.credit}単位` : undefined,
      course.known?.expectsString
        ? `${course.known.expectsString}年次`
        : undefined,
      course.id,
    ]
      .filter((s) => s !== undefined)
      .join("・"),
  );
</script>

<div
  class="row"
  class:planned
  class:taken={listKind === "taken"}
  class:unavailable={unavailable && !planned}
>
  <button class="main" aria-expanded={expanded} onclick={onToggleExpanded}>
    <strong class="name"
      >{course.name}{course.syllabusYear !== catalogYear
        ? ` (${course.syllabusYear})`
        : ""}</strong
    >
    <span class="meta">
      {#if course.known?.slotsString}
        <span class="slots">{course.known.slotsString}</span>
      {/if}
      <span>{details}</span>
      {#if course.real && listKind !== "taken"}
        <span>{gradeDisplay(course.real.grade)}</span>
      {/if}
      {#if tag}
        <span class="tag {tag.tone}">{tag.text}</span>
      {/if}
      {#if overlaps}
        <span class="overlap"><TriangleAlert size={10} />時間が重複</span>
      {/if}
    </span>
  </button>
  {#if listKind === "taken"}
    <span class="status"
      >{course.real ? gradeDisplay(course.real.grade) : ""}</span
    >
  {:else if unavailable && !planned}
    <span class="status">非開講</span>
  {:else}
    <button
      class="move"
      class:labelled
      aria-label={labelled
        ? undefined
        : planned
          ? "取る授業から外す"
          : "取る授業に追加"}
      aria-pressed={planned}
      onclick={() => onMove(planned ? "wont-take" : "might-take")}
    >
      {#if planned}<Check size={labelled ? 15 : 20} />{:else}<Plus
          size={labelled ? 15 : 20}
        />{/if}
      <!-- A checkbox labelled 取る: checked when planned -->
      {#if labelled}取る{/if}
    </button>
  {/if}
  {#if expanded}
    <div class="more">
      <p class:none={!course.known?.remark}>
        {course.known?.remark || "（備考なし）"}
      </p>
      <nav>
        <a
          href={syllabusUrl(course.id, course.syllabusYear)}
          target="_blank"
          rel="noreferrer">シラバス</a
        >
        {#if showGotoCell && course.cellId !== undefined}
          {@const cellId = course.cellId}
          <button onclick={() => onShowCell(cellId)}>該当マスを表示</button>
        {/if}
      </nav>
    </div>
  {/if}
</div>

<style lang="scss">
  .row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    background-color: var(--c-surface);
    border: 1px solid var(--c-rule);

    :global(.row) + & {
      margin-top: -1px;
    }

    &.planned {
      background-color: var(--c-plan-tint);
    }

    &.taken {
      background-color: var(--c-taken-tint);
    }

    &.unavailable {
      opacity: 0.55;
    }
  }

  .main {
    all: unset;
    cursor: pointer;
    display: grid;
    gap: 5px;
    padding: 10px;
    min-width: 0;
  }

  .name {
    font-weight: bold;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px;
    font-size: var(--fs-xs);
    color: var(--c-sub);
  }

  .slots,
  .tag,
  .overlap {
    padding: 0 5px;
    border-radius: 5px;
  }

  .slots {
    background-color: var(--c-panel);
    color: var(--c-text);
    font-size: var(--fs-sm);
  }

  .tag {
    border: 1px solid currentColor;

    &.need {
      color: var(--c-warn);
    }

    &.none {
      border-style: dashed;
    }
  }

  .overlap {
    display: flex;
    align-items: center;
    gap: 5px;
    background-color: var(--c-warn-bg);
    color: var(--c-warn);
  }

  .status {
    margin-right: 15px;
    font-size: var(--fs-sm);
    font-weight: bold;
    color: var(--c-sub);
    white-space: nowrap;
  }

  .move {
    all: unset;
    cursor: pointer;
    box-sizing: border-box;
    display: grid;
    place-items: center;
    width: 45px;
    height: 45px;
    margin-right: 10px;
    border: 1px solid var(--c-rule);
    border-radius: 50%;
    background-color: var(--c-surface);
  }

  .move.labelled {
    display: flex;
    gap: 5px;
    width: auto;
    height: 35px;
    padding: 0 15px;
    border-radius: 20px;
    font-size: var(--fs-sm);
    font-weight: bold;
  }

  .planned .move {
    background-color: var(--c-plan);
  }

  // The desktop's course remarks
  .more {
    grid-column: 1 / -1;
    display: grid;
    gap: 10px;
    padding: 10px;
    border-top: 1px solid var(--c-line);
    background-color: hsl(0, 0%, 96%);
    font-size: var(--fs-sm);

    & > p {
      margin: 0;
      white-space: pre-line;
      overflow-wrap: anywhere;

      &.none {
        color: var(--c-sub);
      }
    }

    & > nav {
      display: flex;
      gap: 15px;

      & > button {
        all: unset;
        cursor: pointer;
      }

      & > a,
      & > button {
        color: var(--c-accent);
        text-decoration: underline;
      }
    }
  }
</style>
