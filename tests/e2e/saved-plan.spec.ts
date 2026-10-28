// How courses moved by hand interact with grades, rebuilds of the page's data
// and what's saved in localStorage
import { gradesFile, type GradeRow } from "./fixtures/grades";
import {
  deselectCell,
  dragToMightTake,
  dragToWontTake,
  expect,
  importGrades,
  mightTakeIds,
  openTab,
  takenIds,
  test,
  wontTakeIds,
  type Page,
} from "./test";

const WIP = {
  id: "GA15211",
  name: "線形代数A",
  credit: 2,
  grade: "履修中",
  year: 2025,
} satisfies GradeRow;
const FAILED = {
  id: "GB27001",
  name: "ソフトウェア工学演習",
  credit: 1,
  grade: "D",
  year: 2024,
} satisfies GradeRow;
const PASSED = {
  id: "GB26403",
  name: "ソフトウェアサイエンス実験A",
  credit: 3,
  grade: "A",
  year: 2023,
} satisfies GradeRow;
const GRADES = gradesFile([WIP, FAILED, PASSED]);
const NEW_WIP = {
  id: "GB13322",
  name: "情報特別演習II",
  credit: 2,
  grade: "履修中",
  year: 2025,
} satisfies GradeRow;
const GB20401_PASSED = {
  id: "GB20401",
  name: "オートマトンと形式言語",
  credit: 2,
  grade: "A",
  year: 2025,
} satisfies GradeRow;

/** Checks all of 取る授業, not just the selected cell's part of it. */
async function expectPlan(page: Page, ids: string[]): Promise<void> {
  await deselectCell(page);
  await expect(mightTakeIds(page)).toHaveText(ids);
}

async function reload(page: Page): Promise<void> {
  await page.reload();
  await openTab(page, "履修を組む");
}

async function answerTransfer(page: Page, answer: "はい" | "いいえ") {
  await openTab(page, "単位チェック");
  await page
    .locator("#student-type")
    .getByText(answer, { exact: true })
    .click();
  await openTab(page, "履修を組む");
}

test.describe("with grades", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("2023/coins");
    await importGrades(page, GRADES);
    await openTab(page, "履修を組む");
  });

  test("a 履修中 course moved out of 取る授業 stays out", async ({ page }) => {
    await expectPlan(page, [WIP.id]);
    await dragToWontTake(page, WIP.id);
    await reload(page);
    await expectPlan(page, []);
    await page.getByTestId("cell-c1").click();
    await expect(wontTakeIds(page)).toHaveText([WIP.id]);
  });

  test("a 履修中 course moved out and back in stays in", async ({ page }) => {
    await dragToWontTake(page, WIP.id);
    await dragToMightTake(page, "c1", WIP.id);
    await reload(page);
    await expectPlan(page, [WIP.id]);
  });

  test("re-importing keeps courses moved by hand", async ({ page }) => {
    await dragToWontTake(page, WIP.id);
    await dragToMightTake(page, "b2", FAILED.id);
    await dragToMightTake(page, "b1", "GB20401");

    // A newer file, which also has a course started since
    await importGrades(page, gradesFile([WIP, FAILED, PASSED, NEW_WIP]));
    await openTab(page, "履修を組む");
    const plan = [NEW_WIP.id, FAILED.id, "GB20401"];
    await expectPlan(page, plan);
    await reload(page);
    await expectPlan(page, plan);
  });

  test("re-importing forgets moves that the grades settle", async ({
    page,
  }) => {
    await dragToMightTake(page, "b2", FAILED.id);
    await dragToMightTake(page, "b1", "GB20401");

    // The retake is now 履修中 and the planned course passed, so the grades
    // place both by themselves
    await importGrades(
      page,
      gradesFile([
        WIP,
        PASSED,
        { ...FAILED, grade: "履修中", year: 2025 },
        { ...GB20401_PASSED },
      ]),
    );
    await openTab(page, "履修を組む");
    await expectPlan(page, [WIP.id, FAILED.id]);

    // Going back to the first file shows the moves weren't kept
    await importGrades(page, GRADES);
    await openTab(page, "履修を組む");
    await expectPlan(page, [WIP.id]);
  });

  test("a 落単済み course can be taken again", async ({ page }) => {
    await dragToMightTake(page, "b2", FAILED.id);
    await reload(page);
    await expectPlan(page, [WIP.id, FAILED.id]);
    // Unlike the 履修中 one, it isn't registered yet
    await openTab(page, "TWINSに出力");
    await expect(page.locator("#export-tab summary")).toHaveText("1件・1単位");
  });

  test("a passed course can't be moved", async ({ page }) => {
    await page.getByTestId("cell-a1").click();
    await expect(takenIds(page)).toHaveText([PASSED.id]);
    await expect(
      page.locator("#right-bar tr.course", { hasText: PASSED.id }),
    ).toHaveAttribute("draggable", "false");
  });

  test("changing the 移行 answer keeps courses moved by hand", async ({
    page,
  }) => {
    await dragToWontTake(page, WIP.id);
    await dragToMightTake(page, "b2", FAILED.id);
    await dragToMightTake(page, "b1", "GB20401");
    const moved = [FAILED.id, "GB20401"];

    await answerTransfer(page, "はい");
    await expectPlan(page, moved);
    await answerTransfer(page, "いいえ");
    await expectPlan(page, moved);
    await reload(page);
    await expectPlan(page, moved);
  });
});

test.describe("without grades", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("2023/coins");
    await openTab(page, "履修を組む");
  });

  test("each entry year and major has its own plan", async ({ page }) => {
    await dragToMightTake(page, "b1", "GB20401");
    await page.goto("2024/coins");
    await openTab(page, "履修を組む");
    await expectPlan(page, []);
    await page.goto("2023/coins");
    await openTab(page, "履修を組む");
    await expectPlan(page, ["GB20401"]);
  });

  test("リセット clears the grades and the plan", async ({ page }) => {
    await importGrades(page, GRADES);
    await openTab(page, "履修を組む");
    await dragToMightTake(page, "b1", "GB20401");

    await openTab(page, "設定");
    page.once("dialog", (d) => void d.accept());
    await page.getByRole("button", { name: "リセット" }).click();

    await openTab(page, "履修を組む");
    await expectPlan(page, []);
    await openTab(page, "単位チェック");
    await expect(page.locator("#csv-drop-zone")).not.toContainText(
      "インポート済み",
    );
  });

  test("tabs of the same page stay in sync", async ({ page, context }) => {
    const other = await context.newPage();
    await other.goto("2023/coins");
    await openTab(other, "履修を組む");

    await dragToMightTake(page, "b1", "GB20401");
    await expectPlan(other, ["GB20401"]);
    await dragToMightTake(other, "b2", FAILED.id);
    await expectPlan(page, ["GB20401", FAILED.id]);
    await reload(page);
    await expectPlan(page, ["GB20401", FAILED.id]);
  });
});

test.describe("with saved data", () => {
  function seed(page: Page, data: string) {
    // Once, so a reload sees what the page saved instead
    return page.addInitScript((data) => {
      if (sessionStorage.getItem("seeded") !== null) return;
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem("coins_2023", data);
    }, data);
  }

  test("broken saved data is replaced", async ({ page }) => {
    await seed(page, "{");
    await page.goto("2023/coins");
    await openTab(page, "履修を組む");
    await expectPlan(page, []);
    await dragToMightTake(page, "b1", "GB20401");
    await reload(page);
    await expectPlan(page, ["GB20401"]);
  });

  test("moves of courses missing from the catalog are ignored", async ({
    page,
  }) => {
    await seed(
      page,
      JSON.stringify({
        version: 3,
        listKindOverrides: { GB99999: "might-take", GB20401: "might-take" },
        realCourses: [],
        fakeCourses: [],
        native: true,
      }),
    );
    await page.goto("2023/coins");
    await openTab(page, "履修を組む");
    await expectPlan(page, ["GB20401"]);
    await openTab(page, "TWINSに出力");
    await expect(page.locator("#export-tab summary")).toHaveText("1件・2単位");
  });
});
