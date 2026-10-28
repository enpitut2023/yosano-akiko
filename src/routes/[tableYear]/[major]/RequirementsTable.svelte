<script lang="ts">
  import { asset } from "$app/paths";
  import Hand from "lucide-svelte/icons/hand";
  import { onMount, untrack, type Snippet } from "svelte";
  import {
    cellIdToColumnId,
    cellIdToRow,
    columnIdIsElective,
    isCellId,
    type CellId,
    type CreditStats,
  } from "$lib/akiko";
  import type { MajorConfig } from "$lib/app-setup";
  import { assert } from "$lib/util";
  import {
    columnCreditStatsDisplay,
    electiveCreditStatsDisplay,
    getPercentage,
  } from "./credit-display";
  import { panZoom } from "./gestures";
  import { markSeen, seen } from "./seen";

  let {
    config,
    creditStats,
    selectedCellId,
    onSelect,
    overlay,
  }: {
    config: MajorConfig;
    creditStats: CreditStats;
    selectedCellId: CellId | undefined;
    /** Called with undefined when the user clicks outside the cells */
    onSelect: (cellId: CellId | undefined) => void;
    /**
     * Shown over the table, scrolling with it. Panning ignores it, so its
     * links and text work as usual.
     */
    overlay: Snippet;
  } = $props();

  // Zoom uses two representations:
  // - zoomLevel: the actual scale multiplier (e.g. 0.7 = 70% of base size)
  // - sliderZoomLevel: a log-scale value driving the slider so equal slider
  //   distances feel like equal zoom steps. slider=0 → ZOOM_MIN,
  //   slider=1 → ZOOM_DEFAULT, slider=ZOOM_SLIDER_MAX → ZOOM_MAX.
  // Pinch/scroll gestures compute a new zoomLevel directly and convert back
  // to sliderZoomLevel via zoomToSlider to keep the slider in sync.
  const tableScale = 2048 / untrack(() => config.tableViewBox.width);
  const ZOOM_DEFAULT = 0.7;
  const ZOOM_MIN = 0.4;
  const ZOOM_MAX = 2;
  const ZOOM_SLIDER_MAX =
    Math.log(ZOOM_MAX / ZOOM_MIN) / Math.log(ZOOM_DEFAULT / ZOOM_MIN);
  function sliderToZoom(s: number): number {
    return Math.min(
      ZOOM_MAX,
      Math.max(ZOOM_MIN, ZOOM_MIN * Math.pow(ZOOM_DEFAULT / ZOOM_MIN, s)),
    );
  }
  function zoomToSlider(z: number): number {
    return Math.log(z / ZOOM_MIN) / Math.log(ZOOM_DEFAULT / ZOOM_MIN);
  }
  let sliderZoomLevel = $state(1);
  const zoomLevel = $derived(sliderToZoom(sliderZoomLevel));

  const cellRects = $derived(
    Object.entries(config.cellIdToRectRecord).map(([id, rect]) => {
      assert(isCellId(id), `Bad cell id: "${id}"`);
      return {
        id,
        x: rect.x * zoomLevel,
        y: rect.y * zoomLevel,
        width: rect.width * zoomLevel,
        height: rect.height * zoomLevel,
      };
    }),
  );

  let requirementsEl = $state<HTMLDivElement | undefined>();

  /** Scrolls the table so the cell is in the middle. */
  export function scrollCellIntoView(cellId: CellId) {
    const rect = cellRects.find((r) => r.id === cellId);
    if (!rect || !requirementsEl) return;
    requirementsEl.scrollLeft =
      rect.x + rect.width / 2 - requirementsEl.clientWidth / 2;
    requirementsEl.scrollTop =
      rect.y + rect.height / 2 - requirementsEl.clientHeight / 2;
  }

  // The column sums sit below the scrolling table, so they follow it by hand
  let scrollX = $state(0);

  type UiColumnCredit = {
    colId: string;
    rect: { x: number; width: number };
    display: { brief: string; warning: string | undefined };
    green: number;
    yellow: number;
  };

  // Two-stage derivation: display strings depend only on creditStats, while
  // rects depend on cellRects (updated on every zoom). Keeping them separate
  // prevents recomputing display strings on zoom.
  const uiColumnCreditsWithoutRect = $derived.by(() => {
    const res = new Map<string, Omit<UiColumnCredit, "rect">>();
    for (const [colId, stats] of creditStats.columns) {
      if (!columnIdIsElective(colId)) continue;
      const display = columnCreditStatsDisplay(stats);
      const [green, yellow] = getPercentage(
        stats.effectiveTaken,
        stats.effectiveMightTake,
        stats.min,
      );
      res.set(colId, { colId, display, green, yellow });
    }
    return res;
  });

  const uiColumnCredits = $derived.by(() => {
    const res: UiColumnCredit[] = [];
    for (const rect of cellRects) {
      if (cellIdToRow(rect.id) !== 1) continue;
      const colId = cellIdToColumnId(rect.id);
      const entry = uiColumnCreditsWithoutRect.get(colId);
      if (entry === undefined) continue;
      res.push({ ...entry, rect });
    }
    return res;
  });

  let columnSpanEls = $state<Record<string, HTMLSpanElement | undefined>>({});
  let overallSpanEl = $state<HTMLSpanElement | undefined>();

  // Squishes each sum's text to fit its box
  $effect(() => {
    void zoomLevel; // re-run squishing when zoom changes container widths
    const spans: HTMLSpanElement[] = [];
    for (const [colId] of creditStats.columns.entries()) {
      if (!columnIdIsElective(colId)) continue;
      const span = columnSpanEls[colId];
      if (span) spans.push(span);
    }
    if (creditStats.elective && overallSpanEl) spans.push(overallSpanEl);

    const BORDER = 1;
    const PADDING = 5;

    // Batch write: clear all transforms first
    for (const span of spans) {
      span.style.transform = "";
    }

    // Batch read: measure all at once (single reflow)
    const measurements = spans.map((span) => {
      assert(span.parentElement !== null);
      const maxWidth =
        span.parentElement.getBoundingClientRect().width -
        (BORDER + PADDING) * 2;
      const spanWidth = span.getBoundingClientRect().width;
      return { span, maxWidth, spanWidth };
    });

    // Batch write: apply all transforms
    for (const { span, maxWidth, spanWidth } of measurements) {
      if (spanWidth > 0) {
        span.style.transform = `scaleX(${Math.min(maxWidth / spanWidth, 1)})`;
      }
    }
  });

  let panning = $state(false);
  // A mouse can't be told apart from a trackpad, so show it for either
  let panHintVisible = $state(false);

  onMount(() => {
    panHintVisible =
      window.matchMedia("(any-pointer: fine)").matches && !seen("panHint");
  });

  function endPan() {
    panning = false;
    panHintVisible = false;
    markSeen("panHint");
  }
</script>

<div id="table-view">
  <div
    id="requirements"
    data-tutorial="requirements"
    class:panning
    bind:this={requirementsEl}
    {@attach panZoom({
      zoom: () => zoomLevel,
      setZoom: (z) =>
        (sliderZoomLevel = zoomToSlider(
          Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)),
        )),
      ignore: ".overlay",
      onPanStart: () => (panning = true),
      onPanEnd: endPan,
    })}
    onscroll={(e) => (scrollX = -e.currentTarget.scrollLeft)}
    onclick={() => onSelect(undefined)}
  >
    <img
      src={asset(`/tables/${config.tableYear}/${config.major}.svg`)}
      alt="Table"
      width={tableScale * zoomLevel * config.tableViewBox.width}
      height={tableScale * zoomLevel * config.tableViewBox.height}
      draggable="false"
    />
    <div class="overlay">{@render overlay()}</div>
    {#each cellRects as r (r.id)}
      {@const cellStats = creditStats.cells.get(r.id)}
      {#if cellStats}
        {@const [green, yellow] = getPercentage(
          cellStats.effectiveTaken,
          cellStats.effectiveMightTake,
          cellStats.min,
        )}
        <div
          class="cell"
          data-testid="cell-{r.id}"
          class:selected={selectedCellId === r.id}
          style="left:{r.x}px; top:{r.y}px; width:{r.width}px; height:{r.height}px; --green-percentage:{green}%; --yellow-percentage:{yellow}%"
          onclick={(e) => {
            e.stopPropagation();
            onSelect(r.id);
          }}
        ></div>
      {/if}
    {/each}
  </div>
  {#if panHintVisible}
    <div id="pan-hint"><Hand size={15} />ドラッグで表を動かせます</div>
  {/if}
  <div id="credit-sums-container">
    <div id="zoom-control">
      <img src={asset("/icons/zoom-in.svg")} width="15" alt="zoom" />
      <input
        type="range"
        min="0"
        max={ZOOM_SLIDER_MAX}
        step="0.01"
        bind:value={sliderZoomLevel}
      />
    </div>
    <div id="column-credit-sums" style="--x: {scrollX}px">
      {#each uiColumnCredits as { colId, rect, display, green, yellow } (colId)}
        <div
          style="left:{rect.x}px; width:{rect.width}px; --green-percentage:{green}%; --yellow-percentage:{yellow}%"
          data-message-on-click={display.warning}
          onclick={() => display.warning && alert(display.warning)}
        >
          <img src={asset("/icons/warning.svg")} width="20" alt="warning" />
          <span bind:this={columnSpanEls[colId]}>{display.brief}</span>
        </div>
      {/each}
    </div>
    {#if creditStats.elective}
      {@const s = creditStats.elective}
      {@const display = electiveCreditStatsDisplay(s)}
      {@const [green, yellow] = getPercentage(
        s.effectiveTaken,
        s.effectiveMightTake,
        s.min,
      )}
      <div
        id="overall-credit-sum"
        style="--green-percentage:{green}%; --yellow-percentage:{yellow}%"
        data-message-on-click={display.warning}
        onclick={() => display.warning && alert(display.warning)}
      >
        <img src={asset("/icons/warning.svg")} width="20" alt="warning" />
        <span bind:this={overallSpanEl}>{display.brief}</span>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  $color-progress-taken: rgb(51, 204, 51);
  $color-progress-might-take: rgb(255, 204, 0);
  $color-hover-overlay: rgba(0, 0, 0, 0.25);

  #table-view {
    position: relative;
    display: grid;
    grid-template-rows: 1fr 85px;
  }

  #requirements {
    grid-row: 1/2;
    position: relative;
    overflow: scroll;
    cursor: grab;
    user-select: none;

    &.panning {
      cursor: grabbing;
    }
  }

  #pan-hint {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 15px;
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid #ccc;
    border-radius: 10px;
    font-size: var(--fs-sm);
    pointer-events: none;
  }

  .cell {
    --border-width: 3px;
    --green-percentage: 0%;
    --yellow-percentage: 0%;
    position: absolute;
    box-sizing: border-box;
    border: var(--border-width) dashed rgba(0, 0, 0, 0.2);
    cursor: pointer;

    &::before {
      content: "";
      display: block;
      position: absolute;
      inset: calc(-1 * var(--border-width));
      background: linear-gradient(
        90deg,
        $color-progress-taken 0%,
        $color-progress-taken var(--green-percentage),
        $color-progress-might-take var(--green-percentage),
        $color-progress-might-take var(--yellow-percentage),
        transparent var(--yellow-percentage),
        transparent 100%
      );
      opacity: 0.4;
    }

    &:hover {
      background-color: $color-hover-overlay;
    }

    &.selected {
      outline: 6px solid #0066ff;
      outline-offset: 4px;
      z-index: 1;
    }
  }

  #credit-sums-container {
    grid-row: 2/3;
    overflow: hidden;
    position: relative;
  }

  #column-credit-sums {
    position: relative;
    transform: translateX(var(--x, 0));
  }

  #column-credit-sums > div,
  #overall-credit-sum {
    --green-percentage: 0%;
    --yellow-percentage: 0%;
    position: absolute;
    box-sizing: border-box;
    border: 1px solid black;
    padding: 5px;
    height: 35px;
    display: grid;
    user-select: none;
    -webkit-user-select: none;

    $alpha: 0.4;
    background: linear-gradient(
      90deg,
      rgba($color-progress-taken, $alpha) 0%,
      rgba($color-progress-taken, $alpha) var(--green-percentage),
      rgba($color-progress-might-take, $alpha) var(--green-percentage),
      rgba($color-progress-might-take, $alpha) var(--yellow-percentage),
      transparent var(--yellow-percentage),
      transparent 100%
    );

    &[data-message-on-click]:not([data-message-on-click=""]) {
      cursor: pointer;

      & > img {
        display: unset;
      }

      &:hover {
        background-color: $color-hover-overlay;
      }
    }

    & > img {
      display: none;
      position: absolute;
      left: 8px;
      top: 5.5px;
    }

    & > span {
      align-self: center;
      justify-self: right;
      transform-origin: top left;
      text-wrap: nowrap;
    }
  }

  #column-credit-sums > div {
    top: 5px;
  }

  #overall-credit-sum {
    right: 5px;
    bottom: 5px;
    width: 300px;
  }

  #zoom-control {
    position: absolute;
    bottom: 5px;
    left: 5px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 15px;
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid #ccc;
    border-radius: 10px;
    font-size: var(--fs-sm);

    & > input[type="range"] {
      width: 100px;
    }
  }
</style>
