import { describe, expect, test } from "vitest";
import {
  sheetDragEnd,
  sheetDragMove,
  sheetDragStart,
  sheetSnapHeight,
  type SheetSnap,
} from "./sheet";

// Snaps at 120 (peek), 385 (half) and 700 (full); half and full meet at 542.5
const CONTAINER = 700;

/**
 * Drags from `from`'s height through `heights`, `dt` ms apart, then releases
 * `hold` ms after the last move.
 */
function dragTo(
  from: SheetSnap,
  heights: number[],
  dt: number,
  hold = 0,
): SheetSnap {
  const startHeight = sheetSnapHeight(from, CONTAINER);
  // The pointer starts at y = 0; moving up lowers y and raises the sheet
  let drag = sheetDragStart(0, startHeight);
  let t = 0;
  for (const h of heights) {
    t += dt;
    drag = sheetDragMove(drag, startHeight - h, t, CONTAINER);
  }
  return sheetDragEnd(drag, t + hold, from, CONTAINER);
}

/** Heights from `a` to `b` in `steps` equal moves. */
function steps(a: number, b: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => a + ((b - a) * (i + 1)) / n);
}

describe("sheetDragEnd", () => {
  test("a tap moves to the next snap", () => {
    expect(dragTo("peek", [], 0)).toBe("half");
    expect(dragTo("full", [], 0)).toBe("peek");
  });

  test("a move under the threshold is a tap", () => {
    expect(dragTo("peek", [123], 10)).toBe("half");
  });

  test("a slow drag lands on the nearest snap", () => {
    expect(dragTo("half", steps(385, 560, 20), 50)).toBe("full");
    expect(dragTo("half", steps(385, 500, 20), 50)).toBe("half");
  });

  test("a short quick flick moves to the next snap its way", () => {
    expect(dragTo("half", steps(385, 405, 2), 10)).toBe("full");
    expect(dragTo("half", steps(385, 365, 2), 10)).toBe("peek");
  });

  test("a flick from peek stops at half unless it's very fast", () => {
    // 2 and 4px/ms
    expect(dragTo("peek", steps(120, 180, 3), 10)).toBe("half");
    expect(dragTo("peek", steps(120, 240, 3), 10)).toBe("full");
  });

  test("the end of a drag counts, not its start", () => {
    // Slowly up past halfway to full, then flicked back down
    const heights = [...steps(385, 600, 20), ...steps(600, 580, 3)];
    expect(dragTo("half", heights, 10)).toBe("half");
  });

  test("a pause before letting go is no fling", () => {
    expect(dragTo("half", steps(385, 420, 3), 10, 300)).toBe("half");
  });

  test("the sheet stays between peek and the container's top", () => {
    expect(dragTo("full", steps(700, 900, 20), 50)).toBe("full");
    expect(dragTo("peek", steps(120, -100, 20), 50)).toBe("peek");
  });
});
