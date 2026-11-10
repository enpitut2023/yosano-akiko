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

// Guesses, to tune on a phone
/** Smaller moves are taps, not drags. */
const DRAG_THRESHOLD = 5;
/** How far back the release velocity looks, in ms. */
const VELOCITY_WINDOW = 100;
/** How far a release carries the sheet: its velocity times this, in ms. */
const PROJECTION_TIME = 200;
/** A release at least this fast, in px/ms, moves to the next snap its way. */
const FLING_SPEED = 0.5;
/** Only a release at least this fast, in px/ms, can skip past a snap. */
const SKIP_SPEED = 3;

/** A pointer on the sheet's grip, from press to release. */
export type SheetDrag =
  | { kind: "pressed"; startY: number; startHeight: number }
  | {
      kind: "dragging";
      startY: number;
      startHeight: number;
      height: number;
      /** The pointer's recent moves, oldest first */
      samples: { y: number; t: number }[];
    };

export function sheetDragStart(y: number, height: number): SheetDrag {
  return { kind: "pressed", startY: y, startHeight: height };
}

/** The drag after the pointer moves to `y` at time `t`, in ms. */
export function sheetDragMove(
  drag: SheetDrag,
  y: number,
  t: number,
  containerHeight: number,
): SheetDrag {
  if (drag.kind === "pressed" && Math.abs(y - drag.startY) < DRAG_THRESHOLD)
    return drag;
  const samples = drag.kind === "dragging" ? drag.samples : [];
  return {
    kind: "dragging",
    startY: drag.startY,
    startHeight: drag.startHeight,
    height: Math.min(
      containerHeight,
      Math.max(SHEET_PEEK_HEIGHT, drag.startHeight + drag.startY - y),
    ),
    samples: [...samples, { y, t }].filter((s) => s.t >= t - VELOCITY_WINDOW),
  };
}

/**
 * Where the sheet settles when the pointer is released at time `t`. A tap
 * moves it to the next snap; a drag goes where its velocity would carry it.
 */
export function sheetDragEnd(
  drag: SheetDrag,
  t: number,
  snap: SheetSnap,
  containerHeight: number,
): SheetSnap {
  if (drag.kind === "pressed")
    return SHEET_SNAPS[(SHEET_SNAPS.indexOf(snap) + 1) % SHEET_SNAPS.length];

  const velocity = releaseVelocity(drag.samples, t);
  const nearest = sheetSnapNearest(
    drag.height + velocity * PROJECTION_TIME,
    containerHeight,
  );
  if (Math.abs(velocity) < FLING_SPEED) return nearest;

  const heightOf = (s: SheetSnap) => sheetSnapHeight(s, containerHeight);
  const next =
    velocity > 0
      ? SHEET_SNAPS.find((s) => heightOf(s) > drag.height)
      : SHEET_SNAPS.findLast((s) => heightOf(s) < drag.height);
  if (next === undefined) return nearest;
  if (Math.abs(velocity) < SKIP_SPEED) return next;
  const beyondNext =
    velocity > 0
      ? heightOf(nearest) >= heightOf(next)
      : heightOf(nearest) <= heightOf(next);
  return beyondNext ? nearest : next;
}

/**
 * How fast the sheet rises at time `t`, in px/ms, from the pointer's last
 * stretch in one direction: a drag reversed at the end goes the new way. A
 * pause before letting go leaves no recent samples, so no velocity.
 */
function releaseVelocity(
  samples: { y: number; t: number }[],
  t: number,
): number {
  const recent = samples.filter((s) => s.t >= t - VELOCITY_WINDOW);
  const last = recent.at(-1);
  if (last === undefined) return 0;
  let first = last;
  let direction = 0;
  for (const s of recent.slice(0, -1).reverse()) {
    const d = Math.sign(first.y - s.y);
    if (d !== 0 && direction !== 0 && d !== direction) break;
    if (d !== 0) direction = d;
    first = s;
  }
  return last.t > first.t ? (first.y - last.y) / (last.t - first.t) : 0;
}

/** The tab shown in the sheet. */
export type SheetTab = "find" | "plan" | "timetable" | "credits";
