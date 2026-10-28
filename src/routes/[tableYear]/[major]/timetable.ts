import { type Term } from "$lib/akiko";

/** The term shown in the timetable. "other" is the tab for courses without a fixed day and period. */
export type TimetableTab = Term | "other";
