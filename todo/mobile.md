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
      the wrong choice: the pink bar with its 成績 and 出力 buttons takes too
      much of the screen to show all the time.
- [ ] A course row and a course's bar in the timetable look like different
      things, but they're the same course; they should look alike, or at
      least feel alike.
- [ ] The ✓ on a course row doesn't say what it means.
- [ ] 案：表と時間割's toolbar total (卒業まで あと 104→97 単位) and the
      red あと N badges on cells and columns say the same kind of thing but
      look nothing alike. They should look similar.

## To decide

- [ ] Which layout. The mock bar's 案 switch picks between the panel layout
      above (案：パネル, `SheetLayout`) and 案：表と時間割 (`ViewsLayout`).

  Why a redesign: the panel layout only makes sense to those who already
  know how akiko works, and a tutorial won't fix that; it's unintuitive at
  heart. Its tabs (探す, 取る授業, 時間割, 単位) are akiko's model: a cell has
  courses, a course moves between lists, and the lists drive the colors,
  the credits and the export. Students instead think of their 履修 in terms
  of the 履修要覧 table and the timetable, so those should be front and
  center, with the model showing through what they do.

  What 案：表と時間割 tries, and why:
  - 表 and 時間割 as the two main views, switched at the top, with no tabs:
    they're how students already think.
  - Picking courses from either view. A cell lists its courses; a timetable
    slot lists the courses at that time that count toward graduation, each
    tagged with what its credits would do (マスにあと2単位必要, 単位は足りて
    いる, …), the needed ones first. "What can I take on Monday 3rd period"
    is how many students choose, and the tags tie the timetable back to the
    table.
  - The courses sheet opens only to pick, headed by what it's for, and closes
    with ✕: always there, it competed with the views and asked to be
    understood before anything else.
  - あと N on each cell and column still short after the planned courses,
    and a legend: the table says where to act without knowing what the colors
    mean.
  - The total (卒業まで あと 104→94 単位) in the toolbar, opening the 単位
    details: it's the number students care about, so it's always in sight.
  - ① 成績 → ② 授業を選ぶ → ③ TWINSへ as the header, in place of the pink
    bar, the major's name and the 成績 and 出力 buttons. The steps describe
    akiko's whole workflow in one line, doing much of a tutorial's job, and
    take less room; importing and exporting are occasional.
  - A 取る button, checked when planned, as the bare ＋/✓ didn't say what
    it does.
  - A banner asking for grades when there are none: on a first visit nothing
    is green, and importing is what comes next.
  - Tried and dropped: a 足りないマスへ button going through the short cells
    in turn, and a toast after each move with 元に戻す and 時間割で見る. Not
    needed.

- [ ] A better 単位 tab. For now it shows what's left to graduate as a big
      number (卒業まで あと 94→81 単位) over meters for 必修 and 選択; it
      could be better. Also tried and dropped: a meter each for 必修, 選択 and
      合計, and a ruled table of 取得済み, 取る授業, 必要 and あと.
- [ ] The order of the sheet's tabs.
- [ ] How the desktop components reused in the sheet should look on a phone:
      `CourseFilters`, `Timetable`, `ImportTab`, `ExportTab`.
- [x] The ＋/− buttons could be smaller once pinch works well. Down from
      45px to 35px, and joined into one box.
- [ ] Importing and exporting what's saved in localStorage (deferred).
- [ ] The timetable's orange highlight on the course added last (a7c4ab5)
      isn't needed on a phone. Leave it for now.

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
- [ ] Add the donation link.
- [ ] Remove the mock route.

## Later

- [ ] Adding あきこ to the home screen (a web app manifest, maybe offline).
- [ ] Making it a handy timetable viewer: open it and see this term's
      classes.
