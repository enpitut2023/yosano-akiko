import type { BaseCreditStats, ListKind, MergedCourse } from "#lib/akiko.ts";

/** A course as a list shows it. */
export type ListedCourse = { course: MergedCourse; listKind: ListKind };

export type CreditProgress = Pick<
  BaseCreditStats,
  "min" | "effectiveTaken" | "effectiveMightTake"
>;

/** Credits still needed to reach `min`, after the planned courses too if `planned`. */
export function creditsLeft(s: CreditProgress, planned: boolean): number {
  const have = s.effectiveTaken + (planned ? s.effectiveMightTake : 0);
  return Math.max(0, s.min - have);
}
