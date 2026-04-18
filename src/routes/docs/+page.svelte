<script lang="ts">
  import { asset } from "$app/paths";
  import HowToImportFromTwins from "$lib/HowToImportFromTwins.svelte";
  import HowToExportForTwins from "$lib/HowToExportForTwins.svelte";
  import Callout from "$lib/Callout.svelte";
  import Nav from "$lib/Nav.svelte";
  const title = "あきこの使い方";
  const description = "あきこの使い方やTWINSとの連携方法などの説明です。";
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

<h1>{title}</h1>

<Callout kind="warning">
  あきこは筑波大学が公式に作成したものではなく有志の学生が作成したものなので、授業一覧や単位計算に誤りがある可能性があります。
  卒業に必要な単位をあきこで管理する場合は、利用者本人の責任のもとで管理してしてください。
  また、不明な点がある場合は、学生支援室にて相談するようにしてください。
</Callout>

<section>
  <h2>あきこの使い方</h2>
  <p>
    自分の学類と入学年度に対応するページを開きます。
    ここでは履修要覧とそれぞれのマスに当てはまる授業の一覧を見ることができます。
    マスを選択すると、当てはまる授業の一覧が「当てはまる授業」の欄に表示されます。
    それぞれのマスに該当する授業だけを見ることで、履修する授業を楽に探すことができます。
  </p>
  <img src={asset("/docs/images/cell-selected.png")} />
  <p>
    表示された授業を右側にドラッグ&ドロップすることで、「取る授業」に移動することができます。
    移動された授業の単位は「取る」単位として計上されます。
    また、TWINSからダウンロードできる成績データをあきこにインポートすることで、現在の自分の履修状況を踏まえた授業探しが可能になります。
  </p>
  <img src={asset("/docs/images/grades-imported.png")} />
  <p>
    すでに成績がついている授業は「単位取得済みの授業」、まだ履修中で成績がついていない授業は「取る授業」となります。
    単位の取得状況や合計を考慮することで、履修する授業がさらに探しやすくなります。
  </p>
</section>

<HowToImportFromTwins />

<HowToExportForTwins />
