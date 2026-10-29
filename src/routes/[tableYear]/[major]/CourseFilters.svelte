<script lang="ts">
  import Funnel from "lucide-svelte/icons/funnel";
  import { DOWS, dowToString, termToString, type Term } from "$lib/akiko";
  import {
    filtersActiveCount,
    filtersInEffect,
    type FilterChoices,
    type WontTakeFilters,
  } from "./course-filters";

  let {
    filters = $bindable(),
    choices,
    showRemark = $bindable(),
    showNonAvailable = $bindable(),
  }: {
    /** As chosen, including values no longer on offer */
    filters: WontTakeFilters;
    choices: FilterChoices;
    showRemark: boolean;
    showNonAvailable: boolean;
  } = $props();

  let open = $state(false);
  const inEffect = $derived(filtersInEffect(filters, choices));
  const activeCount = $derived(filtersActiveCount(inEffect));
</script>

<div id="filter-bar">
  <div id="filter-bar-row">
    <search>
      <input
        type="text"
        placeholder="科目番号もしくは科目名"
        bind:value={filters.courseIdOrName}
      />
    </search>
    <button
      type="button"
      class="filter-toggle"
      class:open
      aria-expanded={open}
      aria-label="絞り込み条件"
      title="絞り込み条件"
      onclick={() => (open = !open)}
    >
      <Funnel size={20} strokeWidth={1.5} />
      {#if activeCount > 0}
        <span class="filter-badge">{activeCount}</span>
      {/if}
    </button>
  </div>
  {#if open}
    <div id="filter-bar-slot-row">
      <select
        value={inEffect.credit ?? ""}
        class:placeholder={inEffect.credit === undefined}
        onchange={(e) => {
          const v = e.currentTarget.value;
          filters.credit = v === "" ? undefined : Number(v);
        }}
      >
        <option value="">全単位</option>
        {#each choices.credits as v (v)}
          <option value={v}>{v}単位</option>
        {/each}
      </select>
      <select
        value={inEffect.expects ?? ""}
        class:placeholder={inEffect.expects === undefined}
        onchange={(e) => {
          const v = e.currentTarget.value;
          filters.expects = v === "" ? undefined : Number(v);
        }}
      >
        <option value="">全年次</option>
        {#each choices.expects as v (v)}
          <option value={v}>{v}年次</option>
        {/each}
      </select>
      <select
        value={inEffect.term ?? ""}
        class:placeholder={inEffect.term === undefined}
        onchange={(e) => {
          const v = e.currentTarget.value;
          filters.term = v === "" ? undefined : (v as Term);
        }}
      >
        <option value="">全学期</option>
        {#each choices.termGroups as group (group.label)}
          <optgroup label={group.label}>
            {#each group.terms as t (t)}
              <option value={t}>{termToString(t)}</option>
            {/each}
          </optgroup>
        {/each}
      </select>
      <div id="dow-chips" role="group" aria-label="曜日で絞り込む">
        {#each DOWS as d (d)}
          {@const active = inEffect.dows.includes(d)}
          <button
            type="button"
            class="dow-chip"
            class:active
            aria-pressed={active}
            disabled={!choices.dows.includes(d)}
            onclick={() => {
              filters.dows = active
                ? filters.dows.filter((x) => x !== d)
                : [...filters.dows, d];
            }}>{dowToString(d)}</button
          >
        {/each}
      </div>
    </div>
    <div id="filter-bar-checkboxes">
      <label class="filter-checkbox">
        <input type="checkbox" bind:checked={filters.onlyUnoccupied} />
        空きコマのみ表示
      </label>
      <label class="filter-checkbox">
        <input type="checkbox" bind:checked={showRemark} />
        備考を表示
      </label>
      <label class="filter-checkbox">
        <input type="checkbox" bind:checked={showNonAvailable} />
        今年度開講しない授業も表示
      </label>
    </div>
  {/if}
</div>

<style lang="scss">
  #filter-bar {
    border-bottom: 1px dashed black;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
  }

  #filter-bar-row {
    display: flex;
    gap: 5px;

    & > search {
      flex: 1;
      min-width: 0;
    }

    & > search > input {
      box-sizing: border-box;
      width: 100%;
      border: 1px solid gray;
      border-radius: 10px;
      padding: 5px 10px;
    }
  }

  .filter-toggle {
    position: relative;
    display: grid;
    place-items: center;
    padding: 5px;
    border: none;
    border-radius: 10px;
    background: none;
    color: gray;
    cursor: pointer;

    &:hover,
    &.open {
      background-color: oklch(95% 0 0);
    }
  }

  .filter-badge {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 15px;
    font-size: 10px;
    line-height: 15px;
    border-radius: 10px;
    color: white;
    background-color: oklch(60% 15% 250);
  }

  #filter-bar-slot-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  select {
    font-size: var(--fs-sm);
    border: 1px solid gray;
    border-radius: 10px;
    padding: 5px 0px 5px 5px;
    background-color: white;
    cursor: pointer;

    &.placeholder {
      color: oklch(0.6 0 0);
    }
  }

  #dow-chips {
    display: flex;
    gap: 5px;
  }

  .dow-chip {
    font-size: var(--fs-sm);
    min-width: 30px;
    padding: 5px 0;
    border: 1px solid gray;
    border-radius: 10px;
    background-color: white;
    cursor: pointer;

    &:hover:not(:disabled) {
      background-color: oklch(95% 0 0);
    }

    &.active {
      border-color: oklch(60% 15% 250);
      background-color: oklch(90% 8% 250);
    }

    &:disabled {
      color: oklch(0.6 0 0);
      border-color: oklch(0.8 0 0);
      cursor: default;
    }
  }

  #filter-bar-checkboxes {
    display: flex;
    flex-wrap: wrap;
    gap: 5px 15px;
  }

  .filter-checkbox {
    font-size: var(--fs-sm);
    display: flex;
    align-items: center;
    white-space: nowrap;
    cursor: pointer;
  }
</style>
