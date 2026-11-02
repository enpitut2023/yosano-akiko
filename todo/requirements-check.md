# Credit requirements vs 履修要覧 tables

Every page's `getCreditRequirements` (cell min/max, columns, 必修/選択 totals)
was compared with its table `static/tables/<year>/<major>.svg`, on all 223
pages of `instances`. The tables were read with the read-table skill
(`render.mjs --labels` maps cell IDs to cells), and every finding below was
re-read on a 2x crop. To see one again:

```sh
node .claude/skills/read-table/scripts/render.mjs --labels OUT YEAR MAJOR CELL_ID...
```

`requirements-check/` has what the check ran, to redo it after the fixes:

- `dump.sh OUT` writes what the code says for every page, one
  `OUT/<year>-<major>.txt` each, and lists rect IDs with no requirement and
  the reverse.
- `agent-prompt.md` is what each checker agent (one per 学類) was told.

Fix one commit per 学類. Where only some years change, split the shared
object into a new `req<X>Since<year>` and extend the `>=` chain. Check each
fix with the snapshot-refactor skill: only those pages' `requirements` (and
the stats in `csvs/…` they cap) should differ.

## Requirements to fix

- [ ] **bres-les, 2023–2026** (`bres-les-since-2023.ts`, both
      `reqSince2023` and `reqSince2025`). The code has min = max for ranges:

      | cell | table | code |
      |---|---|---|
      | b1 | 25〜32 | 32 |
      | b2 | 20〜27 | 27 |
      | d1 | 15〜28 | 28 |
      | h1 | 13〜21 | 21 |
      | column b | 45〜59 | 59 |
      | column d | 15〜28 | 28 |
      | column h | 13〜21 | 21 |

- [ ] **med, all four majors** (`med-since-2023.ts`). `getCreditRequirements`
      ignores `tableYear` and returns `reqMedMedNewSince2023` for med and
      med-new, and `reqMed2MedNew2Since2023` for med-2 and med-2-new. But
      `classifyColumnA` numbers the a cells per major and per period (2024
      moves the English Medical Terminology courses up, and merges 医療概論IV
      with アドヴァンストコース into one cell of 1+1). Only med 2023 matches,
      except a17. The a cells, in cell order, per the tables:

      | page | a1… |
      |---|---|
      | med 2023 | 1, 2, 2, 11, 27, 2, 37, 3, 18, 2, 11, 2, 22, 4, 11, 2, 10, 1, 2 |
      | med 2024+ | 1, 2, 2, 11, 27, 2, 1, 37, 3, 2, 18, 2, 11, 2, 22, 4, 11, 2, 10 |
      | med-new 2023 | 1, 2, 2, 11, 27, 2, 37, 3, 18, 2, 11, 2, 22, 15, 2, 10, 1, 2 |
      | med-new 2024+ | 1, 2, 2, 11, 27, 2, 1, 37, 3, 2, 18, 2, 11, 2, 22, 15, 2, 10 |
      | med-2 2023 | 9, 27, 2, 37, 3, 18, 2, 11, 2, 22, 4, 11, 2, 10, 1, 2 |
      | med-2 2024+ | 9, 27, 2, 1, 37, 3, 2, 18, 2, 11, 2, 22, 4, 11, 2, 10 |
      | med-2-new 2023 | 9, 27, 2, 37, 3, 18, 2, 11, 2, 22, 15, 2, 10, 1, 2 |
      | med-2-new 2024+ | 9, 27, 2, 1, 37, 3, 2, 18, 2, 11, 2, 22, 15, 2, 10 |

      - a17 of med 2023 is `{ min: 10, max: 2 }` in the code; the table says 10.
      - The code has a19 for med-new and a16 for med-2-new, which have no
        cell; drop them.
      - Column a (170 for med and med-new, 163 for med-2 and med-2-new), the
        other cells and the totals already match.
      - 2024 to 2026 tables are the same.

- [ ] **mast, 2025–2026** (`mast-since-2021.ts`, `reqSince2025`): 必修 計 is
      51 and 選択 計 is 73 in the table; the code has 50 and 74. Column c
      went from 24 to 25 (コンピュータリテラシー) and the totals weren't
      updated: 14 + 25 + 12 = 51.

- [ ] **ds, 2023–2026** (`ds-since-2023.ts`): the column total 1〜40 belongs
      to column f (共通科目 選択), but the code keys it `g`. ds has no g cell.

- [ ] **jpjp-jltt, 2026** (`jpjp-since-2023.ts`, `reqJlttSince2026`): the
      AE56 cell (2 credits) is keyed `d0`; classification and the rects say
      `d1`.

- [ ] **earth-les, 2024–2026** (`earth-les-since-2024.ts`, both objects): f2
      is 0〜15 in the table, 0〜14 in the code. No effect today, since f1 is
      exactly 1 and column f caps at 15, but follow the table.

## Rects to fix (`static/rects/`)

- [ ] **2024/jpjp.json**: the 共通科目 選択 cells are saved as `d1` and `d2`
      (x ≈ 1221), and the real d1 (AE56) and d2 (AE53) rects are missing.
      Rename them `f1` and `f2`, and add `d1` and `d2` at the positions in
      2023/jpjp.json; the layout is the same.
- [ ] **2024/meds-ms.json**: a stray `b2` rect sits on the 単位合計 row.
      Delete it.
- [ ] **2023/coens-eqe.json**: `d1` covers only the FF15 row, and `d2` is an
      empty rect below it. Merge them into one `d1` spanning the column, as
      on the other 2023 coens pages.

## Remarks

- [ ] **med-2 / med-2-new** (`getRemark` in `med-since-2023.ts`): the a11
      remark about merging 医療概論IV and アドヴァンストコース shows in every
      year. In 2023 there's no merge and a11 is M6 IIB. Limit it to
      `tableYear >= 2024`, as med's a14 remark already is.

## Questions for the 学類

- [ ] **klis, 2026**: the table's 計 row prints 必修 41 and 選択 83, but its
      columns a, c and e sum to 12 + 19 + 12 = 43 (卒業論文, 2 credits, was
      added to column a, and d dropped from 32〜52 to 30〜50). The code
      assumes 41 is stale and uses 43/81 (TODO in `klis-since-2023.ts`).
      Ask the 学類 which is right. Draft:

      > 知識情報・図書館学類の2026年度入学者の履修要覧(別表)について、必修科目と選択科目の単位数の「計」を確認させてください。
      >
      > - 2026年度の表では、専門科目の必修科目に「卒業論文」(2単位)が加わり、単位合計の行は専門科目の必修科目が12単位、専門基礎科目の必修科目が19単位、共通科目の必修科目が12単位です。これらを合わせると43単位になります。
      > - 一方、同じ表の「計」の欄は必修科目41単位、選択科目83単位(合計124単位)となっています。2025年度の表では専門科目の必修科目が10単位で、「計」の欄の41単位と一致していました。
      > - また、専門基礎科目の選択科目は2025年度の32〜52単位から、2026年度は30〜50単位に変わっています。
      > - あきこでは現在、「計」の欄が更新されていないものとみなし、2026年度入学者の必修科目を43単位、選択科目を81単位として判定しています。
      >
      > 1. 2026年度入学者の卒業に必要な単位数は、必修科目43単位・選択科目81単位でしょうか、それとも「計」の欄のとおり必修科目41単位・選択科目83単位でしょうか？
      > 2. 1の答えが41単位・83単位の場合、各科目区分の単位合計のうち、どの欄の単位数が表と異なりますか？
      > 3. 「卒業論文」(2単位)の科目番号は決まっていますか？2023〜2026年度のKdBには知識情報・図書館学類の「卒業論文」が見当たりませんでした。

## Not mismatches

- chem 2023–2024: a1–a3 are printed 4.5 and coded 4, which moves 1.5 from
  必修 to 選択. The a1–a3 remark says the revised 4 is used on purpose.
- esys: b5 and h3 have no printed bound; the code's `0〜` fits.
- Columns the code leaves out are 0 or blank in the table (often g).

## How thorough it was

- Every page was compared cell by cell, column by column and on both totals.
- help, css and coins were read from the full renders (about 1x), not the
  2x crops; the numbers are legible there. All other 学類 were read on the
  2x crops, except a few meds crops dropped by an image limit, which were read
  on the full render.
- Remarks were only checked where they explain a deviation, not for
  accuracy.
