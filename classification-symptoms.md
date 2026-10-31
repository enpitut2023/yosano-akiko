# Classification symptoms

Symptoms of how the requirements modules (`src/lib/requirements/`) put
courses into cells. Each module's `classify` checks the cells one by one and
returns the first that matches. The same function serves two purposes:
`mode === "known"` decides what the catalog offers as a course to take, and
`mode === "real"` decides where an imported grade counts. This file only
records what goes wrong; it doesn't propose fixes.

## Hidden courses fall through to later cells

A module hides a course from the catalog by adding `mode === "real" &&` to a
cell's check. In catalog mode the check fails, `classify` goes on to the next
cells, and a later cell, usually a catch-all like h1 or h2, picks the course
up and offers it there. The course counts in one cell and is offered in
another.

Found by classifying the whole 2026 catalog both ways, on every page.
`src/lib/tests/offered.test.ts` does this and lists each case in
`OFFERED_ELSEWHERE`:

| Page           | Courses                                                                       | Counts in | Offered in |
| -------------- | ----------------------------------------------------------------------------- | --------- | ---------- |
| chem           | other classes' ファーストイヤーセミナー and 学問への誘い (410)                | e1        | h2         |
| chem           | other classes' 情報リテラシー and データサイエンス (264)                      | e4        | h2         |
| physics        | other classes' ファーストイヤーセミナー and 学問への誘い (414)                | e1        | h2         |
| physics        | other 学類's 微積分 and 線形代数 classes, e.g. GA 線形代数A (16)              | d2        | h2         |
| math, 移行生   | 総合's FA 微積分・線形代数, GA 微分積分A, the FF/GB/GC 線形代数B classes (17) | c1, c2    | h1         |
| esys-eme       | FG59873, FG59883 (registered under the other 主専攻's number)                 | a2        | b5         |
| esys-eme       | FG50354 数値計算法                                                            | a6        | b5         |
| pe (2023–2025) | W160361 スポーツキャリア形成A                                                 | a5        | b2         |
| nurse (2025–)  | 日本国憲法 BB00101/201/401/501                                                | d1        | h1         |

Majors whose catch-all cells leave out 共通科目 (`isKyoutsuu`) don't show the
ファーストイヤーセミナー cases, though their `classify` has the same shape.

## Order matters, and guards hold it in place

The first match wins, so what a course gets depends on which checks come
before. Several modules carry guards that exist only to stop a course from
reaching a later cell:

- coins and mast return `undefined` for any course whose name is in
  `COMPULSORY_NAMES` once the compulsory cells are checked, so that another
  class of a compulsory course (e.g. FF18724 線形代数A for a direct-entry
  coins student) doesn't land in an elective cell.
- klis's `isD1` lists by hand the classes of 情報学群 courses to keep out of
  d1.
- coins's `isD3` excludes 情報特別演習 I・II and 情報科学特別演習, which `isB2`
  already takes.
- Catch-all cells carry the comment 「...以外」なので最後: moving them up
  would swallow everything after.
- med's `isH1` takes every `HB` course, so hiding the 専門導入科目 needed an
  early return at the top of `classify`.

## "Not offered" is not a concept

Nothing says "this counts but isn't offered". It's spelled as conditions on
`mode`, and before `mode` existed it was spelled with the 移行 flag,
`fromSougou` (then `isNative`). The two got mixed up:

- mast counted other 学類's classes only for 移行生 (`fromSougou`) when the
  rule was that they count for everyone but aren't offered.
- math and med gated courses taken during 総合 with `fromSougou` alone, so
  移行生 were offered them as courses to take.
- coins's `isC3` gated other 学類's 微分積分A with `fromSougou` while `isC1`
  didn't for 線形代数A, under one comment that said both count for everyone.

## Offered and counted can be different courses

The catalog and the grades can use separate lists for the same requirement:

- nurse's 日本国憲法 offers BB00301 and BB00601 in d1, but counts
  BB00101/201/401/501 there. BB00301 and BB00601 taken as grades land in h1
  (2025–) or nowhere (2023–2024).
- coins's `COURSE_ID_TO_GB_COURSE_ID` hides the other number of a co-shared
  course from the catalog and maps it to the GB number for grades.

## One course, one cell

A course goes to exactly one cell. A rule where one course stands for two
cells can't be expressed: esys's 注13 lets 移行生 count GA 微分積分A (2
credits) as both 微積分1 (c6) and 微積分2 (c7). The partial attempt put the
whole course in c6 and left c7 empty; the remark now says it isn't supported.

## Pairs live outside `classify`

Rules where two courses together count as one (FA 線形代数1+2, FA 微積分1+2,
coins's FF 線形代数A+B) run before `classify`, in `handlePair`, which removes
the matched courses from the list. A course whose partner is missing goes
through `classify` like any other and lands wherever the cell order sends it:
in coins, FF18724 線形代数A alone is stopped by `COMPULSORY_NAMES`; in math,
FF18744 線形代数B alone counts in c2 for 移行生.
