<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    SHEET_PEEK_HEIGHT,
    SHEET_SNAPS,
    sheetSnapHeight,
    sheetSnapNearest,
    type SheetSnap,
  } from "./sheet";

  let {
    snap = $bindable(),
    containerHeight,
    peek,
    children,
  }: {
    snap: SheetSnap;
    /** The height of the area the sheet covers when pulled all the way up */
    containerHeight: number;
    /** Stays visible at every snap, under the grip */
    peek: Snippet;
    children: Snippet;
  } = $props();

  // Smaller moves are taps, not drags
  const DRAG_THRESHOLD = 5;

  let drag = $state<
    | { startY: number; startHeight: number; height: number | undefined }
    | undefined
  >();
  const height = $derived(
    drag?.height ?? sheetSnapHeight(snap, containerHeight),
  );

  function down(e: PointerEvent) {
    if (e.currentTarget instanceof Element)
      e.currentTarget.setPointerCapture(e.pointerId);
    drag = { startY: e.clientY, startHeight: height, height: undefined };
  }

  function move(e: PointerEvent) {
    if (drag === undefined) return;
    const dy = drag.startY - e.clientY;
    if (drag.height === undefined && Math.abs(dy) < DRAG_THRESHOLD) return;
    drag.height = Math.min(
      containerHeight,
      Math.max(SHEET_PEEK_HEIGHT, drag.startHeight + dy),
    );
  }

  function up() {
    if (drag === undefined) return;
    snap =
      drag.height !== undefined
        ? sheetSnapNearest(drag.height, containerHeight)
        : SHEET_SNAPS[(SHEET_SNAPS.indexOf(snap) + 1) % SHEET_SNAPS.length];
    drag = undefined;
  }
</script>

<section
  class="sheet"
  class:dragging={drag?.height !== undefined}
  style="height: {height}px"
>
  <button
    class="grip"
    aria-label="パネルの高さを変える"
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={up}
  >
    <span></span>
  </button>
  {@render peek()}
  <div class="body">{@render children()}</div>
</section>

<style lang="scss">
  .sheet {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    grid-template-rows: auto auto 1fr;
    background-color: var(--c-bg);
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -5px 20px oklch(25% 0.02 270 / 0.15);
    overflow: hidden;
    transition: height 0.2s;

    &.dragging {
      transition: none;
    }
  }

  .grip {
    all: unset;
    display: grid;
    place-items: center;
    height: 30px;
    cursor: grab;
    // The drag is the sheet's, not a scroll
    touch-action: none;

    & > span {
      width: 40px;
      height: 5px;
      border-radius: 5px;
      background-color: var(--c-line);
    }
  }

  .body {
    min-height: 0;
    display: grid;
  }
</style>
