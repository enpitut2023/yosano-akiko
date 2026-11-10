<script lang="ts">
  import Minus from "lucide-svelte/icons/minus";
  import Plus from "lucide-svelte/icons/plus";
  import { onMount, untrack } from "svelte";
  import { isCellId, type CellId, type CreditStats } from "#lib/akiko.ts";
  import type { MajorConfig } from "#lib/app-setup.ts";
  import { tableSvgUrl } from "#lib/major-config.ts";
  import { assert } from "#lib/util.ts";
  import { creditFillPercentages } from "../credit-display";
  import { pinchZoom, zoomAround } from "./pinch";

  let {
    config,
    creditStats,
    selectedCellId,
    coveredHeight,
    onSelect,
  }: {
    config: MajorConfig;
    creditStats: CreditStats;
    selectedCellId: CellId | undefined;
    /** How much of the bottom something else covers */
    coveredHeight: number;
    onSelect: (cellId: CellId) => void;
  } = $props();

  const ZOOM_MIN = 0.25;
  const ZOOM_MAX = 2;
  const ZOOM_STEP = 1.25;
  // Rects are in the coordinates of the table drawn 2048px wide
  const TABLE_WIDTH = 2048;
  const MARGIN = 20;

  const tableHeight = untrack(
    () =>
      (TABLE_WIDTH / config.tableViewBox.width) * config.tableViewBox.height,
  );

  let zoom = $state(0.55);
  function setZoom(z: number) {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
  }

  const cellRects = $derived(
    Object.entries(config.cellIdToRectRecord).map(([id, rect]) => {
      assert(isCellId(id), `Bad cell id: "${id}"`);
      return {
        id,
        x: rect.x * zoom,
        y: rect.y * zoom,
        width: rect.width * zoom,
        height: rect.height * zoom,
      };
    }),
  );

  let scrollEl = $state<HTMLDivElement | undefined>();

  /** Zooms around the middle of the part that isn't covered. */
  function zoomBy(factor: number) {
    if (!scrollEl) return;
    void zoomAround(
      scrollEl,
      { zoom: () => zoom, setZoom },
      zoom * factor,
      scrollEl.clientWidth / 2,
      (scrollEl.clientHeight - coveredHeight) / 2,
    );
  }

  /** Scrolls the cell to the middle of the part that isn't covered. */
  export function scrollCellIntoView(cellId: CellId) {
    const rect = cellRects.find((r) => r.id === cellId);
    if (!rect || !scrollEl) return;
    const visibleHeight = scrollEl.clientHeight - coveredHeight;
    scrollEl.scrollTo({
      left: rect.x + rect.width / 2 - scrollEl.clientWidth / 2,
      // A cell taller than the visible part shows from its top
      top: rect.y - Math.max(MARGIN, (visibleHeight - rect.height) / 2),
      behavior: "smooth",
    });
  }

  onMount(() => {
    if (cellRects.length === 0) return;
    scrollEl?.scrollTo(
      Math.min(...cellRects.map((r) => r.x)) - MARGIN,
      Math.min(...cellRects.map((r) => r.y)) - MARGIN,
    );
  });
</script>

<div class="table">
  <div
    class="scroll"
    bind:this={scrollEl}
    {@attach pinchZoom({ zoom: () => zoom, setZoom })}
  >
    <div
      class="canvas"
      style="width:{TABLE_WIDTH * zoom}px; height:{tableHeight *
        zoom}px; margin-bottom:{coveredHeight}px"
    >
      <img
        src={tableSvgUrl(config.tableYear, config.major)}
        alt="履修要覧の表"
        draggable="false"
      />
      {#each cellRects as r (r.id)}
        {@const cellStats = creditStats.cells.get(r.id)}
        {#if cellStats}
          {@const [green, yellow] = creditFillPercentages(
            cellStats.effectiveTaken,
            cellStats.effectiveMightTake,
            cellStats.min,
          )}
          <button
            class="cell"
            class:selected={selectedCellId === r.id}
            data-testid="cell-{r.id}"
            aria-label="マス {r.id}"
            aria-pressed={selectedCellId === r.id}
            style="left:{r.x}px; top:{r.y}px; width:{r.width}px; height:{r.height}px; --green:{green}%; --yellow:{yellow}%"
            onclick={() => onSelect(r.id)}
          ></button>
        {/if}
      {/each}
    </div>
  </div>
  <div class="zoom">
    <button aria-label="拡大" onclick={() => zoomBy(ZOOM_STEP)}
      ><Plus size={20} /></button
    >
    <button aria-label="縮小" onclick={() => zoomBy(1 / ZOOM_STEP)}
      ><Minus size={20} /></button
    >
  </div>
</div>

<style lang="scss">
  .table {
    position: absolute;
    inset: 0;
    isolation: isolate;
  }

  .scroll {
    height: 100%;
    overflow: auto;
    isolation: isolate;
    background-color: white;
    // Pinching is handled here; the browser would zoom the whole page
    touch-action: pan-x pan-y;
  }

  .canvas {
    position: relative;

    & > img {
      display: block;
      width: 100%;
      height: 100%;
      user-select: none;
    }
  }

  .cell {
    all: unset;
    cursor: pointer;
    position: absolute;
    box-sizing: border-box;
    border: 2px dashed rgba(0, 0, 0, 0.2);
    background: linear-gradient(
      90deg,
      var(--c-taken) 0 var(--green),
      var(--c-plan) var(--green) var(--yellow),
      transparent var(--yellow)
    );
    opacity: 0.4;

    &.selected {
      opacity: 0.6;
      outline: 5px solid var(--c-accent);
      z-index: 1;
    }
  }

  .zoom {
    position: absolute;
    top: 10px;
    right: 10px;
    display: grid;
    gap: 5px;

    & > button {
      all: unset;
      cursor: pointer;
      display: grid;
      place-items: center;
      width: 45px;
      height: 45px;
      border: 1px solid var(--c-line);
      border-radius: 50%;
      background-color: var(--c-surface);
      box-shadow: 0 0 5px var(--c-line);
    }
  }
</style>
