<script lang="ts">
  import { asset } from "$app/paths";
  import Callout from "$lib/Callout.svelte";
  import Meta from "$lib/Meta.svelte";
  import Nav from "$lib/Nav.svelte";

  const title = "TWINSの成績ファイルの入手方法";
  const description =
    "あきこにインポートするTWINSの成績ファイルをダウンロードする手順です。";
</script>

<Meta {title} {description} />

<Nav />

<main>
  <h1>{title}</h1>
  <ol>
    <li>TWINSにログインします。</li>
    <li>
      「成績」の中にある「成績照会」タブを開きます。
      <img src={asset("/docs/images/grades-tab.png")} alt="成績照会タブ" />
    </li>
    <li>
      ページの一番下にある「ダウンロード」ボタンを押します。
      <img
        src={asset("/docs/images/download-button.png")}
        alt="ダウンロードボタン"
      />
    </li>
    <li>
      ファイル形式を「CSV」、文字コードを「Unicode」、BOM有無を「BOMなし」にして「出力」ボタンを押します。
      <img src={asset("/docs/images/export-button.png")} alt="出力ボタン" />
    </li>
  </ol>
  <p>
    これでダウンロードされるファイルがTWINSの成績ファイルです。
    このファイルをあきこにインポートすることで、現在の自分の履修状況を踏まえた授業探しをすることができます。
  </p>
  <Callout kind="warning">
    成績データのファイルは、あきこにインポートする前にExcelやNumbersなどのアプリケーションで開いたり保存しないでください。
    データの形式が壊れ、あきこに正しくインポートできなくなる場合があります。
  </Callout>
</main>

<style lang="scss">
  :global(body) {
    max-width: var(--content-max-width);
    margin: auto;
    padding-left: 10px;
    padding-right: 10px;
  }

  main {
    padding: 30px 0 100px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  main > * {
    margin-top: 0;
    margin-bottom: 0;
  }

  ol {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  img {
    width: 100%;
    border: 1px solid oklch(0.7 0 0);
  }
</style>
