<script lang="ts">
  import { getDocMeta } from "$lib/constants";

  let { data } = $props();
  const meta = $derived(getDocMeta(data.name));

  let ContentComponent = $state<any>(null);

  $effect(() => {
    const loadContent = async () => {
      const name = data.name;
      const componentName = name.charAt(0).toUpperCase() + name.slice(1);
      try {
        const module = await import(
          `../../../lib/docs/${componentName}.svelte`
        );
        ContentComponent = module.default;
      } catch (e) {
        console.error("Failed to load doc component", e);
      }
    };
    loadContent();
  });
</script>

<svelte:head>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description} />
</svelte:head>

{#if ContentComponent}
  <ContentComponent />
{:else}
  <p>Loading...</p>
{/if}
