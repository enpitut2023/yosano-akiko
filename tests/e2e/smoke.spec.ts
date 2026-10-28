import {
  COLLEGE_TO_JA,
  instances,
  MAJOR_TO_COLLEGE,
  MAJOR_TO_JA,
  majorIsClosed,
} from "$lib/constants";
import { clickUntil, expect, test } from "./test";

for (const { tableYear, major } of instances) {
  test(`${tableYear}/${major} loads`, async ({ page }) => {
    await page.goto(`${tableYear}/${major}`);

    if (majorIsClosed(major)) {
      const college = COLLEGE_TO_JA[MAJOR_TO_COLLEGE[major]];
      await expect(page).toHaveTitle(`あきこ - ${college}`);
      await expect(page.locator("#closed-notice")).toBeVisible();
      return;
    }

    await expect(page).toHaveTitle(
      `あきこ - ${tableYear}年度 ${MAJOR_TO_JA[major]}`,
    );
    await expect(page.locator(".cell").first()).toBeVisible();
    const tab = page.getByRole("button", { name: "単位チェック" });
    await clickUntil(tab, () =>
      expect(tab).toHaveClass(/active/, { timeout: 100 }),
    );
  });
}

for (const path of [
  "",
  "faq",
  "contact",
  "contributors",
  "twins-grades",
  "twins-register",
]) {
  test(`/${path} loads`, async ({ page }) => {
    await page.goto(path);
    // These pages have nothing to click, so wait out hydration this way for
    // the fixture to see any errors it logs
    await page.waitForLoadState("networkidle");
  });
}
