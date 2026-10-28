<script lang="ts">
  import Callout from "$lib/Callout.svelte";
  import HowToImportFromTwins from "$lib/HowToImportFromTwins.svelte";
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
  <HowToImportFromTwins />
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

  h1 {
    margin: 0;
  }
</style>
