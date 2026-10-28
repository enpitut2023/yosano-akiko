import { gradesFile, type GradeRow } from "./fixtures/grades";
import {
  dragToMightTake,
  expect,
  importGrades,
  openTab,
  test,
  type Page,
} from "./test";

const ROWS: GradeRow[] = [
  // a1, half of it
  {
    id: "GB26403",
    name: "ソフトウェアサイエンス実験A",
    credit: 3,
    grade: "A",
    year: 2023,
  },
  // c1, starts in 取る授業
  { id: "GA15211", name: "線形代数A", credit: 2, grade: "履修中", year: 2025 },
  // b2, failed, so it stays in 当てはまる授業
  {
    id: "GB27001",
    name: "ソフトウェア工学演習",
    credit: 1,
    grade: "D",
    year: 2024,
  },
  // c1 only for 移行 students; fits no cell otherwise
  { id: "FF18724", name: "線形代数A", credit: 2, grade: "B", year: 2023 },
  // Fits no cell
  { name: "編入前の単位", credit: 2, grade: "認", year: 2023 },
];
const GRADES = gradesFile(ROWS);
const PASSED_CREDITS = 7;

test.beforeEach(async ({ page }) => {
  await page.goto("2023/coins");
  await openTab(page, "単位チェック");
});

function dropZone(page: Page) {
  return page.locator("#csv-drop-zone");
}

async function expectImported(page: Page): Promise<void> {
  await expect(dropZone(page)).toContainText(
    `インポート済み（${PASSED_CREDITS}単位）`,
  );
}

/** Checks how much of the cell is green (taken) and green plus yellow (取る授業). */
async function expectCell(
  page: Page,
  cellId: string,
  green: number,
  greenAndYellow: number,
): Promise<void> {
  const cell = page.getByTestId(`cell-${cellId}`);
  await expect(cell).toHaveCSS("--green-percentage", `${green}%`);
  await expect(cell).toHaveCSS("--yellow-percentage", `${greenAndYellow}%`);
}

/** The rows of 当てはまる授業 after picking `cellId`. */
async function coursesOfCell(page: Page, cellId: string) {
  await page.getByTestId(`cell-${cellId}`).click();
  return page.locator("#left-bar tr.course");
}

function unclassified(page: Page) {
  return page.locator("details", { hasText: "卒業単位に含まれない授業" });
}

test("importing grades colors the cells and keeps failed courses", async ({
  page,
}) => {
  await importGrades(page, GRADES);
  await expectImported(page);
  await expectCell(page, "a1", 50, 50);
  await expectCell(page, "c1", 0, 100);
  const rows = await coursesOfCell(page, "b2");
  await expect(rows.filter({ hasText: "GB27001" })).toContainText("落単済み");
});

test("imported grades survive a reload", async ({ page }) => {
  await importGrades(page, GRADES);
  await page.reload();
  await openTab(page, "単位チェック");
  await expectImported(page);
  await expectCell(page, "a1", 50, 50);
});

test("re-importing keeps courses moved by hand", async ({ page }) => {
  await importGrades(page, GRADES);
  await dragToMightTake(page, "b1", "GB20401");

  // Without the 認 row, to tell when the new file is in
  await importGrades(page, gradesFile(ROWS.filter((r) => r.grade !== "認")));
  await expect(dropZone(page)).toContainText(
    `インポート済み（${PASSED_CREDITS - 2}単位）`,
  );
  await expect(
    (await coursesOfCell(page, "b1")).filter({ hasText: "GB20401" }),
  ).toHaveCount(0);
});

test("dropping a file on the drop zone imports it", async ({ page }) => {
  const dataTransfer = await page.evaluateHandle(
    ({ name, mimeType, csv }) => {
      const dt = new DataTransfer();
      dt.items.add(new File([csv], name, { type: mimeType }));
      return dt;
    },
    {
      name: GRADES.name,
      mimeType: GRADES.mimeType,
      csv: GRADES.buffer.toString(),
    },
  );
  await dropZone(page).dispatchEvent("drop", { dataTransfer });
  await expectImported(page);
});

test("a broken file shows an alert and keeps the imported grades", async ({
  page,
}) => {
  await importGrades(page, GRADES);
  const dialog = new Promise<string>((resolve) => {
    page.once("dialog", (d) => {
      resolve(d.type());
      void d.dismiss();
    });
  });
  await page.locator(".csv-input").setInputFiles({
    ...GRADES,
    buffer: Buffer.from("not,grades\n1,2\n"),
  });
  expect(await dialog).toBe("alert");
  await expectImported(page);
});

test("courses that fit no cell are listed", async ({ page }) => {
  await importGrades(page, GRADES);
  await unclassified(page).locator("summary").click();
  await expect(unclassified(page).locator("tbody tr")).toHaveCount(2);
  await expect(unclassified(page)).toContainText("FF18724");
  await expect(unclassified(page)).toContainText("編入前の単位");
});

test("the 移行 answer is saved and changes the classification", async ({
  page,
}) => {
  await importGrades(page, GRADES);
  // The radio itself is hidden behind its label
  await page
    .locator("#student-type")
    .getByText("はい", { exact: true })
    .click();
  await expectCell(page, "c1", 100, 100);
  await unclassified(page).locator("summary").click();
  await expect(unclassified(page)).not.toContainText("FF18724");

  await page.reload();
  await openTab(page, "単位チェック");
  await expect(page.getByRole("radio", { name: "はい" })).toBeChecked();
  await expectCell(page, "c1", 100, 100);
});

test("手順を見る opens the TWINS grades guide", async ({ page }) => {
  const popup = page.waitForEvent("popup");
  await page
    .locator('[data-tutorial="import-tab"]')
    .getByRole("link", { name: "手順を見る" })
    .click();
  await expect(await popup).toHaveURL(/\/twins-grades$/);
});
