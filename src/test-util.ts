import {
  akikoGetCreditStats,
  akikoNew,
  BaseCreditStats,
  CellId,
  CourseId,
  CreditRequirements,
  CreditStats,
  FakeCourseId,
  isCellId,
  isColumnId,
} from "./akiko";
import {
  ClassifyFakeCourses,
  ClassifyRealCourses,
  SetupCreditRequirements,
} from "./app-setup";
import { parseImportedCsv } from "./csv";
import { assert } from "./util";

export function getCreditStats(params: {
  csv: string;
  isNative: boolean;
  creditRequirements: SetupCreditRequirements;
  classifyRealCourses: ClassifyRealCourses;
  classifyFakeCourses: ClassifyFakeCourses;
}): CreditStats {
  const result = parseImportedCsv(params.csv);
  assert(result.kind === "ok");

  const sortedRealCourses = Array.from(result.realCourses);
  sortedRealCourses.sort((a, b) => a.takenYear - b.takenYear);
  const realCourses = new Map(result.realCourses.map((c) => [c.id, c]));
  for (const c of sortedRealCourses) {
    realCourses.set(c.id, c);
  }

  const sortedFakeCourses = Array.from(result.fakeCourses);
  sortedFakeCourses.sort((a, b) => a.takenYear - b.takenYear);
  const fakeCourses = new Map(result.fakeCourses.map((c) => [c.id, c]));
  for (const c of sortedFakeCourses) {
    fakeCourses.set(c.id, c);
  }

  const creditRequirements: CreditRequirements = {
    cells: new Map(),
    columns: new Map(),
    compulsoryMin: params.creditRequirements.compulsory,
    electiveMin: params.creditRequirements.elective,
  };
  for (const [id, cell] of Object.entries(params.creditRequirements.cells)) {
    assert(isCellId(id), `Bad cell id: "${id}"`);
    creditRequirements.cells.set(id, cell);
  }
  for (const [id, col] of Object.entries(params.creditRequirements.columns)) {
    assert(isColumnId(id), `Bad column id: "${id}"`);
    creditRequirements.columns.set(id, col);
  }

  const realCoursePositions = new Map<CourseId, CellId>();
  const fakeCoursePositions = new Map<FakeCourseId, CellId>();

  for (const [courseId, cellId] of params.classifyRealCourses(
    result.realCourses,
    { isNative: params.isNative },
  )) {
    assert(isCellId(cellId), `Bad cell id: "${cellId}"`);
    realCoursePositions.set(courseId, cellId);
  }
  for (const [fakeCourseId, cellId] of params.classifyFakeCourses(
    result.fakeCourses,
    { isNative: params.isNative },
  )) {
    assert(isCellId(cellId), `Bad cell id: "${cellId}"`);
    fakeCoursePositions.set(fakeCourseId, cellId);
  }

  const akiko = akikoNew(
    new Map(),
    realCourses,
    fakeCourses,
    [],
    new Map(),
    realCoursePositions,
    fakeCoursePositions,
    creditRequirements,
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
    assert(got.rawMightTake === rawMightTake);
    assert(got.rawTaken === rawTaken);
    assert(got.effectiveMightTake === effectiveMightTake);
    assert(got.effectiveTaken === effectiveTaken);
  }

  for (const [id, gotCell] of got.cells) {
    f(gotCell, want.cells[id]);
  }
  for (const [id, gotColumn] of got.columns) {
    f(gotColumn, want.columns[id]);
  }
  f(got.compulsory, want.compulsory);
  f(got.elective, want.elective);
}
