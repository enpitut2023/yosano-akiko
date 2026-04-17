<script lang="ts">
  import { resolve } from "$app/paths";
</script>

<nav>
  <a href={resolve("/")}>トップページ</a>
  <a href={resolve("/docs")}>あきこの使い方</a>
</nav>

<style lang="scss">
  nav {
    display: flex;
    gap: 20px;
    padding: 15px 10px;
    border-bottom: 1px solid oklch(0.85 0 0);
  }
</style>
