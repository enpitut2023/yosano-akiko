#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { argv, exit } from "node:process";

function parseViewBox(
  s: string,
): { left: number; top: number; right: number; bottom: number } | undefined {
  const chunks = s.trim().replaceAll(/\s+/g, " ").split(" ");
  if (chunks.length !== 4) {
    return undefined;
  }
  const [leftString, topString, rightString, bottomString] = chunks;
  const left = parseFloat(leftString);
  const top = parseFloat(topString);
  const right = parseFloat(rightString);
  const bottom = parseFloat(bottomString);
  if (!isNaN(left) && !isNaN(top) && !isNaN(right) && !isNaN(bottom)) {
    return { left, top, right, bottom };
  }
}

function main(): void {
  if (argv.length <= 2) {
    console.error(`Usage: ${argv[1]} [table.svg ...]`);
    exit(1);
  }

  for (const filename of argv.slice(2)) {
    console.log(`Processing ${filename}`);
    const svg = readFileSync(filename, { encoding: "utf8" });
    const match = /viewBox="(.*?)"/.exec(svg);
    if (match === null) {
      console.error("View box not found");
      continue;
    }
    const [, viewBoxString] = match;
    const viewBox = parseViewBox(viewBoxString);
    if (viewBox === undefined) {
      console.error(`Invalid view box value: "${viewBoxString}"`);
      continue;
    }
    const rect = {
      x: viewBox.left,
      y: viewBox.top,
      width: viewBox.right - viewBox.left,
      height: viewBox.bottom - viewBox.top,
    };
    writeFileSync(
      join(dirname(filename), "table-view-box.json"),
      JSON.stringify(rect, undefined, 2),
      { encoding: "utf8" },
    );
  }
}

main();
