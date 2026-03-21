<script lang="ts">
  import { asset } from "$app/paths";
</script>

<section>
  <h2>TWINSの成績データをダウンロードする手順</h2>
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
