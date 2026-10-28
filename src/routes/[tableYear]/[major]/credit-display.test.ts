import { expect, test } from "vitest";
import type { BaseCreditStats } from "$lib/akiko";
import {
  cellCreditStatsDisplay,
  creditBoundsToString,
  creditProgressToString,
  electiveCreditStatsDisplay,
  getPercentage,
  gradeDisplay,
} from "./credit-display";

test("gradeDisplay", () => {
  expect(gradeDisplay("wip")).toBe("（履修中）");
  expect(gradeDisplay("d")).toBe("（落単済み）");
  expect(gradeDisplay("fail")).toBe("（落単済み）");
  expect(gradeDisplay("pass")).toBe("評価：P");
  expect(gradeDisplay("a+")).toBe("評価：A+");
});

test("creditBoundsToString", () => {
  expect(creditBoundsToString(16, undefined)).toBe("16~");
  expect(creditBoundsToString(6, 6)).toBe("6");
  expect(creditBoundsToString(0, 18)).toBe("0~18");
});

test("creditProgressToString", () => {
  const progress = { min: 6, max: 6, effectiveTaken: 2, effectiveMightTake: 0 };
  expect(creditProgressToString(progress)).toBe("2　要:6");
  expect(creditProgressToString({ ...progress, effectiveMightTake: 3 })).toBe(
    "2→5　要:6",
  );
});

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

test("cellCreditStatsDisplay", () => {
  expect(
    cellCreditStatsDisplay({ max: 6, ...stats({ effectiveTaken: 4 }) }),
  ).toEqual({ brief: "計:4　要:6", warning: undefined });
  expect(
    cellCreditStatsDisplay({
      max: 6,
      ...stats({ effectiveTaken: 6, rawTotal: 8, overflowTotal: 2 }),
    }).warning,
  ).toBe(
    "このマスは合計で6単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で8単位なので、残りの2単位は卒業単位に含まれません。",
  );
});

test("electiveCreditStatsDisplay", () => {
  expect(
    electiveCreditStatsDisplay({ max: 71, ...stats({ min: 71 }) }).brief,
  ).toBe("選択科目計:0　要:71");
});

test("getPercentage", () => {
  expect(getPercentage(1, 1, 0)).toEqual([100, 100]);
  expect(getPercentage(3, 3, 6)).toEqual([50, 100]);
  expect(getPercentage(8, 2, 4)).toEqual([100, 100]);
});
