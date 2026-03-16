<script lang="ts">
  import {
    termToString,
    type CourseId,
    type Dow,
    type KnownCourse,
    type RealCourse,
    type Term,
  } from "$lib/akiko";

  type Props = {
    year: number;
    mightTakeCourseIds: CourseId[];
    takenCourseIds: CourseId[];
    showTaken: boolean;
    knownCoursesMap: Map<CourseId, KnownCourse>;
    realCoursesMap: Map<CourseId, RealCourse>;
  };

  let {
    year,
    mightTakeCourseIds,
    takenCourseIds,
    showTaken,
    knownCoursesMap,
    realCoursesMap,
  }: Props = $props();

  const TERMS: Term[] = [
    "spring-a", "spring-b", "spring-c",
    "autumn-a", "autumn-b", "autumn-c",
  ];
  const DAYS = ["月", "火", "水", "木", "金"] as const;
  const PERIODS = [1, 2, 3, 4, 5, 6] as const;
  const DOW_COL: Partial<Record<Dow, number>> = {
    mon: 0, tue: 1, wed: 2, thu: 3, fri: 4,
  };

  let activeTerm = $state<Term>("spring-a");

  type Bar = {
    x: number;
    yStart: number;
    yEnd: number;
    courseId: CourseId;
    courseName: string;
  };

  function posKey(term: Term, x: number, y: number): string {
    return `${term}:${x}:${y}`;
  }

  const bars = $derived.by(() => {
    const map = new Map<string, Map<CourseId, Bar>>();

    const ids = [...mightTakeCourseIds];
    if (showTaken) {
      for (const courseId of takenCourseIds) {
        if (realCoursesMap.get(courseId)?.takenYear === year) ids.push(courseId);
      }
    }
    for (const courseId of ids) {
      const kc = knownCoursesMap.get(courseId);
      if (!kc) continue;
      const rc = realCoursesMap.get(courseId);
      const name = rc?.name ?? kc.name;
      for (const slot of kc.slots) {
        if (slot.term !== activeTerm) continue;
        if (slot.when.kind !== "regular") continue;
        const x = DOW_COL[slot.when.dow];
        if (x === undefined) continue;
        const y = slot.when.period - 1;
        if (y < 0 || y > 5) continue;
        const k = posKey(activeTerm, x, y);
        const inner = map.get(k) ?? new Map<CourseId, Bar>();
        inner.set(courseId, { x, yStart: y, yEnd: y, courseId, courseName: name });
        map.set(k, inner);
      }
    }

    for (let x = 0; x < 5; x++) {
      for (let y = 1; y < 6; y++) {
        const here = map.get(posKey(activeTerm, x, y));
        const above = map.get(posKey(activeTerm, x, y - 1));
        if (!here || !above) continue;
        for (const [courseId, bar] of here) {
          const barAbove = above.get(courseId);
          if (!barAbove) continue;
          barAbove.yEnd = y;
          here.set(courseId, barAbove); // alias so y+1 can extend further
        }
      }
    }

    const result = new Set<Bar>();
    for (const inner of map.values()) {
      for (const bar of inner.values()) result.add(bar);
    }
    return [...result];
  });
</script>

<div class="timetable">
  <div class="term-tabs">
    {#each TERMS as term}
      <button
        class:active={activeTerm === term}
        onclick={() => (activeTerm = term)}
      >{termToString(term)}</button>
    {/each}
  </div>
  <div class="grid">
    <div class="tt-cell tt-corner" style="grid-column: 1; grid-row: 1"></div>
    {#each DAYS as day, di}
      <div class="tt-cell tt-header" style="grid-column: {di + 2}; grid-row: 1">{day}</div>
    {/each}
    {#each PERIODS as period, pi}
      <div class="tt-cell tt-period" style="grid-column: 1; grid-row: {pi + 2}">{period}</div>
      {#each [0, 1, 2, 3, 4] as _, di}
        <div class="tt-cell" style="grid-column: {di + 2}; grid-row: {pi + 2}"></div>
      {/each}
    {/each}
    {#each bars as bar}
      <div
        class="bar-outer"
        style="grid-column: {bar.x + 2}; grid-row: {bar.yStart + 2} / {bar.yEnd + 3}"
      >
        <div class="bar-inner">
          <span class="bar-name">{bar.courseName}</span>
        </div>
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .timetable {
    border-top: 1px dashed black;
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
  }

  .term-tabs {
    display: flex;
    border-bottom: 1px solid black;

    & > button {
      flex: 1;
      padding: 3px 0;
      background: none;
      border: none;
      border-right: 1px solid black;
      cursor: pointer;
      font-size: 11px;

      &:last-child { border-right: none; }
      &:hover { background-color: oklch(0.95 0 0); }
      &.active { font-weight: bold; background-color: oklch(0.93 0 0); }
    }
  }

  .grid {
    display: grid;
    grid-template-columns: auto repeat(5, 1fr);
    grid-template-rows: auto repeat(6, 1fr);
    overflow: hidden;
  }

  .tt-cell {
    border: 0.5px solid black;
    font-size: 10px;
  }

  .tt-header,
  .tt-period,
  .tt-corner {
    background-color: oklch(0.95 0 0);
    text-align: center;
    font-weight: bold;
    padding: 2px 3px;
  }

  .bar-outer {
    padding: 2px;
    pointer-events: none;
    overflow: hidden;
  }

  .bar-inner {
    height: 100%;
    box-sizing: border-box;
    background-color: oklch(80% 0.12 270);
    border: 1px solid oklch(60% 0.15 270);
    border-radius: 3px;
    padding: 1px 3px;
    overflow: hidden;
  }

  .bar-name {
    font-size: 9px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }
</style>
