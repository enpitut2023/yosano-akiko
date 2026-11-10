# Mobile support

Notes while making the major page work on phones. The mock at
`/[tableYear]/[major]/mock` (`src/routes/[tableYear]/[major]/mock/`) tries the
layout first: unlinked, `noindex`, in memory only. Try it on a phone with
`npm run dev:tailnet`.

## Decided

- Layout: the table fills the screen as a map, under a bottom sheet with
  three heights (peek, half, full) and three tabs: 授業を探す, 取る授業,
  時間割.
- Courses move between lists with a ＋/✓ button on each row, not by
  dragging. Dragging can stay on desktop.
- A course row: bold name, slot chip, then credits, year and ID in small
  grey text; yellow for 取る, green for 取得済み; a 時間が重複 tag; tap to
  expand 備考, シラバス and 該当マスを表示. The button doesn't make the row
  jump.
- Look: the desktop's, not an app-like one. Folder tabs with icons, black
  rules, rows stacked like its course tables, the credit summary as a box
  filled like its column sums, the table's green and yellow tints for taken
  and planned rows. Chosen over a ruled 履修要覧 look and a pink one.
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

## To decide

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
- [ ] Playwright e2e tests at a phone viewport.
- [ ] Remove the mock route.
