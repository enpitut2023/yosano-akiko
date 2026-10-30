import { describe, expect, test } from "vitest";
import type { CourseId } from "$lib/akiko";
import { instances, type Major } from "$lib/constants";
import { knownCourses } from "$lib/current-courses";
import { MAJOR_TO_REQUIREMENTS } from "$lib/major-config";

// What the catalog offers is classified with classifyKnownCourses, what counts
// with classifyRealCourses, so the two can disagree. These tests compare them
// over the whole catalog on every page.

type Requirements = Awaited<
  ReturnType<NonNullable<(typeof MAJOR_TO_REQUIREMENTS)[Major]>>
>;

async function loadRequirements(major: Major): Promise<Requirements> {
  const load = MAJOR_TO_REQUIREMENTS[major];
  if (load === undefined) throw new Error(`No requirements for ${major}`);
  return await load();
}

/** Where each catalog course is offered. */
async function classifyOffered(
  major: Major,
  tableYear: number,
  isNative: boolean,
): Promise<Map<CourseId, string>> {
  const req = await loadRequirements(major);
  return req.classifyKnownCourses(knownCourses, {
    major,
    tableYear,
    isNative,
  });
}

/** Where each catalog course counts once taken. */
async function classifyCounted(
  major: Major,
  tableYear: number,
  isNative: boolean,
): Promise<Map<CourseId, string>> {
  const req = await loadRequirements(major);
  const opts = { major, tableYear, isNative };
  const counted = new Map<CourseId, string>();
  for (const c of knownCourses) {
    // One course at a time, so rules that move credits between cells don't
    // depend on what else is in the list
    const cellId = req
      .classifyRealCourses(
        [
          {
            id: c.id,
            name: c.name,
            credit: c.credit,
            takenYear: tableYear,
            grade: "a+",
          },
        ],
        opts,
      )
      .get(c.id);
    if (cellId !== undefined) counted.set(c.id, cellId);
  }
  return counted;
}

const majors = [
  ...new Set(
    instances
      .filter((i) => MAJOR_TO_REQUIREMENTS[i.major] !== undefined)
      .map((i) => i.major),
  ),
];

function tableYearsOf(major: Major): number[] {
  return instances.filter((i) => i.major === major).map((i) => i.tableYear);
}

/**
 * Courses offered in one cell but counted in another (or nowhere), as
 * "counted → offered". Each entry is a known problem; see
 * classification-symptoms.md.
 */
const OFFERED_ELSEWHERE: Partial<Record<Major, string[]>> = {
  // Other classes' ファーストイヤーセミナー etc. and 情報リテラシー etc.
  chem: ["e1 → h2", "e4 → h2"],
  // Other classes' ファーストイヤーセミナー etc., other 学類's 微積分 and 線形代数
  physics: ["d2 → h2", "e1 → h2"],
  // 移行生's courses from 総合
  math: ["c1 → h1", "c2 → h1"],
  // Classes registered under the other 主専攻's number
  "esys-eme": ["a2 → b5", "a6 → b5"],
  // W160361 スポーツキャリア形成A, 2023–2025
  pe: ["a5 → b2"],
  // 日本国憲法: the counted classes fall through to h1, and the offered ones
  // don't count (see the TODO in nurse-since-2023.ts)
  "nurse-n": ["d1 → h1", "h1 → d1", "nowhere → d1"],
  "nurse-phn": ["c23 → h1", "h1 → c23", "nowhere → c23"],
  "nurse-h": ["c24 → h1", "h1 → c24", "nowhere → c24"],
};

/**
 * Courses offered differently to 移行生 and to students who entered directly:
 * the ones each takes after entering the major.
 */
const OFFERED_BY_NATIVENESS: Partial<Record<Major, string[]>> = {
  // 生物資源科学演習: the class sections, and the class for 移行生
  bres: ["EC11212", "EC11262"],
  "bres-as": ["EC11212", "EC11262"],
  // 医療概論I-B, 医学の基礎B
  med: ["HB32122", "HB32235"],
  "med-new": ["HB32122", "HB32235"],
};

describe.each(majors)("%s", (major) => {
  test("the 移行 answer changes what's offered only for known courses", async () => {
    const got = new Set<string>();
    for (const tableYear of tableYearsOf(major)) {
      const native = await classifyOffered(major, tableYear, true);
      const ikou = await classifyOffered(major, tableYear, false);
      for (const c of knownCourses) {
        if (native.get(c.id) !== ikou.get(c.id)) {
          got.add(c.id);
        }
      }
    }
    expect([...got].sort()).toEqual(
      [...(OFFERED_BY_NATIVENESS[major] ?? [])].sort(),
    );
  });

  test("a course counts in the cell it's offered in", async () => {
    const got = new Set<string>();
    for (const tableYear of tableYearsOf(major)) {
      for (const isNative of [true, false]) {
        const offered = await classifyOffered(major, tableYear, isNative);
        const counted = await classifyCounted(major, tableYear, isNative);
        for (const [id, offeredIn] of offered) {
          const countedIn = counted.get(id);
          if (countedIn !== offeredIn) {
            got.add(`${countedIn ?? "nowhere"} → ${offeredIn}`);
          }
        }
      }
    }
    expect([...got].sort()).toEqual(
      [...(OFFERED_ELSEWHERE[major] ?? [])].sort(),
    );
  });
});
