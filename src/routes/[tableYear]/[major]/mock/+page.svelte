<script lang="ts">
  import type { PageProps } from "./$types";
  import MockApp from "./MockApp.svelte";

  let { data }: PageProps = $props();
</script>

<MockApp config={data.config} />
