<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    sheetDragEnd,
    sheetDragMove,
    sheetDragStart,
    sheetSnapHeight,
    sheetSnapNearest,
    type SheetDrag,
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

  let drag = $state.raw<SheetDrag | undefined>();
  const height = $derived(
    drag?.kind === "dragging"
      ? drag.height
      : sheetSnapHeight(snap, containerHeight),
  );

  function down(e: PointerEvent) {
    if (e.currentTarget instanceof Element)
      e.currentTarget.setPointerCapture(e.pointerId);
    drag = sheetDragStart(e.clientY, height);
  }

  function move(e: PointerEvent) {
    if (drag === undefined) return;
    drag = sheetDragMove(drag, e.clientY, e.timeStamp, containerHeight);
  }

  function up(e: PointerEvent) {
    if (drag === undefined) return;
    snap = sheetDragEnd(drag, e.timeStamp, snap, containerHeight);
    drag = undefined;
  }

  // The browser took the pointer, e.g. to scroll, so neither a tap nor a fling
  function cancel() {
    if (drag?.kind === "dragging")
      snap = sheetSnapNearest(drag.height, containerHeight);
    drag = undefined;
  }
</script>

<section
  class="sheet"
  class:dragging={drag?.kind === "dragging"}
  style="height: {height}px"
>
  <button
    class="grip"
    aria-label="パネルの高さを変える"
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={cancel}
  >
    <span></span>
  </button>
  <div>{@render peek()}</div>
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
    background-color: var(--c-surface);
    border-top: 1px solid var(--c-rule);
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
      background-color: var(--c-sub);
    }
  }

  .body {
    min-height: 0;
    display: grid;
  }
</style>
