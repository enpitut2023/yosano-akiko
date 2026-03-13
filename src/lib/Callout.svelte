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
    padding: 10px;
    border-radius: 10px;

    &::before {
      margin-right: 4px;
    }

    &.warning {
      background-color: oklch(0.98 0.1 110);
      border: 1px solid oklch(0.85 0.5 110);

      &::before {
        content: "⚠️";
      }
    }

    &.info {
      background-color: oklch(0.98 0.05 250);
      border: 1px solid oklch(0.85 0.15 250);

      &::before {
        content: "ℹ️";
      }
    }
  }
</style>
