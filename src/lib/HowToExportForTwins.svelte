<script lang="ts">
  import { asset } from "$app/paths";
  import Callout from "$lib/Callout.svelte";
</script>

<section>
  <h2>取る授業一覧ファイルの使い方</h2>
  <p>
    あきこは「取る授業」の科目番号の一覧をCSVファイルとして出力することができます。
    以下の手順でこのファイルをTWINSにインポートすることで、「取る授業」に移動した授業をTWINSにまとめて履修登録することができます。
  </p>
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
  <Callout kind="warning">
    履修中の授業を「取る授業」から「当てはまる授業」に移動してから、TWINSに取る授業一覧をインポートしても、移動した授業の履修解除はされません。
  </Callout>
  <Callout kind="warning">
    上記の方法では、事前登録の必要がある授業をTWINS上で履修登録することができません。
    そのため、「取る授業」のうち事前登録の授業はCSVファイルに含まれません。
    事前登録の授業を履修する場合は、別途手動で事前登録をする必要があります。
  </Callout>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 20px;

    & > * {
      margin-top: 0;
      margin-bottom: 0;
    }
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
