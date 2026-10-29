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
  import Dialog from "$lib/Dialog.svelte";
  import Meta from "$lib/Meta.svelte";
  import Nav from "$lib/Nav.svelte";
  import ArrowDown from "lucide-svelte/icons/arrow-down";

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

  /**
   * The major's name without the college's, or the full name if the two are
   * the same.
   */
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

  // Each element of title ends where a line may break
  const features: {
    title: string[];
    body: string;
    src: string;
    alt: string;
  }[] = [
    {
      title: ["あと何単位", "必要かわかる"],
      body: "TWINSの成績ファイルを読み込むと、履修要覧の表に色が付く",
      src: "/images/top/credits.jpg",
      alt: "取った単位で色が付いた履修要覧の表",
    },
    {
      title: ["取れる授業が", "すぐ見つかる"],
      body: "表のマスを押すと、そこに当てはまる授業が全部出てくる",
      src: "/images/top/courses.jpg",
      alt: "選んだマスに当てはまる授業の一覧",
    },
    {
      title: ["TWINSに", "まとめて登録"],
      body: "組んだ時間割をファイルにして、TWINSで一度にアップロード",
      src: "/images/top/timetable.jpg",
      alt: "授業が入った時間割と「TWINSに出力」ボタン",
    },
  ];
</script>

<Meta title="あきこ" {description} />

<Nav />

<header class="hero">
  <h1>あきこ</h1>
  <p>筑波大生のための履修サポートWebツール</p>
</header>

<Dialog
  speaker="student"
  image="/images/student-stressed-2.png"
  alt="困っている学生"
  >筑波大は履修する授業を探すのも、取れた単位を計算するのも大変だな...</Dialog
>
<Dialog>履修はあきこと一緒に3ステップで終わらせましょ〜</Dialog>

<ol class="features">
  {#each features as f, i (f.body)}
    <li>
      <span class="num">{i + 1}</span>
      <h3>
        {#each f.title as part (part)}<span>{part}</span>{/each}
      </h3>
      <p>{f.body}</p>
      <img src={asset(f.src)} alt={f.alt} />
    </li>
  {/each}
</ol>

<Dialog speaker="student" image="/images/student-relieved.png" alt="嬉しい学生"
  >あきこさん！ありがとう！！！</Dialog
>

<div class="flow-arrow" aria-hidden="true">
  <ArrowDown size={40} />
</div>

<Dialog id="app-page-links"
  >さっそく始めましょ〜<br />まずは入学年度を教えてね</Dialog
>
<div class="choices years">
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
  <Dialog>学類はどこかしら？</Dialog>
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
  <Dialog>主専攻も教えてね〜</Dialog>
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

  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin: 30px 0 50px;

    & > h1 {
      margin: 0;
      font-size: 60px;
      letter-spacing: 0.1em;
      // letter-spacing also adds space after the last letter, so pad the left by
      // the same to keep the underline centered
      padding: 0 10px 0 calc(10px + 0.1em);
      line-height: 1.2;
      background: linear-gradient(transparent 65%, oklch(90% 10% 350) 65%);
    }

    & > p {
      margin: 0;
      color: #555;
    }
  }

  .features {
    list-style: none;
    margin: 20px 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;

    & > li {
      display: grid;
      grid-template-columns: 35px 1fr;
      grid-template-rows: auto auto 1fr;
      column-gap: 10px;
      row-gap: 5px;
      padding: 15px 20px;
      background-color: hsl(0, 0%, 98%);
      border: 1px solid hsl(0, 0%, 92%);
      border-radius: 15px;
    }

    & h3 {
      margin: 0;
      align-self: center;
      font-size: 18px;

      & > span {
        display: inline-block;
      }
    }

    & p {
      grid-column: 1/3;
      margin: 0;
      color: #555;
      line-height: 1.6;
      word-break: auto-phrase;
    }
  }

  .num {
    align-self: center;
    display: grid;
    place-items: center;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background-color: oklch(70% 50% 270);
    color: white;
    font-weight: bold;
  }

  .features img {
    grid-column: 1/3;
    align-self: end;
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    object-position: left top;
    margin-top: 10px;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-sizing: border-box;
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

  .flow-arrow {
    display: flex;
    justify-content: center;
    margin: 25px 0;
    color: oklch(85% 0 0);
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

  // The entry point, so it stands out more than the college and major choices
  .years > .choice {
    padding: 10px 20px;
    border: 2px solid oklch(70% 50% 270);
    color: oklch(45% 30% 270);
    font-size: 18px;
    font-weight: bold;

    &::after {
      content: " ›";
    }

    &:hover {
      background-color: oklch(97% 3% 270);
    }

    &.picked {
      background-color: oklch(70% 50% 270);
      color: white;
    }
  }

  details {
    margin: 30px 0;

    & > summary {
      cursor: pointer;
      margin-bottom: 20px;
      color: #888;
      font-size: 15px;
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
</style>
