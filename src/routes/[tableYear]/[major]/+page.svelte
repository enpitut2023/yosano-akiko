<script lang="ts">
  import MajorApp from "$lib/MajorApp.svelte";
  import ClosedNotice from "$lib/ClosedNotice.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

{#if data.closed}
  <ClosedNotice name={data.majorJa} />
{:else}
  <MajorApp config={data.config} />
{/if}
