# MajorApp.svelte のサイズ

`src/routes/[tableYear]/[major]/MajorApp.svelte` は 3,231 行（2026-10-28 時点）。script 約 1,290 行、
markup 約 880 行、style 約 1,050 行で、どれか一つが突出しているわけではない。
共有のロジックが大きいというより、タブやウィジェットごとのコードが一つの
ファイルに同居していることが原因。

## 内訳（概算）

| 部分                                                                        | script | markup | CSS                              | 計       |
| --------------------------------------------------------------------------- | ------ | ------ | -------------------------------- | -------- |
| 履修を組むタブ（授業一覧、フィルタ、ドラッグ&ドロップ、時間割側）           | ~320   | ~260   | ~330                             | **~910** |
| 要件の表（マス、タイトル、単位の合計、ズーム、パン、文字の横幅調整）        | ~300   | ~120   | ~220                             | **~640** |
| 単位チェックタブ（インポート、CSV のドロップ、ステップ）                    | ~55    | ~120   | ~200（ステップは出力タブと共有） | **~375** |
| TWINSに出力タブ                                                             | ~60    | ~160   | ~80                              | **~300** |
| 単位の表示用関数（`creditProgressToString`、`cellCreditStatsDisplay` など） | ~135   |        |                                  | ~135     |
| チュートリアルのステップ                                                    | ~140   |        |                                  | ~140     |
| スマホ非対応の判定とオーバーレイ                                            | ~60    | ~20    | ~75                              | ~155     |
| サイドバー・時間割のリサイズハンドル                                        | ~95    | ~15    | ~25                              | ~135     |
| import、型、ローカルデータ、状態の初期化                                    | ~200   |        | ~150（レイアウト）               | ~350     |
| `debugPrintCreditStats`                                                     | ~35    |        |                                  | ~35      |

## 改善案（リスクの低い順）

1. **他に依存されない部品を切り出す**
   - `MobileUnsupportedNotice.svelte`（判定、オーバーレイ、CSS）
   - `credit-display.ts`（`gradeDisplay`、`creditBoundsToString`、`getPercentage`、
     `*CreditStatsDisplay` などの純粋関数。テストも書ける）
   - `debugPrintCreditStats` を開発用のファイルへ
   - `Dialog.svelte`（トップページ、`MajorApp`、`ClosedNotice` にコピーされている
     あきこ・学生の吹き出し）
2. **ポインタ処理を attachment にまとめる**
   - サイドバーと時間割のリサイズハンドルは同じ down/move/up の処理が 2 回
     書かれている。`resizeHandle` attachment 一つにすれば ~95 行が ~40 行になる
   - ドラッグでのパンと Ctrl+ホイールのズームはどちらも `#requirements` に対する
     処理なので、`panZoom` attachment にまとめられる
3. **タブごとにコンポーネントにする**
   - `ImportTab.svelte`、`ExportTab.svelte` は `svelteAkiko`、授業の配列、
     「このマスを表示」のようなコールバックなどの少しの props で済み、CSS も
     一緒に移せる。合わせて ~650 行。`.steps` は `Steps.svelte` として共有できる
4. **履修を組むタブを分ける**（一番大きい）
   - `CourseFilters.svelte`（フィルタバー、~265 行の derived とフィルタ処理、
     ~150 行の CSS）
   - `CourseTable.svelte`（`courseRow`、`courseTable`、`fakeCourseTable` の
     snippet を置き換える）
5. **チュートリアルのステップ**を `tutorial-steps.ts` に移し、必要な状態を
   引数で受け取る関数にする（`MajorApp` の状態と密接なので任意）

1〜4 を終えると、`MajorApp` はレイアウト、共有の状態（`svelteAkiko`、選択中の
マス、開いているタブ、ズーム）、コンポーネント間のつなぎだけになり、
1,200〜1,500 行程度になる見込み。

タブに状態を渡すのが主なコスト。単位チェック、出力、設定は props とコールバックで
足りる。履修を組むタブの分割で props が長くなりすぎる場合は、`.svelte.ts` の
小さな状態クラスを context で渡す方法がある。
