import type {
  CellCreditStats,
  ColumnCreditStats,
  ElectiveCreditStats,
  Grade,
} from "$lib/akiko";

/** How a grade is shown in the course lists. */
export function gradeDisplay(g: Grade): string {
  if (g === "wip") return "（履修中）";
  if (g === "d" || g === "fail") return "（落単済み）";
  if (g === "pass") return "評価：P";
  return `評価：${g.toUpperCase()}`;
}

/** The required credit range, e.g. "6", "0~18", or "16~" when there's no upper bound. */
export function creditBoundsToString(
  min: number,
  max: number | undefined,
): string {
  if (max === undefined) return `${min}~`;
  if (min === max) return min.toString();
  return `${min}~${max}`;
}

/** Progress as "taken→with planned courses　要:required". */
export function creditProgressToString(c: {
  min: number;
  max: number | undefined;
  effectiveTaken: number;
  effectiveMightTake: number;
}): string {
  const progress =
    c.effectiveMightTake === 0
      ? c.effectiveTaken.toString()
      : `${c.effectiveTaken}→${c.effectiveTaken + c.effectiveMightTake}`;
  return progress + "　要:" + creditBoundsToString(c.min, c.max);
}

/** A short credit total, and a warning when credits exceed the upper bound. */
export type CreditStatsDisplay = { brief: string; warning: string | undefined };

function overflowWarning(
  subject: string,
  c: { max: number | undefined; rawTotal: number; overflowTotal: number },
): string | undefined {
  if (c.overflowTotal <= 0) return undefined;
  return `${subject}は合計で${c.max}単位まで有効です。「取る授業」と「単位取得済みの授業」は合計で${c.rawTotal}単位なので、残りの${c.overflowTotal}単位は卒業単位に含まれません。`;
}

/** Credit display for a cell. */
export function cellCreditStatsDisplay(c: CellCreditStats): CreditStatsDisplay {
  return {
    brief: "計:" + creditProgressToString(c),
    warning: overflowWarning("このマス", c),
  };
}

/** Credit display for a column. */
export function columnCreditStatsDisplay(
  c: ColumnCreditStats,
): CreditStatsDisplay {
  return {
    brief: "計:" + creditProgressToString(c),
    warning: overflowWarning("この列", c),
  };
}

/** Credit display for all electives combined. */
export function electiveCreditStatsDisplay(
  c: ElectiveCreditStats,
): CreditStatsDisplay {
  return {
    brief: "選択科目計:" + creditProgressToString(c),
    warning: overflowWarning("選択科目全体", c),
  };
}

/**
 * The taken and taken-plus-planned credits as percentages of `min`, capped at
 * 100. Both are 100 when nothing is required.
 */
export function getPercentage(
  taken: number,
  mightTake: number,
  min: number,
): [number, number] {
  if (min === 0) return [100, 100];
  return [
    Math.min(1, taken / min) * 100,
    Math.min(1, (taken + mightTake) / min) * 100,
  ];
}
