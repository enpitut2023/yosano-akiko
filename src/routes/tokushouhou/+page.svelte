<script lang="ts">
  import ContactEmail from "$lib/ContactEmail.svelte";
  import Nav from "$lib/Nav.svelte";
  const title = "特定商取引法に基づく表記";
  const description = "特定商取引法に基づく表記です。";
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
</svelte:head>

<Nav />

<h1>{title}</h1>

<dl>
  <dt>事業者の名称</dt>
  <dd>髙橋 怜佑</dd>

  <dt>事業者の所在地および連絡先（電話番号）</dt>
  <dd>請求がありましたら、遅滞なく開示いたします。</dd>

  <dt>お問い合わせ先（メールアドレス）</dt>
  <dd>
    <ContactEmail /><br />
    ※お問い合わせは原則メールにてお願いいたします。
  </dd>

  <dt>販売価格</dt>
  <dd>1口 500円（※購入口数は決済画面にてお客様が指定可能）</dd>

  <dt>商品代金以外の必要料金</dt>
  <dd>
    当サイトのページの閲覧、サポーター登録等に必要となるインターネット接続料金、通信料金はお客様のご負担となります。
  </dd>

  <dt>お支払い方法</dt>
  <dd>クレジットカード決済（Stripe決済システムを利用）</dd>

  <dt>代金の支払い時期</dt>
  <dd>各種決済画面における購入手続き完了時に即時決済されます。</dd>

  <dt>サービスの提供時期（引き渡し時期）</dt>
  <dd>
    決済完了後、原則として7日以内に、サイト上のサポーター一覧ページにご指定のお名前（またはハンドルネーム）を掲載いたします。
  </dd>

  <dt>返品・キャンセル・中途解約について</dt>
  <dd>
    提供するサービスの性質上、決済完了後のお客様都合によるキャンセルおよび返金はお受けできません。あらかじめご了承ください。
  </dd>
</dl>

<style lang="scss">
  :global(body) {
    margin: auto;
    max-width: min(100%, var(--content-max-width));
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    border-top: 1px solid oklch(0.85 0 0);
    border-left: 1px solid oklch(0.85 0 0);

    dt,
    dd {
      padding: 15px 10px;
      border-right: 1px solid oklch(0.85 0 0);
      border-bottom: 1px solid oklch(0.85 0 0);
    }

    dt {
      font-weight: bold;
      background-color: oklch(0.97 0 0);
    }

    dd {
      margin: 0;
    }
  }
</style>
