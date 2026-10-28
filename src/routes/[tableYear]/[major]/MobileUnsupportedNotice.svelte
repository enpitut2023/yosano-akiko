<script lang="ts">
  import Dialog from "$lib/Dialog.svelte";
  import {
    mobileUnsupported,
    mobileUnsupportedQueries,
  } from "./mobile-unsupported";

  let unsupported = $state(false);
  let dismissed = $state(false);

  $effect(() => {
    const lists = mobileUnsupportedQueries();
    const update = () => (unsupported = mobileUnsupported());
    update();
    for (const q of lists) q.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      for (const q of lists) q.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  });
</script>

{#if unsupported && !dismissed}
  <div id="mobile-unsupported" role="dialog" aria-modal="true">
    <Dialog>ごめんなさいね〜</Dialog>
    <p>
      現在あきこはスマホの小さい画面やタッチ操作に対応しておらず、パソコンで開いていただく必要があります。
      私たちは主に単位チェックの正確性を優先して開発を進めており、スマホ対応を優先的に進める目処は立っていません。
      お手数をおかけして申し訳ございません。
    </p>
    <div class="actions">
      <button type="button" onclick={() => (dismissed = true)}>
        このまま使う
      </button>
    </div>
  </div>
{/if}

<style lang="scss">
  #mobile-unsupported {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background-color: white;

    & > :global(.dialog) {
      margin: 20px auto 40px;
    }

    & > p {
      margin: 30px;
    }

    & > .actions {
      margin: 0 30px 30px;
      display: flex;
      justify-content: center;

      & > button {
        font-size: inherit;
        padding: 10px 15px;
        border: 1px solid #ccc;
        border-radius: 10px;
        background-color: #f8f8f8;
        cursor: pointer;

        &:hover {
          background-color: #eee;
        }
      }
    }
  }
</style>
