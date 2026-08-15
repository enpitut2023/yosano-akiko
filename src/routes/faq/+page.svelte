<script lang="ts">
  import { resolve } from "$app/paths";
  import { AKIKO_X_URL, ENPIT_URL, FEEDBACK_FORM_URL } from "$lib/constants";
  import Nav from "$lib/Nav.svelte";

  const title = "よくある質問";
  const description = "あきこについてよく寄せられる質問と回答をまとめました。";
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

  <section>
    <h2>公式のツール？</h2>
    <p>
      あきこは筑波大学が公式に作成したものではなく有志の学生が作成したものなので、授業一覧や単位計算に誤りがある可能性があります。
      卒業に必要な単位をあきこで管理する場合は、利用者本人の責任のもとで管理してしてください。
      また、不明な点がある場合は、学生支援室にて相談してください。
    </p>
  </section>

  <section>
    <h2>データは正しい？</h2>
    <p>
      間違っている可能性もあります。ただし、支援室や学生などさまざまな方に聞いて、なるべく間違いがないように細心の注意を払っています。もしデータの間違いを見つけましたら、<a
        href={FEEDBACK_FORM_URL}
        target="_blank"
        rel="noreferrer">こちらのフォーム</a
      >にお願いいたします。
    </p>
  </section>

  <section>
    <h2>なんであきこ？</h2>
    <p>「あきこさんに履修を手伝ってもらう」という設定です。</p>
  </section>

  <section>
    <h2>個人情報って大丈夫なの？</h2>
    <p>
      ご安心ください、個人情報が漏洩することはありません。あきこはみなさんのパソコンの中だけで動作しているため、データは外部に漏れません。あきこのソースコードは<a
        href="https://github.com/enpitut2023/yosano-akiko"
        target="_blank"
        rel="noreferrer">ここ</a
      >に掲載されています。
    </p>
  </section>

  <section>
    <h2>使い方がよく分からない</h2>
    <p>
      あきこの使い方は<a href={resolve("/docs")}>このページ</a
      >で説明されています。こちらを参照してください。
    </p>
  </section>

  <section>
    <h2>生物学類ってない？</h2>
    <p>
      生物学類のみ他の学類と異なる形式の履修要覧の表を使っており、これに対応するものの開発には時間がかかってしまうため、現在は対応していません。申し訳ございません。
    </p>
  </section>

  <section>
    <h2>人文学類ってない？</h2>
    <p>
      人文学類の学生は「履修の手引き」に記載されている人文学類専用のルールで履修を組む必要があります。生物学類と同様に、開発コストの都合上現在は対応していません。申し訳ございません。
    </p>
  </section>

  <section>
    <h2>総合学域群のページってない？</h2>
    <p>
      総合学域群1年生向けのページはありませんが、移行先の学類のページはお使いいただけます。
      総合学域群向けの授業などの単位の読み替えについても、できる限り対応していますが、ここは正確ではない部分も多いのが現状です。
      わからない部分や「ここ違うんじゃない？」というところがあれば、<a
        href={FEEDBACK_FORM_URL}
        target="_blank"
        rel="noreferrer">こちら</a
      >または<a href={AKIKO_X_URL} target="_blank" rel="noreferrer">X</a
      >からお気軽にお問い合わせください。こちらで確認し、Xでもご報告します。
    </p>
  </section>

  <section>
    <h2>編入生は使える？</h2>
    <p>
      お使いいただけますが、TWINSの成績ファイルをインポートする場合、認可された授業はほとんどが正しく振り分けられません。
      あきこは科目番号をもとに授業を各マスに振り分けていますが、TWINSの制限上認可された授業には科目番号が振られていないためです。
      ご了承ください。
    </p>
  </section>

  <section>
    <h2>分かりにくいところ・使いにくいところがあるんだけど</h2>
    <p>
      <a href={resolve("/contact")}>こちら</a
      >からあきこにお問い合わせいただくことができます。ご意見などぜひお聞かせください。
    </p>
  </section>

  <section>
    <h2>誰が開発してるの？</h2>
    <p>
      筑波大学の学生、院生、または卒業生です。あきこは<a
        href={ENPIT_URL}
        target="_blank"
        rel="noreferrer">enPiT</a
      >という授業から生まれました。あきこみたいにみんなに使われるものを企画したい！作ってみたい！という方はぜひ参加してみてください。
    </p>
  </section>

  <section>
    <h2>何のために開発してるの？</h2>
    <p>
      <a href={ENPIT_URL} target="_blank" rel="noreferrer">enPiT</a
      >への恩返しです。将来的には全学類・全学年を制覇したいと考えています。
    </p>
  </section>
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
    gap: 20px;
  }

  h1 {
    margin-bottom: 10px;
  }

  section {
    background-color: hsl(0, 0%, 98%);
    border: 1px solid hsl(0, 0%, 92%);
    padding: 20px 30px;

    & > h2 {
      font-size: 20px;
      margin-bottom: 15px;
    }

    & > p {
      line-height: 1.8;
    }
  }
</style>
