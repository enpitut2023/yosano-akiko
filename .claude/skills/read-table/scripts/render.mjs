// Renders a page's 履修要覧 table to PNG, plus a crop per cell or region.
//
// Usage: node render.mjs [--labels] OUT YEAR MAJOR [CELL_ID | x,y,w,h]...
//
// Run from the repo root. The table is drawn on white at the SVG's own
// width and height, the pixels that cell rects (static/rects/) and a region
// x,y,w,h are in.
// Crops are rendered at twice the resolution, so small text stays legible.
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const labels = args[0] === "--labels";
const [out, year, major, ...targets] = labels ? args.slice(1) : args;
if (!out || !year || !major) {
  console.error(
    "Usage: node render.mjs [--labels] OUT YEAR MAJOR [CELL_ID | x,y,w,h]...",
  );
  process.exit(2);
}

const svg = readFileSync(`static/tables/${year}/${major}.svg`, "utf8");
// Tables without a page, like biol's, have no rects
const rectsPath = `static/rects/${year}/${major}.json`;
const rects = existsSync(rectsPath)
  ? JSON.parse(readFileSync(rectsPath, "utf8"))
  : {};
const attr = (name) =>
  Number(new RegExp(`<svg[^>]*\\s${name}="([\\d.]+)"`).exec(svg)?.[1]);
const width = attr("width");
const height = attr("height");

// A little of the neighbors, so a cell's borders and merged neighbors show
const PAD = 8;

function cellClip(id) {
  const r = rects[id];
  if (!r) throw new Error(`No cell ${id} in ${rectsPath}`);
  const x = Math.max(0, r.x - PAD);
  const y = Math.max(0, r.y - PAD);
  return {
    x,
    y,
    width: Math.min(width - x, r.width + 2 * PAD),
    height: Math.min(height - y, r.height + 2 * PAD),
  };
}

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  await page.setContent(
    `<html><body style="margin:0;background:#fff">${svg}</body></html>`,
  );

  const name = `${year}-${major}`;
  const full = join(out, `${name}.png`);
  await page.screenshot({ path: full, scale: "css" });
  console.log(`${full} (${width}x${height})`);

  if (labels) {
    // After the full image and before the crops, so neither shows the labels
    await page.evaluate((rects) => {
      for (const [id, r] of Object.entries(rects)) {
        const box = document.createElement("div");
        box.style.cssText = `position:absolute;left:${r.x}px;top:${r.y}px;width:${r.width}px;height:${r.height}px;box-sizing:border-box;border:2px solid #e00;`;
        const tag = document.createElement("span");
        tag.textContent = id;
        tag.style.cssText =
          "position:absolute;left:0;top:0;padding:0 3px;background:#e00;color:#fff;font:bold 15px/1.2 sans-serif;";
        box.append(tag);
        document.body.append(box);
      }
    }, rects);
    const path = join(out, `${name}-labels.png`);
    await page.screenshot({ path, scale: "css" });
    console.log(path);
    await page.evaluate(() =>
      document.querySelectorAll("body > div").forEach((d) => d.remove()),
    );
  }

  for (const t of targets) {
    const region = /^[\d.]+(,[\d.]+){3}$/.test(t);
    const clip = region
      ? (([x, y, w, h]) => ({ x, y, width: w, height: h }))(
          t.split(",").map(Number),
        )
      : cellClip(t);
    const path = join(
      out,
      `${name}-${region ? t.replaceAll(",", "_") : t}.png`,
    );
    await page.screenshot({ path, clip, scale: "device" });
    const r = (n) => Math.round(n);
    console.log(
      `${path} (at ${r(clip.x)},${r(clip.y)} ${r(clip.width)}x${r(clip.height)} in the full image)`,
    );
  }
} finally {
  await browser.close();
}
