---
name: draft-college-question
description: Draft the core of an email asking a 学類 (支援室 or 教務) to confirm how akiko should count certain courses, e.g. whether 移行生 can use another 学類's class. Use when a requirements rule is unclear and the user wants to ask the 学類.
---

# Draft a question to a 学類

Write only the core of the email. The user adds the greeting, self-introduction
and sign-off.

## Gather the facts first

For every course the question is about, look up each class's 科目番号, credits,
年次 and remark (who may take it):

- This year: `src/lib/current-courses.ts`.
- Past years: the KdB exports in `/Users/rjooske/akiko/tmp-courses/<year>.xlsx`.
  Search them with the script next to this file:

  ```sh
  python3 -I .claude/skills/draft-college-question/scripts/find-courses.py \
    /Users/rjooske/akiko/tmp-courses FH604 プログラミング入門
  ```

  A pattern matches an ID prefix or part of a name. If the directory is gone,
  say so and use only this year's catalog.

Also read how the requirements module (`src/lib/requirements/<major>-since-<year>.ts`)
counts these courses now, for both 直接入学した学生 and 総合学域群から移行した学生.

Don't state anything you haven't checked. If the remarks differ across years,
say which years say what.

## Write the core

In Japanese, です・ます:

1. One sentence on what to confirm: the course name in 「」 and the 学類.
2. The context: each class as a bullet with its 科目番号 and who it's for, with
   the year range the remarks cover (「2023〜2026年度のシラバスでは」). If akiko
   already counts some of them, say how.
3. Numbered questions, each one answerable on its own. End each with a
   full-width ？. Ask separately whether the answer differs between
   直接入学した学生 and 総合学域群から移行した学生 when that matters.

Ask about a class even when the catalog suggests a student can't take it
(e.g. it's for one 学類's new students): overflow and 履修調整 can still let
others in.

Say 総合学域群から移行した学生, never "native" or "transfer". 移行 and 編入 are
different things; 3年次編入 credits can't be handled at all, because TWINS
grade files don't include them.

## After drafting

If the code should change depending on the answer, add a `// TODO:` in Japanese
to the requirements module, above the function it concerns: what to confirm,
with whom, and what to change afterwards. Don't change behavior until the user
says so.
