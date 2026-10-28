import type { BaseCreditStats } from "$lib/akiko";
import {
  cellCreditStatsDisplay,
  creditBoundsToString,
  creditProgressToString,
  electiveCreditStatsDisplay,
  getPercentage,
  gradeDisplay,
} from "../../routes/[tableYear]/[major]/credit-display";
import { assert } from "$lib/util";

function eq<T>(got: T, want: T): void {
  const g = JSON.stringify(got);
  const w = JSON.stringify(want);
  assert(g === w, `got ${g}, want ${w}`);
}

eq(gradeDisplay("wip"), "（履修中）");
eq(gradeDisplay("d"), "（落単済み）");
eq(gradeDisplay("fail"), "（落単済み）");
eq(gradeDisplay("pass"), "評価：P");
eq(gradeDisplay("a+"), "評価：A+");

eq(creditBoundsToString(16, undefined), "16~");
eq(creditBoundsToString(6, 6), "6");
eq(creditBoundsToString(0, 18), "0~18");

const progress = { min: 6, max: 6, effectiveTaken: 2, effectiveMightTake: 0 };
eq(creditProgressToString(progress), "2　要:6");
eq(creditProgressToString({ ...progress, effectiveMightTake: 3 }), "2→5　要:6");

function stats(overrides: Partial<BaseCreditStats>): BaseCreditStats {
  return {
    min: 6,
    rawMightTake: 0,
    rawTaken: 0,
    rawTotal: 0,
    effectiveMightTake: 0,
    effectiveTaken: 0,
    effectiveTotal: 0,
    overflowMightTake: 0,
    overflowTaken: 0,
    overflowTotal: 0,
    ...overrides,
  };
}

eq(cellCreditStatsDisplay({ max: 6, ...stats({ effectiveTaken: 4 }) }), {
  brief: "計:4　要:6",
  warning: undefined,
});
eq(
  cellCreditStatsDisplay({
    max: 6,
    ...stats({ effectiveTaken: 6, rawTotal: 8, overflowTotal: 2 }),
  }).warning,
  "このマスは合計で6単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で8単位なので、残りの2単位は卒業単位に含まれません。",
);
eq(
  electiveCreditStatsDisplay({ max: 71, ...stats({ min: 71 }) }).brief,
  "選択科目計:0　要:71",
);

eq(getPercentage(1, 1, 0), [100, 100]);
eq(getPercentage(3, 3, 6), [50, 100]);
eq(getPercentage(8, 2, 4), [100, 100]);
