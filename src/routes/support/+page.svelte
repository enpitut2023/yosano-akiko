<script lang="ts">
  import { resolve } from "$app/paths";
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

<section>
  <p>
    いつもあきこをご利用いただきありがとうございます。
    あきこは、「毎回の履修登録や管理をもっとスムーズにしたい」という思いから、有志のメンバーにより無償で開発・運営されています。
    おかげさまで多くの方に使っていただいていますが、あきこを安定して提供し続けるためには、シラバスや開設授業の更新に合わせた定期的なメンテナンス作業が必要になります。
    また、今後さらに便利な機能を追加していくにあたり、開発やデザインを手伝ってくれる学生メンバーへ、少しでも還元（謝礼）ができればと考えています。
    これからもあきこを終了させることなく、安定した運営とアップデートを続けていくために、開発チームを支援してくださるサポーターを募集しています。
  </p>
</section>

<section>
  <h2>いただいた支援の使い道</h2>
  <p>
    皆様からいただいた支援金は、あきこの安定した継続と機能向上のため、以下の用途に大切に使用させていただきます。
  </p>
  <ul>
    <li>あきこの稼働状況を管理するアナリティクス用サーバーの維持費</li>
    <li>
      履修データの更新や不具合修正など、継続的な保守メンテナンスにかかる費用
    </li>
    <li>新機能の開発やデザインを手伝ってくれた外部協力者への謝礼</li>
  </ul>
</section>

<section>
  <h2>サポーター特典について</h2>
  <p>
    ご支援いただいた方への感謝を込めて、お名前（またはハンドルネーム）を当サイト内のサポーター一覧ページに掲載させていただきます。
  </p>
  <ul>
    <li>掲載方法: 当サイト内の専用ページにてお名前を掲載します。</li>
    <li>掲載時期: 決済完了後、1週間以内に反映いたします。</li>
    <li>
      お名前の指定:
      決済画面にて、掲載希望のニックネーム等をご入力ください。（※公序良俗に反する名前は掲載をお断りする場合があります）
    </li>
  </ul>
</section>

<section>
  <h2>支援方法</h2>
  <p>開発・サーバー維持支援：1口 500円</p>
  <p>
    複数口でのご支援も大歓迎です。決済画面にて数量（口数）をご自由に変更いただけます。
  </p>
  <p>
    お支払いには、世界中で利用されている安全な決済システムStripeを利用しています。
    クレジットカード、およびPayPayでの決済に対応しています。
    クレジットカード番号などの機密情報が開発者側に渡ることは一切ありませんので、ご安心ください。
  </p>
</section>

<footer>
  <ul>
    <li><a href={resolve("/tokushouhou")}>特定商取引法に基づく表記</a></li>
    <li><a href={resolve("/privacy")}>プライバシーポリシー</a></li>
    <li>お問い合わせ先：<ContactEmail /></li>
  </ul>
</footer>

<style lang="scss">
  :global(body) {
    margin: auto;
    max-width: min(100%, var(--content-max-width));
  }
</style>
