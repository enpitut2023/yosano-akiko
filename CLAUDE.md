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
- `npm run check`: `svelte-kit sync` and `svelte-check`
- `npm run lint`: ESLint with type-aware rules
- `npm t`: all tests. Each test is a plain module that asserts when imported, so
  run one with `npx tsx src/lib/tests/coins.ts`. New test files must be imported
  from `src/lib/tests/index.ts`.
- `npm run e2e`: Playwright tests in `tests/e2e/`, run against a production
  build served on :42264. The build runs with `AKIKO_E2E=1`, which makes a
  plugin in `vite.config.ts` swap the course catalog for
  `tests/e2e/fixtures/courses.ts` and sends the output to `build-e2e/` and
  `.svelte-kit-e2e/`. Run one with `npx playwright test -g "<name>"`. Import
  `test` from `tests/e2e/test.ts`: it marks the tutorial and pan hint as seen
  and stubs requests to other origins (Matomo).
- `npm run build`: validates `grade-csvs/`, runs the tests, then prerenders every
  page into `build/`. Prerendering fails if a page's rects JSON or table SVG is
  missing.
- `npm run format`: Prettier

CI runs `npm run check && npm run lint && npm run build` on pull requests and on
`main`, plus `npm run e2e` on pull requests. Pushes to `main` deploy to GitHub
Pages.

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
- The TWINS export, which detects time overlaps and 事前登録 courses.

`akiko.svelte.ts` wraps it as `SvelteAkiko`, which makes reads reactive with
`createSubscriber`.

**Per-major rules** live in `src/lib/requirements/<major>-since-<year>.ts`.
Each module exports:

- `getCreditRequirements`: min/max credits per cell ID (`a1`, `b2`, …), per
  column, and the 必修/選択 totals.
- `classifyKnownCourses` / `classifyRealCourses` / `classifyFakeCourses`: map
  each course to a cell ID.
- `getRemark` (optional): notes shown for a cell.

Shared predicates (共通科目, 体育, 外国語, …) are in `requirements/common.ts`.

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
its private components and helpers beside it. It keeps the user's state in
localStorage under `${major}_${tableYear}` in a versioned format
(`local-data.ts` migrates older versions). `major-app-size.md` describes what
makes `MajorApp` large and how to keep splitting it.

**Tests.** Most tests call `runTest` (`src/lib/tests/util.ts`) with a real
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
