<script lang="ts">
  import { asset } from "$app/paths";
  import X from "lucide-svelte/icons/x";
  import { onMount, tick, untrack } from "svelte";
  import type { TutorialStep } from "./tutorial";

  type Rect = { left: number; top: number; right: number; bottom: number };

  let { steps, onClose }: { steps: TutorialStep[]; onClose: () => void } =
    $props();

  const HOLE_PADDING = 5;
  const GAP = 20;

  let index = $state(0);
  let hole = $state<Rect | undefined>();
  let popoverEl = $state<HTMLDivElement | undefined>();
  let popoverWidth = $state(0);
  let popoverHeight = $state(0);
  let innerWidth = $state(0);
  let innerHeight = $state(0);

  const step = $derived(steps[index]);

  async function goto(i: number) {
    steps[i].onEnter?.();
    index = i;
    await tick();
    const first = steps[i].target?.[0];
    if (first !== undefined) {
      document
        .querySelector(`[data-tutorial="${first}"]`)
        ?.scrollIntoView({ block: "start" });
    }
    popoverEl?.focus();
  }

  function next() {
    if (index === steps.length - 1) onClose();
    else void goto(index + 1);
  }

  function choose(id: string) {
    const i = steps.findIndex((s) => s.id === id);
    if (i !== -1) void goto(i);
  }

  $effect(() => {
    if (step.waitFor?.()) untrack(next);
  });

  function measure(ids: string[] | undefined): Rect | undefined {
    if (ids === undefined) return undefined;
    let r: Rect | undefined;
    for (const id of ids) {
      for (const el of document.querySelectorAll(`[data-tutorial="${id}"]`)) {
        const b = el.getBoundingClientRect();
        if (b.width === 0 && b.height === 0) continue;
        r = {
          left: Math.min(r?.left ?? Infinity, b.left),
          top: Math.min(r?.top ?? Infinity, b.top),
          right: Math.max(r?.right ?? -Infinity, b.right),
          bottom: Math.max(r?.bottom ?? -Infinity, b.bottom),
        };
      }
    }
    if (r === undefined) return undefined;
    return {
      left: Math.max(0, r.left - HOLE_PADDING),
      top: Math.max(0, r.top - HOLE_PADDING),
      right: Math.min(window.innerWidth, r.right + HOLE_PADDING),
      bottom: Math.min(window.innerHeight, r.bottom + HOLE_PADDING),
    };
  }

  function rectEquals(a: Rect | undefined, b: Rect | undefined): boolean {
    if (a === undefined || b === undefined) return a === b;
    return (
      a.left === b.left &&
      a.top === b.top &&
      a.right === b.right &&
      a.bottom === b.bottom
    );
  }

  onMount(() => {
    void goto(0);
    // ズームやスクロール、サイドバーのリサイズなど、要素が動く原因は多いので
    // イベントを個別に拾わず毎フレーム測る
    let raf = 0;
    const loop = () => {
      const r = measure(steps[index].target);
      if (!rectEquals(r, hole)) hole = r;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  });

  const popoverPosition = $derived.by(() => {
    const center = {
      left: (innerWidth - popoverWidth) / 2,
      top: (innerHeight - popoverHeight) / 2,
    };
    if (hole === undefined) return center;
    const room = {
      left: hole.left,
      right: innerWidth - hole.right,
      top: hole.top,
      bottom: innerHeight - hole.bottom,
    };
    const side = (Object.keys(room) as (keyof typeof room)[]).reduce((a, b) =>
      room[a] >= room[b] ? a : b,
    );
    const clampLeft = (x: number) =>
      Math.max(GAP, Math.min(innerWidth - popoverWidth - GAP, x));
    const clampTop = (y: number) =>
      Math.max(GAP, Math.min(innerHeight - popoverHeight - GAP, y));
    const needed =
      side === "left" || side === "right" ? popoverWidth : popoverHeight;
    // 穴が画面のほとんどを占めるときは、穴に少し被せて左下の隅に置く
    if (room[side] < needed + GAP * 2) {
      return { left: GAP, top: innerHeight - popoverHeight - GAP };
    }
    switch (side) {
      case "left":
        return {
          left: hole.left - GAP - popoverWidth,
          top: clampTop(hole.top),
        };
      case "right":
        return { left: hole.right + GAP, top: clampTop(hole.top) };
      case "top":
        return {
          left: clampLeft(hole.left),
          top: hole.top - GAP - popoverHeight,
        };
      case "bottom":
        return { left: clampLeft(hole.left), top: hole.bottom + GAP };
    }
  });
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class="tutorial">
  {#if hole}
    {@const h = hole}
    <div
      class="hole"
      style="left:{h.left}px; top:{h.top}px; width:{h.right -
        h.left}px; height:{h.bottom - h.top}px"
    ></div>
    <!-- 穴の外のクリックを止める。穴の中は下の要素をそのまま操作できる -->
    <div class="blocker" style="left:0; top:0; right:0; height:{h.top}px"></div>
    <div
      class="blocker"
      style="left:0; top:{h.bottom}px; right:0; bottom:0"
    ></div>
    <div
      class="blocker"
      style="left:0; top:{h.top}px; width:{h.left}px; height:{h.bottom -
        h.top}px"
    ></div>
    <div
      class="blocker"
      style="left:{h.right}px; top:{h.top}px; right:0; height:{h.bottom -
        h.top}px"
    ></div>
  {:else}
    <div class="blocker backdrop" style="inset:0"></div>
  {/if}

  <div
    class="popover"
    role="dialog"
    aria-labelledby="tutorial-title"
    data-testid="tutorial-{step.id}"
    tabindex="-1"
    bind:this={popoverEl}
    bind:offsetWidth={popoverWidth}
    bind:offsetHeight={popoverHeight}
    style="left:{popoverPosition.left}px; top:{popoverPosition.top}px"
  >
    <header>
      <img src={asset("/images/akiko.png")} alt="あきこ" />
      <h2 id="tutorial-title">{step.title}</h2>
      <span class="count">{index + 1} / {steps.length}</span>
      <button
        class="close"
        aria-label="チュートリアルを閉じる"
        onclick={onClose}><X size={20} /></button
      >
    </header>
    <p>{step.body}</p>
    {#if step.choices !== undefined || step.nextLabel !== undefined}
      <footer>
        {#each step.choices ?? [] as c (c.next)}
          <button onclick={() => choose(c.next)}>{c.label}</button>
        {/each}
        {#if step.nextLabel !== undefined}
          <button class="primary" onclick={next}>{step.nextLabel}</button>
        {/if}
      </footer>
    {/if}
  </div>
</div>

<style lang="scss">
  .tutorial {
    font-size: 14px;
  }

  .hole {
    position: fixed;
    z-index: 1000;
    border-radius: 10px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    pointer-events: none;
  }

  .blocker {
    position: fixed;
    z-index: 1000;

    &.backdrop {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }

  .popover {
    position: fixed;
    z-index: 1001;
    box-sizing: border-box;
    width: 400px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    background-color: white;
    border-radius: 20px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);

    &:focus {
      outline: none;
    }
  }

  header {
    display: flex;
    align-items: center;
    gap: 10px;

    & > img {
      width: 40px;
      height: 40px;
      object-fit: contain;
      background-color: hsl(0, 0%, 98%);
      border: 1px solid #ddd;
      border-radius: 50%;
    }

    & > h2 {
      margin: 0 auto 0 0;
      font-size: 1.2em;
    }
  }

  .count {
    color: #888;
    white-space: nowrap;
  }

  p {
    margin: 0;
    line-height: 1.6;
  }

  footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  button {
    font-size: inherit;
    padding: 5px 15px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: white;

    &:hover {
      background-color: oklch(95% 0 0);
    }

    &.primary {
      $c: oklch(70% 50% 270);
      background-color: $c;
      border-color: $c;
      color: white;

      &:hover {
        background-color: oklch(65% 50% 270);
      }
    }

    &.close {
      display: grid;
      place-items: center;
      width: 30px;
      height: 30px;
      padding: 0;
      border-color: transparent;
      border-radius: 50%;
      color: #888;
    }
  }
</style>
