# Splitting the 履修を組む tab

Plan for step 2 of `major-app-size.md`. The tab is the largest part of
`MajorApp.svelte` (about 985 of its 2,259 lines), and much of its script is pure
logic mixed into `$derived` blocks. So the order is: a unit test framework
first, then the pure logic out into `.ts` files with tests, then the markup into
components, which by then are thin.

## 0. Vitest

The unit tests are plain modules that assert when imported, run by
`tsx src/lib/tests/index.ts`. That has no test names, no filtering, no watch
mode, and failures print only what each file's own helpers print. New pure
modules deserve better before we add many tests to them.

**Vitest**, because it runs on Vite:

- It reads `vite.config.ts`, so `$lib`, the SvelteKit plugin and anything else
  the app's build does apply to tests too, with no second resolver to keep in
  sync. Vitest 5 supports Vite 8.
- `describe` / `test` / `expect` with structural diffs. `toMatchObject` and
  `toEqual` could replace most of `assertCreditStatsEqual` and the `eq` helper
  in the credit display tests.
- `test.each` fits the per-major tests, which are one call per grades CSV.
- Watch mode and `-t <name>` to run one test.
- Browser mode with Playwright, already installed, if we ever want component
  tests. Not planned.

The alternative is `node:test`, which needs no dependency. But it doesn't
resolve `$lib` (tsx does that today, through the tsconfig paths), and its
diffs and filtering are weaker. Not worth it when the project already runs on
Vite.

Steps:

- [x] `npm i -D vitest`. Use `defineConfig` from `vitest/config` in
      `vite.config.ts`, with `test.include` set to `src/**/*.test.ts`. The
      default pattern also matches `tests/e2e/*.spec.ts`, which are
      Playwright's.
- [x] Convert `src/lib/tests/*.ts` to `*.test.ts`:
  - Each per-major file: one `test` per grades CSV, named after it.
  - `runTest`: compare with `expect`, keeping the `WantCreditStats` shorthand
    (`taken` for both `rawTaken` and `effectiveTaken`, and missing cells as
    zero).
  - `credit-display`: `eq` becomes `expect(...).toBe(...)`.
  - `local-data`: each function becomes a `test`, split into
    `akiko.test.ts` (list kinds and moves) and `local-data.test.ts`
    (migration).
  - `index.ts` goes; Vitest finds the files.
- [x] Where tests live: next to their module
      (`course-filters.test.ts` beside `course-filters.ts`). Today
      `src/lib/tests/credit-display.ts` imports from `src/routes/…`, which this
      fixes. The per-major CSV tests stay together in `src/lib/tests/`,
      since they test `requirements/` and `akiko.ts` together.
- [x] `test:unit` runs `vitest run`. Update the CLAUDE.md entry: how to run one
      test, and where new tests go.
- [x] Check that `npm run verify` and CI still pass, and that a failing
      expectation fails `test:unit`.

## 1. Into `akiko.ts`

Facts about courses that don't depend on this page.

- [x] **One course, from both sources:** `akikoGetMergedCourse(akiko, id)` merges the
      catalog entry and the grades row (name, credit, grade, year taken, cell).
      Today each place merges them by hand, slightly differently:
  - the course lists use `rc?.name || kc?.name || "（不明）"`;
  - the search uses `rc?.name || kc?.name || ""`, though the course already
    has a `name`;
  - `Timetable` and `ExportTab` use `rc?.name ?? kc.name`.
- [x] **The syllabus year.** Four rules today:

  | Where        | Year                                                                      |
  | ------------ | ------------------------------------------------------------------------- |
  | Course lists | the year taken if passed, else the catalog's year                         |
  | Timetable    | the year taken if any (also 履修中 and failed), else the timetable's year |
  | Export       | always the catalog's year                                                 |
  | Import tab   | always the year taken                                                     |

  Decided: the year taken if passed, else the catalog's year, since that's
  the syllabus the student took it or would take it under. The rule is in
  `akikoGetMergedCourse` (which is why `Akiko` now holds the catalog's year), and
  every syllabus link goes through `SyllabusLink.svelte`, which shows the year
  after the name only when it isn't the catalog's.

- [x] **Fake courses that count:** `akikoGetClassifiedFakeCourses`, the
      counterpart of `akikoGetUnclassifiedFakeCourses`. `MajorApp` builds it
      inline from `fakeCoursePositions`.
- [x] **Total credits:** `akikoGetCreditStats` also returns `total` (必修 plus
      選択), which `MajorApp` adds up as `graduationCredits`.
- [x] **Summing credits:** a `creditSum(courses)` for the five
      `reduce((s, c) => s + (c.credit ?? 0), 0)` in `MajorApp`, `ExportTab` and
      `ImportTab`.
- [x] **List order** (履修中, then failed, then by ID): next to
      `akikoGetCoursesInCell`, since it's about what the lists mean. Decided.
- [x] Remove `knownCoursesMap` from `MajorApp`; `akiko.knownCourses` already
      holds it. `Timetable` takes `akiko` instead, and derives its lists
      from it.
- [x] `MajorApp`'s `UiCourse` is gone: the course lists are `MergedCourse`s.

## 2. Into `course-filters.ts` (next to the page)

Pure, but filters are a UI idea used by one page, so by the repo's convention
they live beside it rather than in `$lib`.

- [x] The `WontTakeFilters` type and `courseMatchesFilters` (search, credit,
      year, term and day via `slotsMatchFilters`, free slots). Free slots
      take the occupied slots as an argument: `akikoIsOccupied(akiko, …, id)`
      became `occupiedSlotsOverlap(occupied, slots)` in `akiko.ts`.
- [x] `filterChoicesOf(courses)`: the credits, years, days and terms on offer,
      and the term groups (`TERM_TO_GROUP`).
- [x] `filtersActiveCount(filters)`.
- [x] Replace the four `$effect`s that write `undefined` back into the filters
      when a choice disappears with a `$derived` "filters in effect"
      (`filtersInEffect(chosen, choices)`). No effect writes state, and a
      choice comes back if its option does. The selects, chips and badge show
      the values in effect; an e2e test covers a choice going and coming back.
- [x] Tests for each (`course-filters.test.ts`).

## 3. Into `timetable.ts`

- [ ] `termAfterPlanning(slots, current)`: the tab to show after a course is
      added to 取る授業. Now the end of `handleDrop`. Tests: no fixed slot goes
      to その他; a course already on the current term stays; otherwise its
      first term.

## 4. Components

- [ ] `CourseTable.svelte` replaces the `courseRow`, `courseTable` and
      `fakeCourseTable` snippets. Props: the courses, which columns to show,
      the drag source, whether to show remarks and 該当マスを表示, and
      `onShowCell` / `onDragStart` / `onDragEnd`. Takes its CSS along.
- [ ] `CourseFilters.svelte`: the filter bar. `bind:filters`,
      `bind:showRemark`, and the choices as a prop. Takes about 130 lines of
      CSS along.
- [ ] Decide whether to wrap both bars in a `CoursesTab.svelte`. The hard part
      is shared state: `selectedCellId`, the timetable's term and year (also
      set by `ExportTab`, `SettingsTab` and the tutorial), and the drop guide
      that spans both bars. **To decide after the two above**, once we see
      how `MajorApp` looks then.
- [ ] Update `major-app-size.md`.

## Checks at each step

- `npm run verify`. The e2e tests in `courses.spec.ts`, `settings.spec.ts` and
  `saved-plan.spec.ts` cover the tab's behavior, so they should pass unchanged.
- Look at the tab in the dev server after the component steps.
- Keep this file in sync, and delete it once everything is done.
