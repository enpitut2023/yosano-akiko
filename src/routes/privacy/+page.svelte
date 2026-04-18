<script lang="ts">
  import ContactEmail from "$lib/ContactEmail.svelte";
  import Nav from "$lib/Nav.svelte";
  const title = "プライバシーポリシー";
  const description = "あきこのプライバシーポリシーです。";
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
</svelte:head>

<Nav />

<h1>{title}</h1>

<p>
  本ウェブサイト（以下、「当サイト」といいます）は、ユーザーの個人情報の保護を重要視し、以下の通りプライバシーポリシーを定めます。
</p>

<section>
  <h2>1. 取得する個人情報および収集方法</h2>
  <p>当サイトでは、以下の情報を取得することがあります。</p>
  <ul>
    <li>
      サポーター登録時：お名前（ハンドルネームを含む）、メールアドレス、および決済に関する情報。
    </li>
    <li>お問い合わせ時：お名前、メールアドレス、お問い合わせ内容。</li>
    <li>
      自動的に収集される情報：当サイトの運営状況を把握するための匿名アナリティクスデータ。
      なお、ユーザーが入力した履修データ等の利用情報は、原則としてユーザーのブラウザ（ローカル環境）に保存され、当サイトのサーバーが直接取得・保存することはありません。
    </li>
  </ul>
</section>

<section>
  <h2>2. 個人情報の利用目的</h2>
  <p>取得した情報は、以下の目的のためにのみ利用いたします。</p>
  <ul>
    <li>サポーター一覧ページへの名前掲載</li>
    <li>サポーター登録に関する確認および連絡</li>
    <li>当サイトの保守・運営、利用状況の分析、および機能改善</li>
    <li>お問い合わせへの回答</li>
  </ul>
</section>

<section>
  <h2>3. 決済情報について</h2>
  <p>
    当サイトの決済は、外部の決済代行サービス「Stripe」を利用しています。
    クレジットカード番号等の決済情報はStripe社が直接取得・管理し、当サイトの運営者がこれらの情報を閲覧、保持、または保存することはありません。
  </p>
</section>

<section>
  <h2>4. 個人情報の第三者提供</h2>
  <p>
    当サイトは、法令に基づく場合を除き、ユーザーの同意を得ることなく個人情報を第三者に提供することはありません。
    ただし、決済処理のために必要な範囲で決済代行会社（Stripe等）に情報を提供する場合を除きます。
  </p>
</section>

<section>
  <h2>5. 個人情報の開示・訂正・削除</h2>
  <p>
    ユーザー本人から個人情報の開示、訂正、または削除の依頼があった場合は、本人確認の上、速やかに対応いたします。
  </p>
</section>

<section>
  <h2>6. お問い合わせ先</h2>
  <p>
    個人情報の取り扱いに関するお問い合わせは、以下のメールアドレスまでご連絡ください。
  </p>
  <p>メールアドレス：<ContactEmail /></p>
</section>

<style lang="scss">
  :global(body) {
    margin: auto;
    max-width: min(100%, var(--content-max-width));
  }
</style>
