<script lang="ts">
  type Props = {
    title: string;
    description: string;
  };

  let { title, description }: Props = $props();

  const OG_IMAGE =
    "https://github.com/user-attachments/assets/be6c928e-36fa-48e4-ac5b-5a0406a0adb2";
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={OG_IMAGE} />
</svelte:head>
