<script lang="ts">
  import { AkikoApp } from "$lib/akiko.svelte";
  import { MAJOR_TO_JA } from "$lib/constants";
  import { parseImportedCsv } from "$lib/csv";
  import {
    akikoIsCourseVisible,
    courseIdCompare,
    gradeIsPass,
    isCellId,
    isCourseId,
    type CourseId,
    type CellId,
  } from "$lib/akiko";
  import warningIcon from "$lib/icons/warning.svg";
  import importIcon from "$lib/icons/import.svg";
  import exportIcon from "$lib/icons/export.svg";
  import trashIcon from "$lib/icons/trash.svg";
  import searchIcon from "$lib/icons/search.svg";
  import akikoPng from "$lib/images/akiko.png";
  import { assert } from "@/util.js";

  let { data } = $props();
  let app = $derived(new AkikoApp(data.config));

  let barsVisible = $state(true);
  let scrollX = $state(0);

  const scale = $derived(
    data.config.tableViewBox ? 2048 / data.config.tableViewBox.width : 1,
  );
  const cellRects = $derived(
    Object.entries(data.config.cellIdToRectRecord).map(([id, rect]) => {
      assert(isCellId(id), `Bad cell id: "${id}"`);
      return {
        id,
        x: rect.x * scale,
        y: rect.y * scale,
        width: rect.width * scale,
        height: rect.height * scale,
      };
    }),
  );

  function handleCsvUpload(event: Event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const file = input.files?.[0];
    if (!file) return;
    file.text().then((csv) => {
      const result = parseImportedCsv(csv);
      if (result.kind === "ok") {
        app.importCSV(result.realCourses, result.fakeCourses);
      } else {
        alert("CSVファイルを正しく読み込めませんでした。");
      }
    });
  }

  function getSyllabusUrl(courseId: string, year: number) {
    return `https://kdb.tsukuba.ac.jp/syllabi/${year}/${courseId}/jpn`;
  }

  function handleDragStart(
    event: DragEvent,
    courseId: string,
    cellId: string,
    listKind: "wont-take" | "might-take",
  ) {
    if (event.dataTransfer) {
      event.dataTransfer.setData("text/plain", `${courseId},${cellId}`);
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

  function handleDrop(
    event: DragEvent,
    targetListKind: "wont-take" | "might-take",
  ) {
    event.preventDefault();
    const data = event.dataTransfer?.getData("text/plain");
    if (!data) return;
    const courseId = data.split(",")[0];
    if (!isCourseId(courseId)) return;
    if (targetListKind === "might-take") {
      if (!app.mightTakeCourseIds.includes(courseId)) {
        app.mightTakeCourseIds = [...app.mightTakeCourseIds, courseId];
      }
    } else {
      app.mightTakeCourseIds = app.mightTakeCourseIds.filter(
        (id) => id !== courseId,
      );
    }
  }

  // Grouped courses for the UI
  const groupedCourses = $derived.by(() => {
    const wontTake: any[] = [];
    const mightTake: any[] = [];
    const taken: any[] = [];
    const fake: any[] = [];

    if (!app.selectedCellId) return { wontTake, mightTake, taken, fake };

    const cellId = app.selectedCellId;
    for (const [courseId, pos] of app.akiko.coursePositions) {
      if (pos.cellId !== cellId) continue;

      const kc = app.akiko.knownCourses.get(courseId);
      const rc = app.akiko.realCourses.get(courseId);
      const visible = akikoIsCourseVisible(
        app.akiko,
        courseId,
        app.filterString,
      );

      const courseData = {
        id: courseId,
        name: kc?.name || rc?.name || "（不明）",
        credit: rc?.credit ?? kc?.credit ?? 0,
        term: kc?.term,
        when: kc?.when,
        expects: kc?.expects,
        grade: rc?.grade,
        takenYear: rc?.takenYear ?? app.knownCourseYear,
        visible,
      };

      if (pos.listKind === "wont-take") wontTake.push(courseData);
      else if (pos.listKind === "might-take") mightTake.push(courseData);
      else if (pos.listKind === "taken") taken.push(courseData);
    }

    for (const [fakeId, cid] of app.akiko.fakeCoursePositions) {
      if (cid !== cellId) continue;
      const fc = app.akiko.fakeCourses.get(fakeId);
      if (fc) fake.push(fc);
    }

    return {
      wontTake: wontTake.sort((a, b) => courseIdCompare(a.id, b.id)),
      mightTake: mightTake.sort((a, b) => courseIdCompare(a.id, b.id)),
      taken: taken.sort((a, b) => courseIdCompare(a.id, b.id)),
      fake,
    };
  });

  function exportMightTake() {
    const content = app.mightTakeCourseIds.join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(content);
    a.download = "科目番号一覧.csv";
    a.click();
  }

  const creditBoundsToString = (min: number, max: number | undefined) => {
    if (max === undefined) return `${min}~`;
    if (min === max) return min.toString();
    return `${min}~${max}`;
  };

  const getStatsDisplay = (s: any) => {
    let brief = `計:${s.effectiveMightTake === 0 ? s.effectiveTaken : `${s.effectiveTaken}→${s.effectiveTaken + s.effectiveMightTake}`}　要:${creditBoundsToString(s.min, s.max)}`;
    let warning =
      s.overflowTotal > 0
        ? `このマスは合計で${s.max}単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で${s.rawTotal}単位なので、残りの${s.overflowTotal}単位は卒業単位に含まれません。`
        : undefined;
    return { brief, warning };
  };

  const getPercentage = (taken: number, mightTake: number, min: number) => {
    if (min === 0) return [100, 100];
    return [
      Math.min(1, taken / min) * 100,
      Math.min(1, (taken + mightTake) / min) * 100,
    ];
  };

  let metaTitle = $derived(
    `あきこ - ${data.year}年度 ${MAJOR_TO_JA[data.major]}`,
  );
  let metaDescription = $derived(
    `${data.year}年度入学の${MAJOR_TO_JA[data.major]}の学生向け履修サポートツールです。単位の計算・授業探し・Twinsへの登録を楽に終わらせましょう！`,
  );

  let leftBarEl = $state<HTMLDivElement | undefined>();
  let rightBarEl = $state<HTMLDivElement | undefined>();
  let dropGuide = $state<
    { left: number; top: number; width: number; height: number } | undefined
  >();

  let columnSpanEls = $state<Record<string, HTMLSpanElement | undefined>>({});
  let overallSpanEl = $state<HTMLSpanElement | undefined>();

  $effect(() => {
    const spans: HTMLSpanElement[] = [];
    for (const [colId] of app.stats.columns.entries()) {
      if (["a", "c", "e", "g"].includes(colId)) continue;
      const span = columnSpanEls[colId];
      if (span) spans.push(span);
    }
    if (app.stats.elective && overallSpanEl) spans.push(overallSpanEl);

    const BORDER = 1;
    const PADDING = 5;

    // Batch write: clear all transforms first
    for (const span of spans) {
      span.style.transform = "";
    }

    // Batch read: measure all at once (single reflow)
    const measurements = spans.map((span) => {
      assert(span.parentElement !== null);
      const maxWidth =
        span.parentElement.getBoundingClientRect().width - (BORDER + PADDING) * 2;
      const spanWidth = span.getBoundingClientRect().width;
      return { span, maxWidth, spanWidth };
    });

    // Batch write: apply all transforms
    for (const { span, maxWidth, spanWidth } of measurements) {
      if (spanWidth > 0) {
        span.style.transform = `scaleX(${Math.min(maxWidth / spanWidth, 1)})`;
      }
    }
  });
</script>

<svelte:head>
  <title>{metaTitle}</title>
  <meta name="description" content={metaDescription} />
  <meta property="og:title" content={metaTitle} />
  <meta property="og:description" content={metaDescription} />
  <meta
    property="og:image"
    content="https://github.com/user-attachments/assets/be6c928e-36fa-48e4-ac5b-5a0406a0adb2"
  />
</svelte:head>

{#snippet courseRow(
  c: any,
  draggable = false,
  listKind: "wont-take" | "might-take" = "wont-take",
)}
  <tr
    class="course"
    class:hide-in-wont-take={!c.visible}
    {draggable}
    ondragstart={(e) => {
      if (!draggable) return;
      assert(app.selectedCellId !== undefined);
      handleDragStart(e, c.id, app.selectedCellId, listKind);
    }}
    ondragend={handleDragEnd}
  >
    <td class="id-name">
      <span>{c.id}</span><br />
      <a href={getSyllabusUrl(c.id, c.takenYear)} target="_blank"
        >{c.name}{c.grade && gradeIsPass(c.grade) ? ` (${c.takenYear})` : ""}</a
      >
      {#if c.grade}<br /><span
          >{c.grade === "wip"
            ? "（履修中）"
            : `評価：${c.grade.toUpperCase()}`}</span
        >{/if}
    </td>
    <td class="credit">{c.credit}</td>
    <td class="term">{c.term || "-"}</td>
    <td class="when">{c.when || "-"}</td>
    <td class="expects">{c.expects || "-"}</td>
  </tr>
{/snippet}

{#snippet courseTable(
  title: string,
  courses: any[],
  showFields: string,
  containerState: string,
  listKind: "wont-take" | "might-take" = "wont-take",
)}
  <h2>{title}</h2>
  <div class="course-container {showFields}" data-state={containerState}>
    <p class="select-cell">マスを選択してください</p>
    <p class="no-courses">該当する授業がありません</p>
    <table>
      <thead>
        <tr class="course">
          <th class="id-name">科目</th>
          <th class="credit">単位</th>
          {#if showFields.includes("show-term")}<th class="term">学期</th>{/if}
          {#if showFields.includes("show-when")}<th class="when">時限</th>{/if}
          {#if showFields.includes("show-expects")}<th class="expects"
              >標準履修年次</th
            >{/if}
        </tr>
      </thead>
      <tbody>
        {#each courses as c}
          {@render courseRow(
            c,
            containerState === "contains-courses" &&
              title !== "単位取得済みの授業",
            listKind,
          )}
        {/each}
      </tbody>
    </table>
  </div>
{/snippet}

<main class:bars-hidden={!barsVisible}>
  <div id="table-view">
    <div
      id="requirements"
      onscroll={(e) => (scrollX = -e.currentTarget.scrollLeft)}
    >
      <img
        src="/{data.year}/{data.major}/table.svg"
        alt="Table"
        width={data.config.tableViewBox
          ? scale * data.config.tableViewBox.width
          : undefined}
        height={data.config.tableViewBox
          ? scale * data.config.tableViewBox.height
          : undefined}
        draggable="false"
      />
      <div id="title">
        <a href="/" class="akiko"><img src={akikoPng} alt="あきこ" /></a>
        <span
          >このページは <strong>{data.year}</strong> 年度入学の
          <strong>{MAJOR_TO_JA[data.major]}</strong> の学生向けですよ〜</span
        >
        <nav>
          <a href="/#app-page-links">学類一覧に戻る</a>
          <a href="/docs/help.html">あきこの使い方</a>
          <a href="/docs/{data.config.docsPageName || 'help'}.html"
            >未対応の部分など</a
          >
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfUbueFsF6fbyJxCohNTqh5S8bYdxNgqx_HQ76RCR5TJQkpyQ/viewform?usp=dialog"
            target="_blank"
            rel="noreferrer">ご意見はこちらから</a
          >
        </nav>
      </div>
      {#each cellRects as r}
        {@const stats = app.stats.cells.get(r.id)}
        {#if stats}
          {@const [green, yellow] = getPercentage(
            stats.effectiveTaken,
            stats.effectiveMightTake,
            stats.min,
          )}
          <div
            class="cell"
            class:selected={app.selectedCellId === r.id}
            style="left:{r.x}px; top:{r.y}px; width:{r.width}px; height:{r.height}px; --green-percentage:{green}%; --yellow-percentage:{yellow}%"
            onclick={() => {
              app.selectedCellId = r.id;
              barsVisible = true;
            }}
          ></div>
        {/if}
      {/each}
    </div>
    <div id="credit-sums-container">
      <div id="column-credit-sums" style="--x: {scrollX}px">
        {#each app.stats.columns.entries() as [colId, s]}
          {#if !["a", "c", "e", "g"].includes(colId)}
            {@const rect = cellRects.find(
              (r) => r.id === ((colId + "1") as CellId),
            )}
            {#if rect}
              {@const display = getStatsDisplay(s)}
              {@const [green, yellow] = getPercentage(
                s.effectiveTaken,
                s.effectiveMightTake,
                s.min,
              )}
              <div
                style="left:{rect.x}px; width:{rect.width}px; --green-percentage:{green}%; --yellow-percentage:{yellow}%"
                data-message-on-click={display.warning}
                onclick={() => display.warning && alert(display.warning)}
              >
                <img src={warningIcon} width="20" alt="warning" />
                <span bind:this={columnSpanEls[colId]}>{display.brief}</span>
              </div>
            {/if}
          {/if}
        {/each}
      </div>
      {#if app.stats.elective}
        {@const s = app.stats.elective}
        {@const display = getStatsDisplay(s)}
        {@const [green, yellow] = getPercentage(
          s.effectiveTaken,
          s.effectiveMightTake,
          s.min,
        )}
        <div
          id="overall-credit-sum"
          style="--green-percentage:{green}%; --yellow-percentage:{yellow}%"
          data-message-on-click={display.warning}
          onclick={() => display.warning && alert(display.warning)}
        >
          <img src={warningIcon} width="20" alt="warning" />
          <span bind:this={overallSpanEl}
            >選択科目計:{display.brief.split("計:")[1]}</span
          >
        </div>
      {/if}
    </div>
  </div>

  <div id="left-bar-side">
    <div
      bind:this={leftBarEl}
      id="left-bar"
      ondragover={(e) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
      }}
      ondrop={(e) => handleDrop(e, "wont-take")}
    >
      <search>
        <div><img src={searchIcon} width="15px" alt="search" /></div>
        <input
          type="text"
          placeholder="科目番号・科目名で検索"
          bind:value={app.filterString}
        />
      </search>
      {@render courseTable(
        "当てはまる授業",
        groupedCourses.wontTake,
        "show-id-name show-credit show-term show-when show-expects",
        !app.selectedCellId
          ? "no-cell-selected"
          : groupedCourses.wontTake.length === 0
            ? "no-courses"
            : "contains-courses",
        "wont-take",
      )}
    </div>
    <div id="cell-detail" class:no-cell-selected={!app.selectedCellId}>
      <h2>単位数</h2>
      {#if app.selectedCellId}
        {@const stats = app.stats.cells.get(app.selectedCellId)}
        {#if stats}
          {@const display = getStatsDisplay(stats)}
          <p>
            {@html `選択されたマスの単位：${display.brief}${display.warning ? `<br>⚠️ ${display.warning}` : ""}`}
          </p>
        {/if}
        {#if data.config.getRemark}
          {@const remark = data.config.getRemark(
            app.selectedCellId,
            data.year,
            data.major,
          )}
          {#if remark}
            <h2>備考</h2>
            <p>{remark}</p>
          {/if}
        {/if}
      {/if}
    </div>
  </div>

  <div
    bind:this={rightBarEl}
    id="right-bar"
    ondragover={(e) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = "move";
    }}
    ondrop={(e) => handleDrop(e, "might-take")}
  >
    <div id="control">
      <label id="import-grades-button" class="button" style="cursor: pointer">
        <img src={importIcon} width="15px" alt="import" />
        <span class="label">TWINSの成績データをインポート</span>
        <span class="remark">※成績が外部に送信されることはありません</span>
        <input type="file" id="csv" accept=".csv" onchange={handleCsvUpload} />
      </label>
      <div id="student-type-container">
        <label
          ><input
            type="radio"
            name="student-type"
            bind:group={app.native}
            value={true}
          /> <span>1年生からこの学類に所属している</span></label
        ><br />
        <label
          ><input
            type="radio"
            name="student-type"
            bind:group={app.native}
            value={false}
          /> <span>総合学域群からこの学類に移行した</span></label
        >
      </div>
      <button class="button" onclick={exportMightTake}
        ><img src={exportIcon} width="15px" alt="export" />
        <span>取る授業一覧を出力</span></button
      >
      <button id="reset" class="button" onclick={() => app.reset()}
        ><img src={trashIcon} width="15px" alt="reset" />
        <span>リセット</span></button
      >
    </div>
    <div class="separator"></div>
    {@render courseTable(
      "取る授業",
      groupedCourses.mightTake,
      "show-id-name show-credit show-term show-when",
      !app.selectedCellId
        ? "no-cell-selected"
        : groupedCourses.mightTake.length === 0
          ? "no-courses"
          : "contains-courses",
      "might-take",
    )}
    {@render courseTable(
      "単位取得済みの授業",
      groupedCourses.taken,
      "show-id-name show-credit",
      !app.selectedCellId
        ? "no-cell-selected"
        : groupedCourses.taken.length === 0
          ? "no-courses"
          : "contains-courses",
    )}
  </div>
</main>

{#if dropGuide}
  <div
    id="drop-guide"
    style="left:{dropGuide.left}px; top:{dropGuide.top}px; width:{dropGuide.width}px; height:{dropGuide.height}px"
  >
    ここに授業をドロップ
  </div>
{/if}

<button
  id="bars-toggle"
  style="left: {barsVisible
    ? 'calc(100vw - 2 * var(--sidebar-width) - var(--toggle-width))'
    : 'calc(100vw - var(--toggle-width))'}"
  onclick={() => (barsVisible = !barsVisible)}
>
  {barsVisible ? "⏵" : "⏴"}
</button>

<style lang="scss">
  :global(:root) {
    --sidebar-width: 370px;
    --toggle-width: 30px;
  }

  main {
    position: fixed;
    inset: 0;
    font-size: 14px;

    display: grid;
    grid-template-columns: auto var(--sidebar-width) var(--sidebar-width);
    grid-template-rows: 100vh;

    &.bars-hidden {
      grid-template-columns: auto 0 0;

      & > #left-bar-side,
      & > #right-bar {
        display: none;
      }
    }
  }

  #table-view {
    grid-column: 1/2;
    display: grid;
    grid-template-rows: 1fr 85px;
  }

  #requirements {
    grid-row: 1/2;
    position: relative;
    overflow: scroll;
  }

  #title {
    position: absolute;
    left: 0;
    top: 0;
    text-wrap: nowrap;
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;
    align-items: center;
    background-color: oklch(98% 4% 350);
    border-right: 1px solid;
    border-bottom: 1px solid;
    border-color: oklch(92% 10% 350);
    border-bottom-right-radius: 10px;
    padding: 10px 20px;

    & > .akiko {
      grid-column: 1/2;
      grid-row: 1/3;
      width: 60px;
      height: 60px;
      margin-right: 20px;
      background-color: hsl(0, 0%, 98%);
      border: 1px solid oklch(92% 10% 350);
      border-radius: 50%;
      overflow: hidden;

      & > img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    & > nav {
      width: 100%;
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      gap: 20px;
    }

    & > span > strong {
      font-size: 1.2em;
    }
  }

  #left-bar-side {
    grid-column: 2/3;
    display: grid;
    grid-template-rows: 1fr auto;
    border-left: 1px dashed black;
  }

  #left-bar {
    grid-row: 1/2;
    overflow-y: scroll;
  }

  #right-bar {
    grid-column: 3/4;
    border-left: 1px dashed black;
    overflow-y: scroll;
    padding-top: 20px;
  }

  #cell-detail {
    grid-row: 2/3;
    border-top: 1px dashed black;

    &.no-cell-selected {
      display: none;
    }
  }

  #left-bar,
  #right-bar,
  #cell-detail {
    padding: 15px;
  }

  #right-bar > .separator {
    border-top: 1px dashed black;
  }

  .cell {
    --border-width: 3px;
    --green-percentage: 0%;
    --yellow-percentage: 0%;
    position: absolute;
    box-sizing: border-box;
    border: var(--border-width) dashed rgba(0, 0, 0, 0.2);
    cursor: pointer;

    &::before {
      content: "";
      display: block;
      position: absolute;
      inset: calc(-1 * var(--border-width));
      background: linear-gradient(
        90deg,
        rgba(51, 204, 51) 0%,
        rgba(51, 204, 51) var(--green-percentage),
        rgba(255, 204, 0) var(--green-percentage),
        rgba(255, 204, 0) var(--yellow-percentage),
        transparent var(--yellow-percentage),
        transparent 100%
      );
      opacity: 0.4;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.25);
    }

    &.selected {
      outline: 6px solid #0066ff;
      outline-offset: 4px;
      z-index: 1;
    }
  }

  .course-container > p {
    margin-bottom: 40px;
  }

  .course-container {
    & > * {
      display: none;
    }

    &[data-state="no-cell-selected"] > p.select-cell {
      display: revert;
    }

    &[data-state="no-courses"] > p.no-courses {
      display: revert;
    }

    &[data-state="contains-courses"] > table {
      display: revert;
    }
  }

  .course.hide-in-wont-take {
    display: none;
  }

  table,
  th,
  td {
    border: 1px solid black;
    border-collapse: collapse;
  }

  table {
    width: 100%;
    margin-bottom: 2rem;
  }

  th {
    white-space: nowrap;
  }

  tbody > tr {
    background-color: white;
  }

  tbody > tr[draggable="true"] {
    cursor: grab;
  }

  .course > .id-name,
  .course > .credit,
  .course > .term,
  .course > .when,
  .course > .expects {
    display: none;
  }
  .course-container.show-id-name .course > .id-name,
  .course-container.show-credit .course > .credit,
  .course-container.show-term .course > .term,
  .course-container.show-when .course > .when,
  .course-container.show-expects .course > .expects {
    display: revert;
  }

  #bars-toggle {
    position: absolute;
    margin: 0;
    padding: 0;
    border-radius: 0 0 0 10px;
    width: var(--toggle-width);
    height: var(--toggle-width);
    font-size: 20px;
    text-align: center;
    background-color: white;
    border: unset;
    border-left: 1px solid black;
    border-bottom: 1px solid black;

    &:hover {
      background-color: #ddd;
    }
  }

  input[name="student-type"]:checked + span {
    font-weight: bold;
  }

  #control {
    margin-bottom: 30px;
  }
  #control > * + * {
    margin-top: 10px;
  }

  #control .button {
    --fill: hsl(0, 0%, 92%);
    --outline: hsl(0, 0%, 85%);
    display: grid;
    place-content: center;
    place-items: center;
    gap: 10px;
    grid-template-columns: auto auto;
    width: 100%;
    height: 40px;
    background-color: var(--fill);
    border: 1px solid var(--outline);
    border-radius: 10px;

    &:hover {
      background-color: var(--outline);
    }
  }

  #control > #import-grades-button {
    --fill: #e3ecfd;
    --outline: #b8cff9;
    height: 80px;

    & > img {
      justify-self: right;
    }
    & > .label {
      justify-self: left;
    }
    & > .remark {
      grid-column: 1/3;
    }
  }

  #csv {
    display: none;
  }

  #student-type-container {
    padding: 10px;
    background-color: hsl(0, 0%, 97%);
    border-radius: 10px;
  }

  #control > #reset {
    --fill: #fce3eb;
    --outline: #f9b8ce;
    height: 30px;
  }

  #left-bar > search {
    margin-bottom: 30px;
    width: 100%;
    position: relative;

    & > div {
      position: absolute;
      left: 10px;
      top: 0;
      bottom: 0;
      display: grid;
      place-content: center;
      pointer-events: none;
    }

    & > input {
      box-sizing: border-box;
      width: 100%;
      border: 1px solid gray;
      border-radius: 10px;
      padding: 5px 10px 5px 35px;
    }
  }

  #credit-sums-container {
    grid-row: 2/3;
    overflow: hidden;
    position: relative;
  }

  #column-credit-sums {
    position: relative;
    transform: translateX(var(--x, 0));
  }

  #column-credit-sums > div,
  #overall-credit-sum {
    --green-percentage: 0%;
    --yellow-percentage: 0%;
    position: absolute;
    box-sizing: border-box;
    border: 1px solid black;
    padding: 5px;
    height: 35px;
    display: grid;
    user-select: none;
    -webkit-user-select: none;

    $alpha: 0.4;
    background: linear-gradient(
      90deg,
      rgba(51, 204, 51, $alpha) 0%,
      rgba(51, 204, 51, $alpha) var(--green-percentage),
      rgba(255, 204, 0, $alpha) var(--green-percentage),
      rgba(255, 204, 0, $alpha) var(--yellow-percentage),
      transparent var(--yellow-percentage),
      transparent 100%
    );

    &[data-message-on-click]:not([data-message-on-click=""]) {
      & > img {
        display: unset;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.25);
      }
    }

    & > img {
      display: none;
      position: absolute;
      left: 8px;
      top: 5.5px;
    }

    & > span {
      align-self: center;
      justify-self: right;
      transform-origin: top left;
      text-wrap: nowrap;
    }
  }

  #column-credit-sums > div {
    top: 5px;
  }

  #overall-credit-sum {
    right: 5px;
    bottom: 5px;
    width: 300px;
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
