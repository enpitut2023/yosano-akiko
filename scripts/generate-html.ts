#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type Instance = { directory: string; title: string };

function main(): void {
  const instances: Instance[] = [
    // 2021
    {
      directory: "public/2021/coins",
      title: "あきこ（情報科学類 2021年度生）",
    },
    {
      directory: "public/2021/mast",
      title: "あきこ（情報メディア創成学類 2021年度生）",
    },

    // 2022
    {
      directory: "public/2022/coins",
      title: "あきこ（情報科学類 2022年度生）",
    },

    // 2023
    {
      directory: "public/2023/coins",
      title: "あきこ（情報科学類 2023年度生）",
    },
    {
      directory: "public/2023/klis-science",
      title: "あきこ（知識情報・図書館学類 知識科学専攻 2023年度生）",
    },
    {
      directory: "public/2023/klis-system",
      title: "あきこ（知識情報・図書館学類 知識情報システム 2023年度生）",
    },
    {
      directory: "public/2023/mast",
      title: "あきこ（情報メディア創成学類 2023年度生）",
    },

    // 2024
    {
      directory: "public/2024/coins",
      title: "あきこ（情報科学類 2024年度生）",
    },

    // 2025
    {
      directory: "public/2025/coins",
      title: "あきこ（情報科学類 2025年度生）",
    },
  ];

  const template = readFileSync("scripts/index-template.html", {
    encoding: "utf8",
  });
  for (const instance of instances) {
    const filename = path.join(instance.directory, "index.html");
    console.log(`Generating ${filename}`);
    const content = template.replaceAll("!!title!!", instance.title);
    writeFileSync(filename, content, {
      encoding: "utf8",
    });
  }
}

main();
