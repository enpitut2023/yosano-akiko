// Screenshots compared pixel for pixel across the SvelteKit 3 migration. Revert
// the commit that added this file to remove them all.
//
// With SHOTS=<dir> set, `shot` saves a screenshot under <dir>; otherwise it
// does nothing. compare-shots.py compares runs before and after the migration.
// Even with the Chromium flags in playwright.config.ts, a few screenshots (the
// tutorial's title, the timetable's year select) come out one of two ways, so
// each side is run several times and a screenshot passes if any of its
// variants match.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { test, type Page } from "@playwright/test";

const counts = new Map<string, number>();

export async function shot(page: Page, name: string): Promise<void> {
  const root = process.env.SHOTS;
  if (root === undefined || page.isClosed()) return;
  const info = test.info();
  const key = `${info.testId}-${info.retry}-${info.repeatEachIndex}`;
  const n = (counts.get(key) ?? 0) + 1;
  counts.set(key, n);

  // fonts.ready alone can resolve before a font has started loading
  await page.evaluate(async () => {
    await Promise.all([...document.fonts].map((f) => f.load()));
    await document.fonts.ready;
  });
  // Like toHaveScreenshot, wait until two screenshots in a row are the same
  let last = await take(page);
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(100);
    const next = await take(page);
    if (next.equals(last)) break;
    last = next;
  }

  const title = info.titlePath.slice(1).join(" › ");
  const dir = path.join(root, path.basename(info.file), sanitize(title));
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, `${String(n).padStart(2, "0")}-${sanitize(name)}.png`),
    last,
  );
}

function take(page: Page): Promise<Buffer> {
  return page.screenshot({
    fullPage: true,
    animations: "disabled",
    caret: "hide",
    // RequirementsTable squishes these to fit once, when it mounts, so their
    // scale depends on whether the web font had loaded by then
    style:
      "#column-credit-sums span, #overall-credit-sum span { transform: none !important; }",
  });
}

function sanitize(s: string): string {
  return s.replace(/[/\\:*?"<>|]/g, "_");
}
