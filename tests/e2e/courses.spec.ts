import { dragToMightTake, expect, openTab, test, type Page } from "./test";

// Every available course in the fixture catalog; GB41001 isn't offered
const ALL = [
  "GA15211",
  "GB13322",
  "GB20401",
  "GB26403",
  "GB27001",
  "GB31801",
  "GB40111",
];

test.beforeEach(async ({ page }) => {
  await page.goto("2023/coins");
  await openTab(page, "履修を組む");
});

/** The IDs listed in 当てはまる授業 (or 全ての授業). */
function wontTake(page: Page) {
  return page.locator("#left-bar tbody .course-id");
}

/** The IDs listed in 取る授業. */
function mightTake(page: Page) {
  return page.locator("#right-bar tbody .course-id");
}

function timetableTerm(page: Page, name: string) {
  return page.locator(".term-tabs").getByRole("button", { name, exact: true });
}

function timetableBar(page: Page, courseId: string) {
  return page.locator(".bar-inner", { hasText: courseId });
}

function filterSelect(page: Page, anyOption: string) {
  return page
    .locator("#filter-bar select")
    .filter({ has: page.locator("option", { hasText: anyOption }) });
}

async function openFilters(page: Page): Promise<void> {
  await page.getByRole("button", { name: "絞り込み条件" }).click();
}

test("clicking a cell selects it and lists its courses", async ({ page }) => {
  await page.getByTestId("cell-b2").click();
  await expect(page.getByTestId("cell-b2")).toHaveClass(/selected/);
  await expect(page.locator("#left-bar h2").first()).toContainText(
    "当てはまる授業",
  );
  await expect(wontTake(page)).toHaveText(["GB13322", "GB27001", "GB31801"]);
});

test("clicking the table background deselects the cell", async ({ page }) => {
  await page.getByTestId("cell-b2").click();
  // The table's left margin, which no cell covers
  await page.getByAltText("Table").click({ position: { x: 10, y: 300 } });
  await expect(page.getByTestId("cell-b2")).not.toHaveClass(/selected/);
  await expect(wontTake(page)).toHaveCount(0);
});

test("全ての授業を見る lists every course", async ({ page }) => {
  await page
    .getByRole("button", { name: `全ての授業を見る（${ALL.length}件）` })
    .click();
  await expect(wontTake(page)).toHaveText(ALL);
});

test("searching matches course IDs and names", async ({ page }) => {
  const search = page.getByPlaceholder("科目番号もしくは科目名");
  await search.fill("gb2");
  await expect(wontTake(page)).toHaveText(["GB20401", "GB26403", "GB27001"]);
  await search.fill("データベース");
  await expect(wontTake(page)).toHaveText(["GB31801"]);
});

test.describe("filters", () => {
  test.beforeEach(async ({ page }) => {
    await openFilters(page);
  });

  test("by credits", async ({ page }) => {
    await filterSelect(page, "全単位").selectOption({ label: "1単位" });
    await expect(wontTake(page)).toHaveText(["GB27001"]);
  });

  test("by expected year", async ({ page }) => {
    await filterSelect(page, "全年次").selectOption({ label: "1年次" });
    await expect(wontTake(page)).toHaveText(["GA15211", "GB13322"]);
  });

  test("by term", async ({ page }) => {
    await filterSelect(page, "全学期").selectOption({ label: "秋C" });
    await expect(wontTake(page)).toHaveText(["GB27001"]);
  });

  test("by day of week", async ({ page }) => {
    await page
      .getByRole("group", { name: "曜日で絞り込む" })
      .getByText("火")
      .click();
    await expect(wontTake(page)).toHaveText(["GA15211", "GB40111"]);
  });

  test("by free time slots", async ({ page }) => {
    await dragToMightTake(page, "b1", "GB20401");
    await page.getByTestId("cell-b2").click();
    await page.getByLabel("空きコマのみ表示").check();
    // GB31801 is on 月1 in 春AB, like GB20401
    await expect(wontTake(page)).toHaveText(["GB13322", "GB27001"]);
  });

  test("the badge counts the active filters", async ({ page }) => {
    const badge = page.locator(".filter-badge");
    await expect(badge).toBeHidden();
    await filterSelect(page, "全単位").selectOption({ label: "2単位" });
    const dows = page.getByRole("group", { name: "曜日で絞り込む" });
    await dows.getByText("月").click();
    await dows.getByText("火").click();
    await expect(badge).toHaveText("3");
  });
});

test("dragging a course adds it to 取る授業 and the timetable", async ({
  page,
}) => {
  await timetableTerm(page, "秋A").click();
  await dragToMightTake(page, "b1", "GB20401");
  await expect(mightTake(page)).toHaveText(["GB20401"]);
  // The timetable switches to the course's first term
  await expect(timetableTerm(page, "春A")).toHaveClass(/active/);
  await expect(timetableBar(page, "GB20401")).toBeVisible();

  await timetableTerm(page, "秋A").click();
  await expect(timetableBar(page, "GB20401")).toBeHidden();
});

test("a course without a fixed time slot is under その他", async ({ page }) => {
  await dragToMightTake(page, "b2", "GB13322");
  await expect(timetableTerm(page, "その他")).toHaveClass(/active/);
  await expect(page.locator(".other-tab")).toContainText("GB13322");
});

test("dragging a course back removes it from 取る授業", async ({ page }) => {
  await dragToMightTake(page, "b1", "GB20401");
  await page
    .locator("#right-bar tr.course", { hasText: "GB20401" })
    .dragTo(page.locator("#left-bar"));
  await expect(mightTake(page)).toHaveCount(0);
  await expect(wontTake(page)).toContainText(["GB20401"]);
  await expect(timetableBar(page, "GB20401")).toBeHidden();
});

test("該当マスを表示 selects the course's cell and scrolls to it", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: `全ての授業を見る（${ALL.length}件）` })
    .click();
  const cell = page.getByTestId("cell-b2");
  await page.locator("#requirements").evaluate((el) => {
    el.scrollLeft = el.scrollWidth;
    el.scrollTop = el.scrollHeight;
  });
  await expect(cell).not.toBeInViewport();

  await page
    .locator("#left-bar tr.course", { hasText: "GB31801" })
    .getByRole("button", { name: "該当マスを表示" })
    .click();
  await expect(cell).toHaveClass(/selected/);
  await expect(cell).toBeInViewport();
});

test("a course name links to its syllabus", async ({ page }) => {
  await page.getByTestId("cell-b1").click();
  const link = page.getByRole("link", { name: "オートマトンと形式言語" });
  await expect(link).toHaveAttribute(
    "href",
    "https://kdb.tsukuba.ac.jp/syllabi/2026/GB20401/jpn",
  );
  await expect(link).toHaveAttribute("target", "_blank");
});

test("courses moved by hand stay moved after a reload", async ({ page }) => {
  await dragToMightTake(page, "b1", "GB20401");
  await page.reload();
  await openTab(page, "履修を組む");
  await expect(mightTake(page)).toHaveText(["GB20401"]);
});
