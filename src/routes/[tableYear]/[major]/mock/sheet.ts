/** How far up the bottom sheet is pulled. */
export type SheetSnap = "peek" | "half" | "full";

export const SHEET_SNAPS: SheetSnap[] = ["peek", "half", "full"];

/** Enough for the grip, the credit summary and the tabs. */
export const SHEET_PEEK_HEIGHT = 120;

/** The sheet's height at a snap, in a container of the given height. */
export function sheetSnapHeight(
  snap: SheetSnap,
  containerHeight: number,
): number {
  switch (snap) {
    case "peek":
      return SHEET_PEEK_HEIGHT;
    case "half":
      return Math.max(SHEET_PEEK_HEIGHT, Math.round(containerHeight * 0.55));
    case "full":
      return Math.max(SHEET_PEEK_HEIGHT, containerHeight);
  }
}

/** The snap whose height is closest to `height`. */
export function sheetSnapNearest(
  height: number,
  containerHeight: number,
): SheetSnap {
  let nearest: SheetSnap = "peek";
  for (const snap of SHEET_SNAPS) {
    if (
      Math.abs(sheetSnapHeight(snap, containerHeight) - height) <
      Math.abs(sheetSnapHeight(nearest, containerHeight) - height)
    )
      nearest = snap;
  }
  return nearest;
}

/** The tab shown in the sheet. */
export type SheetTab = "find" | "plan" | "timetable";
