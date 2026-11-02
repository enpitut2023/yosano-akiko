---
name: snapshot-refactor
description: Snapshot every classification, credit requirement and remark of every page before and after a change to the requirements modules, and diff them. Use when refactoring src/lib/requirements/ (or code it depends on) to prove nothing changed, or to see exactly what a behavior change does.
---

# Snapshot a refactor

Tests check what someone thought to check. This compares everything the
requirements modules produce, on every page, for both answers to 移行, between
two trees.

## Run it

```sh
.claude/skills/snapshot-refactor/scripts/run.sh OUT BASE_REF [NEW_REF]
```

- `OUT` goes in the scratchpad. A run writes about 500MB there and takes under a
  minute per tree; delete it when done.
- `BASE_REF` is checked out as a git worktree, so the baseline is exactly
  that commit, not whatever the working tree held. Without `NEW_REF` the new
  side is the current working tree. Uncommitted changes are fine there.
- For a series of commits, check each one on its own:
  `run.sh OUT <commit>~1 <commit>`.
- `SNAPSHOT_PAGES='^coins'` limits the pages (a regex on
  `<major>-<tableYear>`). `SHARDS` sets how many vitest workers split the
  pages (default 8).

The script prints `identical`, or one line per page and place that differs,
counting each `old -> new` change (`-` means absent). To list every
difference of one page:

```sh
python3 -I .claude/skills/snapshot-refactor/scripts/snapdiff.py OUT/base OUT/new --show coins-2026-direct [known]
```

## Read the result

- A refactor that shouldn't change behavior must print `identical`. Don't
  explain a difference away: find what caused it.
- For a behavior change, account for every line. Check the catalog side
  (`known`) separately from the grades side (`realAlone`, `realTogether…`,
  `fakeByName`, `csvs/…`): a change meant only for the catalog must leave grades alone.
- A value like `throws RangeError: …` is a crash, recorded instead of
  stopping the run. A refactor that adds or removes one shows up as a
  difference.
- `snapdiff.py --throws OUT/new` lists every recorded crash, per page and
  section.
- The inputs come from each tree, so if the two trees have different
  catalogs (`src/lib/current-courses.ts`) or grades files, the snapshots
  differ for that reason too. Compare refactors on trees with the same
  catalog.

## Make sure it can see the change

Identical output only proves something if the snapshot covers the code that
changed.

1. **Mutation check.** Break the module you changed on purpose, e.g. change
   one returned cell ID, run with `SNAPSHOT_PAGES` limited to its pages, and
   confirm a difference appears. Then undo the break.
2. **Coverage.** `scripts/coverage.sh OUT` lists the code in
   `src/lib/requirements/` the snapshot never runs: functions, sides of
   branches, and operands of `||` and `&&`. To list one module again
   without rerunning, pass a file name to
   `scripts/uncovered.py OUT/coverage/coverage-final.json coins`. Code it
   never runs is a blind spot: add an input that reaches it, or tell the
   user. Coverage only says an operand was evaluated, not that it was ever
   true. Some leftovers are harmless: the implicit else of an `else if`
   that already covers every specialty, a `tableYear >= 2023` check with no
   page before 2023, and the "nothing fits" end of `findExactCombination`.

## What a snapshot holds

One gzipped JSON per page and 移行 answer (`<major>-<tableYear>-direct` or
`-ikou`):

- `requirements` and `remarks`: `getCreditRequirements` and `getRemark` for
  every cell.
- `known`: `classifyKnownCourses` over every input course.
- `realAlone`: `classifyRealCourses` on each input course by itself.
- `realTogether`: the current and past catalogs as grades at once, so pairs
  and overflow rules fire. `realTogetherShuffled` is the same in a fixed
  shuffled order, to catch order dependence. `realTogetherFailed` gives every
  course a failing grade.
- `fakeByName`: `classifyFakeCourses` on every name in the current and past
  catalogs at once, keyed by name.
- `csvs`: for each file in `grade-csvs/`, the real and fake course
  classification and the credit stats.

## Inputs

- The current catalog (`src/lib/current-courses.ts`).
- `data/past-courses.json`: the 2023–2026 KdB exports, since grades hold
  courses that aren't offered anymore. Regenerate it with
  `scripts/export-past-courses.py DIR > data/past-courses.json` when there
  are newer exports.
- A sweep of IDs from `scripts/make-sweep.py`. Every possible ID is too many
  (36⁷), but the modules only match IDs exactly or by prefix, and real IDs
  start with one of the 2-character prefixes in `data/prefixes.txt`. The
  sweep takes every known prefix with every 3rd and 4th character, each
  ID-like token in both trees' requirements literals extended by every next
  character, and a fixed random sample.

`make-sweep.py` stops, and so does `run.sh`, when an ID in either tree's
catalog or grades files, or in the past catalogs, starts with a prefix not in
`data/prefixes.txt`, e.g. after a catalog update brings a new one. Check that
the ID is real, add the prefix, and run again. A small random sample over any
prefix also runs, so catch-all rules meet unseen prefixes even before that.

## When it breaks

The snapshot test (`scripts/snapshot.test.ts`, copied by `snapshot.sh` into
`src/lib/requirements/tests/` (`src/lib/tests/` in older trees) as
`snapshot.tmp.<i>of<n>.test.ts` for each run and removed afterwards)
uses `MAJOR_TO_REQUIREMENTS`, `instances`, `parseImportedCsv` and
`getCreditStats` from the `util.ts` beside it. If a base commit is older
than one of these, the run fails in that tree; its log is
`OUT/base.log`.
