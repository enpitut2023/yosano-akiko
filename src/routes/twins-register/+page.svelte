<script lang="ts">
  import { asset } from "$app/paths";
  import Callout from "$lib/Callout.svelte";
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
  <ol>
    <li>TWINSにログインします。</li>
    <li>
      「履修」の中にある「履修登録・登録状況照会」タブを開きます。
      <img
        src={asset("/docs/images/register-tab.png")}
        alt="履修登録・登録状況照会タブ"
      />
    </li>
    <li>
      履修登録期間中の学期を選択すると現れる「アップロード」ボタンを押します。
      <img
        src={asset("/docs/images/upload-button.png")}
        alt="アップロードボタン"
      />
    </li>
    <li>
      あきこで出力したCSVファイルを選択して「登録」ボタンを押します。
      <img src={asset("/docs/images/register-button.png")} alt="登録ボタン" />
    </li>
  </ol>
  <p>これで「取る授業」の授業がTWINSにまとめて履修登録されます。</p>
  <Callout kind="warning">
    履修中の授業を「取る授業」から「当てはまる授業」に移動してから、TWINSに取る授業一覧をインポートしても、移動した授業の履修解除はされません。
  </Callout>
  <Callout kind="warning">
    上記の方法では、事前登録の必要がある授業をTWINS上で履修登録することができません。
    そのため、「取る授業」のうち事前登録の授業はCSVファイルに含まれません。
    事前登録の授業を履修する場合は、別途手動で事前登録をする必要があります。
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
