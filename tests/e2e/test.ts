import { test as base } from "@playwright/test";
import { SEEN_KEYS } from "../../src/routes/[tableYear]/[major]/seen";

export { expect } from "@playwright/test";

/**
 * Playwright's `test`, with the things shown on a first visit (the tutorial,
 * the pan hint) already marked as seen. Tests of those use
 * `test.use({ seen: false })`.
 */
export const test = base.extend<{ seen: boolean }>({
  seen: [true, { option: true }],
  page: async ({ page, seen }, use) => {
    if (seen) {
      await page.addInitScript((keys) => {
        for (const key of keys) localStorage.setItem(key, "1");
      }, Object.values(SEEN_KEYS));
    }
    await use(page);
  },
});
