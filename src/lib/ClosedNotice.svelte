<script lang="ts">
  import { asset } from "$app/paths";

  let { name }: { name: string } = $props();
</script>

<div id="closed-notice" role="dialog" aria-modal="true">
  <div class="closed-notice-dialog">
    <img src={asset("/images/akiko.png")} alt="あきこ" />
    <span>あきこ</span>
    <span>ごめんなさいね〜</span>
  </div>
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

    & > .closed-notice-dialog {
      width: 80%;
      margin: 20px auto;
      margin-bottom: 40px;

      display: grid;
      $icon-size: 70px;
      grid-template-columns: $icon-size auto;
      grid-template-rows: $icon-size auto;
      padding: 10px 20px;

      --h: 350;
      background-color: oklch(98% 4% var(--h));
      border: 1px solid oklch(92% 10% var(--h));
      border-radius: 20px;

      & > img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background-color: hsl(0, 0%, 98%);
        border: 1px solid oklch(92% 10% var(--h));
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
  }
</style>
