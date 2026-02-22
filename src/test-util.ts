import {
  BaseCreditStats,
  CreditStats,
  akikoGetCreditStats,
  akikoNew,
} from "./akiko";
import {
  ClassifyFakeCourses,
  ClassifyRealCourses,
  SetupCreditRequirements,
  classifyCoursesOrFail,
  createCreditRequirementsOrFail,
} from "./app-setup";
import { parseImportedCsv } from "./csv";
import { assert } from "./util";

function indent(s: string, n: number): string {
  return s
    .split("\n")
    .map((l) => " ".repeat(n) + l)
    .join("\n");
}

export function getCreditStats(params: {
  csv: string;
  isNative: boolean;
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
      () => new Map(),
      params.classifyRealCourses,
      params.classifyFakeCourses,
    );
  const akiko = akikoNew(
    [],
    result.realCourses,
    result.fakeCourses,
    [],
    courseIdToCellId,
    realCoursePositions,
    fakeCoursePositions,
    createCreditRequirementsOrFail(params.creditRequirements),
  );
  assert(akiko !== undefined);

  return akikoGetCreditStats(akiko);
}

/**
 * `mightTake` を設定すると、 `rawMightTake` と `effectiveMightTake` を同じ値に
 * 設定したものとして扱われる。 `mightTake` を設定しないと、 `rawMightTake` と
 * `effectiveMightTake` を0に設定したものとして扱われる。 `taken` についても同
 * 様。
 */
export type WantBaseCreditStats = (
  | { rawMightTake: number; effectiveMightTake: number }
  | { mightTake: number }
  | {}
) &
  ({ rawTaken: number; effectiveTaken: number } | { taken: number } | {});

export type WantCreditStats = {
  cells: Record<string, WantBaseCreditStats>;
  columns: Record<string, WantBaseCreditStats>;
  compulsory: WantBaseCreditStats;
  elective: WantBaseCreditStats;
};

export function assertCreditStatsEqual(
  got: CreditStats,
  want: WantCreditStats,
): void {
  function f(
    got: BaseCreditStats,
    want: WantBaseCreditStats | undefined,
    name: string,
  ): void {
    let rawMightTake = 0;
    let rawTaken = 0;
    let effectiveMightTake = 0;
    let effectiveTaken = 0;
    if (want !== undefined) {
      if ("rawMightTake" in want) {
        rawMightTake = want.rawMightTake;
        effectiveMightTake = want.effectiveMightTake;
      } else if ("mightTake" in want) {
        rawMightTake = want.mightTake;
        effectiveMightTake = want.mightTake;
      } else {
        rawMightTake = 0;
        effectiveMightTake = 0;
      }
      if ("rawTaken" in want) {
        rawTaken = want.rawTaken;
        effectiveTaken = want.effectiveTaken;
      } else if ("taken" in want) {
        rawTaken = want.taken;
        effectiveTaken = want.taken;
      } else {
        rawTaken = 0;
        effectiveTaken = 0;
      }
    }
    const message = `Bad ${name}:
${indent(`want: ` + JSON.stringify(want, undefined, 2), 2)}
${indent(`got: ` + JSON.stringify(got, undefined, 2), 2)}`;
    assert(got.rawMightTake === rawMightTake, message);
    assert(got.rawTaken === rawTaken, message);
    assert(got.effectiveMightTake === effectiveMightTake, message);
    assert(got.effectiveTaken === effectiveTaken, message);
  }

  for (const [id, gotCell] of got.cells) {
    f(gotCell, want.cells[id], `cell ${id}`);
  }
  for (const [id, gotColumn] of got.columns) {
    f(gotColumn, want.columns[id], `column ${id}`);
  }
  f(got.compulsory, want.compulsory, "compulsory");
  f(got.elective, want.elective, "elective");
}
