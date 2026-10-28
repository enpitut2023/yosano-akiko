import {
  COLLEGE_TO_JA,
  instances,
  MAJOR_TO_COLLEGE,
  type College,
} from "$lib/constants";
import { clickUntil, expect, test, type Page } from "./test";

// A year in which 情報科学類 has several majors and 心理学類 has one
const YEAR = 2023;

/** Picks the entry year, waiting for the page to hydrate first. */
async function pickYear(page: Page, year: number): Promise<void> {
  await page.goto("");
  await clickUntil(page.getByRole("button", { name: `${year}年度入学` }), () =>
    expect(page.getByText("学類はどこかしら？")).toBeVisible({
      timeout: 100,
    }),
  );
}

/** The choice buttons and links, by label without the ✅, mapped to whether they have one. */
async function choiceChecks(page: Page): Promise<Map<string, boolean>> {
  const texts = await page
    .locator(".choices:not(.years) .choice")
    .allTextContents();
  return new Map(
    texts.map((t) => [t.replace("✅", "").trim(), t.includes("✅")]),
  );
}

test("picking a year, a college and a major opens that major's page", async ({
  page,
}) => {
  await pickYear(page, YEAR);
  await page.getByRole("button", { name: /^情報科学類/ }).click();
  await page
    .getByRole("link", { name: /^ソフトウェアサイエンス主専攻/ })
    .click();
  await expect(page).toHaveURL(`/yosano-akiko/${YEAR}/coins`);
});

test("a college with one major links straight to its page", async ({
  page,
}) => {
  await pickYear(page, YEAR);
  await page.getByRole("link", { name: /^心理学類/ }).click();
  await expect(page).toHaveURL(`/yosano-akiko/${YEAR}/psy`);
});

test("✅ marks the colleges whose majors have all been checked", async ({
  page,
}) => {
  await pickYear(page, YEAR);

  const want = new Map<string, boolean>();
  const checkedByCollege = new Map<College, boolean>();
  for (const i of instances.filter((i) => i.tableYear === YEAR)) {
    const college = MAJOR_TO_COLLEGE[i.major];
    checkedByCollege.set(
      college,
      (checkedByCollege.get(college) ?? true) && i.checked === true,
    );
  }
  for (const [college, checked] of checkedByCollege) {
    want.set(COLLEGE_TO_JA[college], checked);
  }
  expect(await choiceChecks(page)).toEqual(want);
});
