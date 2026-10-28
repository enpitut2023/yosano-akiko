# E2E tests

Playwright tests of the UI, mostly the major page (`/[tableYear]/[major]`).
They check that the UI is wired up: importing grades, building a plan,
exporting for TWINS, the tutorial, and what's saved. Credit arithmetic per
major is covered by the unit tests with real CSVs in `grade-csvs/`, and
`npm run build` already fails on missing rects, table SVGs or broken internal
links. So the suite covers one page in depth (coins 2023), plus a smoke test
that loads every page.

Run them with `npm run test:e2e`. The whole suite takes about a minute,
including the build. Run a subset with `-g`, which matches the file name plus
the test name (`-g "2023/coins"`, or `-g " /[a-z-]* loads"` for the pages that
aren't major pages). Positional arguments filter by file instead.

## How it works

### A test-only course catalog

The real catalog (`src/lib/current-courses.ts`) is regenerated every year, so
tests naming real course IDs or time slots would break every year. With
`AKIKO_E2E` set, a plugin in `vite.config.ts` serves
`fixtures/courses.ts` wherever the real catalog is imported.

- **A plugin, not an if/else in `major-config.ts`:** production code and
  bundling stay exactly as they are, and `src/` never refers to `tests/`. The
  cost is that the swap is invisible from `major-config.ts`, so its import has
  a comment pointing at the plugin.
- **The hook has a filter** (`/current-courses/`). Without it the bundler
  calls the hook for every import, which took about half the build's plugin
  time.

### Against a production build

Playwright builds with `AKIKO_E2E=1` and serves it with `vite preview` on
:42264, so the tests run the code that ships. It builds fresh every run and
never reuses a running server, so a leftover server can't serve stale code.
Prerendered pages also load faster than a dev server: the smoke test took 1.6
minutes on one.

- **Separate outputs:** the build goes to `build-e2e/` and `.svelte-kit-e2e/`,
  so running the tests never replaces `build/` or what `npm run preview`
  serves. SvelteKit then warns that `tsconfig.json` should extend
  `.svelte-kit-e2e/tsconfig.json`. That's harmless: the root tsconfig is only
  for editors and `npm run check`.
- **Port:** the dev server stays on :42263, so both can run at once.
- **Network:** the production build loads Matomo. The `context` fixture in
  `test.ts` answers every request to another origin with an empty response.
  Aborting them instead would log "Failed to load resource" errors, which fail
  the test.

### The `test` fixture

Import `test` from `test.ts`, not from Playwright. It marks the tutorial and
the pan hint as seen (tests of those use `test.use({ seen: false })`), and it
fails the test if the page logs an error or a hydration warning. That's why
the smoke test mostly just loads pages.

### Coupling to the coins rules

The fixture replaces the catalog, not the rules that put courses into cells.
Those stay real (`src/lib/requirements/coins-since-2021.ts`) and go mostly by
course ID, so each fixture course's ID is picked to land in a known cell. Read
the rule before trusting a comment: `GB31801` looks like b1 but is b2, because
b1 takes only `GB20`, `GB30` and `GB40`. A test breaks only if someone edits
these rules, which rarely happens for a finished entry year. The real table
SVG and rects for coins 2023 are just as fixed.

A test-only major would remove this coupling, but it would show up on the top
page and in prerendering.

### Grades files built in each test

`gradesFile(rows)` (`fixtures/grades.ts`) lays rows out like a TWINS export.
Each test lists only the rows it needs, next to the assertions that depend on
them, so adding a row for one test can't break another.

## Writing tests

- **Hydration:** pages are prerendered, so a click before hydration does
  nothing. `openTab` and `clickUntil` retry until the click works. Before
  checking that something _doesn't_ happen, wait for hydration
  (`waitForHydration`) or for the event that would cause it, or the check
  passes before anything had a chance to happen.
- **Course lists** show only the selected cell's courses. Use `deselectCell`
  before checking a whole list.
- **Grades:** `importGrades` sets the file on the hidden `.csv-input`.
  Re-importing the same file leaves 「インポート済み」 as it was, so use a
  file that changes something visible to know it's in.
- **Drag and drop:** course rows use HTML5 drag and drop, which `dragTo`
  supports; see `dragToMightTake` and `dragToWontTake`. The pan and the resize
  handles need real pointer input through `page.mouse`, because synthetic
  events can't take pointer capture.
- **Downloads:** `page.waitForEvent("download")`, then read the file.
- **Dialogs:** `alert` and `confirm` need a `page.once("dialog", …)` handler.
- **Selectors:** role and accessible name for buttons and tabs,
  `data-tutorial` for regions, and `data-testid` with `getByTestId` when
  nothing else identifies an element (cells, the tutorial's step). Match
  Japanese text only where the text is what the test is about.
- **No screenshots:** fonts differ between macOS and Linux, so they would
  differ between local runs and CI.

## To do

### Open findings

- [ ] `MajorApp` isn't remounted on a client-side navigation from one major
      page to another, so it would keep the first major's `saved`. Nothing
      links one major page to another directly yet.
- [ ] Moves of courses no longer in the catalog stay in localStorage, and come
      back if the course does.
- [ ] Courses with `availability: "indeterminable"` are exported without a
      warning. Should they get one like the courses not offered this year?

### Setup

- [ ] Cache the Playwright browser in CI if installing it gets slow.
- [ ] Firefox and WebKit, if needed.
- [ ] Visual regression snapshots, generated and compared only in CI, so
      fonts don't differ between runs.
