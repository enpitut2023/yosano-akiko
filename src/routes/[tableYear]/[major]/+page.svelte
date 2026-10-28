<script lang="ts">
  import MajorApp from "./MajorApp.svelte";
  import ClosedNotice from "./ClosedNotice.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

{#if data.closed}
  <ClosedNotice name={data.majorJa} />
{:else}
  <MajorApp config={data.config} />
{/if}
