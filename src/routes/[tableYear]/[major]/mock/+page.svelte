<script lang="ts">
  import type { PageProps } from "./$types";
  import MobileApp from "./MobileApp.svelte";

  let { data }: PageProps = $props();
</script>

<MobileApp config={data.config} />
