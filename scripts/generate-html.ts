#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

function unreachable(_: never): never {
  throw new Error("Should be unreachable");
}

type Major = "coins" | "mast" | "klis-science" | "klis-system";

function majorCompare(a: Major, b: Major): number {
  // TODO
  return 0;
}

function majorToString(m: Major): string {
  switch (m) {
    case "coins":
      return "情報科学類";
    case "mast":
      return "情報メディア創成学類";
    case "klis-science":
      return "知識情報・図書館学類 知識科学専攻";
    case "klis-system":
      return "知識情報・図書館学類 知識情報システム";
    default:
      unreachable(m);
  }
}

type Instance = { year: number; major: Major };

function fillInPlaceholders(template: string, i: Instance): string {
  const title = `あきこ（${majorToString(i.major)} ${i.year}年度生）`;
  template = template.replaceAll("!!title!!", title);
  template = template.replaceAll("!!year!!", i.year.toString());
  template = template.replaceAll("!!major!!", majorToString(i.major));
  return template;
}

function createNavigationLinks(is: Instance[]): string {
  const yearToMajors = new Map<number, Major[]>();
  for (const i of is) {
    const majors = yearToMajors.get(i.year);
    if (majors === undefined) {
      yearToMajors.set(i.year, [i.major]);
    } else {
      majors.push(i.major);
    }
  }

  const years = Array.from(yearToMajors.keys());
  years.sort((a, b) => b - a);

  let result = "";
  for (const year of years) {
    result += `<section><h3>${year}年度入学</h3><ul>`;
    for (const major of yearToMajors.get(year) ?? []) {
      result += `<li><a href="${year}/${major}">${majorToString(major)}</a></li>`;
    }
    result += "</ul></section>";
  }

  return result;
}

function main(): void {
  const instances: Instance[] = [
    { year: 2021, major: "coins" },
    { year: 2021, major: "mast" },

    { year: 2022, major: "coins" },

    { year: 2023, major: "coins" },
    { year: 2023, major: "klis-science" },
    { year: 2023, major: "klis-system" },
    { year: 2023, major: "mast" },

    { year: 2024, major: "coins" },

    { year: 2025, major: "coins" },
  ];

  const template = readFileSync(path.join(__dirname, "template-index.html"), {
    encoding: "utf8",
  });
  const appTemplate = readFileSync(
    path.join(__dirname, "template-app-index.html"),
    { encoding: "utf8" },
  );

  console.log("Generating public/index.html");
  writeFileSync(
    path.join("public", "index.html"),
    template.replaceAll("!!links!!", createNavigationLinks(instances)),
    { encoding: "utf8" },
  );

  for (const instance of instances) {
    const filename = path.join(
      "public",
      instance.year.toString(),
      instance.major,
      "index.html",
    );
    console.log(`Generating ${filename}`);
    const content = fillInPlaceholders(appTemplate, instance);
    writeFileSync(filename, content, {
      encoding: "utf8",
    });
  }
}

main();
