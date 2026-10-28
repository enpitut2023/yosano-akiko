# MajorApp.svelte のサイズ

`src/routes/[tableYear]/[major]/MajorApp.svelte` は 2,259 行（2026-10-28 時点）。script 約 940 行、
markup 約 600 行、style 約 715 行。単位チェック・出力・設定タブ、ポインタ処理、
スマホ非対応の表示などはすでに別ファイルに切り出してあり、残りの大半は
履修を組むタブと要件の表。

## 内訳（概算）

| 部分                                                              | script | markup | CSS                | 計       |
| ----------------------------------------------------------------- | ------ | ------ | ------------------ | -------- |
| 履修を組むタブ（授業一覧、フィルタ、ドラッグ&ドロップ、時間割側） | ~300   | ~365   | ~320               | **~985** |
| 要件の表（マス、タイトル、単位の合計、ズーム、文字の横幅調整）    | ~180   | ~120   | ~230               | **~530** |
| チュートリアルのステップ                                          | ~105   |        |                    | ~105     |
| サイドバー・時間割のリサイズ                                      | ~55    | ~15    | ~40                | ~110     |
| import、型、保存する状態（`saved`）、タブ間のつなぎ               | ~295   | ~95    | ~150（レイアウト） | ~540     |

切り出し済み：`ImportTab.svelte`、`ExportTab.svelte`（共有の CSS は
`steps-panel.scss`）、`SettingsTab.svelte`、`Timetable.svelte`、`Tutorial.svelte`、
`MobileUnsupportedNotice.svelte`、`credit-display.ts`、`debug.ts`、
`gestures.ts`（`panZoom`、`resizeHandle`）、`$lib/Dialog.svelte`。

## 改善案（リスクの低い順）

1. **チュートリアルのステップ**を `tutorial-steps.ts` に移し、必要な状態を
   引数で受け取る関数にする（`MajorApp` の状態と密接なので任意）
2. **履修を組むタブを分ける**（一番大きい）
   - `CourseFilters.svelte`（フィルタバー、~170 行の derived とフィルタ処理、
     ~130 行の CSS）
   - `CourseTable.svelte`（`courseRow`、`courseTable`、`fakeCourseTable` の
     snippet を置き換える）

2 まで終えると、`MajorApp` はレイアウト、共有の状態（`saved` と、そこから
derive する `akiko`、選択中のマス、開いているタブ、ズーム）、コンポーネント間の
つなぎだけになり、1,200〜1,400 行程度になる見込み。

タブに状態を渡すのが主なコスト。`akiko` は値なので props でそのまま渡せ、変更は
コールバックで `saved` を置き換える形になる。履修を組むタブの分割で props が
長くなりすぎる場合は、`.svelte.ts` の小さな状態クラスを context で渡す方法がある。
