# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

あきこ is a static SvelteKit site for 筑波大学 students. There is one page per
入学年度 × 主専攻 at `/[tableYear]/[major]`. It shows that major's 履修要覧 table
as an SVG with clickable cells (マス), colors each cell by credits earned from the
student's TWINS grades file, lists the courses that count toward a cell, builds a
timetable, and exports the chosen course IDs as a CSV for bulk registration in
TWINS. The site is served under the base path `/yosano-akiko`, so internal links
and assets go through `resolve()` / `asset()` from `$app/paths`.

## Commands

- `npm run dev`: dev server at http://localhost:42263/yosano-akiko/
- `npm run build`: prerenders every page into `build/`. Prerendering fails if a
  page's rects JSON or table SVG is missing, or a link points at a missing page.
- `npm run format`: Prettier
- `npm run check`: `svelte-kit sync` and `svelte-check`
- `npm run lint`: runs each of these, which also run on their own:
  - `lint:eslint`: ESLint with type-aware rules
  - `lint:format`: Prettier in check mode
  - `lint:grade-csvs`: validates `grade-csvs/`
- `npm test`: unit and e2e tests.
- `npm run test:unit`: Vitest, on every `src/**/*.test.ts`. Run one file with
  `npx vitest run coins`, or tests by name with `-t "<name>"`; `npx vitest`
  watches.
- `npm run test:e2e`: Playwright tests in `tests/e2e/`, against a production
  build with a test-only course catalog. Run one with
  `npx playwright test -g "<name>"`. Read `tests/e2e/README.md` before writing
  one: it explains the setup and the pitfalls, and lists what's still to do.
- `npm run verify`: everything CI runs: `check`, `lint`, `test:unit`, `build`,
  then `test:e2e`.

CI runs `npm run verify` on pull requests and on `main`. Pushes to `main` deploy
to GitHub Pages once it passes.

## Architecture

**Three kinds of course** (`src/lib/akiko.ts`):

- `KnownCourse`: the catalog in `src/lib/current-courses.ts` (generated, about
  6,800 lines, not formatted or linted; don't edit by hand).
- `RealCourse`: rows of the student's TWINS grades CSV, parsed in `csv.ts`.
- `FakeCourse`: grade rows without a course ID, such as credits approved for
  transfer students (編入生).

**Core model.** `akiko.ts` is framework-free. An `Akiko` value holds the courses,
which cell each course belongs to, and the user's overrides; the `akikoXxx(akiko, …)`
functions derive everything else:

- Which list a course is in: `wont-take` (当てはまる授業), `might-take` (取る授業) or
  `taken`. Grades decide the default, and `ListKindOverrides` record what the user
  moved by hand.
- Credit stats per cell, per column (`a`–`h`), and for 必修/選択 totals. Each has
  `raw*` and `effective*` values: credits past a cell's or column's maximum
  overflow and don't count.
- The TWINS export, which detects time overlaps and leaves out 事前登録 courses
  and courses not offered this year.

An `Akiko` is never changed in place. Moving a course (`akikoMoveCourse`)
returns new overrides, and the caller builds a new `Akiko` from them.

**Per-major rules** live in `src/lib/requirements/<major>-since-<year>.ts`.
Each module exports:

- `getCreditRequirements`: min/max credits per cell ID (`a1`, `b2`, …), per
  column, and the 必修/選択 totals.
- `classifyKnownCourses` / `classifyRealCourses` / `classifyFakeCourses`: map
  each course to a cell ID.
- `getRemark`: notes shown for a cell, or `undefined` for none.

Shared predicates (共通科目, 体育, 外国語, …) are in `requirements/common.ts`.

**Offered vs counted.** A module's `classify` runs twice per course kind:
`mode === "known"` on the catalog decides what 当てはまる授業 offers, and
`mode === "real"` on grades decides where a credit counts. Offer narrowly and
count broadly: a course the student shouldn't be steered toward, but that counts
if it's in their grades anyway, goes in an `isXxUnlisted` check right after its
cell's, returning `unlisted(cellId, mode)`. Examples are
another 学類's class of a course every 学類 teaches, or a course taken during
総合. `fromSougou` is a separate axis, for rules that differ between 直接入学 and
移行生. Don't use it to hide a course. For example, coins counts mast's
微分積分A for every student but offers it to none. `src/lib/tests/offered.test.ts`
compares the two modes over the whole catalog and lists where they disagree.

**Assembling a page.** `src/routes/[tableYear]/[major]/+page.ts` calls
`getMajorConfig` (`major-config.ts`). It lazy-imports the major's requirements
module, so each page bundles only its own, and fetches
`static/rects/<year>/<major>.json` (cell rectangles over the table) and
`static/tables/<year>/<major>.svg`. The page builds an `Akiko` from the config
with the helpers in `app-setup.ts`. Which pages exist comes from `instances` in `constants.ts`, which also
drives prerendering. `checked: true` there shows a ✅ on the top page, meaning
that college's 支援室 has roughly verified the results. `majorIsClosed` replaces a
college's pages with a notice.

**UI.** The major page is `src/routes/[tableYear]/[major]/MajorApp.svelte`, with
its private components and helpers beside it. Everything the user enters that's
saved (grades, the 移行 answer, courses moved by hand) is one `$state.raw` value,
`saved`, replaced whole on every change. The `Akiko` is `$derived` from it. One
effect writes `saved` to localStorage under `${major}_${tableYear}` in a
versioned format (`local-data.ts` migrates older versions), and a `storage`
listener takes in what another tab of the same page saved. Nothing else reads
localStorage. `MajorApp` holds that state and the tutorial's steps, and passes
the rest to `RequirementsTable` (the table) and one component per tab
(`ImportTab`, `CoursesTab`, `ExportTab`).

**Tests.** A unit test sits next to the module it tests, as `<module>.test.ts`.
The per-major tests are the exception: they're in `src/lib/tests/`, one file
per major, and each calls `runTest` (`src/lib/tests/util.ts`) with a real
grades CSV from `grade-csvs/` and the expected credit stats per cell. In dev,
importing a grades file logs the current stats in that same shape.

## Conventions

- Code used by only one page lives next to it in `src/routes/…`; `src/lib` is
  for code shared across pages (the core model, requirements, shared components).
- Type-aware ESLint can't see types declared in `.svelte` files. So keep types
  and functions that other files import in `.ts` files, not in a component's
  `<script module>`, and annotate the parameters of inline callbacks passed as
  props (`onShowCell={(cellId: CellId, term: TimetableTab) => …}`); otherwise
  every use is reported as unsafe.
- Name callback props in camelCase (`onShowCell`, `onClose`).
- Write comments in English, except in `src/lib/requirements/`, where Japanese
  fits the domain (履修要覧, 科目区分, …). UI text is Japanese.
- A requirements module mirrors its 履修要覧 table: one predicate per cell,
  named after the cell (`isC1`, `isD2Unlisted`), listing that cell's course
  IDs with a comment each. Don't group courses under a name the table doesn't
  use, or share such a group between modules. When courses move between cells
  across years, name them after the cell where a table lists them on their
  own, and let the other year call it.

  Mistakes this rule comes from:
  - 5ae5dd4 factored the five courses every 情報学群 学類 teaches into an
    `INFO_COURSE_IDS` table in `common.ts`, read through `isInfoCourse`,
    `isInfoCourseOf` and `isInfoCourseOfOthers`, which mast wrapped again in
    `isInfoCourseForMast(id, "微分積分A", mode, isNative)`. "Information
    course" is in no table, and learning that mast's c1 is GA15331 took three
    functions and a table in another file. 116fd88 undid it: mast's `isC1` is
    now `id === "GA15331"`, and `isC1Unlisted` lists the other 学類's classes.
  - coens's 数学リテラシー, 微積分, 線形代数, 力学, 電磁気学 and 化学 1–3 are in
    c1 in the 2023 table and in d2 from 2024. A proposed `isFoundation` for
    them named a group no table names. a85b65e lists them in `isD2`, after
    the 2024 table's d2, and 2023's `isC1` calls it.
