<script lang="ts">
  import { asset } from "$app/paths";
  import type { Snippet } from "svelte";

  type Props = { id?: string; children: Snippet } & (
    | { speaker?: "akiko" }
    | { speaker: "student"; image: string; alt: string }
  );

  let props: Props = $props();
</script>

<!-- A speech bubble from あきこ or a student. Width and vertical margins are left to the caller. -->
<div id={props.id} class="dialog {props.speaker ?? 'akiko'}">
  {#if props.speaker === "student"}
    <img src={asset(props.image)} alt={props.alt} />
    <span>学生</span>
  {:else}
    <img src={asset("/images/akiko.png")} alt="あきこ" />
    <span>あきこ</span>
  {/if}
  <span>{@render props.children()}</span>
</div>

<style lang="scss">
  .dialog {
    width: 80%;
    margin-left: auto;
    margin-right: auto;

    display: grid;
    $icon-size: 70px;
    grid-template-columns: $icon-size auto;
    grid-template-rows: $icon-size auto;
    padding: 10px 20px;

    --fill-l: 98%;
    --fill-c: 4%;
    --outline-l: 92%;
    --outline-c: 10%;
    background-color: oklch(var(--fill-l) var(--fill-c) var(--h));
    border: 1px solid oklch(var(--outline-l) var(--outline-c) var(--h));
    border-radius: 20px;

    &.akiko {
      --h: 350;
    }

    &.student {
      --h: 270;
    }

    // The next dialog is another instance, so without :global Svelte drops this as unused
    & + :global(.dialog) {
      margin-top: 10px;
    }

    & > img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background-color: hsl(0, 0%, 98%);
      border: 1px solid oklch(var(--outline-l) var(--outline-c) var(--h));
      border-radius: 50%;
    }

    & > span:first-of-type {
      place-self: center;
      margin-top: 5px;
    }

    & > span:nth-of-type(2) {
      grid-column: 2/3;
      grid-row: 1/3;
      align-self: center;
      margin-left: 30px;
    }
  }
</style>
