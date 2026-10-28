# E2E UI tests with Playwright

Plan for adding end-to-end tests of the major page (`/[tableYear]/[major]`).
The setup and the per-page smoke test are done; the rest is to do.

## Scope

E2E tests check that the UI is wired up: importing grades, picking courses,
exporting for TWINS, the tutorial, and so on. Credit arithmetic per major is
already covered by the `runTest` unit tests with real CSVs in `grade-csvs/`,
and `npm run build` already fails on missing rects or table SVGs. So the e2e
suite targets one or two majors in depth (coins 2023) plus a cheap smoke test
over every page, not every major in depth.

## Decisions

### Test-only course catalog

The real catalog (`src/lib/current-courses.ts`) is regenerated every year, so
tests that name real course IDs or time slots would break yearly. Instead, a
small hand-written catalog replaces it when `AKIKO_E2E=1` is set.

The swap is a Vite plugin in `vite.config.ts`, loaded only when the env var is
set. It resolves every import to an absolute path and redirects the one that
is `src/lib/current-courses.ts` to `tests/e2e/fixtures/courses.ts`:

```ts
const catalog = fileURLToPath(
  new URL("src/lib/current-courses.ts", import.meta.url),
);
const e2eCatalog = fileURLToPath(
  new URL("tests/e2e/fixtures/courses.ts", import.meta.url),
);

/** Serves the e2e fixture wherever the real course catalog is imported. */
function useE2eCatalog(): Plugin {
  return {
    name: "akiko-e2e-catalog",
    enforce: "pre",
    async resolveId(source, importer, options) {
      const resolved = await this.resolve(source, importer, {
        ...options,
        skipSelf: true,
      });
      return resolved?.id === catalog ? e2eCatalog : null;
    },
  };
}

export default defineConfig({
  plugins: [process.env.AKIKO_E2E && useE2eCatalog(), sveltekit()],
  // ...
});
```

- Chosen over an if/else with a dynamic import in `major-config.ts` because
  production code and bundling stay exactly as they are. The real catalog
  stays statically bundled with `major-config`, and `src/` never references
  `tests/`.
- The cost is that the swap is invisible from `major-config.ts`, so its
  import gets a one-line comment pointing at the plugin in `vite.config.ts`.
- The env var is read in Node, not in the browser, so it needs no `VITE_`
  prefix.

### Production build

Playwright runs `AKIKO_E2E=1 vite build && vite preview --port 42264
--strictPort`, so tests exercise the code that ships. It builds fresh on
every run and never reuses a running server, so a leftover server can't serve
stale code.

- **Speed:** with the fixture catalog the build takes about 5 seconds, and
  prerendered pages load faster than dev-server pages. All 223 smoke tests
  take about 1 minute including the build, against about 1.6 minutes on a dev
  server.
- **Separate outputs:** with `AKIKO_E2E` set, `svelte.config.js` writes to
  `build-e2e/` and `.svelte-kit-e2e/` instead of `build/` and `.svelte-kit/`.
  So running the tests never replaces the real build, or what
  `npm run preview` serves.
- **Network:** the production build injects Matomo. The `context` fixture in
  `tests/e2e/test.ts` answers every request to another origin with an empty
  response, which keeps tests off the network. Aborting the requests instead
  would log "Failed to load resource" console errors, which fail the smoke
  test.
- **Ports:** the regular dev server stays on :42263, so both can run at once.
- **No separate Vite cache needed:** only the dev server uses Vite's
  dependency cache, so sharing `node_modules/.vite` is fine.
- **Plugin cost:** the catalog plugin's `resolveId` hook declares a filter
  (`/current-courses/`) so the bundler doesn't call it for every import.
  Without it, the plugin took about half the build's plugin time.
- **Known noise:** SvelteKit warns that `tsconfig.json` should extend
  `.svelte-kit-e2e/tsconfig.json`, because of the separate output folder. It's
  harmless; the root tsconfig is only for editors and `npm run check`.

### Where the tests live

`tests/e2e/`, with fixtures in `tests/e2e/fixtures/`. SvelteKit's generated
`.svelte-kit/tsconfig.json` already includes `tests/**`, so type checking,
type-aware ESLint and `$lib` imports work there without config changes.
`playwright.config.ts` at the repo root is outside every tsconfig, so it has
to be added to ESLint's `allowDefaultProject`.

## Fixtures

### Catalog (`tests/e2e/fixtures/courses.ts`)

About 10 typed `KnownCourse`s with a fixed `knownCourseYear`. They are chosen
for coins 2023 so that each one has a purpose:

- Two courses with overlapping time slots, for the overlap warning.
- A course whose remark contains 事前登録対象, for the 事前登録 warning.
- A course with `availability: "unavailable"`, for the 設定 toggle.
- Courses that land in known cells (e.g. a `GB20…` course in `b1`).
- A required course by ID (e.g. `GB26403` in `a1`).

### Coupling to the coins requirements

The fixture replaces the catalog, not the rules that put courses into cells.
Those stay real: for coins 2023 they are in
`src/lib/requirements/coins-since-2021.ts`, and they work mostly by course ID:

- `GB26403` / `GB26503` are listed by ID in `a1`.
- IDs starting `GB20`, `GB30` or `GB40` go to `b1`.
- Other `GB2` / `GB3` / `GB4` and `GA4` IDs go to `b2`.
- A course named like a required course (e.g. 線形代数A) whose ID isn't the
  listed one goes to no cell.

So fixture IDs must be chosen to land where a test expects. For example, "GB20401
appears when you click `b1`" depends on the `GB20` rule. A test breaks only if
someone edits that rule. That rarely happens for a finished entry year: the
2023 履修要覧 doesn't change, and new years get new branches or a new module.
The page also uses the real table SVG and rects for coins 2023, which are just
as fixed.

A test-only major (its own requirements module, table, rects and `instances`
entry) would remove this coupling, but it would show up on the top page and
in prerendering. Not worth it.

### Grades files (`tests/e2e/fixtures/grades.ts`)

Grades files are built in each test from rows, with `gradesFile`, which lays
them out in the columns of a TWINS export (see `grade-csvs/` and
`src/lib/csv.ts`). The rows sit next to the assertions that depend on them,
and each test gets only the rows it needs, so adding a row for one test can't
break another. The rows are written to match the fixture catalog.

The import tests use:

- A passed required course: `GB26403` (a1), grade A.
- A 履修中 course, which starts in 取る授業: `GA15211` (c1).
- A failed course, which stays in 当てはまる授業: `GB27001` (b2), grade D.
- A credit-transfer row (認, no course ID), which becomes a `FakeCourse` and
  fits no cell.
- `FF18724` 線形代数A, which counts toward c1 only for 移行 students and
  otherwise fits no cell. None of the real CSVs show 卒業単位に含まれない授業 on
  coins.
- A broken file, for the import error alert.

## Setup

- [x] `npm i -D @playwright/test` and `npx playwright install chromium`.
- [x] Add the plugin to `vite.config.ts`, and add the comment on the catalog
      import in `src/lib/major-config.ts`.
- [x] Write the fixture catalog and the grades file helper.
- [x] Write `playwright.config.ts`:
  - `webServer` builds with `AKIKO_E2E=1` and previews on :42264.
  - `baseURL` is `http://localhost:42264/yosano-akiko/`.
  - Chromium only, for now.
- [x] Add a starting-state helper:
  - Use `addInitScript` to set `akiko_tutorial_seen` and
    `akiko_pan_hint_seen`, except in tests of those features.
  - Each test gets a fresh context, so localStorage is isolated.
- [x] Add the `npm run test:e2e` script, and add `playwright.config.ts` to ESLint's
      `allowDefaultProject`.
- [x] Ignore Playwright's output folders (`test-results/`,
      `playwright-report/`) and the e2e build outputs in `.gitignore`.
- [x] Stub every request to another origin, which also silences Matomo.
- [x] CI: both workflows install Chromium with dependencies and run
      `npm run verify`, which ends with `npm run test:e2e`. The deploy waits for
      it.
- [ ] CI: cache the Playwright browser if installing it gets slow.
- [x] Document `npm run test:e2e`, the fixture catalog and `AKIKO_E2E` in
      CLAUDE.md.

## Things tests must handle

- **Grade import:** call `setInputFiles` on the hidden `.csv-input`.
- **CSV download:** use `page.waitForEvent("download")` to catch the `data:`
  link, then assert the contents.
- **Course drag and drop:** course rows use HTML5 drag and drop, which
  `locator.dragTo` supports in Chromium.
- **Pan and resize handles:** they need real pointer input through
  `page.mouse`. Synthetic events can't take pointer capture, so the resize
  handles ignore them.
- **Dialogs:** `alert` / `confirm` (bad CSV, リセット) need
  `page.on("dialog")`.
- **Selectors:**
  - Prefer role plus accessible name for buttons and tabs.
  - Use the existing `data-tutorial` attributes for regions.
  - When nothing else identifies an element (a cell, the tutorial's current
    step), add `data-testid` and use `getByTestId`, so it's clear the
    attribute is there for tests.
  - Japanese text in selectors breaks when wording changes, so keep text
    matching to what the test is actually about.
- **Visual snapshots:** skip them for now. Fonts differ between macOS and
  Linux, so screenshots would differ between local runs and CI.

## Test cases

### Smoke

Every test fails if the page logs an error or a hydration warning (the `page`
fixture in `tests/e2e/test.ts`), so the smoke tests mostly just load pages.

- [x] Every `instances` page loads, has the right title and reacts to a tab
      click. Closed colleges show the closed notice with the college's title.
- [x] The top page, `/faq`, `/contact`, `/contributors`, `/twins-grades` and
      `/twins-register` load.
- [x] On the top page, year → college → major opens that major's page, and a
      college with one major links straight to it.
- [x] ✅ marks exactly the colleges whose majors are all `checked`.
- Not tested: whether internal links resolve. Prerendering in `npm run build`
  already fails on links to missing pages or anchors. External links aren't
  checked either, since tests are kept off the network.

The whole suite takes about 1 minute, including the build. Run a subset with
`-g`, which matches the file name plus the test name (e.g. `-g "2023/coins"`,
or `-g " /[a-z-]* loads"` for the non-major pages). Positional arguments
filter by file instead.

### 単位チェック (import)

- [x] Importing the fixture CSV makes the drop zone show
      「インポート済み（N単位）」.
- [x] Imported cells are colored green (taken) or yellow (取る授業).
- [x] Imported data survives a reload.
- [x] Re-importing keeps courses moved by hand.
- [x] Dropping a file on the drop zone imports it, like the file picker does.
- [x] A broken CSV shows the error alert and leaves the data unchanged.
- [x] The 移行 toggle (いいえ / はい) is saved, and changes how courses are
      classified.
- [x] 卒業単位に含まれない授業 lists the unclassified real and fake courses.
- [x] The 手順を見る link opens `/twins-grades`.

### 履修を組む (courses)

- [x] Clicking a cell selects it and lists that cell's courses in
      当てはまる授業.
- [x] Clicking the table background deselects the cell.
- [x] 全ての授業を見る lists every course.
- [x] Searching by course ID and by name filters the list.
- [x] Each filter works: credits, expected year, term, day of week, only free
      time slots. The badge counts active filters.
- [x] Dragging a course to the right adds it to 取る授業 and shows it in the
      timetable on its term.
- [x] Dragging it back removes it.
- [x] The timetable term tabs switch terms. A course without a fixed time
      slot shows under その他.
- [x] 該当マスを表示 selects the course's cell and scrolls it into view.
- [x] A course name links to its KdB syllabus page.
- [x] Courses moved by hand stay moved after a reload.

### TWINSに出力 (export)

- [x] With no 取る授業, step 1 says there is nothing to register, ダウンロード
      is disabled, and the link switches to 履修を組む.
- [x] The summary shows 「N件・M単位」, and expanding it lists the courses.
- [x] ダウンロード downloads 科目番号一覧.csv containing exactly the 取る授業
      course IDs, except 履修中 ones, which are registered already.
- [x] After a download, the support dialog appears.
- [x] With overlapping courses:
  - [x] the warning and the overlap table show;
  - [x] ダウンロード is disabled;
  - [x] 表示 selects the cell, switches to 履修を組む and sets the timetable
        term.
- [x] With a 事前登録 course, its warning shows, and the course isn't in the
      downloaded file.
- [x] The same for a course not offered this year.
- [x] The 手順を見る link opens `/twins-register`.

### Saved plan (`saved-plan.spec.ts`)

How courses moved by hand interact with grades, rebuilds and what's saved.

- [x] A 履修中 course moved out of 取る授業 stays out; moved back in, it stays
      in.
- [x] A 落単済み course can be taken again, and is exported.
- [x] A passed course can't be moved.
- [x] Re-importing keeps moves, but forgets the ones the new grades settle
      (now passed, or now in that list anyway).
- [x] Changing the 移行 answer keeps moves.
- [x] Each entry year and major has its own plan.
- [x] リセット clears the grades and the plan.
- [x] Tabs of the same page stay in sync.
- [x] Broken saved data is replaced; moves of courses missing from the catalog
      are ignored.

### Tutorial

- [x] It opens on the first visit and not after it has been seen.
- [x] The branch for students with grades walks through import, cell, drag
      and export. Each waiting step advances only after the real action.
- [x] The まだない branch skips the import steps.
- [x] The tab steps wait for the user to click each tab.
- [x] Closing it marks it seen, and the チュートリアル link reopens it.

### Table

- [ ] Dragging with the mouse pans the table, and the click that ends a pan
      doesn't select a cell.
- [ ] The pan hint shows for mouse users until the first pan, then never
      again.
- [ ] Ctrl+wheel zooms around the pointer, within the min and max zoom.
- [ ] The zoom slider zooms.
- [ ] The column credit sums stay readable at different zoom levels.
- [ ] The sidebar and timetable resize handles resize within their limits.
- [ ] The bars toggle hides and shows the sidebar.

### 設定

- [ ] 今年度開講しない授業を表示する shows and hides unavailable courses.
- [ ] 時間割に単位取得済みの授業を表示する shows and hides taken courses in the
      timetable.
- [ ] Changing 時間割の年度 changes the timetable.
- [ ] リセット asks for confirmation. Cancelling keeps the data; confirming
      clears it.

### Saved data

- [ ] localStorage from older format versions (v1, v2) loads and is migrated
      to v3.
- [ ] Corrupt localStorage falls back to the defaults without crashing.

### Mobile

- [ ] With touch emulation and a small viewport, the mobile-unsupported
      overlay shows; このまま使う dismisses it.
- [ ] The tutorial doesn't open automatically when the overlay applies.

## Later

- [ ] Other browsers (Firefox, WebKit) if needed.
- [ ] Visual regression snapshots, generated and compared only in CI.
