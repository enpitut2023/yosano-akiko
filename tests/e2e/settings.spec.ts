import { gradesFile, type GradeRow } from "./fixtures/grades";
import { knownCourseYear } from "./fixtures/courses";
import {
  deselectCell,
  dragToMightTake,
  expect,
  importGrades,
  mightTakeIds,
  openTab,
  test,
  wontTakeIds,
  type Page,
} from "./test";

const WIP = {
  id: "GA15211",
  name: "線形代数A",
  credit: 2,
  grade: "履修中",
  year: knownCourseYear,
} satisfies GradeRow;

test.beforeEach(async ({ page }) => {
  await page.goto("2023/coins");
});

function setting(page: Page, label: string) {
  return page.locator("#settings-tab").getByLabel(label);
}

async function showUnavailable(page: Page, show: boolean) {
  await openTab(page, "設定");
  await setting(page, "今年度開講しない授業を表示する").setChecked(show);
  await openTab(page, "履修を組む");
}

test("今年度開講しない授業を表示する shows courses not offered this year", async ({
  page,
}) => {
  await openTab(page, "履修を組む");
  await page.getByTestId("cell-b2").click();
  await expect(wontTakeIds(page)).toHaveText(["GB13322", "GB27001", "GB31801"]);

  await showUnavailable(page, true);
  await expect(wontTakeIds(page)).toHaveText([
    "GB13322",
    "GB27001",
    "GB31801",
    "GB41001",
  ]);
  const row = page.locator("#left-bar tr.course", { hasText: "GB41001" });
  await expect(row).toContainText("（非開講）");

  // Hiding them again leaves one in 取る授業 there
  await dragToMightTake(page, "b2", "GB41001");
  await showUnavailable(page, false);
  await deselectCell(page);
  await expect(mightTakeIds(page)).toHaveText(["GB41001"]);
});

test("cancelling リセット keeps the grades and the plan", async ({ page }) => {
  await importGrades(page, gradesFile([WIP]));
  await openTab(page, "履修を組む");
  await dragToMightTake(page, "b1", "GB20401");

  await openTab(page, "設定");
  const asked = new Promise<void>((resolve) =>
    page.once("dialog", (d) => {
      void d.dismiss();
      resolve();
    }),
  );
  await page.getByRole("button", { name: "リセット" }).click();
  await asked;

  for (let i = 0; i < 2; i++) {
    await openTab(page, "履修を組む");
    await deselectCell(page);
    await expect(mightTakeIds(page)).toHaveText([WIP.id, "GB20401"]);
    await openTab(page, "単位チェック");
    await expect(page.locator("#csv-drop-zone")).toContainText(
      "インポート済み",
    );
    await page.reload();
  }
});
