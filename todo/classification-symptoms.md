# Classification symptoms

Symptoms of how the requirements modules (`src/lib/requirements/`) put
courses into cells. Each module's `classify` checks the cells one by one and
returns the first that matches. The same function serves two purposes:
`mode === "known"` decides what the catalog offers as a course to take, and
`mode === "real"` decides where an imported grade counts. This file only
records what goes wrong; it doesn't propose fixes.

## Hidden courses can fall through to later cells

A course that counts but isn't offered is checked with `unlisted`, which
stops `classify` at its cell. A check written as a plain `mode === "real" &&`
doesn't stop it: in catalog mode the check fails, `classify` goes on, and a
later cell, usually a catch-all like h1 or h2, picks the course up and offers
it there. The course counts in one cell and is offered in another. Only
`src/lib/requirements/tests/offered.test.ts`, which classifies the whole 2026 catalog both
ways on every page, would notice.

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

## Offered and counted can be different courses

coins's `COURSE_ID_TO_GB_COURSE_ID` hides the other number of a co-shared
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
