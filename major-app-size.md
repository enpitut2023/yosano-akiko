# MajorApp.svelte のサイズ

`src/routes/[tableYear]/[major]/MajorApp.svelte` は 1,159 行（2026-10-28 時点）。script 約 530 行、
markup 約 240 行、style 約 390 行。各タブ、ポインタ処理、スマホ非対応の表示などはすでに
別ファイルに切り出してあり、残りの大半は要件の表と、保存する状態やタブ間のつなぎ。

## 内訳（概算）

| 部分                                                           | script | markup | CSS                | 計       |
| -------------------------------------------------------------- | ------ | ------ | ------------------ | -------- |
| 要件の表（マス、タイトル、単位の合計、ズーム、文字の横幅調整） | ~180   | ~120   | ~230               | **~530** |
| チュートリアルのステップ                                       | ~105   |        |                    | ~105     |
| サイドバーのリサイズ                                           | ~20    | ~5     | ~15                | ~40      |
| import、型、保存する状態（`saved`）、タブ間のつなぎ            | ~225   | ~115   | ~145（レイアウト） | ~485     |

切り出し済み：`CoursesTab.svelte`（中に `CourseFilters.svelte`、`CourseTable.svelte`、
`FakeCourseTable.svelte`、`Timetable.svelte`。表の共有の CSS は `course-table.scss`）、
`ImportTab.svelte`、`ExportTab.svelte`（共有の CSS は `steps-panel.scss`）、
`SettingsTab.svelte`、`Tutorial.svelte`、`SyllabusLink.svelte`、
`MobileUnsupportedNotice.svelte`、`course-filters.ts`、`timetable.ts`、
`credit-display.ts`、`debug.ts`、`gestures.ts`（`panZoom`、`resizeHandle`）、
`$lib/Dialog.svelte`。

## 改善案

1. **チュートリアルのステップ**を `tutorial-steps.ts` に移し、必要な状態を
   引数で受け取る関数にする（`MajorApp` の状態と密接なので任意）
2. **要件の表**を `RequirementsTable.svelte` に分ける。ズームとパン、
   `scrollCellIntoView`、単位の合計の横幅調整が中に入る。選択中のマスは
   `bind`、マスを押したときはコールバック。チュートリアルが
   `data-tutorial="requirements"` で指すので、その属性は残す。

タブに状態を渡すのが主なコスト。`akiko` は値なので props でそのまま渡せ、変更は
コールバックで `saved` を置き換える形になる。props が長くなりすぎる場合は、
`.svelte.ts` の小さな状態クラスを context で渡す方法がある。
