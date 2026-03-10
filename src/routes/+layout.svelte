<script lang="ts">
  import { dev } from "$app/environment";

  let { children } = $props();
</script>

<svelte:head>
  {#if !dev}
    <script>
      var _paq = (window._paq = window._paq || []);
      /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
      _paq.push(["trackPageView"]);
      _paq.push(["enableLinkTracking"]);
      (function () {
        var u = "//139-162-123-42.ip.linodeusercontent.com/";
        _paq.push(["setTrackerUrl", u + "matomo.php"]);
        _paq.push(["setSiteId", "1"]);
        var d = document,
          g = d.createElement("script"),
          s = d.getElementsByTagName("script")[0];
        g.async = true;
        g.src = u + "matomo.js";
        s.parentNode.insertBefore(g, s);
      })();
    </script>
  {/if}
</svelte:head>

{@render children()}

<style lang="scss">
  @use "$lib/fonts.scss";

  :global(:root) {
    --content-max-width: 800px;
  }

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
      padding-bottom: 50vh;
    }
  }
</style>
