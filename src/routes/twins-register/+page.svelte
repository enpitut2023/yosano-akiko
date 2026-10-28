<script lang="ts">
  import HowToExportForTwins from "$lib/HowToExportForTwins.svelte";
  import Meta from "$lib/Meta.svelte";
  import Nav from "$lib/Nav.svelte";

  const title = "取る授業一覧ファイルをTWINSに登録する方法";
  const description =
    "あきこで出力した取る授業一覧ファイルをTWINSにアップロードして、まとめて履修登録する手順です。";
</script>

<Meta {title} {description} />

<Nav />

<main>
  <h1>{title}</h1>
  <HowToExportForTwins />
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
