<script lang="ts">
  import { browser } from "$app/environment";

  const ENCODED = "nxvxb-pbagnpg@gbrvqb.wc";

  function rot13(s: string): string {
    return s.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
  }

  const email = browser ? rot13(ENCODED) : undefined;
</script>

{#if email !== undefined}
  <a href="mailto:{email}">{email}</a>
{/if}
