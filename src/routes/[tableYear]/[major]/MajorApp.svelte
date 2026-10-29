<script lang="ts">
  import { resolve, asset } from "$app/paths";
  import BadgeJapaneseYen from "lucide-svelte/icons/badge-japanese-yen";
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import { type TimetableTab } from "./timetable";
  import Meta from "$lib/Meta.svelte";
  import { FEEDBACK_FORM_URL, MAJOR_TO_JA } from "$lib/constants";
  import { parseImportedCsv } from "$lib/csv";
  import {
    akikoGetCourseLists,
    akikoGetCreditStats,
    akikoGetMightTakeCourseIds,
    akikoGetUnclassifiedFakeCourses,
    akikoNew,
    type CellId,
    type FakeCourse,
    type ListKindOverrides,
    type RealCourse,
  } from "$lib/akiko";
  import {
    createCreditRequirementsOrFail,
    classifyCoursesOrFail,
    type MajorConfig,
  } from "$lib/app-setup";
  import { trackEvent } from "$lib/analytics";
  import {
    localDataDefault,
    localDataFromJson,
    localDataToJson,
    type LocalDataV3,
  } from "$lib/local-data";
  import { browser, dev } from "$app/environment";
  import { assert } from "$lib/util.js";
  import { onMount, untrack } from "svelte";
  import { markSeen, seen } from "./seen";
  import { debugPrintCreditStats } from "./debug";
  import { mobileUnsupported } from "./mobile-unsupported";
  import MobileUnsupportedNotice from "./MobileUnsupportedNotice.svelte";
  import SettingsTab from "./SettingsTab.svelte";
  import CoursesTab from "./CoursesTab.svelte";
  import RequirementsTable from "./RequirementsTable.svelte";
  import Tutorial from "./Tutorial.svelte";
  import ImportTab from "./ImportTab.svelte";
  import ExportTab from "./ExportTab.svelte";
  import { SUPPORT_URL } from "./links";
  import { resizeHandle } from "./gestures";
  import type { TutorialStep } from "./tutorial";

  let { config }: { config: MajorConfig } = $props();

  const localDataKey = $derived(`${config.major}_${config.tableYear}`);

  // TODO: should identify ways loading can fail and let the user know that the
  // data will be overwritten by the default value
  function localDataLoad(): LocalDataV3 {
    if (!browser) return localDataDefault();
    const json = localStorage.getItem(localDataKey);
    if (json === null) return localDataDefault();
    return localDataFromJson(json) ?? localDataDefault();
  }

  // Everything the user enters that's saved: grades, the 移行 answer and the
  // courses moved by hand. Each change replaces it whole, so saving and
  // everything derived from it see every change.
  let saved = $state.raw<LocalDataV3>(localDataLoad());
  const realCourses = $derived(saved.realCourses);
  const fakeCourses = $derived(saved.fakeCourses);
  const isNative = $derived(saved.native);
  let selectedCellId = $state<CellId | undefined>(undefined);
  let showNonAvailable = $state(false);

  const creditRequirements = $derived(
    createCreditRequirementsOrFail(
      config.getCreditRequirements(config.tableYear, config.major),
    ),
  );

  // Apart from akiko, so moving a course doesn't classify every course again
  const classification = $derived(
    classifyCoursesOrFail(
      config.knownCourses,
      realCourses,
      fakeCourses,
      isNative,
      config.tableYear,
      config.major,
      config.classifyKnownCourses,
      config.classifyRealCourses,
      config.classifyFakeCourses,
    ),
  );
  const akiko = $derived.by(() => {
    const { courseIdToCellId, realCoursePositions, fakeCoursePositions } =
      classification;
    const a = akikoNew(
      config.knownCourses,
      config.knownCourseYear,
      realCourses,
      fakeCourses,
      saved.listKindOverrides,
      courseIdToCellId,
      realCoursePositions,
      fakeCoursePositions,
      creditRequirements,
    );
    assert(a !== undefined);
    return a;
  });

  const creditStats = $derived(akikoGetCreditStats(akiko));

  $effect(() => {
    if (!browser) return;
    // akiko's overrides, without the ones newer grades have settled
    const json = localDataToJson({
      ...saved,
      listKindOverrides: akiko.listKindOverrides,
    });
    // Doesn't write back what another tab just saved
    if (localStorage.getItem(localDataKey) !== json) {
      localStorage.setItem(localDataKey, json);
    }
  });

  /**
   * Takes what the same page saved in another tab, so this tab's next save
   * doesn't drop it.
   */
  function onStorage(e: StorageEvent) {
    if (e.key !== localDataKey) return;
    if (e.newValue === null) {
      saved = localDataDefault();
      return;
    }
    // Ignored when it can't be read, such as a newer version's format saved
    // by a tab opened after a deploy: falling back to empty data would save
    // that right away and erase it
    const data = localDataFromJson(e.newValue);
    if (data !== undefined) saved = data;
  }

  type Tab = "import" | "export" | "courses" | "settings";

  let timetableYear = $state(untrack(() => config.knownCourseYear));
  let activeTimetableTerm = $state<TimetableTab>("spring-a");

  let barsVisible = $state(true);
  let activeTab = $state<Tab>("courses");

  const SIDEBAR_MARGIN = 100;
  const SIDEBAR_WIDTH_DEFAULT = 740;
  const SIDEBAR_WIDTH_MIN = 500;

  let sidebarWidth = $state(SIDEBAR_WIDTH_DEFAULT);

  $effect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${sidebarWidth}px`,
    );
  });

  function resizeSidebar(e: PointerEvent) {
    const raw = window.innerWidth - e.clientX;
    const snapped = Math.round(raw / 5) * 5;
    sidebarWidth = Math.min(
      window.innerWidth - SIDEBAR_MARGIN,
      Math.max(SIDEBAR_WIDTH_MIN, snapped),
    );
  }

  function importCsvFile(file: File) {
    void file.text().then((csv) => {
      const result = parseImportedCsv(csv);
      if (result.kind !== "ok") {
        alert(
          "CSVファイルを正しく読み込めませんでした。成績データのファイルをExcelやNumbersなどのアプリケーションで開いたり保存したりすると、データの形式が壊れて読み込めなくなる場合があります。TWINSからダウンロードしたファイルをそのままインポートしてください。",
        );
        return;
      }
      applyImport(result.realCourses, result.fakeCourses);
    });
  }

  /**
   * Takes in a grades file. Courses moved by hand stay moved, except where the
   * new grades settle them: passed, or now in that list anyway.
   */
  function applyImport(
    newRealCourses: RealCourse[],
    newFakeCourses: FakeCourse[],
  ) {
    saved = {
      ...saved,
      // akiko's, so moves that the grades being replaced had settled don't
      // come back if the new ones don't settle them
      listKindOverrides: akiko.listKindOverrides,
      realCourses: newRealCourses,
      fakeCourses: newFakeCourses,
    };
    trackEvent(
      "grades",
      "import-grades",
      `${config.tableYear}/${config.major}`,
    );
    if (dev) debugPrintCreditStats(akikoGetCreditStats(akiko));
    if (akikoGetUnclassifiedFakeCourses(akiko).length > 4) {
      alert(
        "申し訳ございませんが、TWINSの仕様のため編入生の認可された科目のみ単位チェック時に正しく単位を計算することができません。認可されていない通常の科目の成績は正しく計算されます。",
      );
    }
  }

  const selectedCellRemark = $derived(
    selectedCellId !== undefined
      ? config.getRemark?.(selectedCellId, config.tableYear, config.major)
      : undefined,
  );
  const mightTakeCourseIds = $derived(akikoGetMightTakeCourseIds(akiko));
  let exportCount = $state(0);

  let metaTitle = $derived(
    `あきこ - ${config.tableYear}年度 ${MAJOR_TO_JA[config.major]}`,
  );
  let metaDescription = $derived(
    `${config.tableYear}年度入学の${MAJOR_TO_JA[config.major]}の学生向け履修サポートツールです。単位の計算・授業探し・Twinsへの登録を楽に終わらせましょう！`,
  );

  // Typed by hand: ESLint can't see the types of a component's exports
  let requirementsTable = $state<{
    scrollCellIntoView: (cellId: CellId) => void;
  }>();

  /** Selects the cell, scrolls to it, and shows its courses. */
  function showCell(cellId: CellId) {
    selectedCellId = cellId;
    requirementsTable?.scrollCellIntoView(cellId);
    showTab("courses");
  }

  let tutorialOpen = $state(false);

  onMount(() => {
    if (!mobileUnsupported() && !seen("tutorial")) tutorialOpen = true;
  });

  function closeTutorial() {
    tutorialOpen = false;
    markSeen("tutorial");
  }

  let tutorialStepStart = {
    realCourses: [] as RealCourse[],
    mightTakeCount: 0,
    exportCount: 0,
  };

  function tutorialSnapshot() {
    tutorialStepStart = {
      realCourses,
      mightTakeCount: mightTakeCourseIds.length,
      exportCount,
    };
  }

  function showTab(tab: Tab) {
    barsVisible = true;
    activeTab = tab;
  }

  const tutorialSteps: TutorialStep[] = [
    {
      id: "welcome",
      title: "はじめまして〜",
      body: "あきこよ〜。卒業に必要な単位のチェックから、授業探し、TWINSへの履修登録までお手伝いするわね。実際に触りながら使い方を教えるから、一緒にやってみましょ〜",
      nextLabel: "お願いします！",
      onEnter: () => showTab("courses"),
    },
    {
      id: "tab-import",
      target: ["tab-import"],
      title: "タブで画面を切り替える",
      body: "右側の画面は、上のタブで切り替えるの。まずは「単位チェック」タブを押してみて〜",
      onEnter: () => (barsVisible = true),
      waitFor: () => activeTab === "import",
    },
    {
      id: "import",
      target: ["import-tab"],
      title: "成績データをインポート",
      body: "まずはTWINSの成績データをちょうだいね。「手順を見る」のとおりにダウンロードして、そのファイルを枠にドロップするか選んでくれたら、次に進むわよ〜",
      choices: [
        {
          label: "まだ成績ファイルを持っていない（新入生）",
          next: "tab-courses",
        },
      ],
      onEnter: tutorialSnapshot,
      waitFor: () => realCourses !== tutorialStepStart.realCourses,
    },
    {
      id: "progress",
      target: ["requirements"],
      title: "マスの色で進み具合がわかる",
      body: "表のマスの緑色は、もう取れた単位の割合よ。右端まで緑になったマスは、必要な単位がそろってるってこと。必要な単位が0のマスは最初から緑だから、気にしないでね〜",
      nextLabel: "次へ",
    },
    {
      id: "tab-courses",
      target: ["tab-courses"],
      title: "授業を探しに行こう",
      body: "次は授業探しよ。「履修を組む」タブを押してね〜",
      onEnter: () => (barsVisible = true),
      waitFor: () => activeTab === "courses",
    },
    {
      id: "cell",
      target: ["requirements"],
      title: "マスを押して授業を探す",
      body: "表のマスをどれか押してみて〜。そのマスに当てはまる授業を右側に出すわね。授業が出てこなかったら、別のマスを試してみてちょうだい",
      onEnter: () => (selectedCellId = undefined),
      waitFor: () =>
        selectedCellId !== undefined &&
        akikoGetCourseLists(akiko, selectedCellId, showNonAvailable).wontTake
          .length > 0,
    },
    {
      id: "syllabus",
      target: ["left-bar"],
      title: "シラバスを確認する",
      body: "「当てはまる授業」に、このマスの授業を並べておいたわ。授業名を押すと、シラバスが新しいタブで開くわよ〜",
      nextLabel: "次へ",
    },
    {
      id: "drag",
      target: ["left-bar", "right-bar"],
      title: "ドラッグで時間割に追加",
      body: "取りたい授業があったら、その行を右側にドラッグしてみて。「取る授業」に入って、時間割にも出てくるわ〜",
      onEnter: tutorialSnapshot,
      waitFor: () =>
        mightTakeCourseIds.length > tutorialStepStart.mightTakeCount,
    },
    {
      id: "more",
      target: ["requirements", "left-bar", "right-bar"],
      title: "どんどん追加しよう",
      body: "その調子〜！他のマスも押して、どんどん追加しちゃいましょ。マスの黄色いところは、取る授業の単位が取れたら増える分よ。いくつか追加できたら次へを押してね",
      nextLabel: "次へ",
    },
    {
      id: "tab-export",
      target: ["tab-export"],
      title: "TWINSに出力しよう",
      body: "取る授業が決まったら、「TWINSに出力」タブを押してね〜",
      onEnter: () => (barsVisible = true),
      waitFor: () => activeTab === "export",
    },
    {
      id: "export",
      target: ["export-button"],
      title: "TWINSに出力",
      body: "「ダウンロード」を押してみて〜。取る授業の科目番号を並べたCSVファイルをダウンロードするわ。時間が被ってる授業があると押せないから、そのときは次へを押して、あとで「履修を組む」タブで直してね",
      nextLabel: "次へ",
      onEnter: tutorialSnapshot,
      waitFor: () => exportCount > tutorialStepStart.exportCount,
    },
    {
      id: "register",
      target: ["export-upload"],
      title: "TWINSでまとめて履修登録",
      body: "ダウンロードしたファイルは、「手順を見る」に書いてある方法でTWINSにアップロードしてね。それだけで、まとめて履修登録できちゃうわよ〜",
      nextLabel: "次へ",
    },
    {
      id: "done",
      title: "これでばっちり！",
      body: "わからなくなったら、左上の「チュートリアル」からいつでも呼んでね〜。履修、がんばってね！",
      nextLabel: "ありがとう！",
    },
  ];
</script>

<Meta title={metaTitle} description={metaDescription} />

<svelte:window onstorage={onStorage} />

<main class:bars-hidden={!barsVisible}>
  <RequirementsTable
    bind:this={requirementsTable}
    {config}
    {creditStats}
    {selectedCellId}
    onSelect={(cellId: CellId | undefined) => {
      selectedCellId = cellId;
      if (cellId !== undefined) showTab("courses");
    }}
  >
    {#snippet overlay()}
      <div id="title">
        <a href={resolve("/")} class="akiko"
          ><img src={asset("/images/akiko.png")} alt="あきこ" /></a
        >
        <span
          >このページは <strong>{config.tableYear}</strong>
          年度入学の
          <strong>{MAJOR_TO_JA[config.major]}</strong> の学生向けですよ〜</span
        >
        <nav>
          <a href="{resolve('/')}#app-page-links">学類一覧に戻る</a>
          <button class="link-button" onclick={() => (tutorialOpen = true)}
            >チュートリアル</button
          >
          <a href={FEEDBACK_FORM_URL} target="_blank" rel="noreferrer"
            >ご意見はこちらから</a
          >
          <a class="support" href={SUPPORT_URL} target="_blank" rel="noreferrer"
            ><BadgeJapaneseYen size={15} />開発を支援</a
          >
        </nav>
      </div>
    {/snippet}
  </RequirementsTable>

  <div id="sidebar">
    <div id="tab-header">
      <button
        data-tutorial="tab-import"
        class:active={activeTab === "import"}
        onclick={() => (activeTab = "import")}
        ><span class="icon" style="--src: url({asset('/icons/math.svg')})"
        ></span>単位チェック</button
      >
      <span class="workflow-arrow" aria-hidden="true">
        <ChevronRight size={15} />
      </span>
      <button
        data-tutorial="tab-courses"
        class:active={activeTab === "courses"}
        onclick={() => (activeTab = "courses")}
        ><span class="icon" style="--src: url({asset('/icons/book.svg')})"
        ></span>履修を組む</button
      >
      <span class="workflow-arrow" aria-hidden="true">
        <ChevronRight size={15} />
      </span>
      <button
        data-tutorial="tab-export"
        class:active={activeTab === "export"}
        onclick={() => (activeTab = "export")}
        ><span class="icon" style="--src: url({asset('/icons/itf.svg')})"
        ></span>TWINSに出力</button
      >
      <button
        class="settings"
        class:active={activeTab === "settings"}
        onclick={() => (activeTab = "settings")}
        ><span class="icon" style="--src: url({asset('/icons/cog.svg')})"
        ></span>設定</button
      >
    </div>

    <div
      id="import-tab"
      data-tutorial="import-tab"
      class:active={activeTab === "import"}
    >
      <ImportTab
        {akiko}
        {realCourses}
        {fakeCourses}
        bind:native={
          () => isNative, (native: boolean) => (saved = { ...saved, native })
        }
        onImport={importCsvFile}
      />
    </div>

    <div id="export-tab" class:active={activeTab === "export"}>
      <ExportTab
        {akiko}
        {config}
        onShowCell={(cellId: CellId, term: TimetableTab) => {
          showCell(cellId);
          activeTimetableTerm = term;
        }}
        onPickCourses={() => showTab("courses")}
        onDownload={() => exportCount++}
      />
    </div>

    <div id="settings-tab" class:active={activeTab === "settings"}>
      <SettingsTab
        bind:showNonAvailable
        bind:timetableYear
        onReset={() => (saved = localDataDefault())}
      />
    </div>

    <div id="courses-tab" class:active={activeTab === "courses"}>
      <CoursesTab
        {akiko}
        {creditStats}
        {selectedCellId}
        cellRemark={selectedCellRemark}
        {showNonAvailable}
        bind:timetableYear
        bind:timetableTerm={activeTimetableTerm}
        onShowCell={showCell}
        onMove={(listKindOverrides: ListKindOverrides) =>
          (saved = { ...saved, listKindOverrides })}
      />
    </div>
  </div>
</main>

<button
  id="bars-toggle"
  style="left: {barsVisible
    ? 'calc(100vw - var(--sidebar-width) - var(--toggle-width))'
    : 'calc(100vw - var(--toggle-width))'}"
  onclick={() => (barsVisible = !barsVisible)}
>
  {barsVisible ? "⏵" : "⏴"}
</button>

{#if barsVisible}
  <div id="sidebar-resize-handle" {@attach resizeHandle(resizeSidebar)}></div>
{/if}

<MobileUnsupportedNotice />

{#if tutorialOpen}
  <Tutorial steps={tutorialSteps} onClose={closeTutorial} />
{/if}

<style lang="scss">
  :global(:root) {
    --sidebar-width: 740px;
    --toggle-width: 30px;
  }

  main {
    position: fixed;
    inset: 0;
    font-size: 14px;
    --fs-xs: 0.75em;
    --fs-sm: 0.9em;
    --fs-lg: 1.4em;

    display: grid;
    grid-template-columns: auto var(--sidebar-width);
    grid-template-rows: 100vh;

    &.bars-hidden {
      grid-template-columns: auto 0;

      & > #sidebar {
        display: none;
      }
    }
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
      align-items: center;
      gap: 20px;

      & > .support {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 0 10px;
        border: 1px solid oklch(85% 0.1 85);
        border-radius: 50px;
        background-color: oklch(97% 0.05 90);
        color: oklch(45% 0.1 75);
        text-decoration: none;

        &:hover {
          background-color: oklch(93% 0.08 90);
        }
      }
    }

    & > span > strong {
      font-size: 1.2em;
    }
  }

  .link-button {
    all: unset;
    cursor: pointer;
    color: LinkText;
    text-decoration: underline;
  }

  #sidebar {
    grid-column: 2/3;
    display: grid;
    grid-template-rows: auto 1fr;
    border-left: 1px solid black;
    overflow: hidden;
  }

  #tab-header {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 10px 10px 0;
    border-bottom: 1px solid black;

    & > .workflow-arrow {
      display: flex;
      align-self: center;
      margin: 0 -10px;
      color: #999;
    }

    & > button {
      display: flex;
      align-items: center;
      gap: 5px;
      // Overlaps the header's bottom border so the active tab joins its content
      margin-bottom: -1px;
      padding: 10px 15px;
      background-color: oklch(95% 0 0);
      color: #666;
      border: 1px solid black;
      border-radius: 10px 10px 0 0;

      &:hover {
        background-color: oklch(90% 0 0);
      }

      &.settings {
        margin-left: auto;
      }

      &.active {
        background-color: white;
        border-bottom-color: white;
        color: oklch(45% 30% 270);
        box-shadow: inset 0 3px 0 oklch(70% 50% 270);
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
  #export-tab {
    display: none;
    grid-template-rows: 1fr;
    overflow-y: scroll;
    padding: 15px;

    &.active {
      display: grid;
    }
  }

  #settings-tab {
    display: none;
    overflow-y: scroll;
    padding: 15px;
    padding-bottom: 50vh;

    &.active {
      display: flex;
      flex-direction: column;
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

  #bars-toggle {
    position: absolute;
    margin: 0;
    padding: 0;
    border-radius: 0 0 0 10px;
    width: var(--toggle-width);
    height: var(--toggle-width);
    font-size: var(--fs-lg);
    text-align: center;
    background-color: white;
    border: unset;
    border-left: 1px solid black;
    border-bottom: 1px solid black;

    &:hover {
      background-color: #ddd;
    }
  }

  #sidebar-resize-handle {
    position: fixed;
    top: var(--toggle-width);
    bottom: 0;
    left: calc(100vw - var(--sidebar-width));
    width: 10px;
    transform: translateX(-5px);
    cursor: col-resize;
    z-index: 100;
  }
</style>
