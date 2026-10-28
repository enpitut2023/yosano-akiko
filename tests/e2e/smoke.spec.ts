import { instances, majorIsClosed } from "$lib/constants";
import { expect, test } from "./test";

for (const { tableYear, major } of instances) {
  test(`${tableYear}/${major} loads`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" || /hydrat/i.test(m.text())) {
        errors.push(m.text());
      }
    });

    await page.goto(`${tableYear}/${major}`);

    if (majorIsClosed(major)) {
      await expect(page.locator("#closed-notice")).toBeVisible();
    } else {
      await expect(page.locator(".cell").first()).toBeVisible();
      // Retried because the tab only reacts once the page has hydrated
      const tab = page.getByRole("button", { name: "単位チェック" });
      await expect(async () => {
        await tab.click();
        await expect(tab).toHaveClass(/active/, { timeout: 100 });
      }).toPass();
    }
    expect(errors).toEqual([]);
  });
}
