import { tick } from "svelte";
import type { Attachment } from "svelte/attachments";

/** Calls `onmove` for each pointer move while the element is dragged with the primary button. */
export function resizeHandle(
  onmove: (e: PointerEvent) => void,
): Attachment<HTMLElement> {
  return (el) => {
    const down = (e: PointerEvent) => {
      if (e.button === 0) el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (el.hasPointerCapture(e.pointerId)) onmove(e);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
    };
  };
}

/** Options for {@link panZoom}. */
export type PanZoomOptions = {
  zoom(): number;
  /** May clamp the level; the scroll position follows the level actually applied. */
  setZoom(zoom: number): void;
  /** Pressing inside an element matching this selector doesn't start a pan. */
  ignore?: string;
  onPanStart?(): void;
  onPanEnd?(): void;
};

// Smaller moves are clicks, not pans
const PAN_THRESHOLD = 5;

/**
 * Pans a scroll container by dragging it with the mouse, and zooms it with
 * Ctrl+wheel around the pointer.
 */
export function panZoom(opts: PanZoomOptions): Attachment<HTMLElement> {
  return (el) => {
    let start:
      | { x: number; y: number; scrollLeft: number; scrollTop: number }
      | undefined;
    let panning = false;
    let suppressClick = false;

    const down = (e: PointerEvent) => {
      if (e.button !== 0 || e.pointerType !== "mouse") return;
      if (
        opts.ignore !== undefined &&
        e.target instanceof Element &&
        e.target.closest(opts.ignore)
      )
        return;
      const rect = el.getBoundingClientRect();
      // Leave scrollbar drags to the browser
      if (
        e.clientX - rect.left >= el.clientWidth ||
        e.clientY - rect.top >= el.clientHeight
      )
        return;
      start = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
      };
    };

    const move = (e: PointerEvent) => {
      if (start === undefined) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!panning) {
        if (Math.hypot(dx, dy) < PAN_THRESHOLD) return;
        panning = true;
        el.setPointerCapture(e.pointerId);
        opts.onPanStart?.();
      }
      el.scrollLeft = start.scrollLeft - dx;
      el.scrollTop = start.scrollTop - dy;
    };

    const up = () => {
      start = undefined;
      if (!panning) return;
      panning = false;
      opts.onPanEnd?.();
      // The click that follows a pan must not reach what's under the pointer
      suppressClick = true;
      setTimeout(() => (suppressClick = false));
    };

    const click = (e: MouseEvent) => {
      if (suppressClick) e.stopPropagation();
    };

    const wheel = async (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const { scrollLeft, scrollTop } = el;
      const oldZoom = opts.zoom();
      opts.setZoom(oldZoom * Math.exp(-e.deltaY * 0.01));
      await tick();
      const f = opts.zoom() / oldZoom;
      el.scrollLeft = (scrollLeft + cx) * f - cx;
      el.scrollTop = (scrollTop + cy) * f - cy;
    };
    const onWheel = (e: WheelEvent) => void wheel(e);

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, { capture: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, { capture: true });
      el.removeEventListener("wheel", onWheel);
    };
  };
}
