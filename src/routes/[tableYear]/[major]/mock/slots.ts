import type { Dow, KnownCourse, Slot, Term } from "#lib/akiko.ts";

/** A cell of the timetable: a period on a weekday in a module. */
export type TimetableSlot = { term: Term; dow: Dow; period: number };

export const TIMETABLE_TERMS: Term[] = [
  "spring-a",
  "spring-b",
  "spring-c",
  "autumn-a",
  "autumn-b",
  "autumn-c",
];
export const TIMETABLE_DOWS: Dow[] = ["mon", "tue", "wed", "thu", "fri"];
export const TIMETABLE_PERIODS = [1, 2, 3, 4, 5, 6];

export function slotIsAt(s: Slot, at: TimetableSlot): boolean {
  return (
    s.term === at.term &&
    s.when.kind === "regular" &&
    s.when.dow === at.dow &&
    s.when.period === at.period
  );
}

export function knownCourseIsAt(
  k: KnownCourse | undefined,
  at: TimetableSlot,
): boolean {
  return k?.slots.some((s) => slotIsAt(s, at)) ?? false;
}

/** Whether a slot is one the timetable has a place for, not 集中 or 春学期. */
export function slotIsInTimetable(s: Slot): boolean {
  return (
    TIMETABLE_TERMS.includes(s.term) &&
    s.when.kind === "regular" &&
    TIMETABLE_DOWS.includes(s.when.dow) &&
    TIMETABLE_PERIODS.includes(s.when.period)
  );
}
