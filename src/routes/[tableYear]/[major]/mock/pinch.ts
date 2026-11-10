import { tick } from "svelte";
import type { Attachment } from "svelte/attachments";

/** Options for {@link pinchZoom}. */
export type PinchZoomOptions = {
  zoom(): number;
  /** May clamp the level; the scroll position follows the level actually applied. */
  setZoom(zoom: number): void;
};

/**
 * Zooms the content of the scroll container `el`, keeping what's at (`x`, `y`)
 * in place. The point is relative to `el`'s top left.
 */
export async function zoomAround(
  el: HTMLElement,
  opts: PinchZoomOptions,
  zoom: number,
  x: number,
  y: number,
) {
  const { scrollLeft, scrollTop } = el;
  const oldZoom = opts.zoom();
  opts.setZoom(zoom);
  await tick();
  const f = opts.zoom() / oldZoom;
  el.scrollLeft = (scrollLeft + x) * f - x;
  el.scrollTop = (scrollTop + y) * f - y;
}

/**
 * Zooms a scroll container with a two-finger pinch, around the point between
 * the fingers. One finger is left to the browser, which scrolls.
 */
export function pinchZoom(opts: PinchZoomOptions): Attachment<HTMLElement> {
  return (el) => {
    let start: { distance: number; zoom: number } | undefined;

    const distance = (e: TouchEvent) =>
      Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );

    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2)
        start = { distance: distance(e), zoom: opts.zoom() };
    };

    const move = async (e: TouchEvent) => {
      if (start === undefined || e.touches.length !== 2) return;
      // Otherwise the browser zooms the whole page
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      await zoomAround(
        el,
        opts,
        (start.zoom * distance(e)) / start.distance,
        (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left,
        (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top,
      );
    };
    const onMove = (e: TouchEvent) => void move(e);

    const onEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) start = undefined;
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  };
}
