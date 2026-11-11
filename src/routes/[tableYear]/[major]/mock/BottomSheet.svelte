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
  let grip = $state<HTMLElement>();
  /** Whether the press is on the grip, where a tap moves the sheet */
  let onGrip = false;
  /** Whether the release ended a drag, so the click it fires isn't a tap */
  let dragged = false;
  const height = $derived(
    drag?.kind === "dragging"
      ? drag.height
      : sheetSnapHeight(snap, containerHeight),
  );

  /** Whether a press there can drag the sheet: not in what scrolls or takes text. */
  function canDragFrom(target: EventTarget | null, sheet: Element): boolean {
    for (
      let el = target instanceof Element ? target : null;
      el !== null && el !== sheet;
      el = el.parentElement
    ) {
      if (el.matches("input, select, textarea")) return false;
      const { overflowX, overflowY } = getComputedStyle(el);
      const scrolls = /auto|scroll/;
      if (
        (scrolls.test(overflowY) && el.scrollHeight > el.clientHeight) ||
        (scrolls.test(overflowX) && el.scrollWidth > el.clientWidth)
      )
        return false;
    }
    return true;
  }

  function down(e: PointerEvent) {
    dragged = false;
    if (
      !(e.currentTarget instanceof Element) ||
      !canDragFrom(e.target, e.currentTarget)
    )
      return;
    onGrip = e.target instanceof Node && (grip?.contains(e.target) ?? false);
    drag = sheetDragStart(e.clientY, height);
  }

  function move(e: PointerEvent) {
    if (drag === undefined) return;
    const pressed = drag.kind === "pressed";
    drag = sheetDragMove(drag, e.clientY, e.timeStamp, containerHeight);
    // Only now, so a tap still reaches the button under it
    if (
      pressed &&
      drag.kind === "dragging" &&
      e.currentTarget instanceof Element
    )
      e.currentTarget.setPointerCapture(e.pointerId);
  }

  function up(e: PointerEvent) {
    if (drag === undefined) return;
    dragged = drag.kind === "dragging";
    if (dragged || onGrip)
      snap = sheetDragEnd(drag, e.timeStamp, snap, containerHeight);
    drag = undefined;
  }

  // Browsers disagree on where the click after a captured drag goes
  function swallowClickAfterDrag(e: MouseEvent) {
    if (!dragged) return;
    dragged = false;
    e.stopPropagation();
    e.preventDefault();
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
  onpointerdown={down}
  onpointermove={move}
  onpointerup={up}
  onpointercancel={cancel}
  onclickcapture={swallowClickAfterDrag}
>
  <button bind:this={grip} class="grip" aria-label="パネルの高さを変える">
    <span></span>
  </button>
  <div class="peek">{@render peek()}</div>
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
    // The drag is the sheet's, not a scroll. What scrolls inside is its own
    // scroll container, so it still scrolls.
    touch-action: none;

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

    & > span {
      width: 40px;
      height: 5px;
      border-radius: 5px;
      background-color: var(--c-sub);
    }
  }

  .peek {
    user-select: none;
  }

  .body {
    min-height: 0;
    display: grid;
  }
</style>
