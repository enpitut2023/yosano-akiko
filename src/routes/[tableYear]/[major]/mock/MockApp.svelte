<script lang="ts">
  import { untrack } from "svelte";
  import {
    akikoGetCreditStats,
    akikoNew,
    type FakeCourse,
    type ListKindOverrides,
    type RealCourse,
  } from "#lib/akiko.ts";
  import {
    classifyCoursesOrFail,
    creditRequirementsNewOrFail,
    type MajorConfig,
  } from "#lib/app-setup.ts";
  import { parseImportedCsv } from "#lib/csv.ts";
  import { sampleGrades, type SampleGrades } from "./sample-grades";
  import SheetLayout from "./SheetLayout.svelte";
  import ViewsLayout from "./ViewsLayout.svelte";

  let { config }: { config: MajorConfig } = $props();

  // Kept in memory only, so trying the mock can't touch what the real page saved
  let realCourses = $state.raw<RealCourse[]>(
    untrack(() => sampleGrades("typical", config.knownCourseYear)),
  );
  let fakeCourses = $state.raw<FakeCourse[]>([]);
  let listKindOverrides = $state.raw<ListKindOverrides>(new Map());
  let native = $state(true);

  const creditRequirements = $derived(
    creditRequirementsNewOrFail(
      config.getCreditRequirements(config.tableYear, config.major),
    ),
  );
  const classification = $derived(
    classifyCoursesOrFail(
      config.knownCourses,
      realCourses,
      fakeCourses,
      !native,
      config.tableYear,
      config.major,
      config.classifyKnownCourses,
      config.classifyRealCourses,
      config.classifyFakeCourses,
    ),
  );
  const akiko = $derived(
    akikoNew(
      config.knownCourses,
      config.knownCourseYear,
      realCourses,
      fakeCourses,
      listKindOverrides,
      classification.courseIdToCellId,
      classification.realCoursePositions,
      classification.fakeCoursePositions,
      creditRequirements,
    ),
  );
  const creditStats = $derived(akikoGetCreditStats(akiko));

  function useGrades(real: RealCourse[], fake: FakeCourse[]) {
    realCourses = real;
    fakeCourses = fake;
    listKindOverrides = new Map();
  }

  type GradesSource = SampleGrades | "none" | "imported";
  const GRADES_SOURCES: Record<GradesSource, string> = {
    typical: "サンプル成績",
    overflowing: "上限超えの成績",
    none: "成績なし",
    imported: "読み込んだ成績",
  };
  let gradesSource = $state<GradesSource>("typical");
  function setGradesSource(source: GradesSource) {
    gradesSource = source;
    if (source === "none") useGrades([], []);
    else if (source !== "imported")
      useGrades(sampleGrades(source, config.knownCourseYear), []);
  }

  function importCsvFile(file: File) {
    void file.text().then((csv) => {
      const result = parseImportedCsv(csv);
      if (result.kind !== "ok") {
        alert("CSVファイルを正しく読み込めませんでした。");
        return;
      }
      useGrades(result.realCourses, result.fakeCourses);
      gradesSource = "imported";
    });
  }

  type Layout = "views" | "sheet";
  const LAYOUTS: Record<Layout, string> = {
    views: "案：表と時間割",
    sheet: "案：パネル",
  };
  let layout = $state<Layout>("views");
</script>

<svelte:head>
  <title>あきこ モバイル版モック</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="app">
  <div class="mock-bar">
    <span>モック：保存されません</span>
    <select aria-label="デザイン案" bind:value={layout}>
      {#each Object.entries(LAYOUTS) as [value, label] (value)}
        <option {value}>{label}</option>
      {/each}
    </select>
    <select aria-label="成績" bind:value={() => gradesSource, setGradesSource}>
      {#each Object.entries(GRADES_SOURCES) as [value, label] (value)}
        <option {value} disabled={value === "imported"}>{label}</option>
      {/each}
    </select>
  </div>

  {#if layout === "views"}
    <ViewsLayout
      {config}
      {akiko}
      {creditStats}
      {realCourses}
      {fakeCourses}
      bind:native
      bind:listKindOverrides
      onImport={importCsvFile}
      onReset={() => setGradesSource("none")}
    />
  {:else}
    <SheetLayout
      {config}
      {akiko}
      {creditStats}
      {realCourses}
      {fakeCourses}
      bind:native
      bind:listKindOverrides
      onImport={importCsvFile}
      onReset={() => setGradesSource("none")}
    />
  {/if}
</div>

<style lang="scss">
  .app {
    // From the desktop page
    --c-surface: white;
    --c-rule: black;
    --c-line: #ccc;
    --c-panel: oklch(95% 0 0);
    --c-text: black;
    --c-sub: #666;
    --c-accent: oklch(45% 30% 270);
    --c-tab-accent: oklch(70% 50% 270);
    --c-brand-bg: oklch(98% 4% 350);
    --c-brand-line: oklch(92% 10% 350);
    --c-taken: rgb(51, 204, 51);
    --c-plan: rgb(255, 204, 0);
    // The table's tints
    --c-taken-tint: rgb(51 204 51 / 0.4);
    --c-plan-tint: rgb(255 204 0 / 0.4);
    --c-warn: oklch(50% 0.18 30);
    --c-warn-bg: oklch(95% 0.04 30);
    // The components shared with the desktop page size their text with these
    --fs-xs: 0.8em;
    --fs-sm: 0.9em;
    --fs-lg: 1.4em;

    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    font-size: 15px;
    color: var(--c-text);
    background-color: var(--c-surface);

    & :global(button) {
      color: inherit;
    }

    // Shared by both layouts' lists
    & :global(.list) {
      display: grid;
      padding: 0 15px 20px;
    }

    & :global(.list > h2) {
      position: sticky;
      top: 0;
      z-index: 1;
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin: 0;
      padding: 15px 0 5px;
      background-color: var(--c-surface);
      font-size: 1.2em;
    }

    & :global(.list > h2 > small) {
      font-size: var(--fs-sm);
    }

    & :global(.hint) {
      margin: 0;
      padding: 20px 0;
      text-align: center;
      font-size: var(--fs-sm);
      color: var(--c-sub);
    }

    & :global(.warning) {
      margin: 15px 0 0;
      padding: 10px;
      background-color: var(--c-warn-bg);
      color: var(--c-warn);
      font-size: var(--fs-sm);
    }

    & :global(.pill) {
      height: 45px;
      padding: 0 20px;
      border: 1px solid var(--c-line);
      border-radius: 10px;
      background-color: var(--c-surface);
      font-size: var(--fs-sm);
    }
  }

  .mock-bar {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    background-color: var(--c-text);
    color: var(--c-surface);
    font-size: var(--fs-xs);

    & > span {
      margin-right: auto;
      white-space: nowrap;
    }

    & > select {
      min-width: 0;
      padding: 0 5px;
      border: 1px solid var(--c-sub);
      border-radius: 5px;
      background: none;
      color: inherit;
      font-size: inherit;
    }
  }
</style>
