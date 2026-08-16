import { type Term } from "$lib/akiko";

/** 時間割で表示中の学期。 "other" は曜時限が決まっていない授業のタブ。 */
export type TimetableTab = Term | "other";
