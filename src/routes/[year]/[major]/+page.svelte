<script lang="ts">
  import { resolve, asset } from "$app/paths";
  import HowToImportFromTwins from "$lib/HowToImportFromTwins.svelte";
  import HowToExportForTwins from "$lib/HowToExportForTwins.svelte";
  import { AkikoApp } from "$lib/akiko.svelte";
  import { MAJOR_TO_DOCS_PAGE_NAME, MAJOR_TO_JA } from "$lib/constants";
  import { parseImportedCsv } from "$lib/csv";
  import {
    akikoIsCourseVisible,
    columnIdIsElective,
    courseIdCompare,
    gradeIsPass,
    isCellId,
    isCourseId,
    type CellCreditStats,
    type CellId,
    type ColumnCreditStats,
    type CourseId,
    type ElectiveCreditStats,
    type FakeCourse,
    type Grade,
  } from "$lib/akiko";
  import { assert } from "$lib/util.js";
  import Callout from "$lib/Callout.svelte";

  type UiCourse = {
    id: CourseId;
    name: string;
    credit: number | undefined;
    term: string | undefined;
    when: string | undefined;
    expects: string | undefined;
    grade: Grade | undefined;
    takenYear: number | undefined;
    visible: boolean;
  };

  let { data } = $props();
  let app = $derived(new AkikoApp(data.config));

  type Tab = "import" | "export" | "courses" | "settings";

  let barsVisible = $state(true);
  let activeTab = $state<Tab>("courses");
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

  function handleDrop(
    event: DragEvent,
    targetListKind: "wont-take" | "might-take",
  ) {
    event.preventDefault();
    const courseId = event.dataTransfer?.getData("text/plain");
    if (courseId === undefined || !isCourseId(courseId)) return;
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

  // Sorted course lists — does NOT depend on filterString, so typing in the
  // search box won't trigger a re-sort.
  const sortedGroupedCourses = $derived.by(() => {
    const wontTake: UiCourse[] = [];
    const mightTake: UiCourse[] = [];
    const taken: UiCourse[] = [];
    const fake: FakeCourse[] = [];

    if (!app.selectedCellId) return { wontTake, mightTake, taken, fake };

    for (const [courseId, pos] of app.akiko.coursePositions) {
      if (pos.cellId !== app.selectedCellId) continue;

      const kc = app.akiko.knownCourses.get(courseId);
      const rc = app.akiko.realCourses.get(courseId);

      const ui: UiCourse = {
        id: courseId,
        name: rc?.name || kc?.name || "（不明）",
        credit: rc?.credit ?? kc?.credit,
        term: kc?.term,
        when: kc?.when,
        expects: kc?.expects?.join(","), // TODO: better display
        grade: rc?.grade,
        takenYear: rc?.takenYear,
        visible: false,
      };

      if (pos.listKind === "wont-take") wontTake.push(ui);
      else if (pos.listKind === "might-take") mightTake.push(ui);
      else if (pos.listKind === "taken") taken.push(ui);
    }

    for (const [fakeId, cid] of app.akiko.fakeCoursePositions) {
      if (cid !== app.selectedCellId) continue;
      const fc = app.akiko.fakeCourses.get(fakeId);
      if (fc) fake.push(fc);
    }

    const compare = (a: UiCourse, b: UiCourse) => courseIdCompare(a.id, b.id);
    return {
      wontTake: wontTake.sort(compare),
      mightTake: mightTake.sort(compare),
      taken: taken.sort(compare),
      fake,
    };
  });

  // Adds the `visible` flag — only this re-runs when filterString changes.
  const groupedCourses = $derived.by(() => {
    const addVisible = (c: UiCourse): UiCourse => ({
      ...c,
      visible: akikoIsCourseVisible(app.akiko, c.id, app.filterString),
    });
    return {
      wontTake: sortedGroupedCourses.wontTake.map(addVisible),
      mightTake: sortedGroupedCourses.mightTake,
      taken: sortedGroupedCourses.taken,
      fake: sortedGroupedCourses.fake,
    };
  });

  function exportMightTake() {
    const content = app.mightTakeCourseIds.join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(content);
    a.download = "科目番号一覧.csv";
    a.click();
  }

  function gradeDisplay(g: Grade): string {
    if (g === "wip") return "（履修中）";
    if (g === "d" || g === "fail") return "（落単済み）";
    if (g === "pass") return "評価：P";
    return `評価：${g.toUpperCase()}`;
  }

  function creditBoundsToString(min: number, max: number | undefined): string {
    if (max === undefined) return `${min}~`;
    if (min === max) return min.toString();
    return `${min}~${max}`;
  }

  function cellCreditStatsDisplay(c: CellCreditStats): {
    brief: string;
    warning: string | undefined;
  } {
    let brief = "計:";
    if (c.effectiveMightTake === 0) {
      brief += c.effectiveTaken.toString();
    } else {
      brief += `${c.effectiveTaken}→${c.effectiveTaken + c.effectiveMightTake}`;
    }
    brief += "　要:" + creditBoundsToString(c.min, c.max);

    let warning: string | undefined;
    if (c.overflowTotal > 0) {
      warning = `このマスは合計で${c.max}単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で${c.rawTotal}単位なので、残りの${c.overflowTotal}単位は卒業単位に含まれません。`;
    }

    return { brief, warning };
  }

  function columnCreditStatsDisplay(c: ColumnCreditStats): {
    brief: string;
    warning: string | undefined;
  } {
    let brief = "計:";
    if (c.effectiveMightTake === 0) {
      brief += c.effectiveTaken.toString();
    } else {
      brief += `${c.effectiveTaken}→${c.effectiveTaken + c.effectiveMightTake}`;
    }
    brief += "　要:" + creditBoundsToString(c.min, c.max);

    let warning: string | undefined;
    if (c.overflowTotal > 0) {
      warning = `この列は合計で${c.max}単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で${c.rawTotal}単位なので、残りの${c.overflowTotal}単位は卒業単位に含まれません。`;
    }

    return { brief, warning };
  }

  function electiveCreditStatsDisplay(c: ElectiveCreditStats): {
    brief: string;
    warning: string | undefined;
  } {
    let brief = "選択科目計:";
    if (c.effectiveMightTake === 0) {
      brief += c.effectiveTaken.toString();
    } else {
      brief += `${c.effectiveTaken}→${c.effectiveTaken + c.effectiveMightTake}`;
    }
    brief += "　要:" + creditBoundsToString(c.min, c.max);

    let warning: string | undefined;
    if (c.overflowTotal > 0) {
      warning = `選択科目全体は合計で${c.max}単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で${c.rawTotal}単位なので、残りの${c.overflowTotal}単位は卒業単位に含まれません。`;
    }

    return { brief, warning };
  }

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
      if (!columnIdIsElective(colId)) continue;
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
        span.parentElement.getBoundingClientRect().width -
        (BORDER + PADDING) * 2;
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
  c: UiCourse,
  listKind: "wont-take" | "might-take" | "taken",
)}
  {@const draggable = listKind === "wont-take" || listKind === "might-take"}
  <tr
    class="course"
    class:hide-in-wont-take={listKind === "wont-take" && !c.visible}
    {draggable}
    ondragstart={(e) => {
      if (!draggable) return;
      assert(app.selectedCellId !== undefined);
      handleDragStart(e, c.id, listKind);
    }}
    ondragend={handleDragEnd}
  >
    <td class="id-name">
      <span>{c.id}</span><br />
      <a
        href={getSyllabusUrl(c.id, c.takenYear ?? data.year)}
        target="_blank"
        draggable="false"
        >{c.name}{c.grade && gradeIsPass(c.grade) ? ` (${c.takenYear})` : ""}</a
      >
      {#if c.grade}<br /><span>{gradeDisplay(c.grade)}</span>{/if}
    </td>
    <td class="credit">{c.credit ?? "-"}</td>
    <td class="term">{c.term || "-"}</td>
    <td class="when">{c.when || "-"}</td>
    <td class="expects">{c.expects || "-"}</td>
  </tr>
{/snippet}

{#snippet courseTable(
  title: string,
  courses: UiCourse[],
  state: "no-cell-selected" | "no-courses" | "contains-courses",
  showTerm: boolean,
  showWhen: boolean,
  showExpects: boolean,
  listKind: "wont-take" | "might-take" | "taken",
)}
  <h2>{title}</h2>
  {#if state === "no-cell-selected"}
    <p>マスを選択してください</p>
  {:else if state === "no-courses"}
    <p>該当する授業がありません</p>
  {:else}
    <table
      class:show-term={showTerm}
      class:show-when={showWhen}
      class:show-expects={showExpects}
    >
      <thead>
        <tr class="course">
          <th class="id-name">科目</th>
          <th class="credit">単位</th>
          <th class="term">学期</th>
          <th class="when">時限</th>
          <th class="expects">標準<br />履修<br />年次</th>
        </tr>
      </thead>
      <tbody>
        {#each courses as c}
          {@render courseRow(c, listKind)}
        {/each}
      </tbody>
    </table>
  {/if}
{/snippet}

<main class:bars-hidden={!barsVisible}>
  <div id="table-view">
    <div
      id="requirements"
      onscroll={(e) => (scrollX = -e.currentTarget.scrollLeft)}
    >
      <img
        src={asset(`/${data.year}/${data.major}/table.svg`)}
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
        <a href={resolve("/")} class="akiko"
          ><img src={asset("/images/akiko.png")} alt="あきこ" /></a
        >
        <span
          >このページは <strong>{data.year}</strong> 年度入学の
          <strong>{MAJOR_TO_JA[data.major]}</strong> の学生向けですよ〜</span
        >
        <nav>
          <a href="{resolve('/')}#app-page-links">学類一覧に戻る</a>
          <a href={resolve("/docs")}>あきこの使い方</a>
          <a
            href={resolve("/docs/[name]", {
              name: MAJOR_TO_DOCS_PAGE_NAME[data.config.major],
            })}>未対応の部分など</a
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
              activeTab = "courses";
            }}
          ></div>
        {/if}
      {/each}
    </div>
    <div id="credit-sums-container">
      <div id="column-credit-sums" style="--x: {scrollX}px">
        {#each app.stats.columns.entries() as [colId, s]}
          {#if columnIdIsElective(colId)}
            {@const rect = cellRects.find(
              (r) => r.id === ((colId + "1") as CellId),
            )}
            {#if rect}
              {@const display = columnCreditStatsDisplay(s)}
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
                <img
                  src={asset("/icons/warning.svg")}
                  width="20"
                  alt="warning"
                />
                <span bind:this={columnSpanEls[colId]}>{display.brief}</span>
              </div>
            {/if}
          {/if}
        {/each}
      </div>
      {#if app.stats.elective}
        {@const s = app.stats.elective}
        {@const display = electiveCreditStatsDisplay(s)}
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
          <img src={asset("/icons/warning.svg")} width="20" alt="warning" />
          <span bind:this={overallSpanEl}>{display.brief}</span>
        </div>
      {/if}
    </div>
  </div>

  <div id="sidebar">
    <div id="tab-header">
      <button
        class:active={activeTab === "import"}
        onclick={() => (activeTab = "import")}
        ><span class="icon" style="--src: url({asset('/icons/math.svg')})"
        ></span>単位チェック</button
      >
      <button
        class:active={activeTab === "courses"}
        onclick={() => (activeTab = "courses")}
        ><span class="icon" style="--src: url({asset('/icons/book.svg')})"
        ></span>履修を組む</button
      >
      <button
        class:active={activeTab === "export"}
        onclick={() => (activeTab = "export")}
        ><span class="icon" style="--src: url({asset('/icons/itf.svg')})"
        ></span>TWINSに出力</button
      >
      <button
        class:active={activeTab === "settings"}
        onclick={() => (activeTab = "settings")}
        ><span class="icon" style="--src: url({asset('/icons/cog.svg')})"
        ></span>設定</button
      >
    </div>

    <div id="import-tab" class:active={activeTab === "import"}>
      <div id="control">
        <label id="import-grades-button" class="button">
          <img src={asset("/icons/import.svg")} width="15px" alt="import" />
          <span>TWINSの成績データをインポート</span>
          <input
            type="file"
            id="csv"
            accept=".csv"
            onchange={handleCsvUpload}
          />
        </label>
        <div id="student-type-container" style="margin-bottom: 20px;">
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
        <Callout kind="info">
          成績データは、あきこの開発チームに閲覧されたり、外部に送信されたりすることはありません。
        </Callout>
        <Callout kind="warning">
          成績データのファイルは、あきこにインポートする前にExcelやNumbersなどのアプリケーションで開いたり保存しないでください。
          データの形式が壊れ、あきこに正しくインポートできなくなる場合があります。
        </Callout>
      </div>
      <HowToImportFromTwins />
    </div>

    <div id="export-tab" class:active={activeTab === "export"}>
      <div id="control">
        <button class="button" onclick={exportMightTake}
          ><img src={asset("/icons/export.svg")} width="15px" alt="export" />
          <span>取る授業一覧を出力</span></button
        >
      </div>
      <HowToExportForTwins />
    </div>

    <div id="settings-tab" class:active={activeTab === "settings"}>
      <div id="control">
        <button id="reset" class="button" onclick={() => app.reset()}
          ><img src={asset("/icons/trash.svg")} width="15px" alt="reset" />
          <span>リセット</span></button
        >
      </div>
    </div>

    <div id="courses-tab" class:active={activeTab === "courses"}>
      <div
        bind:this={leftBarEl}
        id="left-bar"
        ondragover={(e) => {
          e.preventDefault();
          if (e.dataTransfer !== null) e.dataTransfer.dropEffect = "move";
        }}
        ondrop={(e) => handleDrop(e, "wont-take")}
      >
        <div id="left-bar-scroll">
          <search>
            <div>
              <img src={asset("/icons/search.svg")} width="15px" alt="search" />
            </div>
            <input
              type="text"
              placeholder="科目番号・科目名で検索"
              bind:value={app.filterString}
            />
          </search>
          {@render courseTable(
            "当てはまる授業",
            groupedCourses.wontTake,
            !app.selectedCellId
              ? "no-cell-selected"
              : groupedCourses.wontTake.length === 0
                ? "no-courses"
                : "contains-courses",
            true,
            true,
            true,
            "wont-take",
          )}
        </div>
        <div id="cell-detail" class:no-cell-selected={!app.selectedCellId}>
          <h2>単位数</h2>
          {#if app.selectedCellId}
            {@const stats = app.stats.cells.get(app.selectedCellId)}
            {#if stats}
              {@const display = cellCreditStatsDisplay(stats)}
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
          if (e.dataTransfer !== null) e.dataTransfer.dropEffect = "move";
        }}
        ondrop={(e) => handleDrop(e, "might-take")}
      >
        {@render courseTable(
          "取る授業",
          groupedCourses.mightTake,
          !app.selectedCellId
            ? "no-cell-selected"
            : groupedCourses.mightTake.length === 0
              ? "no-courses"
              : "contains-courses",
          true,
          true,
          false,
          "might-take",
        )}
        {@render courseTable(
          "単位取得済みの授業",
          groupedCourses.taken,
          !app.selectedCellId
            ? "no-cell-selected"
            : groupedCourses.taken.length === 0
              ? "no-courses"
              : "contains-courses",
          false,
          false,
          false,
          "taken",
        )}
      </div>
    </div>
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
  $color-progress-taken: rgb(51, 204, 51);
  $color-progress-might-take: rgb(255, 204, 0);
  $color-hover-overlay: rgba(0, 0, 0, 0.25);

  :global(:root) {
    --sidebar-width: 370px;
    --toggle-width: 30px;
  }

  main {
    position: fixed;
    inset: 0;
    font-size: 14px;

    display: grid;
    grid-template-columns: auto calc(2 * var(--sidebar-width));
    grid-template-rows: 100vh;

    &.bars-hidden {
      grid-template-columns: auto 0;

      & > #sidebar {
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

  #sidebar {
    grid-column: 2/3;
    display: grid;
    grid-template-rows: auto 1fr;
    border-left: 1px solid black;
    overflow: hidden;

    & h2 {
      margin-top: 0;
      &:not(:first-of-type) {
        margin-top: 50px;
      }
    }
  }

  #tab-header {
    display: flex;
    gap: 10px;
    padding: 10px;
    border-bottom: 1px solid black;

    & > button {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      background-color: white;
      color: #444;
      border: 1px solid currentColor;
      border-radius: 10px;

      &:hover {
        background-color: oklch(95% 0 0);
      }

      &.active {
        $c: oklch(70% 50% 270);
        background-color: $c;
        border-color: $c;
        color: white;
      }

      & > .icon {
        width: 15px;
        height: 15px;
        background-color: currentColor;
        mask-image: var(--src);
        mask-size: contain;
        mask-repeat: no-repeat;
        mask-position: center;
      }
    }
  }

  #import-tab,
  #export-tab,
  #settings-tab {
    display: none;
    grid-template-rows: 1fr;
    overflow-y: scroll;
    padding: 15px;
    padding-bottom: 50vh;

    &.active {
      display: grid;
    }
  }

  #courses-tab {
    display: none;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;

    &.active {
      display: grid;
    }
  }

  #left-bar {
    display: grid;
    grid-template-rows: 1fr auto;
    border-right: 1px dashed black;
    overflow: hidden;
  }

  #left-bar-scroll {
    overflow-y: scroll;
    padding: 15px;
  }

  #right-bar {
    overflow-y: scroll;
  }

  #cell-detail {
    border-top: 1px dashed black;

    &.no-cell-selected {
      display: none;
    }
  }

  #right-bar,
  #cell-detail {
    padding: 15px;
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
        $color-progress-taken 0%,
        $color-progress-taken var(--green-percentage),
        $color-progress-might-take var(--green-percentage),
        $color-progress-might-take var(--yellow-percentage),
        transparent var(--yellow-percentage),
        transparent 100%
      );
      opacity: 0.4;
    }

    &:hover {
      background-color: $color-hover-overlay;
    }

    &.selected {
      outline: 6px solid #0066ff;
      outline-offset: 4px;
      z-index: 1;
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
    margin-bottom: 30px;

    .term,
    .when,
    .expects {
      display: none;
    }
    &.show-term .term,
    &.show-when .when,
    &.show-expects .expects {
      display: revert;
    }
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
    margin-bottom: 50px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    & .button {
      --bg-l: 0.92;
      --bg-c: 0.05;
      --border-l: 0.85;
      --border-c: 0.1;
      --h: 270;
      display: grid;
      place-content: center;
      place-items: center;
      gap: 10px;
      grid-template-columns: auto auto;
      width: 100%;
      height: 40px;
      background-color: oklch(var(--bg-l) var(--bg-c) var(--h));
      border: 1px solid oklch(var(--border-l) var(--border-c) var(--h));
      border-radius: 10px;

      &:hover {
        background-color: oklch(var(--border-l) var(--border-c) var(--h));
      }
    }

    & label.button {
      box-sizing: border-box;
    }

    & #reset {
      --h: 10;
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

  #left-bar-scroll > search {
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
      rgba($color-progress-taken, $alpha) 0%,
      rgba($color-progress-taken, $alpha) var(--green-percentage),
      rgba($color-progress-might-take, $alpha) var(--green-percentage),
      rgba($color-progress-might-take, $alpha) var(--yellow-percentage),
      transparent var(--yellow-percentage),
      transparent 100%
    );

    &[data-message-on-click]:not([data-message-on-click=""]) {
      & > img {
        display: unset;
      }

      &:hover {
        background-color: $color-hover-overlay;
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
