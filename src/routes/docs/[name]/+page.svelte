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
  <meta property="og:title" content={meta.title} />
  <meta property="og:description" content={meta.description} />
  <meta
    property="og:image"
    content="https://github.com/user-attachments/assets/be6c928e-36fa-48e4-ac5b-5a0406a0adb2"
  />
</svelte:head>

{#if ContentComponent}
  <ContentComponent />
{:else}
  <p>Loading...</p>
{/if}
