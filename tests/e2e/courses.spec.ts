import { knownCourseYear } from "./fixtures/courses";
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
  timetableBar,
  timetableTerm,
  wontTakeIds,
  type Page,
} from "./test";

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
  await expect(wontTakeIds(page)).toHaveText(["GB13322", "GB27001", "GB31801"]);
});

test("clicking the table background deselects the cell", async ({ page }) => {
  await page.getByTestId("cell-b2").click();
  await deselectCell(page);
  await expect(page.getByTestId("cell-b2")).not.toHaveClass(/selected/);
  await expect(wontTakeIds(page)).toHaveCount(0);
});

test("全ての授業を見る lists every course", async ({ page }) => {
  await page
    .getByRole("button", { name: `全ての授業を見る（${ALL.length}件）` })
    .click();
  await expect(wontTakeIds(page)).toHaveText(ALL);
});

test("searching matches course IDs and names", async ({ page }) => {
  const search = page.getByPlaceholder("科目番号もしくは科目名");
  await search.fill("gb2");
  await expect(wontTakeIds(page)).toHaveText(["GB20401", "GB26403", "GB27001"]);
  await search.fill("データベース");
  await expect(wontTakeIds(page)).toHaveText(["GB31801"]);
});

test.describe("filters", () => {
  test.beforeEach(async ({ page }) => {
    await openFilters(page);
  });

  test("by credits", async ({ page }) => {
    await filterSelect(page, "全単位").selectOption({ label: "1単位" });
    await expect(wontTakeIds(page)).toHaveText(["GB27001"]);
  });

  test("by expected year", async ({ page }) => {
    await filterSelect(page, "全年次").selectOption({ label: "1年次" });
    await expect(wontTakeIds(page)).toHaveText(["GA15211", "GB13322"]);
  });

  test("by term", async ({ page }) => {
    await filterSelect(page, "全学期").selectOption({ label: "秋C" });
    await expect(wontTakeIds(page)).toHaveText(["GB27001"]);
  });

  test("by day of week", async ({ page }) => {
    await page
      .getByRole("group", { name: "曜日で絞り込む" })
      .getByText("火")
      .click();
    await expect(wontTakeIds(page)).toHaveText(["GA15211", "GB40111"]);
  });

  test("by free time slots", async ({ page }) => {
    await dragToMightTake(page, "b1", "GB20401");
    await page.getByTestId("cell-b2").click();
    await page.getByLabel("空きコマのみ表示").check();
    // GB31801 is on 月1 in 春AB, like GB20401
    await expect(wontTakeIds(page)).toHaveText(["GB13322", "GB27001"]);
  });

  test("a choice no longer on offer stops applying until it is again", async ({
    page,
  }) => {
    const credit = filterSelect(page, "全単位");
    const badge = page.locator(".filter-badge");
    await page.getByTestId("cell-b2").click();
    await credit.selectOption({ label: "1単位" });
    await expect(wontTakeIds(page)).toHaveText(["GB27001"]);

    // b1 has no 1単位 course
    await page.getByTestId("cell-b1").click();
    await expect(credit).toHaveValue("");
    await expect(badge).toBeHidden();
    await expect(wontTakeIds(page)).toContainText(["GB20401"]);

    await page.getByTestId("cell-b2").click();
    await expect(credit).toHaveValue("1");
    await expect(badge).toHaveText("1");
    await expect(wontTakeIds(page)).toHaveText(["GB27001"]);
  });

  test("今年度開講しない授業も表示 shows courses not offered this year", async ({
    page,
  }) => {
    const show = page.getByLabel("今年度開講しない授業も表示");
    await page.getByTestId("cell-b2").click();
    await expect(wontTakeIds(page)).toHaveText([
      "GB13322",
      "GB27001",
      "GB31801",
    ]);

    await show.check();
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
    await show.uncheck();
    await deselectCell(page);
    await expect(mightTakeIds(page)).toHaveText(["GB41001"]);
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
  await expect(mightTakeIds(page)).toHaveText(["GB20401"]);
  // The timetable switches to the course's first term
  await expect(timetableTerm(page, "春A")).toHaveClass(/active/);
  await expect(timetableBar(page, "GB20401")).toBeVisible();

  await timetableTerm(page, "秋A").click();
  await expect(timetableBar(page, "GB20401")).toBeHidden();
});

test.describe("the timetable's year", () => {
  // Both on 春A, like GB31801
  const passedThisYear = {
    id: "GB26403",
    name: "ソフトウェアサイエンス実験A",
    credit: 3,
    grade: "A",
    year: knownCourseYear,
  } satisfies GradeRow;
  const passedLastYear = {
    id: "GB20401",
    name: "オートマトンと形式言語",
    credit: 2,
    grade: "A",
    year: knownCourseYear - 1,
  } satisfies GradeRow;

  function yearPicker(page: Page) {
    return page.getByLabel("時間割の年度");
  }

  test("can't be picked without grades from another year", async ({ page }) => {
    await expect(yearPicker(page)).toHaveCount(0);
    await importGrades(page, gradesFile([passedThisYear]));
    await openTab(page, "履修を組む");
    await expect(yearPicker(page)).toHaveCount(0);
  });

  test("another year shows only what was passed then", async ({ page }) => {
    await importGrades(page, gradesFile([passedThisYear, passedLastYear]));
    await openTab(page, "履修を組む");
    await dragToMightTake(page, "b2", "GB31801");
    await expect(timetableBar(page, passedThisYear.id)).not.toHaveCount(0);
    await expect(timetableBar(page, passedLastYear.id)).toHaveCount(0);
    await expect(timetableBar(page, "GB31801")).not.toHaveCount(0);

    await yearPicker(page).selectOption(String(knownCourseYear - 1));
    await expect(timetableBar(page, passedThisYear.id)).toHaveCount(0);
    await expect(timetableBar(page, passedLastYear.id)).not.toHaveCount(0);
    await expect(timetableBar(page, "GB31801")).toHaveCount(0);

    await page.getByRole("button", { name: "今年度に戻る" }).click();
    await expect(yearPicker(page)).toHaveValue(String(knownCourseYear));
    await expect(timetableBar(page, "GB31801")).not.toHaveCount(0);
  });

  test("planning a course goes back to this year", async ({ page }) => {
    await importGrades(page, gradesFile([passedThisYear, passedLastYear]));
    await openTab(page, "履修を組む");
    await yearPicker(page).selectOption(String(knownCourseYear - 1));
    await dragToMightTake(page, "b2", "GB31801");
    await expect(yearPicker(page)).toHaveValue(String(knownCourseYear));
    await expect(timetableBar(page, "GB31801")).not.toHaveCount(0);
  });
});

test("a course without a fixed time slot is under その他", async ({ page }) => {
  await dragToMightTake(page, "b2", "GB13322");
  await expect(timetableTerm(page, "その他")).toHaveClass(/active/);
  await expect(page.locator(".other-tab")).toContainText("GB13322");
});

test("dragging a course back removes it from 取る授業", async ({ page }) => {
  await dragToMightTake(page, "b1", "GB20401");
  await dragToWontTake(page, "GB20401");
  await expect(wontTakeIds(page)).toContainText(["GB20401"]);
  await expect(timetableBar(page, "GB20401")).toBeHidden();
});

test("dragging a course's bar out of the timetable removes it", async ({
  page,
}) => {
  await dragToMightTake(page, "b1", "GB20401");
  await timetableBar(page, "GB20401").dragTo(page.locator("#left-bar"));
  await expect(timetableBar(page, "GB20401")).toHaveCount(0);
  await deselectCell(page);
  await expect(mightTakeIds(page)).toHaveText([]);
});

test("clicking a course's bar selects its cell and scrolls to it", async ({
  page,
}) => {
  await dragToMightTake(page, "b1", "GB20401");
  await page.getByTestId("cell-a1").click();
  const cell = page.getByTestId("cell-b1");
  await page.locator("#requirements").evaluate((el) => {
    el.scrollLeft = el.scrollWidth;
    el.scrollTop = el.scrollHeight;
  });
  await expect(cell).not.toBeInViewport();

  await timetableBar(page, "GB20401").click();
  await expect(cell).toHaveClass(/selected/);
  await expect(cell).toBeInViewport();
});

test("dragging a course out of その他 removes it", async ({ page }) => {
  await dragToMightTake(page, "b2", "GB13322");
  const row = page.locator(".other-tab tr", { hasText: "GB13322" });
  await row.dragTo(page.locator("#left-bar"));
  await expect(row).toHaveCount(0);
  await deselectCell(page);
  await expect(mightTakeIds(page)).toHaveText([]);
});

test("a passed course can't be dragged out of the timetable", async ({
  page,
}) => {
  await importGrades(
    page,
    gradesFile([
      {
        id: "GB20401",
        name: "オートマトンと形式言語",
        credit: 2,
        grade: "A",
        year: knownCourseYear,
      },
      {
        id: "GB13322",
        name: "情報特別演習II",
        credit: 2,
        grade: "A",
        year: knownCourseYear,
      },
    ]),
  );
  await openTab(page, "履修を組む");
  await expect(timetableBar(page, "GB20401")).toHaveAttribute(
    "draggable",
    "false",
  );
  await timetableTerm(page, "その他").click();
  await expect(
    page.locator(".other-tab tr", { hasText: "GB13322" }),
  ).toHaveAttribute("draggable", "false");
  await deselectCell(page);
  await expect(takenIds(page)).toHaveText(["GB13322", "GB20401"]);
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

test("a passed course links to the syllabus of the year it was taken", async ({
  page,
}) => {
  await importGrades(
    page,
    gradesFile([
      {
        id: "GB26403",
        name: "ソフトウェアサイエンス実験A",
        credit: 3,
        grade: "A",
        year: 2023,
      },
      // Failed, so it would be taken under this year's syllabus
      {
        id: "GB27001",
        name: "ソフトウェア工学演習",
        credit: 1,
        grade: "D",
        year: 2024,
      },
    ]),
  );
  await openTab(page, "履修を組む");
  await page.getByTestId("cell-a1").click();
  // The year shows only when it isn't this year's
  await expect(
    page.getByRole("link", { name: "ソフトウェアサイエンス実験A (2023)" }),
  ).toHaveAttribute(
    "href",
    "https://kdb.tsukuba.ac.jp/syllabi/2023/GB26403/jpn",
  );
  await page.getByTestId("cell-b2").click();
  await expect(
    page.getByRole("link", { name: "ソフトウェア工学演習", exact: true }),
  ).toHaveAttribute(
    "href",
    `https://kdb.tsukuba.ac.jp/syllabi/${knownCourseYear}/GB27001/jpn`,
  );
});

test("courses moved by hand stay moved after a reload", async ({ page }) => {
  await dragToMightTake(page, "b1", "GB20401");
  await page.reload();
  await openTab(page, "履修を組む");
  await expect(mightTakeIds(page)).toHaveText(["GB20401"]);
});
