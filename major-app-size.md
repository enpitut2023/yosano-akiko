# MajorApp.svelte のサイズ

`src/routes/[tableYear]/[major]/MajorApp.svelte` は 1,665 行（2026-10-28 時点）。script 約 720 行、
markup 約 405 行、style 約 540 行。単位チェック・出力・設定タブ、授業の表とフィルタバー、
ポインタ処理、スマホ非対応の表示などはすでに別ファイルに切り出してあり、残りの大半は
要件の表と、履修を組むタブのつなぎ。

## 内訳（概算）

| 部分                                                            | script | markup | CSS                | 計       |
| --------------------------------------------------------------- | ------ | ------ | ------------------ | -------- |
| 要件の表（マス、タイトル、単位の合計、ズーム、文字の横幅調整）  | ~180   | ~120   | ~230               | **~530** |
| 履修を組むタブ（一覧の組み立て、ドラッグ&ドロップ、時間割の下） | ~150   | ~165   | ~130               | **~445** |
| チュートリアルのステップ                                        | ~105   |        |                    | ~105     |
| サイドバー・時間割のリサイズ                                    | ~55    | ~15    | ~40                | ~110     |
| import、型、保存する状態（`saved`）、タブ間のつなぎ             | ~230   | ~105   | ~140（レイアウト） | ~475     |

切り出し済み：`ImportTab.svelte`、`ExportTab.svelte`（共有の CSS は
`steps-panel.scss`）、`SettingsTab.svelte`、`Timetable.svelte`、`Tutorial.svelte`、
`CourseFilters.svelte`、`CourseTable.svelte`、`FakeCourseTable.svelte`（共有の CSS は
`course-table.scss`）、`SyllabusLink.svelte`、`MobileUnsupportedNotice.svelte`、
`course-filters.ts`、`timetable.ts`、`credit-display.ts`、`debug.ts`、
`gestures.ts`（`panZoom`、`resizeHandle`）、`$lib/Dialog.svelte`。

## 改善案（リスクの低い順）

1. **チュートリアルのステップ**を `tutorial-steps.ts` に移し、必要な状態を
   引数で受け取る関数にする（`MajorApp` の状態と密接なので任意）
2. **履修を組むタブを `CoursesTab.svelte` にまとめる**かどうか
   （`courses-tab-plan.md` の手順 4 で検討中）。まとめると `MajorApp` は
   1,200〜1,250 行程度になる見込み。

タブに状態を渡すのが主なコスト。`akiko` は値なので props でそのまま渡せ、変更は
コールバックで `saved` を置き換える形になる。props が長くなりすぎる場合は、
`.svelte.ts` の小さな状態クラスを context で渡す方法がある。
