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
  timetableBar,
  timetableTerm,
  wontTakeIds,
  type Page,
} from "./test";

// On 春A, like WIP
const PASSED_THIS_YEAR = {
  id: "GB26403",
  name: "ソフトウェアサイエンス実験A",
  credit: 3,
  grade: "A",
  year: knownCourseYear,
} satisfies GradeRow;
const PASSED_LAST_YEAR = {
  id: "GB20401",
  name: "オートマトンと形式言語",
  credit: 2,
  grade: "A",
  year: knownCourseYear - 1,
} satisfies GradeRow;
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

test("時間割に単位取得済みの授業を表示する shows passed courses in the timetable", async ({
  page,
}) => {
  await importGrades(page, gradesFile([PASSED_THIS_YEAR, WIP]));
  await openTab(page, "履修を組む");
  await expect(timetableTerm(page, "春A")).toHaveClass(/active/);
  await expect(timetableBar(page, PASSED_THIS_YEAR.id)).not.toHaveCount(0);

  await openTab(page, "設定");
  await setting(page, "時間割に単位取得済みの授業を表示する").uncheck();
  await openTab(page, "履修を組む");
  await expect(timetableBar(page, PASSED_THIS_YEAR.id)).toHaveCount(0);
  await expect(timetableBar(page, WIP.id)).not.toHaveCount(0);
});

test("時間割の年度 picks the year of passed courses in the timetable", async ({
  page,
}) => {
  await importGrades(page, gradesFile([PASSED_THIS_YEAR, PASSED_LAST_YEAR]));
  await openTab(page, "履修を組む");
  await expect(timetableBar(page, PASSED_THIS_YEAR.id)).not.toHaveCount(0);
  await expect(timetableBar(page, PASSED_LAST_YEAR.id)).toHaveCount(0);

  await openTab(page, "設定");
  await setting(page, "時間割の年度").fill(String(knownCourseYear - 1));
  await openTab(page, "履修を組む");
  await expect(timetableBar(page, PASSED_THIS_YEAR.id)).toHaveCount(0);
  await expect(timetableBar(page, PASSED_LAST_YEAR.id)).not.toHaveCount(0);

  // Planning a course goes back to this year, the one it's planned for
  await dragToMightTake(page, "b2", "GB31801");
  await expect(timetableBar(page, PASSED_THIS_YEAR.id)).not.toHaveCount(0);
  await expect(timetableBar(page, PASSED_LAST_YEAR.id)).toHaveCount(0);
  await openTab(page, "設定");
  await expect(setting(page, "時間割の年度")).toHaveValue(
    String(knownCourseYear),
  );
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
