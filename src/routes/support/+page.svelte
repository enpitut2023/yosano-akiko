<script lang="ts">
  import { asset, resolve } from "$app/paths";
  import { Server, Wrench, Gift, LayoutList, Clock, Pencil, HandHeart } from "lucide-svelte";
  import ContactEmail from "$lib/ContactEmail.svelte";
  import Nav from "$lib/Nav.svelte";
  const title = "あきこを支援する";
  const description = "あきこの開発を支援する方法を紹介します。";
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
</svelte:head>

<Nav />

<h1>{title}</h1>

<div class="dialog akiko">
  <img src={asset("/images/akiko.png")} alt="あきこ" />
  <span>あきこ</span>
  <span>いつもありがとうね〜</span>
</div>

<div class="intro">
  <p>
    いつもあきこをご利用いただきありがとうございます。
    あきこは、「毎回の履修登録や管理をもっとスムーズにしたい」という思いから、有志のメンバーにより無償で開発・運営されています。
    おかげさまで多くの方に使っていただいていますが、あきこを安定して提供し続けるためには定期的なメンテナンス作業が必要になります。
    これからも安定した運営とアップデートを続けていくために、開発チームへのご支援をお願いしています。
  </p>
  <div class="pricing">
    <span class="price">500円〜</span>
    <span class="price-label">/ 1口</span>
  </div>
  <a class="payment-button" href="TODO"><HandHeart />支援する</a>
  <p class="stripe-note">
    Powered by <strong>Stripe</strong> — クレジットカード対応
  </p>
</div>

<section>
  <h2>いただいた支援の使い道</h2>
  <p>
    皆様からいただいた支援金は、あきこの安定した継続と機能向上のため、以下の用途に大切に使用させていただきます。
  </p>
  <div class="cards">
    <div class="card">
      <Server />
      <h3>サーバー維持費</h3>
      <p>あきこの稼働状況を管理するアナリティクス用サーバーの維持費</p>
    </div>
    <div class="card">
      <Wrench />
      <h3>保守メンテナンス</h3>
      <p>履修データの更新や不具合修正など、継続的な保守メンテナンスにかかる費用</p>
    </div>
    <div class="card">
      <Gift />
      <h3>開発者への謝礼</h3>
      <p>新機能の開発やデザインを手伝ってくれた外部協力者への謝礼</p>
    </div>
  </div>
</section>

<section>
  <h2>サポーター特典について</h2>
  <p>
    ご支援いただいた方への感謝を込めて、お名前（またはハンドルネーム）を当サイト内のサポーター一覧ページに掲載させていただきます。
  </p>
  <div class="cards">
    <div class="card">
      <LayoutList />
      <h3>掲載方法</h3>
      <p>当サイト内の専用ページにてお名前を掲載します。</p>
    </div>
    <div class="card">
      <Clock />
      <h3>掲載時期</h3>
      <p>決済完了後、1週間以内に反映いたします。</p>
    </div>
    <div class="card">
      <Pencil />
      <h3>お名前の指定</h3>
      <p>決済画面にて、掲載希望のニックネーム等をご入力ください。（※公序良俗に反する名前は掲載をお断りする場合があります）</p>
    </div>
  </div>
</section>

<footer>
  <a href={resolve("/tokushouhou")}>特定商取引法に基づく表記</a>
  <a href={resolve("/privacy")}>プライバシーポリシー</a>
  <span>お問い合わせ：<ContactEmail /></span>
</footer>

<style lang="scss">
  :global(body) {
    margin: auto;
    max-width: min(100%, var(--content-max-width));
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

  .intro {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 25px 10px;
  }

  .pricing {
    display: flex;
    align-items: baseline;
    gap: 5px;

    .price {
      font-family: "M PLUS 1p", sans-serif;
      font-size: 2rem;
      font-weight: bold;
      color: oklch(0.5 0.2 250);
    }

    .price-label {
      color: oklch(0.5 0 0);
    }
  }

  .payment-button {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 15px 40px;
    background-color: oklch(0.5 0.2 250);
    color: white;
    font-family: "M PLUS 1p", sans-serif;
    font-weight: bold;
    font-size: 1.1rem;
    border-radius: 5px;
    text-decoration: none;
    align-self: flex-start;

    &:hover {
      background-color: oklch(0.45 0.2 250);
    }
  }

  .stripe-note {
    font-size: 0.85rem;
    color: oklch(0.5 0 0);
    margin: 0;
  }

  section {
    padding: 50px 10px;
    border-top: 1px solid oklch(0.9 0 0);

    h2 {
      margin-top: 0;
    }
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-top: 20px;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }

  .card {
    padding: 20px;
    border: 1px solid oklch(0.9 0 0);
    border-radius: 5px;
    background-color: oklch(0.98 0 0);

    :global(svg) {
      width: 25px;
      height: 25px;
      opacity: 0.6;
    }

    h3 {
      margin: 10px 0 5px;
      font-size: 1rem;
    }

    p {
      margin: 0;
      font-size: 0.9rem;
      color: oklch(0.4 0 0);
    }
  }

  footer {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    align-items: center;
    padding: 20px 10px;
    border-top: 1px solid oklch(0.9 0 0);
    font-size: 0.85rem;
    color: oklch(0.5 0 0);

    a {
      color: oklch(0.5 0 0);
    }
  }
</style>
