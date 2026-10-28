// The notice that small touch screens aren't supported. Touch emulation makes
// the primary pointer coarse and leaves no fine pointer or hover.
import { expect, test, waitForHydration, type Page } from "./test";

function notice(page: Page) {
  return page.locator("#mobile-unsupported");
}

function tutorial(page: Page) {
  return page.locator("#tutorial-title");
}

test.describe("on a phone", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    seen: false,
  });

  test("the notice shows, and このまま使う dismisses it", async ({ page }) => {
    await page.goto("2023/coins");
    await expect(notice(page)).toBeVisible();
    await page.getByRole("button", { name: "このまま使う" }).tap();
    await expect(notice(page)).toBeHidden();
    await page.getByRole("button", { name: "単位チェック" }).tap();
    await expect(page.locator("#import-tab")).toHaveClass(/active/);
  });

  test("the tutorial doesn't open on its own", async ({ page }) => {
    await page.goto("2023/coins");
    await expect(notice(page)).toBeVisible();
    await page.getByRole("button", { name: "このまま使う" }).tap();
    await expect(tutorial(page)).toHaveCount(0);
  });
});

test.describe("with touch on a large screen", () => {
  test.use({ viewport: { width: 1366, height: 1024 }, hasTouch: true });

  test("the notice doesn't show", async ({ page }) => {
    await page.goto("2023/coins");
    await waitForHydration(page);
    await expect(notice(page)).toHaveCount(0);
  });

  test("the notice shows once the screen gets small", async ({ page }) => {
    await page.goto("2023/coins");
    await waitForHydration(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(notice(page)).toBeVisible();
  });
});

test.describe("with a mouse on a small screen", () => {
  test.use({ viewport: { width: 800, height: 600 }, seen: false });

  test("the notice doesn't show, and the tutorial opens", async ({ page }) => {
    await page.goto("2023/coins");
    await expect(tutorial(page)).toBeVisible();
    await expect(notice(page)).toHaveCount(0);
  });
});
