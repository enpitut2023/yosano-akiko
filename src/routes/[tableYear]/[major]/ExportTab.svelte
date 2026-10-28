<script lang="ts">
  import { resolve } from "$app/paths";
  import Download from "lucide-svelte/icons/download";
  import TriangleAlert from "lucide-svelte/icons/triangle-alert";
  import {
    akikoExportForTwins,
    akikoGetMergedCourse,
    creditSum,
    slotToString,
    type Akiko,
    type MergedCourse,
    type CellId,
    type KnownCourse,
  } from "$lib/akiko";
  import { trackEvent } from "$lib/analytics";
  import type { MajorConfig } from "$lib/app-setup";
  import Dialog from "$lib/Dialog.svelte";
  import { SUPPORT_URL } from "./links";
  import SyllabusLink from "./SyllabusLink.svelte";
  import type { TimetableTab } from "./timetable";

  let {
    akiko,
    config,
    onShowCell,
    onPickCourses,
    onDownload,
  }: {
    akiko: Akiko;
    config: MajorConfig;
    /** Shows a course's cell, with the timetable on the term it's in. */
    onShowCell: (cellId: CellId, term: TimetableTab) => void;
    onPickCourses: () => void;
    onDownload: () => void;
  } = $props();

  type UiOverlapGroup = {
    slot: string;
    term: TimetableTab;
    courses: MergedCourse[];
  };

  type UiLeftOutCourse = { course: MergedCourse; term: TimetableTab };

  const exportForTwinsResult = $derived(akikoExportForTwins(akiko));

  function toCourses(kcs: KnownCourse[]): MergedCourse[] {
    return kcs
      .map((kc) => akikoGetMergedCourse(akiko, kc.id))
      .filter((c) => c !== undefined);
  }

  function toUiLeftOut(kcs: KnownCourse[]): UiLeftOutCourse[] {
    return toCourses(kcs).map((course) => ({
      course,
      term: course.known?.slots[0]?.term ?? "other",
    }));
  }

  const uiJizentouroku = $derived(
    toUiLeftOut(exportForTwinsResult.jizentouroku),
  );
  const uiUnavailable = $derived(toUiLeftOut(exportForTwinsResult.unavailable));
  const exportCourses = $derived(
    exportForTwinsResult.kind === "ok"
      ? toCourses(exportForTwinsResult.toExport)
      : [],
  );
  const exportCredits = $derived(creditSum(exportCourses));
  const uiOverlaps = $derived.by((): UiOverlapGroup[] => {
    if (exportForTwinsResult.kind === "ok") return [];
    return exportForTwinsResult.overlaps.map((overlap) => ({
      slot: slotToString(overlap.slot),
      term: overlap.slot.term,
      courses: toCourses(overlap.courses),
    }));
  });

  let downloaded = $state(false);

  function download() {
    if (exportForTwinsResult.kind !== "ok") return;
    downloaded = true;
    onDownload();
    const content = exportForTwinsResult.toExport.map((c) => c.id).join("\n");
    trackEvent(
      "export",
      "export-for-twins",
      `${config.tableYear}/${config.major}`,
      exportForTwinsResult.toExport.length,
    );
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(content);
    a.download = "科目番号一覧.csv";
    a.click();
  }
</script>

{#snippet leftOut(message: string, courses: UiLeftOutCourse[])}
  {#if courses.length > 0}
    <p class="step-problem"><TriangleAlert size={15} />{message}</p>
    <table>
      <tbody>
        {#each courses as { course, term } (course.id)}
          <tr class="course">
            <td class="id-name">
              <span>{course.id}</span><br />
              <SyllabusLink {course} catalogYear={akiko.knownCourseYear} />
            </td>
            <td>
              {#if course.cellId !== undefined}
                {@const cellId = course.cellId}
                <button onclick={() => onShowCell(cellId, term)}>表示</button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
{/snippet}

<div class="steps-panel">
  <ol class="steps">
    <li>
      <p>出力する授業を確認</p>
      {#if exportForTwinsResult.kind === "err"}
        <p class="step-problem">
          <TriangleAlert
            size={15}
          />時間が被っている授業はTWINSに登録できません。1つを残して、他は「当てはまる授業」に戻してください
        </p>
        <table class="show-term">
          <tbody>
            {#each uiOverlaps as group (group.slot)}
              {#each group.courses as course, i (course.id)}
                <tr class="course">
                  {#if i === 0}
                    <td
                      class="term"
                      rowspan={group.courses.length}
                      style="white-space: nowrap">{group.slot}</td
                    >
                  {/if}
                  <td class="id-name">
                    <span>{course.id}</span><br />
                    <SyllabusLink
                      {course}
                      catalogYear={akiko.knownCourseYear}
                    />
                  </td>
                  <td>
                    {#if course.cellId !== undefined}
                      {@const cellId = course.cellId}
                      <button onclick={() => onShowCell(cellId, group.term)}
                        >表示</button
                      >
                    {/if}
                  </td>
                </tr>
              {/each}
            {/each}
          </tbody>
        </table>
      {:else if exportCourses.length > 0}
        <details>
          <summary>{exportCourses.length}件・{exportCredits}単位</summary>
          <table>
            <tbody>
              {#each exportCourses as course (course.id)}
                <tr class="course">
                  <td class="id-name">
                    <span>{course.id}</span><br />
                    <SyllabusLink
                      {course}
                      catalogYear={akiko.knownCourseYear}
                    />
                  </td>
                  <td class="credit">{course.credit ?? "-"}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </details>
      {:else if uiJizentouroku.length + uiUnavailable.length === 0}
        <p class="step-note">
          TWINSに登録する授業がまだありません。<button
            class="link-button"
            onclick={onPickCourses}>「履修を組む」で選ぶ</button
          >
        </p>
      {/if}
      {@render leftOut(
        "事前登録の授業はファイルに含まれません。TWINSで別途事前登録してください",
        uiJizentouroku,
      )}
      {@render leftOut(
        "今年度開講しない授業はTWINSで登録できないので、ファイルに含まれません",
        uiUnavailable,
      )}
    </li>
    <li>
      <p>ファイルをダウンロード</p>
      <button
        id="export-button"
        data-tutorial="export-button"
        onclick={download}
        disabled={exportCourses.length === 0}
      >
        <Download size={20} />ダウンロード
      </button>
    </li>
    <li data-tutorial="export-upload">
      <p>
        TWINSでアップロード
        <a href={resolve("/twins-register")} target="_blank">手順を見る</a>
      </p>
      <p class="step-note">
        ※ アップロードしても、登録済みの授業は取り消されません
      </p>
    </li>
  </ol>
  {#if downloaded}
    <Dialog id="support-ask"
      >あきこが役に立ったら、<a
        href={SUPPORT_URL}
        target="_blank"
        rel="noreferrer">開発を支援</a
      >してもらえると嬉しいわ〜</Dialog
    >
  {/if}
</div>

<style lang="scss">
  @use "./steps-panel";

  table,
  td {
    border: 1px solid black;
    border-collapse: collapse;
  }

  table {
    width: 100%;
  }

  tbody > tr {
    background-color: white;
  }

  .link-button {
    all: unset;
    cursor: pointer;
    color: LinkText;
    text-decoration: underline;
  }

  .steps-panel > :global(#support-ask) {
    width: auto;
    margin-top: 50px;
  }

  .step-problem {
    display: flex;
    align-items: flex-start;
    gap: 5px;
    margin: 0;
    font-size: var(--fs-sm);
    color: oklch(50% 0.15 50);

    & > :global(svg) {
      flex-shrink: 0;
      height: 1lh;
    }
  }

  #export-button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    background-color: oklch(60% 50% 270);
    color: white;
    font-size: 18px;
    font-weight: bold;

    &:hover {
      background-color: oklch(50% 50% 270);
    }

    &:disabled {
      background-color: oklch(90% 0 0);
      color: oklch(60% 0 0);
    }
  }
</style>
