const MAX_WIDTH = 1024;
const MAX_HEIGHT = 700;

/** The media queries the check depends on, for watching changes. */
export function mobileUnsupportedQueries(): MediaQueryList[] {
  return [
    "(pointer: coarse)",
    "(hover: none)",
    "(any-pointer: fine)",
    "(any-hover: hover)",
    `(max-width: ${MAX_WIDTH}px)`,
    `(max-height: ${MAX_HEIGHT}px)`,
  ].map((q) => window.matchMedia(q));
}

/** Whether this is a small touch-only screen, which あきこ doesn't support. */
export function mobileUnsupported(): boolean {
  const [
    primaryCoarse,
    primaryNoHover,
    anyFine,
    anyHover,
    maxWidth,
    maxHeight,
  ] = mobileUnsupportedQueries().map((q) => q.matches);
  const touchOnly = primaryCoarse && primaryNoHover && !anyFine && !anyHover;
  const smallViewport = maxWidth || maxHeight;
  return touchOnly && smallViewport;
}
