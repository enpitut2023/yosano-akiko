<script lang="ts">
  import type { BaseCreditStats } from "#lib/akiko.ts";
  import {
    creditBoundsToString,
    creditFillPercentages,
  } from "../credit-display";

  let {
    label,
    stats: s,
  }: {
    label: string;
    stats: BaseCreditStats & { max: number | undefined };
  } = $props();

  const fill = $derived(
    creditFillPercentages(s.effectiveTaken, s.effectiveMightTake, s.min),
  );
</script>

<!-- Like the desktop's column sums: a box filled behind its text -->
<div
  class="credit"
  class:over={s.overflowTotal > 0}
  style="--green:{fill[0]}%; --yellow:{fill[1]}%"
>
  <span>{label}</span>
  <strong
    >{s.effectiveTaken}{#if s.effectiveMightTake > 0}→{s.effectiveTaken +
        s.effectiveMightTake}{/if}</strong
  >
  <span>/ {creditBoundsToString(s.min, s.max)}単位</span>
</div>

<style lang="scss">
  .credit {
    display: flex;
    align-items: baseline;
    gap: 5px;
    min-width: 0;
    padding: 5px 10px;
    border: 1px solid var(--c-rule);
    background: linear-gradient(
      90deg,
      var(--c-taken-tint) 0 var(--green),
      var(--c-plan-tint) var(--green) var(--yellow),
      transparent var(--yellow)
    );
    font-size: var(--fs-sm);
    white-space: nowrap;

    & strong {
      font-size: 1.2em;
    }

    &.over {
      outline: 1px solid var(--c-warn);
      border-color: var(--c-warn);
    }
  }
</style>
