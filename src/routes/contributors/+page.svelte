<script lang="ts">
  import { asset } from "$app/paths";
  import { DOCS_PAGE_NAME_TO_JA, type DocsPageName } from "$lib/constants";
  import Nav from "$lib/Nav.svelte";

  const title = "あきこの主な貢献者一覧";
  const description = "あきこに主に貢献した人たちの一覧です。";

  type Contributor = { name: string; major: DocsPageName };

  const contributors: Contributor[] = [
    { name: "白井拓翔（企画・代表）", major: "coins" },
    { name: "髙橋怜佑", major: "coins" },
    { name: "中山佳汰", major: "coens" },
    { name: "河名翼", major: "coins" },
    { name: "加藤愛緯", major: "ccc" },
    { name: "安田和也", major: "coins" },
    { name: "齊藤慎太郎", major: "klis" },
    { name: "島崎悠人", major: "coins" },
    { name: "田部萌々佳", major: "klis" },
    { name: "高木直希", major: "coins" },
  ];
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta
    property="og:image"
    content="https://github.com/user-attachments/assets/be6c928e-36fa-48e4-ac5b-5a0406a0adb2"
  />
</svelte:head>

<Nav />

<main>
  <h1>{title}</h1>

  <p>
    あきこの開発や運用において、直接的な貢献をした方たちの一覧です。
    協力していただいた感謝の意を込めて、お名前と学類をご紹介します。
    また、SNSやフォームを通じて匿名でご意見や情報提供をしていただいた方にも、改めて感謝を申し上げます。
    今後ともあきこをよろしくお願いいたします。
  </p>

  <div class="dialog student">
    <img src={asset("/images/crowd.png")} alt="貢献者たち" />
    <span>貢献者たち</span>
    <span>私たちがあきこです！</span>
  </div>

  <table>
    <thead>
      <tr>
        <th>氏名</th>
        <th>学類</th>
      </tr>
    </thead>
    <tbody>
      {#each contributors as c}
        <tr>
          <td>{c.name}</td>
          <td>{DOCS_PAGE_NAME_TO_JA[c.major]}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>

<style lang="scss">
  :global(body) {
    max-width: var(--content-max-width);
    margin: auto;
    padding-left: 10px;
    padding-right: 10px;
  }

  * {
    margin: 0;
    padding: 0;
  }

  main {
    padding-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 30px;
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

    &.student {
      --h: 270;
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
      font-size: 13px;
    }

    & > span:nth-of-type(2) {
      grid-column: 2/3;
      grid-row: 1/3;
      align-self: center;
      margin-left: 30px;
    }
  }

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
    background-color: oklch(0.9 0 0);
  }
  tr:nth-child(2n) {
    background-color: oklch(0.96 0 0);
  }
  tr:nth-child(2n + 1) {
    background-color: oklch(0.98 0 0);
  }

  th,
  td {
    padding: 10px 20px;
  }
</style>
