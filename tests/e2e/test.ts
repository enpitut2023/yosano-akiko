import {
  test as base,
  expect,
  type Locator,
  type Page,
} from "@playwright/test";
import { SEEN_KEYS } from "../../src/routes/[tableYear]/[major]/seen";

export { expect, type Page } from "@playwright/test";

/**
 * Playwright's `test`, with:
 * - requests to other origins answered with an empty response;
 * - the things shown on a first visit (the tutorial, the pan hint) already
 *   marked as seen. Tests of those use `test.use({ seen: false })`;
 * - a failure if the page logs an error or a hydration warning.
 */
export const test = base.extend<{ seen: boolean }>({
  seen: [true, { option: true }],
  context: async ({ context, baseURL }, use) => {
    // Keeps tests off the network, which also stops the production build's
    // Matomo tracker from reporting. An empty response rather than an aborted
    // request, because aborting logs a console error.
    const origin = new URL(baseURL ?? "").origin;
    await context.route(
      (url) => url.origin !== origin,
      (route) => route.fulfill({ body: "" }),
    );
    await use(context);
  },
  page: async ({ page, seen }, use) => {
    if (seen) {
      await page.addInitScript((keys) => {
        for (const key of keys) localStorage.setItem(key, "1");
      }, Object.values(SEEN_KEYS));
    }
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" || /hydrat/i.test(m.text())) {
        errors.push(m.text());
      }
    });
    await use(page);
    expect(errors, "errors logged by the page").toEqual([]);
  },
});

/**
 * Waits until the page has likely hydrated, for checks that would pass
 * vacuously on the prerendered HTML: that something doesn't appear, or that
 * the page logs no errors. Pages with a button can use `clickUntil` instead.
 */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
}

/**
 * Clicks `target` until `check` passes. Pages are prerendered, so a click
 * before hydration does nothing.
 */
export async function clickUntil(
  target: Locator,
  check: () => Promise<void>,
): Promise<void> {
  await expect(async () => {
    await target.click();
    await check();
  }).toPass();
}
