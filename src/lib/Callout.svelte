<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    type: "warning" | "info";
    children: Snippet;
  };

  let { type, children }: Props = $props();
</script>

<div class="callout {type}">
  {@render children()}
</div>

<style lang="scss">
  .callout {
    --bg-l: 0.98;
    --bg-c: 0.03;
    --border-l: 0.85;
    --border-c: 0.1;

    padding: 10px 15px;

    &::before {
      margin-right: 10px;
    }

    &.warning {
      background-color: oklch(var(--bg-l) var(--bg-c) 100);
      border: 1px solid oklch(var(--border-l) var(--border-c) 100);

      &::before {
        content: "⚠️";
      }
    }

    &.info {
      background-color: oklch(var(--bg-l) var(--bg-c) 250);
      border: 1px solid oklch(var(--border-l) var(--border-c) 250);

      &::before {
        content: "ℹ️";
      }
    }
  }
</style>
