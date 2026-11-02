---
name: read-table
description: Render a page's 履修要覧 table (static/tables/) to PNG and crop its cells, to read a cell's conditions and credit bounds and the 注 that apply. Use when checking a requirements module, a credit min/max or a remark against the actual table, or when a comment or TODO makes a claim about what the table says.
---

# Read a 履修要覧 table

The tables are what the requirements modules
(`src/lib/requirements/<major>-since-<year>.ts`) implement. Read the table
instead of trusting a comment or TODO about it.

## Render it

From the repo root:

```sh
node .claude/skills/read-table/scripts/render.mjs [--labels] OUT YEAR MAJOR [CELL_ID | x,y,w,h]...
```

- `OUT` goes in the scratchpad.
- It writes `OUT/<year>-<major>.png`: the whole table on white, at the SVG's
  `width` × `height`. That's also the pixel space of the cell rects
  (`static/rects/<year>/<major>.json`) and of a region.
- For each `CELL_ID` (`a1`, `h3`, …) it writes a crop of that cell with a
  little of its neighbors. For each `x,y,w,h` it writes a crop of that
  region of the full image. Crops are at twice the resolution, so small
  text is legible.
- It prints where each crop sits in the full image.
- `--labels` also writes `OUT/<year>-<major>-labels.png`: the full image
  with each cell rect outlined and tagged with its ID. Use it to map IDs
  to cells. A tag hides the start of the cell's text, so read the text
  from the plain image or a crop.

The full image is displayed downscaled. Multiply coordinates read off it by
the factor stated with the image before passing them as a region.

## Read it

Always read the full image first, then crop what you need:

- **Cells.** A cell's rect is a rectangle, but some cells aren't: merged,
  L-shaped, or spanning rows of another column. Check the full image for
  how far the cell really reaches, and which conditions and bounds
  (`2〜10`, `16〜`) belong to it.
- **注.** They're printed outside the cells, usually under the table, and
  they're too small to read in the full image: crop the region. A cell
  points to one with 注N or 履修条件:注N.
- **Where the 注 are.** A table's 注 aren't always on its own page. For
  example, every coins major's 注 are on coins-mimt's table. If they aren't
  on the page, render the same 学類's other tables of that year
  (`ls static/tables/<year>/`).
- **Totals.** The 単位合計 row and the 計 columns give the column and
  必修/選択 totals in `getCreditRequirements`.

The text is written by the university's staff, not as rigorous rules: a
condition can be ambiguous, or deliberately vague, like 「その他学類長が特に
指定する科目」, which has no published list. Say what the table literally
says and what's open to interpretation. To ask the 学類, use the
draft-college-question skill.

Tables without a page, like biol's, have no rects: only full renders and
regions work for them.
