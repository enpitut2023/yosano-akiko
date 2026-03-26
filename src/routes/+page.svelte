<script lang="ts">
  import { resolve, asset } from "$app/paths";
  import {
    instances,
    MAJOR_TO_JA,
    MAJOR_TO_DOCS_PAGE_NAME,
    type Instance,
    majorCompare,
  } from "$lib/constants";
  import { assert } from "$lib/util";

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
    return {
      tableYear,
      instances: is.map((i, index) => ({
        ...i,
        majorJa: MAJOR_TO_JA[i.major],
        gap:
          index > 0 &&
          MAJOR_TO_DOCS_PAGE_NAME[is[index - 1].major] !==
            MAJOR_TO_DOCS_PAGE_NAME[i.major],
      })),
    };
  });
</script>

<svelte:head>
  <title>あきこ</title>
  <meta name="description" content={description} />
  <meta property="og:title" content="あきこ" />
  <meta property="og:description" content={description} />
  <meta
    property="og:image"
    content="https://github.com/user-attachments/assets/be6c928e-36fa-48e4-ac5b-5a0406a0adb2"
  />
</svelte:head>

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
<div class="dialog akiko" style="margin-bottom: 20px">
  <img src={asset("/images/akiko.png")} alt="あきこ" />
  <span>あきこ</span>
  <span>まずは入学年度と学類を教えてね〜</span>
</div>

<p class="remark">
  チェックマーク✅は、その学類の支援室があきこの正しさをある程度確認済みであること表します。
  チェックマークがついていても、成績データに対する単位計算は正しくない可能性があります。
  また、支援室はあきこ上の誤った単位計算などによる損害の責任を負いません。
</p>

{#each sections as s}
  <section>
    <h3>{s.tableYear}年度入学</h3>
    <ul>
      {#each s.instances as i}
        <li class:gap={i.gap}>
          <a
            href={resolve("/[tableYear]/[major]", {
              tableYear: s.tableYear.toString(),
              major: i.major,
            })}>{i.majorJa}</a
          >
          {#if i.checked}<span>✅</span>{/if}
          {#if i.comment}<span>{i.comment}</span>{/if}
        </li>
      {/each}
    </ul>
  </section>
{/each}

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
