// Shared across all majors, so each is shown once per browser rather than once
// per major page.
const KEYS = {
  tutorial: "akiko_tutorial_seen",
  panHint: "akiko_pan_hint_seen",
};

/** Things shown only until the user has seen them once. */
export type Seen = keyof typeof KEYS;

/**
 * Whether the user has already seen `what`. Reports true when localStorage is
 * unavailable, so it isn't shown again on every visit.
 */
export function seen(what: Seen): boolean {
  try {
    return localStorage.getItem(KEYS[what]) !== null;
  } catch {
    return true;
  }
}

/** Records that the user has seen `what`. Failing to save is harmless. */
export function markSeen(what: Seen): void {
  try {
    localStorage.setItem(KEYS[what], "1");
  } catch {
    // Nothing to do; it just shows again next time
  }
}
