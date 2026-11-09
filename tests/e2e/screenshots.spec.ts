// Pages at phone width, which no other test shows. Goes with shot.ts.
import { test, waitForHydration } from "./test";

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

for (const path of [
  "",
  "faq",
  "contact",
  "contributors",
  "twins-grades",
  "twins-register",
]) {
  test(`/${path} at phone width`, async ({ page }) => {
    await page.goto(path);
    await waitForHydration(page);
  });
}
