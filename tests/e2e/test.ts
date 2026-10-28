import {
  test as base,
  expect,
  type Locator,
  type Page,
} from "@playwright/test";
import { SEEN_KEYS } from "../../src/routes/[tableYear]/[major]/seen";
import type { gradesFile } from "./fixtures/grades";

export { expect, type Page } from "@playwright/test";

/**
 * Playwright's `test`, with:
 * - requests to other origins answered with an empty response;
 * - the things shown on a first visit (the tutorial, the pan hint) already
 *   marked as seen. Tests of those use `test.use({ seen: false })`;
 * - a failure if the page logs an error or a hydration warning.
 */
export const test = base.extend<{ seen: boolean }>({
  seen: [true, { option: true }],
  context: async ({ context, baseURL }, use) => {
    // Keeps tests off the network, which also stops the production build's
    // Matomo tracker from reporting. An empty response rather than an aborted
    // request, because aborting logs a console error.
    const origin = new URL(baseURL ?? "").origin;
    await context.route(
      (url) => url.origin !== origin,
      (route) => route.fulfill({ body: "" }),
    );
    await use(context);
  },
  page: async ({ page, seen }, use) => {
    if (seen) {
      await page.addInitScript((keys) => {
        for (const key of keys) localStorage.setItem(key, "1");
      }, Object.values(SEEN_KEYS));
    }
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" || /hydrat/i.test(m.text())) {
        errors.push(m.text());
      }
    });
    await use(page);
    expect(errors, "errors logged by the page").toEqual([]);
  },
});

/** Opens a sidebar tab of a major page, waiting for the page to hydrate. */
export async function openTab(page: Page, name: string): Promise<void> {
  const tab = page.getByRole("button", { name, exact: true });
  await clickUntil(tab, () =>
    expect(tab).toHaveClass(/active/, { timeout: 100 }),
  );
}

/** Imports a grades file on the 単位チェック tab. */
export async function importGrades(
  page: Page,
  file: ReturnType<typeof gradesFile>,
): Promise<void> {
  await openTab(page, "単位チェック");
  await page.locator(".csv-input").setInputFiles(file);
  await expect(page.locator("#csv-drop-zone")).toContainText("インポート済み");
}

/**
 * The IDs listed in 当てはまる授業 (or 全ての授業). Like the other lists, it only
 * shows the selected cell's courses, or every course when none is selected.
 */
export function wontTakeIds(page: Page): Locator {
  return page.locator("#left-bar tbody .course-id");
}

/** The IDs listed in 取る授業. */
export function mightTakeIds(page: Page): Locator {
  return rightBarSection(page, "取る授業").locator("tbody .course-id");
}

/** The IDs listed in 単位取得済みの授業. */
export function takenIds(page: Page): Locator {
  return rightBarSection(page, "単位取得済みの授業").locator(
    "tbody .course-id",
  );
}

function rightBarSection(page: Page, heading: string): Locator {
  return page.locator("#right-bar .section", {
    has: page.getByRole("heading", { name: heading, exact: true }),
  });
}

/** Adds a course to 取る授業 by dragging it out of its cell's 当てはまる授業. */
export async function dragToMightTake(
  page: Page,
  cellId: string,
  courseId: string,
): Promise<void> {
  await page.getByTestId(`cell-${cellId}`).click();
  const row = page.locator("#left-bar tr.course", { hasText: courseId });
  await row.dragTo(page.locator("#right-bar"));
  await expect(row).toHaveCount(0);
}

/** Clicks the table's left margin, which no cell covers. */
export async function deselectCell(page: Page): Promise<void> {
  await page.getByAltText("Table").click({ position: { x: 10, y: 300 } });
}

/** Moves a course out of 取る授業 by dragging it to the left. */
export async function dragToWontTake(
  page: Page,
  courseId: string,
): Promise<void> {
  const row = rightBarSection(page, "取る授業").locator("tr.course", {
    hasText: courseId,
  });
  await row.dragTo(page.locator("#left-bar"));
  await expect(row).toHaveCount(0);
}

/**
 * Waits until the page has likely hydrated, for checks that would pass
 * vacuously on the prerendered HTML: that something doesn't appear, or that
 * the page logs no errors. Pages with a button can use `clickUntil` instead.
 */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
}

/**
 * Clicks `target` until `check` passes. Pages are prerendered, so a click
 * before hydration does nothing.
 */
export async function clickUntil(
  target: Locator,
  check: () => Promise<void>,
): Promise<void> {
  await expect(async () => {
    await target.click();
    await check();
  }).toPass();
}
