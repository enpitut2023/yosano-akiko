#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from "node:fs";
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

function replaceDimensions(
  svg: string,
  width: number,
  height: number,
): string | undefined {
  const WIDTH_PATTERN = /width=".*?pt"/;
  const HEIGHT_PATTERN = /height=".*?pt"/;
  if (!WIDTH_PATTERN.test(svg) || !HEIGHT_PATTERN.test(svg)) {
    return undefined;
  }
  return svg
    .replace(WIDTH_PATTERN, `width="${width}"`)
    .replace(HEIGHT_PATTERN, `height="${height}"`);
}

const WIDTH = 2048;

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
    if (viewBox.left !== 0 || viewBox.top !== 0) {
      console.error(`Unexpected view box:`, viewBox);
      continue;
    }
    const newWidth = WIDTH;
    const newHeight = Math.round((WIDTH / viewBox.right) * viewBox.bottom);
    const newSvg = replaceDimensions(svg, newWidth, newHeight);
    if (newSvg === undefined) {
      let head = svg;
      if (head.length > 100) {
        head = head.substring(0, 99);
        head += "...";
      }
      console.log(`Failed to replace dimensions: ${head}`);
      continue;
    }
    console.log(`New dimensions: ${newWidth}, ${newHeight}`);
    writeFileSync(filename, newSvg, { encoding: "utf8" });
  }
}

main();
