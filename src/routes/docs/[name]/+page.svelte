<script lang="ts">
  import type { Component } from "svelte";
  import { getDocMeta } from "$lib/constants";
  import Meta from "$lib/Meta.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const meta = $derived(getDocMeta(data.name));

  let ContentComponent = $state<Component | null>(null);

  $effect(() => {
    const loadContent = async () => {
      const name = data.name;
      const componentName = name.charAt(0).toUpperCase() + name.slice(1);
      try {
        const module = (await import(
          `../../../lib/docs/${componentName}.svelte`
        )) as { default: Component };
        ContentComponent = module.default;
      } catch (e) {
        console.error("Failed to load doc component", e);
      }
    };
    void loadContent();
  });
</script>

<Meta title={meta.title} description={meta.description} />

{#if ContentComponent}
  <ContentComponent />
{:else}
  <p>Loading...</p>
{/if}
