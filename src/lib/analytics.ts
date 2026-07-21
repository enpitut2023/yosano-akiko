// Thin wrapper around Matomo's event tracking. The tracker is only injected in
// production (see routes/+layout.svelte), so this safely no-ops in dev and
// during SSR, where window._paq does not exist.
declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

export function trackEvent(
  category: string,
  action: string,
  name?: string,
  value?: number,
): void {
  if (typeof window === "undefined" || window._paq === undefined) return;
  const event: (string | number)[] = ["trackEvent", category, action];
  if (name !== undefined) event.push(name);
  // Matomo expects the value in the 5th slot, so a value without a name still
  // needs a name placeholder.
  if (value !== undefined) {
    if (name === undefined) event.push("");
    event.push(value);
  }
  window._paq.push(event);
}
