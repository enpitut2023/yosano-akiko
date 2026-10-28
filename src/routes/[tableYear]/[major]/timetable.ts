import { type Slot, type Term } from "$lib/akiko";

/** The term shown in the timetable. "other" is the tab for courses without a fixed day and period. */
export type TimetableTab = Term | "other";

/**
 * The tab to show once a course with the slots is added to 取る授業: the
 * current one if the course is on it, else the course's first term, or その他
 * if it has no fixed day and period.
 */
export function timetableTabAfterPlanning(
  slots: Slot[],
  current: TimetableTab,
): TimetableTab {
  const terms = slots
    .filter((s) => s.when.kind === "regular")
    .map((s) => s.term);
  if (terms.length === 0) return "other";
  if (current !== "other" && terms.includes(current)) return current;
  return terms[0];
}
