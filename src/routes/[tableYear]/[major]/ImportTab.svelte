<script lang="ts">
  import { resolve } from "$app/paths";
  import CircleCheck from "lucide-svelte/icons/circle-check";
  import CircleQuestionMark from "lucide-svelte/icons/circle-question-mark";
  import FileUp from "lucide-svelte/icons/file-up";
  import Lock from "lucide-svelte/icons/lock";
  import {
    akikoGetMergedCourse,
    akikoGetUnclassifiedFakeCourses,
    akikoGetUnclassifiedRealCourses,
    creditSum,
    gradeIsPass,
    type Akiko,
    type FakeCourse,
    type RealCourse,
  } from "$lib/akiko";
  import { gradeDisplay } from "./credit-display";
  import SyllabusLink from "./SyllabusLink.svelte";

  let {
    akiko,
    realCourses,
    fakeCourses,
    native = $bindable(),
    onImport,
  }: {
    akiko: Akiko;
    realCourses: RealCourse[];
    fakeCourses: FakeCourse[];
    /** Whether the student entered this major directly, not through 総合学域群. */
    native: boolean;
    onImport: (file: File) => void;
  } = $props();

  let csvDragOver = $state(false);

  const gradesImported = $derived(realCourses.length + fakeCourses.length > 0);
  const importedCredits = $derived(
    creditSum([
      ...realCourses.filter((c) => gradeIsPass(c.grade)),
      ...fakeCourses,
    ]),
  );
  const unclassifiedCourses = $derived({
    real: akikoGetUnclassifiedRealCourses(akiko)
      .map((rc) => akikoGetMergedCourse(akiko, rc.id))
      .filter((c) => c !== undefined),
    fake: akikoGetUnclassifiedFakeCourses(akiko),
  });

  function handleCsvUpload(event: Event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const file = input.files?.[0];
    if (!file) return;
    // Lets choosing the same file again fire change
    input.value = "";
    onImport(file);
  }
</script>

<div class="steps-panel">
  <ol class="steps">
    <li>
      <p>
        TWINSから成績ファイルをダウンロード
        <a class="step-help" href={resolve("/twins-grades")} target="_blank"
          ><CircleQuestionMark size={15} />手順を見る</a
        >
      </p>
      <p class="step-note">
        ※ ExcelやNumbersなどで開かずに、そのままインポートしてください
      </p>
    </li>
    <li>
      <p>ダウンロードしたファイルをインポート</p>
      <label
        id="csv-drop-zone"
        class:dragover={csvDragOver}
        class:imported={gradesImported}
        ondragover={(e) => {
          e.preventDefault();
          csvDragOver = true;
        }}
        ondragleave={() => (csvDragOver = false)}
        ondrop={(e) => {
          e.preventDefault();
          csvDragOver = false;
          const file = e.dataTransfer?.files[0];
          if (file) onImport(file);
        }}
      >
        {#if gradesImported}
          <CircleCheck size={30} strokeWidth={1.5} />
          <span>インポート済み（{importedCredits}単位）</span>
          <span class="sub">ドロップまたはクリックで再インポート</span>
        {:else}
          <FileUp size={30} strokeWidth={1.5} />
          <span>ここにドロップ</span>
          <span class="sub">またはクリックして選択</span>
        {/if}
        <input
          type="file"
          class="csv-input"
          accept=".csv"
          onchange={handleCsvUpload}
        />
      </label>
      <p class="step-note">
        <Lock
          size={15}
        />成績データは、あきこの開発チームに閲覧されたり、外部に送信されたりすることはありません
      </p>
    </li>
    <li>
      <div id="student-type">
        <span>総合学域群からこの学類に移行した？</span>
        <div class="segmented">
          <label
            ><input
              type="radio"
              name="student-type"
              bind:group={native}
              value={true}
            />いいえ</label
          >
          <label
            ><input
              type="radio"
              name="student-type"
              bind:group={native}
              value={false}
            />はい</label
          >
        </div>
      </div>
    </li>
  </ol>
  {#if unclassifiedCourses.real.length + unclassifiedCourses.fake.length > 0}
    <details>
      <summary
        >卒業単位に含まれない授業（{unclassifiedCourses.real.length +
          unclassifiedCourses.fake.length}件）</summary
      >
      <table class="show-term">
        <thead>
          <tr class="course">
            <th class="id-name">科目</th>
            <th class="credit">単位</th>
            <th class="term">評価</th>
          </tr>
        </thead>
        <tbody>
          {#each unclassifiedCourses.real as c (c.id)}
            <tr class="course">
              <td class="id-name">
                <span>{c.id}</span><br />
                <SyllabusLink course={c} catalogYear={akiko.knownCourseYear} />
              </td>
              <td class="credit">{c.credit ?? "-"}</td>
              <td class="term">{c.real && gradeDisplay(c.real.grade)}</td>
            </tr>
          {/each}
          {#each unclassifiedCourses.fake as c (c.id)}
            <tr class="course">
              <td class="id-name">
                <span>（科目番号不明）</span><br />
                <span>{c.name}</span>
              </td>
              <td class="credit">{c.credit ?? "-"}</td>
              <td class="term">-</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </details>
  {/if}
</div>

<style lang="scss">
  @use "./steps-panel";

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

  tbody > tr {
    background-color: white;
  }

  details > summary {
    cursor: pointer;
    margin-bottom: 10px;
  }

  .csv-input {
    display: none;
  }

  #csv-drop-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 30px;
    border: 2px dashed oklch(70% 0.1 270);
    border-radius: 10px;
    background-color: oklch(97% 0.02 270);
    color: oklch(40% 0.1 270);
    cursor: pointer;

    &:hover,
    &.dragover {
      background-color: oklch(92% 0.05 270);
    }

    &.imported {
      border-color: oklch(70% 0.1 150);
      background-color: oklch(97% 0.03 150);
      color: oklch(40% 0.1 150);

      &:hover,
      &.dragover {
        background-color: oklch(92% 0.06 150);
      }
    }

    & > .sub {
      font-size: var(--fs-sm);
    }
  }

  #student-type {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  .segmented {
    display: flex;
    border: 1px solid gray;
    border-radius: 10px;
    overflow: hidden;

    & > label {
      padding: 5px 15px;
      cursor: pointer;

      & + label {
        border-left: 1px solid gray;
      }

      &:has(input:checked) {
        background-color: oklch(70% 50% 270);
        color: white;
      }

      &:has(input:focus-visible) {
        outline: 2px solid oklch(60% 15% 250);
        outline-offset: -2px;
      }
    }

    & input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
  }
</style>
