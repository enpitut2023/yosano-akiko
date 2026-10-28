import { gradesFile } from "./fixtures/grades";
import { expect, test, waitForHydration, type Page } from "./test";

// The tutorial only needs some valid file
const GRADES = gradesFile([
  {
    id: "GB26403",
    name: "ソフトウェアサイエンス実験A",
    credit: 3,
    grade: "A",
    year: 2023,
  },
]);

function tutorial(page: Page) {
  return page
    .getByRole("dialog")
    .filter({ has: page.locator("#tutorial-title") });
}

async function expectStep(page: Page, id: string): Promise<void> {
  await expect(tutorial(page)).toHaveAttribute("data-testid", `tutorial-${id}`);
}

/** Clicks the button that goes to the next step. */
async function next(page: Page): Promise<void> {
  await tutorial(page).locator("footer button.primary").click();
}

/** A step that waits for an action has no button to skip it. */
async function expectWaiting(page: Page, id: string): Promise<void> {
  await expectStep(page, id);
  await expect(tutorial(page).locator("footer button.primary")).toHaveCount(0);
}

test.describe("on the first visit", () => {
  test.use({ seen: false });

  test("it opens", async ({ page }) => {
    await page.goto("2023/coins");
    await expectStep(page, "welcome");
  });

  test("with grades, it walks through import, cell, drag and export", async ({
    page,
  }) => {
    await page.goto("2023/coins");
    await expectStep(page, "welcome");
    await next(page);

    await expectWaiting(page, "tab-import");
    await page.getByRole("button", { name: "単位チェック" }).click();

    await expectWaiting(page, "import");
    await page.locator(".csv-input").setInputFiles(GRADES);

    await expectStep(page, "progress");
    await next(page);

    await expectWaiting(page, "tab-courses");
    await page.getByRole("button", { name: "履修を組む" }).click();

    await expectWaiting(page, "cell");
    // No fixture course is in a2, so picking it doesn't count
    await page.getByTestId("cell-a2").click();
    await expectWaiting(page, "cell");
    await page.getByTestId("cell-b1").click();

    await expectStep(page, "syllabus");
    await next(page);

    await expectWaiting(page, "drag");
    await page
      .locator("#left-bar tr.course", { hasText: "GB20401" })
      .dragTo(page.locator("#right-bar"));

    await expectStep(page, "more");
    await next(page);

    await expectWaiting(page, "tab-export");
    await page.getByRole("button", { name: "TWINSに出力" }).click();

    await expectStep(page, "export");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "ダウンロード" }).click();
    await download;

    await expectStep(page, "register");
    await next(page);
    await expectStep(page, "done");
    await next(page);
    await expect(tutorial(page)).toBeHidden();
  });

  test("without grades, it skips the import steps", async ({ page }) => {
    await page.goto("2023/coins");
    await next(page);
    await page.getByRole("button", { name: "単位チェック" }).click();
    await expectStep(page, "import");
    await tutorial(page)
      .getByRole("button", { name: /成績ファイルを持っていない/ })
      .click();
    await expectWaiting(page, "tab-courses");
  });

  test("closing it marks it seen, and the nav reopens it", async ({ page }) => {
    await page.goto("2023/coins");
    await tutorial(page)
      .getByRole("button", { name: "チュートリアルを閉じる" })
      .click();
    await expect(tutorial(page)).toBeHidden();

    await page.reload();
    await waitForHydration(page);
    await expect(tutorial(page)).toBeHidden();

    await page
      .getByRole("button", { name: "チュートリアル", exact: true })
      .click();
    await expectStep(page, "welcome");
  });
});

test("it doesn't open once seen", async ({ page }) => {
  await page.goto("2023/coins");
  await waitForHydration(page);
  await expect(tutorial(page)).toBeHidden();
});
