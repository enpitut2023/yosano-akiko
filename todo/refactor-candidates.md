# Refactor candidates

Found by reading through `src/` and `tests/`. Roughly ordered by value for
the effort. Nothing here changes behavior unless it says so.

## Dead code and small fixes

- [ ] `akikoGetAllCourses` (`src/lib/akiko.ts:585`): the second loop, over
      real courses missing from the catalog, sorts them by hand from
      `courseIdToListKind` or the grade. `akikoNew` already gives every real
      course a list kind in `courseIdToListKind`, so the grade branch never
      runs, and the loop could call `akikoGetListKind` like the first one.
- [ ] The same `switch (listKind)` that sorts ids into
      `wontTake`/`mightTake`/`taken` appears three times in
      `akikoGetCoursesInCell` and `akikoGetAllCourses`. One helper that
      buckets ids by list kind would replace all three.
- [x] `akikoNew` returns `Akiko | undefined` but never returns `undefined`.
      `MajorApp` asserts it away. Make the return type `Akiko`.
- [x] Unused icons and `student-stressed-1.png`: deleted.
- [x] Unused tables: `static/tables/2023/biol.svg`,
      `static/tables/2026/biol.svg`, `static/tables/2023/earth-les.svg` have
      no rects and no page in `instances`. Kept on purpose: don't delete
      them.
- [x] `CLAUDE.md` says nothing but `MajorApp` reads localStorage, but
      `seen.ts` does too (the tutorial and pan hint flags).
- [x] `MajorApp` declares `metaTitle` and `metaDescription` with `let`;
      they're `$derived` and never reassigned, so `const`.

## CSS duplication

- [ ] `ImportTab`, `ExportTab` and Timetable's `.other-tab` each repeat the
      table rules in `course-table.scss` (borders, `width: 100%`,
      `th { white-space: nowrap }`, white rows). They could
      `@use "./course-table"` like `CourseTable` does.
- [ ] `.link-button` is defined the same in `MajorApp` and `ExportTab`.
      A small `LinkButton.svelte`, or one global class.
- [ ] `.step-problem` in `ExportTab` is `.step-note` from
      `steps-panel.scss` with another color. Could be `.step-note` plus a
      modifier, so the icon alignment lives in one place.
- [ ] Classes with no CSS and no test using them: `id-name`, `credit`,
      `slots`, `expects`, `term`, `show-term` (37 uses across the course
      tables). `tr.course` is only a test hook. Either drop them or keep
      them as hooks on purpose.

## Function signatures

- [ ] `akikoNew` takes 9 positional arguments, three of them maps of the
      same type (`courseIdToCellId`, `realCoursePositions`, …), so a
      mix-up type-checks. An options object would make call sites
      self-describing. The same goes for `classifyCoursesOrFail`
      (`src/lib/app-setup.ts`, 9 arguments), whose last 6 all come from
      `config`: it could take the `MajorConfig` itself.

## Splitting big files

- [ ] `src/lib/akiko.ts` (950 lines) holds two layers: the course
      vocabulary (ids, grades, terms, days, `When`, `Slot`, the three
      course types; lines 1–300) and the `Akiko` model built on it. The
      first part could be `src/lib/course.ts`, leaving `akiko.ts` about
      `Akiko`.
- [ ] `MajorApp.svelte` (735 lines): the 13 tutorial steps take ~140 of
      them, and they reach into most of MajorApp's state. A
      `tutorialSteps(ctx)` function in `tutorial.ts` taking getters and
      actions would move the text out, though the coupling would stay.
- [ ] `MajorApp.svelte`: loading, saving and syncing `saved` across tabs
      (`localDataLoad`, the save effect, `onStorage`) is one concern spread
      over three places. A `persisted.svelte.ts` holding a `$state.raw`
      bound to a localStorage key would group it and make it testable.
- [ ] `Timetable.svelte`: the bar layout (merging consecutive periods,
      nudging overlapping bars) is pure logic inside the component. Moved
      to `timetable.ts` as a function from courses and a term to bars, it
      could get unit tests like `timetableTabAfterPlanning`.

## Duplicated constants

- [ ] `Timetable.svelte` lists the six regular terms twice (`TERMS` and
      `TIMETABLE_TERMS`), and `akiko.ts` has its own `TERMS` with every
      term. One exported `REGULAR_TERMS` in `akiko.ts` (or `timetable.ts`)
      would cover both.
- [x] `SUPPORT_URL` is in `routes/[tableYear]/[major]/links.ts`, while the
      other outside links (`FEEDBACK_FORM_URL`, `AKIKO_X_URL`, `ENPIT_URL`)
      are in `$lib/constants`.

## UI consistency

- [x] The zoom icon in `RequirementsTable` is now lucide's `ZoomIn`. The tab
      icons (`math.svg`, `book.svg`, `itf.svg`) stay custom on purpose: their
      line weight matches the 筑波大学 logo.
- [x] The warning icons in `RequirementsTable` are now lucide's
      `TriangleAlert`, filled yellow.
- [ ] Import errors and the 編入生 notice use `alert()` (`MajorApp`), while
      the rest of the UI uses `Dialog`/`Callout` and inline notes. The
      import error could show under the drop zone in `ImportTab`.

## Tests

- [x] Grade rows in the e2e specs repeat each fixture course's name and
      credit (`GB26403` is spelled out with "ソフトウェアサイエンス実験A", 3
      credits, in several specs). A `gradeRow(courseId, grade, year)`
      helper in `fixtures/grades.ts` that looks them up in
      `fixtures/courses.ts` would keep them in sync.
- [ ] Majors with a requirements module but no per-major test in
      `src/lib/requirements/tests/`: bres-les, ccc, css, ds, earth, earth-les, edu, help,
      jpjp, med, nurse. Each needs a real grades CSV in `grade-csvs/` first.
      med and nurse have edge-case tests on made-up rows, but no real CSV.
      The rest, by risk from reading the code:

      - Riskiest:
        - css: 11 TODOs, several limits inside a cell not implemented
          (社会学演習 6単位以上, 憲法I・II…から4単位以上, …). ps merges b1
          and b2 from 2025.
        - earth: 17 year checks, a requirements table per year 2023–2026,
          移行 rules, and a guard that depends on rule order (`isA2` for
          the other specialty).
        - help: 9 year checks, 22 prefix rules, and d1 and d2 overlap
          completely; `redistributeOverflow` passes d1's excess to d2.
        - jpjp: two specialties and 移行 rules. Its own TODO says the
          foreign-language rules are probably wrong.
      - Medium: ccc and ds, with 移行 rules and a broad catch-all cell.
      - Low: bres-les, earth-les and edu, small with few branches.

- [x] `src/lib/tests/` holds the per-major requirement tests, which is easy
      to confuse with `tests/e2e/`. `src/lib/requirements/tests/` would say
      what they test.

## Docstrings

Exports without a docstring, outside `requirements/` . Many are
self-explanatory type guards and comparators,
but these would gain from one:

- [ ] `akiko.ts`: `Akiko`, `akikoNew`, `ListKind`, `ListKindOverrides`,
      `CreditStats` and the `*CreditStats` types (what raw vs. effective
      means), `Availability`, `akikoExportForTwins`, `akikoMoveCourse`,
      `OccupiedSlots`
- [ ] `app-setup.ts`: `MajorConfig`, `classifyCoursesOrFail`,
      `creditRequirementsNewOrFail`, `ClassifyOptions`
- [ ] `local-data.ts`: `LocalDataV1`–`V3`, `localDataFromJson`
- [ ] `constants.ts`: `instances`, `Instance`, `majorIsClosed`
- [ ] `csv.ts`: `parseImportedCsv`; `major-config.ts`: `getMajorConfig`
