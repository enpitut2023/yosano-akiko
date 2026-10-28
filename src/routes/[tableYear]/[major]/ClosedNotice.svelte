<script lang="ts">
  import Dialog from "$lib/Dialog.svelte";

  let { name }: { name: string } = $props();
</script>

<div id="closed-notice" role="dialog" aria-modal="true">
  <Dialog>ごめんなさいね〜</Dialog>
  <p>
    {name}のページは、支援室の要請により一時的に閉鎖しています。ご迷惑をおかけして申し訳ございません。
  </p>
</div>

<style lang="scss">
  #closed-notice {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background-color: white;

    & > p {
      margin: 30px;
    }

    & > :global(.dialog) {
      margin: 20px auto 40px;
    }
  }
</style>
