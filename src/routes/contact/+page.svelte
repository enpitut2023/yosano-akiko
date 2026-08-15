<script lang="ts">
  import { resolve } from "$app/paths";
  import { AKIKO_X_URL, FEEDBACK_FORM_URL } from "$lib/constants";
  import ContactEmail from "$lib/ContactEmail.svelte";
  import Nav from "$lib/Nav.svelte";

  const title = "あきこへのお問い合わせ";
  const description = "あきこへのお問い合わせ方法をご案内します。";
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

  <p>
    <a href={resolve("/faq")}>よくある質問</a>ページも合わせてご覧ください。
  </p>

  <p>
    あきこに関するお問い合わせは、<a
      href={AKIKO_X_URL}
      target="_blank"
      rel="noreferrer">あきこ公式Xアカウント</a
    >にDMを送っていただくか、<ContactEmail />にご連絡ください。
  </p>

  <p>
    あきこの機能に関してのリクエストなどは、<a
      href={FEEDBACK_FORM_URL}
      target="_blank"
      rel="noreferrer">こちらのフォーム</a
    >でも受け付けています。
  </p>
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
    gap: 30px;
  }
</style>
