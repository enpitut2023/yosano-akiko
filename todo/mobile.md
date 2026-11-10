# Mobile support

Notes while making the major page work on phones. The mock at
`/[tableYear]/[major]/mock` (`src/routes/[tableYear]/[major]/mock/`) tries the
layout first: unlinked, `noindex`, in memory only. Try it on a phone with
`npm run dev:tailnet`.

## Decided

- The mock is published on main at `/yosano-akiko/2023/coins/mock`, the
  only page `entries` prerenders. It stays under `[tableYear]/[major]/` rather
  than at `/mock`: it imports the major page's components as `../X`, and sits
  beside the code it will be merged into.
- Layout: the table fills the screen as a map, under a bottom sheet with
  three heights (peek, half, full) and four tabs: 探す, 取る授業, 時間割,
  単位.
- Letting go of the sheet projects its height by its speed and snaps to the
  nearest; a quick flick moves one snap its way, and only a very fast one
  can skip half. The thresholds in `sheet.ts` are guesses to tune on a phone.
- Courses move between lists with a ＋/✓ button on each row, not by
  dragging. Dragging can stay on desktop.
- A course row: bold name, slot chip, then credits, year and ID in small
  grey text; yellow for 取る, green for 取得済み; a 時間が重複 tag; tap to
  expand 備考, シラバス and 該当マスを表示. The button doesn't make the row
  jump: a course taken out on the 取る授業 tab stays listed, with a ＋, until
  the tab changes.
- Look: the desktop's, not an app-like one. Folder tabs with icons, black
  rules, rows stacked like its course tables, the credit summary as a box
  filled like its column sums, the table's green and yellow tints for taken
  and planned rows. Chosen over a ruled 履修要覧 look and a pink one.
- Credits: the peek shows only the selected cell, or a hint. The totals live
  in a 単位 tab. The column sums always show in a strip under the table's
  columns, pinned above the sheet: they have no names a student knows (a1,
  b2 are internal), so they only make sense lined up with the columns.
- A tap on the table outside a cell clears the selection, as on desktop;
  there's no clear button.
- Keep the ＋/− zoom buttons: mouse and trackpad users have no pinch, and a
  two-finger gesture needs a one-finger alternative (WCAG 2.5.1). They zoom
  around the middle of the part the sheet doesn't cover.

## Known issues

- [ ] Pinch zoom is very laggy on a Zenfone 10 in Firefox. Each `touchmove`
      sets `zoom`, which resizes the table image and every cell, then waits
      for a `tick` before scrolling. A CSS transform during the gesture,
      applying the zoom only when it ends, may fix it.
- [ ] A trackpad pinch (ctrl+wheel) zooms the whole page, not the table.
- [ ] The major's name is cut off in the header. Maybe the whole top bar is
      the wrong choice.
- [ ] A course row and a course's bar in the timetable look like different
      things, but they're the same course; they should look alike, or at
      least feel alike.
- [ ] The ✓ on a course row doesn't say what it means.

## To decide

- [ ] A better 単位 tab. For now it shows what's left to graduate as a big
      number (卒業まで あと 94→81 単位) over meters for 必修 and 選択; it
      could be better. Also tried and dropped: a meter each for 必修, 選択 and
      合計, and a ruled table of 取得済み, 取る授業, 必要 and あと.
- [ ] The order of the sheet's tabs.
- [ ] How the desktop components reused in the sheet should look on a phone:
      `CourseFilters`, `Timetable`, `ImportTab`, `ExportTab`.
- [ ] The ＋/− buttons could be smaller once pinch works well.
- [ ] Importing and exporting what's saved in localStorage (deferred).

## To do

- [ ] Iterate on the mock with testers' feedback.
- [ ] Replace `CourseTable` with the new course row and its ＋/✓ button,
      desktop too.
- [ ] Split `CoursesTab` into the find list, the plan list and the timetable.
- [ ] Add the mobile layout to `MajorApp`, behind a media query.
- [ ] Touch pan and pinch zoom in `gestures.ts`.
- [ ] Rewrite the tutorial's steps for the mobile layout, and remove
      `MobileUnsupportedNotice`.
- [ ] Playwright e2e tests at a phone viewport, on the real page once the
      layout is in `MajorApp`. Behaviors to cover:
  - Tapping a cell selects it, opens the sheet to half on 探す with its
    courses, and scrolls the cell into view above the sheet and the strip.
  - Tapping the table outside a cell clears the selection; panning doesn't.
  - ＋ and ✓ move a course without moving its row, and the peek's credits
    and the tab's count follow.
  - A course taken out on 取る授業 stays listed with a ＋ until the tab
    changes, and ＋ puts it back.
  - 該当マスを表示 and a timetable bar select their course's cell.
  - The 時間が重複 tag shows on a course clashing with a planned one.
  - さらに表示 lists more of a long cell.
  - The ＋/− zoom keeps what's in the middle of the visible part in place,
    with the sheet at each height.
  - The column strip lines up under its columns through scrolling and
    zooming; a column past its limit has a red border, and its warning's
    表で見る scrolls to it.
  - The 単位 tab's numbers match the credit stats.
  - A grip tap moves the sheet to the next height; one drag and one flick,
    as a check that `BottomSheet` wires up the rules `sheet.test.ts` covers.
  - Importing grades from 成績 and downloading from 出力 still work.
- [ ] Remove the mock route.

## Later

- [ ] Adding あきこ to the home screen (a web app manifest, maybe offline).
- [ ] Making it a handy timetable viewer: open it and see this term's
      classes.
