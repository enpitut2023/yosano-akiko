<script>
  let { children } = $props();
</script>

{@render children()}

<style lang="scss">
  @use "$lib/fonts.scss";

  :global {
    body,
    button,
    input {
      font-family: "M PLUS Rounded 1c", sans-serif;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    strong,
    th {
      font-family: "M PLUS 1p", sans-serif;
    }

    body {
      margin: 0;
      padding: 0;
    }
  }
</style>
