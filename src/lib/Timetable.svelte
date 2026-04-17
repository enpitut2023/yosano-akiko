<script lang="ts">
  import {
    courseIdCompare,
    termToString,
    type CourseId,
    type Dow,
    type Grade,
    type KnownCourse,
    type RealCourse,
    type Term,
  } from "$lib/akiko";

  export type TimetableTab = Term | "other";

  type Props = {
    year: number;
    activeTerm: TimetableTab;
    mightTakeCourseIds: CourseId[];
    takenCourseIds: CourseId[];
    showTaken: boolean;
    knownCoursesMap: Map<CourseId, KnownCourse>;
    realCoursesMap: Map<CourseId, RealCourse>;
    onBarClick: (courseId: CourseId) => void;
    onBarDragStart: (event: DragEvent, courseId: CourseId) => void;
    onBarDragEnd: () => void;
  };

  let {
    year,
    activeTerm = $bindable(),
    mightTakeCourseIds,
    takenCourseIds,
    showTaken,
    knownCoursesMap,
    realCoursesMap,
    onBarClick,
    onBarDragStart,
    onBarDragEnd,
  }: Props = $props();

  const TERMS: Term[] = [
    "spring-a",
    "spring-b",
    "spring-c",
    "autumn-a",
    "autumn-b",
    "autumn-c",
  ];
  const DAYS = ["月", "火", "水", "木", "金"] as const;
  const PERIODS = [1, 2, 3, 4, 5, 6] as const;
  const DOW_COL: Partial<Record<Dow, number>> = {
    mon: 0,
    tue: 1,
    wed: 2,
    thu: 3,
    fri: 4,
  };

  type Bar = {
    x: number;
    yStart: number;
    yEnd: number;
    courseId: CourseId;
    courseName: string;
    nudge: number;
    taken: boolean;
  };

  function posKey(term: Term, x: number, y: number): string {
    return `${term}:${x}:${y}`;
  }

  function getSyllabusUrl(
    courseId: string,
    takenYear: number | undefined,
  ): string {
    return `https://kdb.tsukuba.ac.jp/syllabi/${takenYear ?? year}/${courseId}/jpn`;
  }

  function gradeDisplay(g: Grade): string {
    if (g === "wip") return "（履修中）";
    if (g === "d" || g === "fail") return "（落単済み）";
    if (g === "pass") return "評価：P";
    return `評価：${g.toUpperCase()}`;
  }

  const TIMETABLE_TERMS = new Set<Term>([
    "spring-a",
    "spring-b",
    "spring-c",
    "autumn-a",
    "autumn-b",
    "autumn-c",
  ]);

  const otherTabCourses = $derived.by(() => {
    const ids = [...mightTakeCourseIds];
    if (showTaken) {
      for (const id of takenCourseIds) {
        if (realCoursesMap.get(id)?.takenYear === year) ids.push(id);
      }
    }
    return ids
      .filter((id) => {
        const kc = knownCoursesMap.get(id);
        return (
          kc?.slots.some(
            (s) => !TIMETABLE_TERMS.has(s.term) || s.when.kind !== "regular",
          ) ?? false
        );
      })
      .map((id) => ({
        id,
        kc: knownCoursesMap.get(id),
        rc: realCoursesMap.get(id),
        draggable: mightTakeCourseIds.includes(id),
      }))
      .sort((a, b) => courseIdCompare(a.id, b.id));
  });

  const bars = $derived.by(() => {
    if (activeTerm === "other") return [];

    const map = new Map<string, Map<CourseId, Bar>>();

    const ids = [...mightTakeCourseIds];
    if (showTaken) {
      for (const courseId of takenCourseIds) {
        if (realCoursesMap.get(courseId)?.takenYear === year)
          ids.push(courseId);
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
        inner.set(courseId, {
          x,
          yStart: y,
          yEnd: y,
          courseId,
          courseName: name,
          nudge: 0,
          taken: takenCourseIds.includes(courseId),
        });
        map.set(k, inner);
      }
    }

    for (let x = 0; x < 5; x++) {
      for (let y = 1; y < 6; y++) {
        const here = map.get(posKey(activeTerm, x, y));
        const above = map.get(posKey(activeTerm, x, y - 1));
        if (!here || !above) continue;
        for (const [courseId] of here) {
          const barAbove = above.get(courseId);
          if (!barAbove) continue;
          barAbove.yEnd = y;
          here.set(courseId, barAbove); // alias so y+1 can extend further
        }
      }
    }

    const unique = new Set<Bar>();
    for (const inner of map.values()) {
      for (const bar of inner.values()) unique.add(bar);
    }

    // Group unique bars by column, then greedily layer to avoid overlap.
    // Sort key: taken, length asc (longer first), yStart asc, then courseId.
    const byX = new Map<number, Bar[]>();
    for (const bar of unique) {
      const col = byX.get(bar.x) ?? [];
      col.push(bar);
      byX.set(bar.x, col);
    }
    for (const col of byX.values()) {
      col.sort((a, b) => {
        if (a.taken !== b.taken) return a.taken ? -1 : 1;
        const aLen = a.yEnd - a.yStart;
        const bLen = b.yEnd - b.yStart;
        if (aLen !== bLen) return bLen - aLen;
        if (a.yStart !== b.yStart) return a.yStart - b.yStart;
        return courseIdCompare(a.courseId, b.courseId);
      });
      let remaining = col;
      let nudge = 0;
      while (remaining.length > 0) {
        const layer: Bar[] = [];
        const next: Bar[] = [];
        for (const bar of remaining) {
          if (layer.some((l) => l.yStart <= bar.yEnd && bar.yStart <= l.yEnd)) {
            next.push(bar);
          } else {
            bar.nudge = nudge;
            layer.push(bar);
          }
        }
        remaining = next;
        nudge++;
      }
    }

    return [...unique].sort((a, b) => a.nudge - b.nudge);
  });
</script>

<div class="timetable">
  <div class="term-tabs">
    {#each TERMS as term}
      <button
        class:active={activeTerm === term}
        onclick={() => (activeTerm = term)}>{termToString(term)}</button
      >
    {/each}
    <button
      class:active={activeTerm === "other"}
      onclick={() => (activeTerm = "other")}>その他</button
    >
  </div>
  {#if activeTerm === "other"}
    <div class="other-tab">
      {#if otherTabCourses.length === 0}
        <p>該当する授業はありません</p>
      {:else}
        <table>
          <thead>
            <tr>
              <th class="id-name">科目</th>
              <th class="credit">単位</th>
              <th class="slots">時限</th>
            </tr>
          </thead>
          <tbody>
            {#each otherTabCourses as { id, kc, rc, draggable }}
              <tr
                {draggable}
                ondragstart={(e) => {
                  if (draggable) onBarDragStart(e, id);
                }}
                ondragend={() => onBarDragEnd()}
              >
                <td class="id-name">
                  <span>{id}</span><br />
                  <a
                    href={getSyllabusUrl(id, rc?.takenYear)}
                    target="_blank"
                    draggable="false">{rc?.name ?? kc?.name ?? "（不明）"}</a
                  >
                  {#if rc?.grade}<br /><span>{gradeDisplay(rc.grade)}</span
                    >{/if}
                </td>
                <td class="credit">{rc?.credit ?? kc?.credit ?? "-"}</td>
                <td class="slots">{kc?.slotsString || "-"}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  {:else}
    <div class="grid">
      <div class="tt-cell tt-corner" style="grid-column: 1; grid-row: 1"></div>
      {#each DAYS as day, di}
        <div
          class="tt-cell tt-header"
          style="grid-column: {di + 2}; grid-row: 1"
        >
          {day}
        </div>
      {/each}
      {#each PERIODS as period, pi}
        {@const lastRow = pi === PERIODS.length - 1}
        <div
          class="tt-cell tt-period"
          class:last-row={lastRow}
          style="grid-column: 1; grid-row: {pi + 2}"
        >
          {period}
        </div>
        {#each [0, 1, 2, 3, 4] as _, di}
          <div
            class="tt-cell"
            class:last-row={lastRow}
            style="grid-column: {di + 2}; grid-row: {pi + 2}"
          ></div>
        {/each}
      {/each}
      {#each bars as bar}
        <div
          class="bar-outer"
          style="grid-column: {bar.x + 2}; grid-row: {bar.yStart +
            2} / {bar.yEnd + 3}; --nudge: {bar.nudge}"
        >
          <div
            class="bar-inner"
            class:taken={bar.taken}
            draggable={mightTakeCourseIds.includes(bar.courseId)}
            onclick={() => onBarClick(bar.courseId)}
            ondragstart={(e) => onBarDragStart(e, bar.courseId)}
            ondragend={() => onBarDragEnd()}
          >
            <span class="bar-id">{bar.courseId}</span>
            <span class="bar-name">{bar.courseName}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .timetable {
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
    font-size: 10px;
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
      font-size: 1.1em;

      &:last-child {
        border-right: none;
      }
      &:hover {
        background-color: oklch(0.95 0 0);
      }
      &.active {
        font-weight: bold;
        background-color: oklch(0.93 0 0);
      }
    }
  }

  .grid {
    display: grid;
    grid-template-columns: auto repeat(5, 1fr);
    grid-template-rows: auto repeat(6, 1fr);
    overflow: hidden;
  }

  .other-tab {
    overflow-y: auto;
    padding: 8px;

    table,
    th,
    td {
      border: 1px solid black;
      border-collapse: collapse;
    }

    table {
      width: 100%;
    }

    th {
      white-space: nowrap;
    }

    tbody > tr[draggable="true"] {
      cursor: grab;
      &:active {
        cursor: grabbing;
      }
    }
  }

  .tt-cell {
    border: 0.5px solid black;
  }

  .tt-header,
  .tt-corner {
    border-top: none;
  }

  .tt-cell.last-row {
    border-bottom: none;
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
    padding-left: calc(2px + var(--nudge, 0) * 10px);
    overflow: hidden;
    z-index: var(--nudge, 0);
    pointer-events: none;
  }

  .bar-inner {
    height: 100%;
    box-sizing: border-box;
    background-color: oklch(85% 0.15 95);
    border: 1px solid oklch(70% 0.18 95);
    border-radius: 3px;

    &.taken {
      background-color: oklch(80% 0.15 145);
      border-color: oklch(65% 0.18 145);
    }
    padding: 1px 3px;
    overflow: hidden;
    pointer-events: auto;
    user-select: none;
    cursor: pointer;

    &[draggable="true"] {
      cursor: grab;
    }
    &[draggable="true"]:active {
      cursor: grabbing;
    }
    &:hover {
      filter: brightness(0.9);
    }
  }

  .bar-id {
    font-size: 0.8em;
    opacity: 0.7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  .bar-name {
    font-size: 0.9em;
    display: block;
    word-break: break-all;
  }
</style>
