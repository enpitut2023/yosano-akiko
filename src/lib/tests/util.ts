import { readFileSync } from "node:fs";
import { expect } from "vitest";
import {
  type BaseCreditStats,
  type CreditStats,
  akikoGetCreditStats,
  akikoNew,
} from "$lib/akiko";
import {
  type ClassifyFakeCourses,
  type ClassifyRealCourses,
  type SetupCreditRequirements,
  classifyCoursesOrFail,
  createCreditRequirementsOrFail,
} from "$lib/app-setup";
import { parseImportedCsv } from "$lib/csv";
import { assert } from "$lib/util";
import type { Major } from "$lib/constants";

export function getCreditStats(params: {
  csv: string;
  isNative: boolean;
  tableYear: number;
  major: Major;
  creditRequirements: SetupCreditRequirements;
  classifyRealCourses: ClassifyRealCourses;
  classifyFakeCourses: ClassifyFakeCourses;
}): CreditStats {
  const result = parseImportedCsv(params.csv);
  assert(result.kind === "ok");

  const { courseIdToCellId, realCoursePositions, fakeCoursePositions } =
    classifyCoursesOrFail(
      [],
      result.realCourses,
      result.fakeCourses,
      params.isNative,
      params.tableYear,
      params.major,
      () => new Map(),
      params.classifyRealCourses,
      params.classifyFakeCourses,
    );
  const akiko = akikoNew(
    [],
    result.realCourses,
    result.fakeCourses,
    new Map(),
    courseIdToCellId,
    realCoursePositions,
    fakeCoursePositions,
    createCreditRequirementsOrFail(params.creditRequirements),
  );
  assert(akiko !== undefined);

  return akikoGetCreditStats(akiko);
}

export type RunTestParams = {
  isNative: boolean;
  tableYear: number;
  major: Major;
  getCreditRequirements: (
    tableYear: number,
    major: Major,
  ) => SetupCreditRequirements;
  classifyRealCourses: ClassifyRealCourses;
  classifyFakeCourses: ClassifyFakeCourses;
  want: WantCreditStats;
} & ({ csvPath: string } | { csv: string });

export function runTest(params: RunTestParams): void {
  const csv =
    "csv" in params
      ? params.csv
      : readFileSync(params.csvPath, { encoding: "utf8" });
  const got = getCreditStats({
    csv,
    isNative: params.isNative,
    tableYear: params.tableYear,
    major: params.major,
    creditRequirements: params.getCreditRequirements(
      params.tableYear,
      params.major,
    ),
    classifyRealCourses: params.classifyRealCourses,
    classifyFakeCourses: params.classifyFakeCourses,
  });
  expectCreditStats(got, params.want);
}

/**
 * `mightTake` を設定すると、 `rawMightTake` と `effectiveMightTake` を同じ値に
 * 設定したものとして扱われる。 `mightTake` を設定しないと、 `rawMightTake` と
 * `effectiveMightTake` を0に設定したものとして扱われる。 `taken` についても同
 * 様。
 */
/* eslint-disable @typescript-eslint/no-empty-object-type --
   `{}` はどちらのキーも指定しない場合を表す。 */
export type WantBaseCreditStats = (
  | { rawMightTake: number; effectiveMightTake: number }
  | { mightTake: number }
  | {}
) &
  ({ rawTaken: number; effectiveTaken: number } | { taken: number } | {});
/* eslint-enable @typescript-eslint/no-empty-object-type */

export type WantCreditStats = {
  cells: Record<string, WantBaseCreditStats>;
  columns: Record<string, WantBaseCreditStats>;
  compulsory: WantBaseCreditStats;
  elective: WantBaseCreditStats;
};

function normalize(want: WantBaseCreditStats | undefined) {
  let rawMightTake = 0;
  let effectiveMightTake = 0;
  let rawTaken = 0;
  let effectiveTaken = 0;
  if (want !== undefined) {
    if ("rawMightTake" in want) {
      rawMightTake = want.rawMightTake;
      effectiveMightTake = want.effectiveMightTake;
    } else if ("mightTake" in want) {
      rawMightTake = want.mightTake;
      effectiveMightTake = want.mightTake;
    }
    if ("rawTaken" in want) {
      rawTaken = want.rawTaken;
      effectiveTaken = want.effectiveTaken;
    } else if ("taken" in want) {
      rawTaken = want.taken;
      effectiveTaken = want.taken;
    }
  }
  return { rawMightTake, effectiveMightTake, rawTaken, effectiveTaken };
}

function pick(s: BaseCreditStats) {
  const { rawMightTake, effectiveMightTake, rawTaken, effectiveTaken } = s;
  return { rawMightTake, effectiveMightTake, rawTaken, effectiveTaken };
}

/**
 * Expects the credit stats of every cell and column in `got` or `want`, with
 * one diff for all of them. Those missing from `want` are expected to be zero.
 */
export function expectCreditStats(got: CreditStats, want: WantCreditStats) {
  function byId(
    gotById: Map<string, BaseCreditStats>,
    wantById: Record<string, WantBaseCreditStats>,
  ) {
    const ids = [...new Set([...gotById.keys(), ...Object.keys(wantById)])];
    return {
      got: Object.fromEntries(
        ids.map((id) => {
          const s = gotById.get(id);
          return [id, s && pick(s)];
        }),
      ),
      want: Object.fromEntries(ids.map((id) => [id, normalize(wantById[id])])),
    };
  }
  const cells = byId(got.cells, want.cells);
  const columns = byId(got.columns, want.columns);
  expect({
    cells: cells.got,
    columns: columns.got,
    compulsory: pick(got.compulsory),
    elective: pick(got.elective),
  }).toEqual({
    cells: cells.want,
    columns: columns.want,
    compulsory: normalize(want.compulsory),
    elective: normalize(want.elective),
  });
}
