<!-- The prompt each checker agent got, one Sonnet agent per 学類. Replace
REQS with dump.sh's output dir, and give each agent its pages and its own
scratch dir as OUT. Tables with many cells (nurse, meds) hit an image
request limit: tell those agents to skip the plain full image. -->

You are checking, read-only, that the credit requirements coded in this repo
(/Users/rjooske/code/enpit/yosano-akiko, a site for 筑波大学 students) match
the 履修要覧 tables they implement. Do not edit any file in the repo. Write
only under your own scratch dir given below.

## Inputs per page (one page = one 入学年度 YEAR × 主専攻 MAJOR)

- What the code says: REQS/YEAR-MAJOR.txt (from dump.sh). It lists
  - `cells`: each cell ID (a1, b2, …) with its bound. `6` means min=max=6,
    `16〜` min 16 with no max, `2〜10` min 2 max 10.
  - `columns`: a–h, the 単位合計 row at the bottom of the table. Column letters
    follow the table's column pairs left to right: a 専門科目 必修, b 専門科目
    選択, c 専門基礎科目 必修, d 専門基礎科目 選択, e 共通科目 必修, f 共通科目
    選択, g 関連科目 必修, h 関連科目 選択. (Cell IDs use the same letters.)
    A column absent from the code whose table total is 0 or blank is fine.
  - compulsory = the 計 必修科目 total, elective = the 計 選択科目 total.
  - remarks: notes the site shows for a cell. A remark may explain a
    deliberate deviation from the table (e.g. chem's a1–a3 4 vs printed 4.5).
- The table: render it from the repo root with
  `node .claude/skills/read-table/scripts/render.mjs --labels OUT YEAR MAJOR 0,0,1024,724 1024,0,1024,724 0,724,1024,724 1024,724,1024,724`
  where OUT is your scratch dir. It writes OUT/YEAR-MAJOR.png (full table),
  OUT/YEAR-MAJOR-labels.png (each cell rect outlined in red and tagged with
  its ID; the tag hides the first characters of the cell), and four quadrant
  crops at 2x resolution, which are where you should read the numbers. You can
  also pass cell IDs (e.g. `h3`) or more `x,y,w,h` regions (in full-image
  pixels, 2048x1448) to get 2x crops of them; do so whenever a number is
  hard to read. Read .claude/skills/read-table/SKILL.md once first.

## For each page

1. Render. You must Read all four quadrant crops of every page: in the
   full image 6 vs 8, 10 vs 16 or 20 vs 26 are easy to confuse. Look at the
   labels image to map IDs to cells, then read each cell's bound (the 単位数 column right of the cell's courses) from the 2x
   crops. A cell can span rows; its bound is usually at its top. Watch for
   〜 ranges that wrap onto two lines (`10〜` above `20` means 10〜20).
2. Read the 単位合計 row (columns) and the 計 必修/選択 totals.
3. Compare each with the code. Be careful: a misread is worse than a miss;
   re-crop any cell you'd report before reporting it.
4. Also note cells that carry a bound in the table but have no ID in the
   code, or IDs in the code whose cell has no bound in the table.

Pages of the same major in different years often share one table layout;
still read each year's table on its own, since bounds change between years.

## Report (your final message)

For each page a line `YEAR-MAJOR: compared N cells, M columns, 2 totals`.
Then every mismatch as a row:
`page | cell/column/total | table says | code says | remark that explains it, if any | confidence high/medium/low | crop path`
Then cells only in the table / only in the code. If there are no mismatches
for a page, say so. Keep it terse; no prose beyond this.
