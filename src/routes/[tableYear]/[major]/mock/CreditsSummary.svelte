<script lang="ts">
  import {
    columnIdIsElective,
    type ColumnId,
    type CreditStats,
  } from "#lib/akiko.ts";
  import {
    creditBoundsToString,
    creditFillPercentages,
    electiveCreditStatsDisplay,
  } from "../credit-display";
  import { creditsLeft, type CreditProgress } from "./credits";

  let {
    creditStats,
    heading = true,
    onShowColumn,
  }: {
    creditStats: CreditStats;
    heading?: boolean;
    onShowColumn: (colId: ColumnId) => void;
  } = $props();

  const total = $derived(creditStats.total);
  const electiveWarning = $derived(
    electiveCreditStatsDisplay(creditStats.elective).warning,
  );
  const overflowingColumns = $derived(
    [...creditStats.columns]
      .filter(([colId, s]) => columnIdIsElective(colId) && s.overflowTotal > 0)
      .map(([colId, stats]) => ({ colId, stats })),
  );
</script>

{#snippet meter(label: string, s: CreditProgress & { max: number | undefined })}
  {@const [green, yellow] = creditFillPercentages(
    s.effectiveTaken,
    s.effectiveMightTake,
    s.min,
  )}
  <div class="meter">
    <strong>{label}</strong>
    <div class="bar" style="--green:{green}%; --yellow:{yellow}%"></div>
    <span
      ><b
        >{s.effectiveTaken}{#if s.effectiveMightTake > 0}→{s.effectiveTaken +
            s.effectiveMightTake}{/if}</b
      >
      / {creditBoundsToString(s.min, s.max)}</span
    >
  </div>
{/snippet}

<div class="list credits" class:untitled={!heading}>
  {#if heading}<h2>卒業に必要な単位</h2>{/if}
  <div class="hero">
    <span>卒業まで あと</span>
    <strong
      >{creditsLeft(
        total,
        false,
      )}{#if total.effectiveMightTake > 0}→{creditsLeft(
          total,
          true,
        )}{/if}</strong
    >
    <span>単位</span>
  </div>
  <div class="meters">
    {@render meter("必修", creditStats.compulsory)}
    {@render meter("選択", creditStats.elective)}
  </div>
  <p class="legend">
    <span class="swatch taken"></span>取得済み
    <span class="swatch plan"></span>取る授業
  </p>
  {#if electiveWarning}<p class="warning">⚠️ {electiveWarning}</p>{/if}
  {#each overflowingColumns as { colId, stats } (colId)}
    <p class="warning">
      ⚠️ 赤い枠の列は{stats.max}単位までで、{stats.overflowTotal}単位が卒業単位に入りません。
      <button class="link" onclick={() => onShowColumn(colId)}>表で見る</button>
    </p>
  {/each}
  <p class="hint">列ごとの選択科目の単位は、表の下の帯に出ます</p>
</div>

<style lang="scss">
  .credits {
    gap: 15px;

    &.untitled {
      padding-top: 15px;
    }
  }

  .hero {
    display: flex;
    align-items: baseline;
    gap: 5px;

    & > strong {
      font-size: 2.4em;
      line-height: 1;
    }
  }

  // A name, a bar and a figure per row, the bars aligned
  .meters {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
  }

  .meter {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    align-items: center;
    font-size: var(--fs-sm);

    & > span {
      text-align: right;
      white-space: nowrap;

      & > b {
        font-size: 1.2em;
      }
    }
  }

  .bar {
    height: 15px;
    border: 1px solid var(--c-rule);
    background: linear-gradient(
      90deg,
      var(--c-taken-tint) 0 var(--green),
      var(--c-plan-tint) var(--green) var(--yellow),
      transparent var(--yellow)
    );
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0;
    font-size: var(--fs-xs);
    color: var(--c-sub);
  }

  .swatch {
    width: 10px;
    height: 10px;
    border: 1px solid var(--c-rule);

    &.taken {
      background-color: var(--c-taken-tint);
    }

    &.plan {
      margin-left: 10px;
      background-color: var(--c-plan-tint);
    }
  }

  .link {
    all: unset;
    cursor: pointer;
    color: var(--c-accent);
    text-decoration: underline;
  }
</style>
