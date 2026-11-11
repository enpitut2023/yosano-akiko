<script lang="ts">
  import Plus from "lucide-svelte/icons/plus";
  import {
    akikoGetMergedCourse,
    akikoGetMightTakeCourseIds,
    akikoGetTakenCourseIds,
    dowToString,
    termToString,
    type Akiko,
    type CourseId,
    type MergedCourse,
  } from "#lib/akiko.ts";
  import type { TimetableTab } from "../timetable";
  import {
    slotIsAt,
    slotIsInTimetable,
    TIMETABLE_DOWS,
    TIMETABLE_PERIODS,
    TIMETABLE_TERMS,
    type TimetableSlot,
  } from "./slots";

  let {
    akiko,
    term = $bindable(),
    selected,
    onSlot,
    onCourse,
  }: {
    akiko: Akiko;
    term: TimetableTab;
    selected: TimetableSlot | undefined;
    onSlot: (slot: TimetableSlot) => void;
    onCourse: (courseId: CourseId) => void;
  } = $props();

  type Entry = { course: MergedCourse; taken: boolean };

  // This year's: the planned courses, and those already passed this year
  const entries = $derived(
    [
      ...akikoGetMightTakeCourseIds(akiko).map((id) => ({ id, taken: false })),
      ...akikoGetTakenCourseIds(akiko)
        .filter(
          (id) =>
            akiko.realCourses.get(id)?.takenYear === akiko.knownCourseYear,
        )
        .map((id) => ({ id, taken: true })),
    ].flatMap(({ id, taken }): Entry[] => {
      const course = akikoGetMergedCourse(akiko, id);
      return course ? [{ course, taken }] : [];
    }),
  );

  function entriesAt(at: TimetableSlot): Entry[] {
    return entries.filter((e) =>
      e.course.known?.slots.some((s) => slotIsAt(s, at)),
    );
  }

  const others = $derived(
    entries.filter(
      (e) => !(e.course.known?.slots.every(slotIsInTimetable) ?? false),
    ),
  );
</script>

<div class="tt">
  <div class="terms">
    {#each TIMETABLE_TERMS as t (t)}
      <button class:active={term === t} onclick={() => (term = t)}
        >{termToString(t)}</button
      >
    {/each}
    <button class:active={term === "other"} onclick={() => (term = "other")}
      >その他</button
    >
  </div>
  {#if term === "other"}
    <div class="others">
      {#each others as { course, taken } (course.id)}
        <button class="course" class:taken onclick={() => onCourse(course.id)}>
          <strong>{course.name}</strong>
          <span>{course.known?.slotsString || "時間不明"}</span>
        </button>
      {:else}
        <p class="hint">
          集中講義など、曜日と時限の決まっていない授業がここに出ます
        </p>
      {/each}
    </div>
  {:else}
    {@const shownTerm = term}
    <div class="grid">
      <span></span>
      {#each TIMETABLE_DOWS as dow (dow)}
        <span class="head">{dowToString(dow)}</span>
      {/each}
      {#each TIMETABLE_PERIODS as period (period)}
        <span class="head">{period}</span>
        {#each TIMETABLE_DOWS as dow (dow)}
          {@const at = { term: shownTerm, dow, period }}
          {@const here = entriesAt(at)}
          <button
            class="slot"
            class:selected={selected !== undefined &&
              selected.term === shownTerm &&
              selected.dow === dow &&
              selected.period === period}
            class:clash={here.filter((e) => !e.taken).length > 1}
            aria-label="{termToString(shownTerm)} {dowToString(dow)}{period}"
            onclick={() => onSlot(at)}
          >
            {#each here as { course, taken } (course.id)}
              <span class="course" class:taken>{course.name}</span>
            {:else}
              <Plus size={15} />
            {/each}
          </button>
        {/each}
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .tt {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
    min-height: 0;
  }

  .terms {
    display: flex;
    border-bottom: 1px solid var(--c-rule);

    & > button {
      all: unset;
      cursor: pointer;
      flex: 1;
      padding: 10px 0;
      text-align: center;
      font-size: var(--fs-sm);
      color: var(--c-sub);

      &.active {
        box-shadow: inset 0 -3px 0 var(--c-tab-accent);
        color: var(--c-accent);
        font-weight: bold;
      }
    }
  }

  .grid {
    display: grid;
    grid-template-columns: 20px repeat(5, minmax(0, 1fr));
    grid-template-rows: auto repeat(6, minmax(0, 1fr));
    min-height: 0;
  }

  .head {
    display: grid;
    place-items: center;
    padding: 5px 0;
    background-color: var(--c-panel);
    font-size: var(--fs-xs);
    font-weight: bold;
  }

  .slot {
    all: unset;
    cursor: pointer;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    gap: 5px;
    min-height: 0;
    padding: 5px;
    overflow: hidden;
    border-left: 1px solid var(--c-line);
    border-top: 1px solid var(--c-line);

    & > :global(svg) {
      align-self: center;
      color: var(--c-line);
    }

    &.selected {
      outline: 3px solid #0066ff;
      outline-offset: -3px;
    }

    &.clash {
      background-color: var(--c-warn-bg);
    }
  }

  .course {
    flex: none;
    padding: 0 5px;
    border-left: 3px solid var(--c-plan);
    background-color: var(--c-plan-tint);
    color: var(--c-text);
    font-size: 11px;
    line-height: 1.3;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;

    &.taken {
      border-left-color: var(--c-taken);
      background-color: var(--c-taken-tint);
    }
  }

  .others {
    display: grid;
    align-content: start;
    gap: 5px;
    padding: 15px;
    overflow-y: auto;

    & > .course {
      all: unset;
      cursor: pointer;
      display: grid;
      gap: 5px;
      padding: 10px;
      border-left: 3px solid var(--c-plan);
      background-color: var(--c-plan-tint);
      font-size: var(--fs-sm);

      &.taken {
        border-left-color: var(--c-taken);
        background-color: var(--c-taken-tint);
      }
    }
  }
</style>
