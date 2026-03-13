<script lang="ts">
  let { children } = $props();
</script>

{@render children()}

<style lang="scss">
  :global {
    body {
      margin: auto;
      max-width: min(100%, var(--content-max-width));
    }

    section {
      margin-top: 50px;
    }

    img {
      width: 100%;
      border: 1px solid oklch(0.7 0 0);
    }
  }
</style>
