<script lang="ts">
  import { resolve, asset } from "$app/paths";
  import {
    instances,
    MAJOR_TO_JA,
    MAJOR_TO_COLLEGE,
    COLLEGE_TO_JA,
    type College,
    type Instance,
    majorCompare,
  } from "$lib/constants";
  import { assert } from "$lib/util";
  import Callout from "$lib/Callout.svelte";
  import Meta from "$lib/Meta.svelte";
  import Nav from "$lib/Nav.svelte";

  const description =
    "筑波大生向けの履修サポートWebツールです。単位の計算・授業探し・Twinsへの登録を楽に終わらせましょう！";

  const yearToInstances = new Map<number, Instance[]>();
  for (const i of instances) {
    let is = yearToInstances.get(i.tableYear);
    if (is === undefined) {
      yearToInstances.set(i.tableYear, [i]);
    } else {
      is.push(i);
    }
  }

  const years = Array.from(yearToInstances.keys()).sort((a, b) => b - a);

  const sections = years.map((tableYear) => {
    const is = yearToInstances.get(tableYear);
    assert(is !== undefined);
    is.sort((a, b) => majorCompare(a.major, b.major));
    const colleges: { college: College; instances: Instance[] }[] = [];
    for (const i of is) {
      const college = MAJOR_TO_COLLEGE[i.major];
      const last = colleges.at(-1);
      if (last?.college === college) {
        last.instances.push(i);
      } else {
        colleges.push({ college, instances: [i] });
      }
    }
    return {
      tableYear,
      colleges,
      instances: is.map((i, index) => ({
        ...i,
        majorJa: MAJOR_TO_JA[i.major],
        gap:
          index > 0 &&
          MAJOR_TO_COLLEGE[is[index - 1].major] !== MAJOR_TO_COLLEGE[i.major],
      })),
    };
  });

  function pageHref(i: Instance): string {
    return resolve("/[tableYear]/[major]", {
      tableYear: i.tableYear.toString(),
      major: i.major,
    });
  }

  /** 学類名を除いた主専攻名。学類名そのものなら学類名を返す */
  function majorOnlyJa(i: Instance): string {
    const full = MAJOR_TO_JA[i.major];
    const college = COLLEGE_TO_JA[MAJOR_TO_COLLEGE[i.major]];
    return full.slice(college.length).trim() || full;
  }

  let pickedYear = $state<number | undefined>();
  let pickedCollege = $state<College | undefined>();
  const pickedSection = $derived(
    sections.find((s) => s.tableYear === pickedYear),
  );
  const pickedCollegeInstances = $derived(
    pickedSection?.colleges.find((c) => c.college === pickedCollege)?.instances,
  );
</script>

<Meta title="あきこ" {description} />

<Nav />

<h1>あきこ</h1>

<div class="dialog student">
  <img src={asset("/images/student-stressed-1.png")} alt="困っている学生" />
  <span>学生</span>
  <span>筑波大は履修しないといけない授業を探すのが難しいな...</span>
</div>
<div class="dialog student">
  <img
    src={asset("/images/student-stressed-2.png")}
    alt="もっと困っている学生"
  />
  <span>学生</span>
  <span>どれぐらい単位が取れているかも自分で計算しないといけない...</span>
</div>
<div class="dialog akiko">
  <img src={asset("/images/akiko.png")} alt="あきこ" />
  <span>あきこ</span>
  <span>履修を手伝ってほしいのね〜</span>
</div>
<div class="dialog student">
  <img src={asset("/images/student-relieved.png")} alt="嬉しい学生" />
  <span>学生</span>
  <span>あきこさん！ありがとう！！！</span>
</div>

<h2 id="app-page-links">年度・学類一覧</h2>
<div class="dialog akiko">
  <img src={asset("/images/akiko.png")} alt="あきこ" />
  <span>あきこ</span>
  <span>まずは入学年度を教えてね〜</span>
</div>
<div class="choices">
  {#each sections as s (s.tableYear)}
    <button
      class="choice"
      class:picked={pickedYear === s.tableYear}
      onclick={() => {
        pickedYear = s.tableYear;
        pickedCollege = undefined;
      }}>{s.tableYear}年度入学</button
    >
  {/each}
</div>

{#if pickedSection}
  <div class="dialog akiko">
    <img src={asset("/images/akiko.png")} alt="あきこ" />
    <span>あきこ</span>
    <span>学類はどこかしら？</span>
  </div>
  <div class="choices">
    {#each pickedSection.colleges as c (c.college)}
      {@const checked = c.instances.every((i) => i.checked)}
      {#if c.instances.length === 1}
        <a class="choice" href={pageHref(c.instances[0])}
          >{COLLEGE_TO_JA[c.college]}{#if checked}&nbsp;✅{/if}</a
        >
      {:else}
        <button
          class="choice"
          class:picked={pickedCollege === c.college}
          onclick={() => (pickedCollege = c.college)}
          >{COLLEGE_TO_JA[c.college]}{#if checked}&nbsp;✅{/if}</button
        >
      {/if}
    {/each}
  </div>
{/if}

{#if pickedCollegeInstances}
  <div class="dialog akiko">
    <img src={asset("/images/akiko.png")} alt="あきこ" />
    <span>あきこ</span>
    <span>主専攻も教えてね〜</span>
  </div>
  <div class="choices">
    {#each pickedCollegeInstances as i (i.major)}
      <a class="choice" href={pageHref(i)}
        >{majorOnlyJa(i)}{#if i.checked}&nbsp;✅{/if}</a
      >
    {/each}
  </div>
{/if}

<details>
  <summary>すべての学類を表示</summary>
  {#each sections as s (s.tableYear)}
    <section>
      <h3>{s.tableYear}年度入学</h3>
      <ul>
        {#each s.instances as i (i.major)}
          <li class:gap={i.gap}>
            <a href={pageHref(i)}>{i.majorJa}</a>
            {#if i.checked}<span>✅</span>{/if}
            {#if i.comment}<span>{i.comment}</span>{/if}
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</details>

<h2>ご利用にあたって</h2>
<Callout kind="warning">
  あきこは筑波大学が公式に作成したものではなく有志の学生が作成したものなので、授業一覧や単位計算に誤りがある可能性があります。
  卒業に必要な単位をあきこで管理する場合は、利用者本人の責任のもとで管理してください。
  また、不明な点がある場合は、学生支援室にて相談してください。
</Callout>
<p class="remark">
  チェックマーク✅は、その学類の支援室があきこの正しさをある程度確認済みであること表します。
  チェックマークがついていても、成績データに対する単位計算は正しくない可能性があります。
  また、支援室はあきこ上の誤った単位計算などによる損害の責任を負いません。
</p>
<p class="remark">
  編入生の方もあきこを利用できますが、TWINSの仕様のため編入生の認可された科目のみ単位チェック時に正しく単位を計算することができません。
  あらかじめご了承ください。
</p>

<style lang="scss">
  :global(body) {
    max-width: var(--content-max-width);
    margin: auto;
    padding-left: 10px;
    padding-right: 10px;
  }

  h1 {
    margin-bottom: 30px;
  }

  h2 {
    margin-top: 100px;
    margin-bottom: 30px;
  }

  p {
    margin: 30px 10px;

    &.remark {
      color: #444;
      border-left: 5px solid #aaa;
      padding-left: 10px;
    }
  }

  .choices {
    width: 80%;
    margin: 15px auto 30px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .choice {
    font-size: inherit;
    padding: 5px 15px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: white;
    color: inherit;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      background-color: oklch(95% 0 0);
    }

    &.picked {
      $c: oklch(70% 50% 270);
      background-color: $c;
      border-color: $c;
      color: white;
    }
  }

  details {
    margin: 30px 0;

    & > summary {
      cursor: pointer;
      margin-bottom: 20px;
    }
  }

  section {
    background-color: hsl(0, 0%, 98%);
    border: 1px solid hsl(0, 0%, 92%);
    padding: 20px 30px;

    & + & {
      margin-top: 20px;
    }

    & > h3 {
      margin: 0;
      font-size: 20px;
    }

    & > ul > li.gap {
      margin-top: 10px;
    }
  }

  .dialog {
    width: 80%;
    margin-left: auto;
    margin-right: auto;

    display: grid;
    $icon-size: 70px;
    grid-template-columns: $icon-size auto;
    grid-template-rows: $icon-size auto;
    padding: 10px 20px;

    --fill-l: 98%;
    --fill-c: 4%;
    --outline-l: 92%;
    --outline-c: 10%;
    background-color: oklch(var(--fill-l) var(--fill-c) var(--h));
    border: 1px solid oklch(var(--outline-l) var(--outline-c) var(--h));
    border-radius: 20px;

    & + .dialog {
      margin-top: 10px;
    }

    &.student {
      --h: 270;
    }

    &.akiko {
      --h: 350;
    }

    & > img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background-color: hsl(0, 0%, 98%);
      border: 1px solid oklch(var(--outline-l) var(--outline-c) var(--h));
      border-radius: 50%;
    }

    & > span:first-of-type {
      place-self: center;
      margin-top: 5px;
    }

    & > span:nth-of-type(2) {
      grid-column: 2/3;
      grid-row: 1/3;
      align-self: center;
      margin-left: 30px;
    }
  }
</style>
