<script lang="ts">
  import { asset } from "$app/paths";

  let {
    showNonAvailable = $bindable(),
    onReset,
  }: {
    showNonAvailable: boolean;
    /** Called once the user has confirmed. */
    onReset: () => void;
  } = $props();

  function reset() {
    const msg =
      "インポートした成績データや「取る授業」に移動した授業などが全てリセットされます。本当にリセットしますか？";
    if (window.confirm(msg)) onReset();
  }
</script>

<label class="settings-row">
  <input type="checkbox" bind:checked={showNonAvailable} />
  <span>今年度開講しない授業を表示する</span>
</label>
<div id="control">
  <button id="reset" onclick={reset}>
    <img src={asset("/icons/trash.svg")} width="15px" alt="reset" />
    <span>リセット</span>
  </button>
</div>

<style lang="scss">
  .settings-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background-color: hsl(0, 0%, 97%);
    border-radius: 10px;
    margin-bottom: 5px;
  }

  #control {
    margin-bottom: 50px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  #reset {
    display: grid;
    place-content: center;
    place-items: center;
    gap: 10px;
    grid-template-columns: auto auto;
    width: 100%;
    height: 40px;
    background-color: oklch(0.92 0.05 10);
    border: 1px solid oklch(0.85 0.1 10);
    border-radius: 10px;

    &:hover {
      background-color: oklch(0.85 0.1 10);
    }
  }
</style>
