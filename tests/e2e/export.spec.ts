import { readFile } from "node:fs/promises";
import { gradesFile } from "./fixtures/grades";
import {
  dragToMightTake,
  expect,
  importGrades,
  openTab,
  test,
  type Page,
} from "./test";

test.beforeEach(async ({ page }) => {
  await page.goto("2023/coins");
  await openTab(page, "履修を組む");
});

function exportTab(page: Page) {
  return page.locator("#export-tab");
}

function downloadButton(page: Page) {
  return page.getByRole("button", { name: "ダウンロード" });
}

/** Clicks ダウンロード and returns the file's name and course IDs, sorted. */
async function download(page: Page): Promise<{ name: string; ids: string[] }> {
  const event = page.waitForEvent("download");
  await downloadButton(page).click();
  const d = await event;
  const content = await readFile(await d.path(), "utf8");
  return { name: d.suggestedFilename(), ids: content.split("\n").sort() };
}

test("with no 取る授業 there's nothing to download", async ({ page }) => {
  await openTab(page, "TWINSに出力");
  await expect(downloadButton(page)).toBeDisabled();
  await exportTab(page)
    .getByRole("button", { name: /「履修を組む」で選ぶ/ })
    .click();
  await expect(page.getByRole("button", { name: "履修を組む" })).toHaveClass(
    /active/,
  );
});

test("ダウンロード downloads the IDs of 取る授業", async ({ page }) => {
  await dragToMightTake(page, "b1", "GB20401");
  await dragToMightTake(page, "b2", "GB27001");
  await openTab(page, "TWINSに出力");

  const summary = exportTab(page).locator("summary");
  await expect(summary).toHaveText("2件・3単位");
  await summary.click();
  await expect(exportTab(page).locator("tr.course")).toHaveText([
    /GB20401/,
    /GB27001/,
  ]);

  expect(await download(page)).toEqual({
    name: "科目番号一覧.csv",
    ids: ["GB20401", "GB27001"],
  });
  await expect(page.locator("#support-ask")).toBeVisible();
});

test("履修中 courses are left out, since they're registered already", async ({
  page,
}) => {
  await importGrades(
    page,
    gradesFile([
      {
        id: "GB13322",
        name: "情報特別演習II",
        credit: 2,
        grade: "履修中",
        year: 2026,
      },
    ]),
  );
  await openTab(page, "履修を組む");
  await dragToMightTake(page, "b2", "GB27001");
  await openTab(page, "TWINSに出力");

  expect((await download(page)).ids).toEqual(["GB27001"]);
});

test("overlapping courses block the download and can be shown", async ({
  page,
}) => {
  await dragToMightTake(page, "b1", "GB20401");
  await dragToMightTake(page, "b2", "GB31801");
  // Move away from what 表示 should switch to
  await page.getByTestId("cell-a1").click();
  const terms = page.locator(".term-tabs");
  await terms.getByRole("button", { name: "秋A" }).click();
  await openTab(page, "TWINSに出力");

  await expect(exportTab(page).locator(".step-problem")).toBeVisible();
  await expect(exportTab(page).locator("tbody")).toContainText("GB20401");
  await expect(exportTab(page).locator("tbody")).toContainText("GB31801");
  await expect(downloadButton(page)).toBeDisabled();

  // They overlap on both 春A and 春B 月1, so GB20401 has a row in each
  await exportTab(page)
    .locator("tr", { hasText: "GB20401" })
    .first()
    .getByRole("button", { name: "表示" })
    .click();
  await expect(page.getByTestId("cell-b1")).toHaveClass(/selected/);
  await expect(page.getByRole("button", { name: "履修を組む" })).toHaveClass(
    /active/,
  );
  await expect(terms.locator("button.active")).toHaveText(/^春[AB]$/);
});

test("事前登録 courses are warned about and left out", async ({ page }) => {
  await dragToMightTake(page, "b1", "GB40111");
  await dragToMightTake(page, "b2", "GB27001");
  await openTab(page, "TWINSに出力");

  const warning = exportTab(page).locator(".step-problem");
  await expect(warning).toContainText("事前登録");
  await expect(warning.locator("+ table")).toContainText("GB40111");
  expect((await download(page)).ids).toEqual(["GB27001"]);
});

test("courses not offered this year are warned about and left out", async ({
  page,
}) => {
  await openTab(page, "設定");
  await page.getByLabel("今年度開講しない授業を表示する").check();
  await openTab(page, "履修を組む");
  await dragToMightTake(page, "b2", "GB41001");
  await dragToMightTake(page, "b2", "GB27001");
  await openTab(page, "TWINSに出力");

  const warning = exportTab(page).locator(".step-problem");
  await expect(warning).toContainText("今年度開講しない");
  await expect(warning.locator("+ table")).toContainText("GB41001");
  expect((await download(page)).ids).toEqual(["GB27001"]);
});

test("手順を見る opens the TWINS registration guide", async ({ page }) => {
  await openTab(page, "TWINSに出力");
  const popup = page.waitForEvent("popup");
  await exportTab(page).getByRole("link", { name: "手順を見る" }).click();
  await expect(await popup).toHaveURL(/\/twins-register$/);
});
