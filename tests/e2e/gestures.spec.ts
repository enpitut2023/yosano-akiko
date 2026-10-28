// Panning and zooming the table, and resizing the sidebar and the timetable.
// Each test's page is the default 1280×720 viewport, where the table is larger
// than its view.
import { SEEN_KEYS } from "../../src/routes/[tableYear]/[major]/seen";
import { clickUntil, expect, test, waitForHydration, type Page } from "./test";

test.beforeEach(async ({ page }) => {
  await page.goto("2023/coins");
});

function view(page: Page) {
  return page.locator("#requirements");
}

function scroll(page: Page) {
  return view(page).evaluate((el) => ({ x: el.scrollLeft, y: el.scrollTop }));
}

async function center(page: Page, selector: string) {
  const box = await page.locator(selector).boundingBox();
  if (box === null) throw new Error(`${selector} isn't visible`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Presses the left button at `from`, moves to `to` and releases it. */
async function drag(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 5 });
  await page.mouse.up();
}

async function tableWidth(page: Page) {
  return (await page.getByAltText("Table").boundingBox())?.width;
}

/**
 * Waits for the table to be `width` wide, give or take the fraction that the
 * img's width attribute drops.
 */
async function expectTableWidth(page: Page, width: number) {
  await expect.poll(() => tableWidth(page)).toBeCloseTo(width, -1);
}

/** Selects a cell, so the click that ends a pan has something to change. */
async function selectCell(page: Page, cellId: string) {
  const cell = page.getByTestId(`cell-${cellId}`);
  await clickUntil(cell, () =>
    expect(cell).toHaveClass(/selected/, { timeout: 100 }),
  );
}

test.describe("panning", () => {
  test("dragging the table pans it", async ({ page }) => {
    await selectCell(page, "a1");
    const from = await center(page, '[data-testid="cell-b1"]');
    await drag(page, from, { x: from.x - 100, y: from.y - 50 });
    expect(await scroll(page)).toEqual({ x: 100, y: 50 });
    // The click that ends the pan reaches neither the cell nor the table
    await expect(page.getByTestId("cell-a1")).toHaveClass(/selected/);
    await expect(page.getByTestId("cell-b1")).not.toHaveClass(/selected/);
  });

  test("a click that moves a little still selects a cell", async ({ page }) => {
    await selectCell(page, "a1");
    const from = await center(page, '[data-testid="cell-b1"]');
    await drag(page, from, { x: from.x + 3, y: from.y });
    expect(await scroll(page)).toEqual({ x: 0, y: 0 });
    await expect(page.getByTestId("cell-b1")).toHaveClass(/selected/);
  });

  test("dragging the title doesn't pan", async ({ page }) => {
    await selectCell(page, "a1");
    const from = await center(page, "#title > span");
    await drag(page, from, { x: from.x - 100, y: from.y });
    expect(await scroll(page)).toEqual({ x: 0, y: 0 });
  });

  test("the column credit sums follow the table", async ({ page }) => {
    const sum = page.locator("#column-credit-sums > div").first();
    const before = await sum.boundingBox();
    await selectCell(page, "a1");
    const from = await center(page, '[data-testid="cell-b1"]');
    await drag(page, from, { x: from.x - 100, y: from.y });
    await expect
      .poll(async () => (await sum.boundingBox())?.x)
      .toBe((before?.x ?? 0) - 100);
  });
});

test.describe("the pan hint", () => {
  test.use({ seen: false });
  test.beforeEach(async ({ page }) => {
    // Only the hint is new; the tutorial would cover the table
    await page.evaluate(
      (key) => localStorage.setItem(key, "1"),
      SEEN_KEYS.tutorial,
    );
    await page.reload();
  });

  test("shows until the first pan", async ({ page }) => {
    const hint = page.locator("#pan-hint");
    await expect(hint).toBeVisible();
    await page.getByTestId("cell-b1").click();
    await expect(hint).toBeVisible();

    const from = await center(page, '[data-testid="cell-b1"]');
    await drag(page, from, { x: from.x - 100, y: from.y });
    await expect(hint).toBeHidden();
    await page.reload();
    await waitForHydration(page);
    await expect(hint).toBeHidden();
  });
});

test.describe("zooming", () => {
  // 2048px wide at 100%, and the page starts at 70%
  const DEFAULT_WIDTH = 2048 * 0.7;
  const MIN_WIDTH = 2048 * 0.4;
  const MAX_WIDTH = 2048 * 2;

  test.beforeEach(async ({ page }) => {
    await waitForHydration(page);
  });

  async function ctrlWheel(page: Page, deltaY: number) {
    await page.keyboard.down("Control");
    await page.mouse.wheel(0, deltaY);
    await page.keyboard.up("Control");
  }

  test("Ctrl+wheel zooms around the pointer", async ({ page }) => {
    await view(page).evaluate((el) => el.scrollTo(200, 100));
    const box = await view(page).boundingBox();
    // The pointer's position in the view
    const offset = { x: 300, y: 200 };
    await page.mouse.move((box?.x ?? 0) + offset.x, (box?.y ?? 0) + offset.y);
    // Which point of the table is under the pointer, from 0 to 1
    const underPointer = () =>
      view(page).evaluate(
        (el, p) => ({
          x: (el.scrollLeft + p.x) / el.scrollWidth,
          y: (el.scrollTop + p.y) / el.scrollHeight,
        }),
        offset,
      );
    const before = await underPointer();

    await ctrlWheel(page, -50);
    await expectTableWidth(page, DEFAULT_WIDTH * Math.exp(0.5));
    const after = await underPointer();
    expect(after.x).toBeCloseTo(before.x, 2);
    expect(after.y).toBeCloseTo(before.y, 2);
  });

  test("Ctrl+wheel stops at the limits", async ({ page }) => {
    const { x, y } = await center(page, "#requirements");
    await page.mouse.move(x, y);
    await ctrlWheel(page, -500);
    await expectTableWidth(page, MAX_WIDTH);
    await ctrlWheel(page, 1000);
    await expectTableWidth(page, MIN_WIDTH);
  });

  test("the wheel alone scrolls", async ({ page }) => {
    const { x, y } = await center(page, "#requirements");
    await page.mouse.move(x, y);
    await page.mouse.wheel(0, 100);
    await expect.poll(async () => (await scroll(page)).y).toBe(100);
    await expectTableWidth(page, DEFAULT_WIDTH);
  });

  test("the slider zooms, and follows Ctrl+wheel", async ({ page }) => {
    const slider = page.locator("#zoom-control input");
    const cell = page.getByTestId("cell-a1");
    const atDefault = (await cell.boundingBox())?.width ?? 0;
    await slider.fill("0");
    await expectTableWidth(page, MIN_WIDTH);
    // The cells scale with the table
    await expect
      .poll(async () => (await cell.boundingBox())?.width)
      .toBeCloseTo(atDefault * (MIN_WIDTH / DEFAULT_WIDTH), 0);
    await slider.fill("1");
    await expectTableWidth(page, DEFAULT_WIDTH);

    const { x, y } = await center(page, "#requirements");
    await page.mouse.move(x, y);
    await ctrlWheel(page, -500);
    await expect
      .poll(() => slider.evaluate((el: HTMLInputElement) => el.valueAsNumber))
      .toBeCloseTo(Number(await slider.getAttribute("max")), 1);
  });

  test("the column credit sums fit when zoomed out", async ({ page }) => {
    await page.locator("#zoom-control input").fill("0");
    await expectTableWidth(page, MIN_WIDTH);
    const overflowing = () =>
      page.locator("#column-credit-sums > div > span").evaluateAll((spans) =>
        spans
          .filter((span) => {
            const parent = span.parentElement?.getBoundingClientRect();
            const rect = span.getBoundingClientRect();
            return (
              parent !== undefined &&
              (rect.left < parent.left || rect.right > parent.right)
            );
          })
          .map((span) => span.textContent),
      );
    await expect.poll(overflowing).toEqual([]);
  });
});

test.describe("the sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await waitForHydration(page);
  });

  async function dragHandleTo(page: Page, x: number) {
    const from = await center(page, "#sidebar-resize-handle");
    await drag(page, from, { x, y: from.y });
  }

  async function sidebarWidth(page: Page) {
    return (await page.locator("#sidebar").boundingBox())?.width;
  }

  test("the handle resizes it, in steps of 5px", async ({ page }) => {
    await dragHandleTo(page, 702);
    expect(await sidebarWidth(page)).toBe(580);
  });

  test("the handle stops at the limits", async ({ page }) => {
    await dragHandleTo(page, 1000);
    expect(await sidebarWidth(page)).toBe(500);
    // Leaves 100px of the table
    await dragHandleTo(page, 10);
    expect(await sidebarWidth(page)).toBe(1180);
  });

  test("the toggle hides and shows it", async ({ page }) => {
    const toggle = page.locator("#bars-toggle");
    const sidebar = page.locator("#sidebar");
    await toggle.click();
    await expect(sidebar).toBeHidden();
    await expect(page.locator("#sidebar-resize-handle")).toHaveCount(0);
    expect(await view(page).boundingBox()).toMatchObject({ width: 1280 });
    await toggle.click();
    await expect(sidebar).toBeVisible();
  });

  test("selecting a cell shows it", async ({ page }) => {
    await page.locator("#bars-toggle").click();
    await page.getByTestId("cell-a1").click();
    await expect(page.locator("#sidebar")).toBeVisible();
  });
});

test.describe("the timetable", () => {
  test.beforeEach(async ({ page }) => {
    await waitForHydration(page);
  });

  function timetableHeight(page: Page) {
    return page
      .locator("#right-bar > :first-child")
      .evaluate((el) => el.getBoundingClientRect().height);
  }

  async function dragHandleBy(page: Page, dy: number) {
    const from = await center(page, "#timetable-resize-handle");
    await drag(page, from, { x: from.x, y: from.y + dy });
  }

  test("the handle resizes it within its limits", async ({ page }) => {
    expect(await timetableHeight(page)).toBe(400);
    await dragHandleBy(page, -102);
    expect(await timetableHeight(page)).toBe(300);
    await dragHandleBy(page, -1000);
    expect(await timetableHeight(page)).toBe(100);
    // Leaves 100px below it
    await dragHandleBy(page, 1000);
    const top = await page
      .locator("#right-bar")
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(await timetableHeight(page)).toBe(720 - top - 100);
  });
});
