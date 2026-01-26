import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path, { dirname } from "node:path";

function unreachable(_: never): never {
  throw new Error("Should be unreachable");
}

function fillInDescription(template: string, description: string): string {
  return template.replaceAll("!!description!!", description);
}

type Major =
  | "coins"
  | "mast"
  | "klis-science"
  | "klis-system"
  | "pops-economics"
  | "pops-management"
  | "pops-city-planning"
  | "esys-intelligence"
  | "esys-mechanics"
  | "math"
  | "physics"
  | "nichinichi"
  | "nichinichi-japan-expert";

// TODO
// function majorCompare(a: Major, b: Major): number {
//   return 0;
// }

function majorToString(m: Major): string {
  switch (m) {
    case "coins":
      return "情報科学類";
    case "mast":
      return "情報メディア創成学類";
    case "klis-science":
      return "知識情報・図書館学類 知識科学専攻";
    case "klis-system":
      return "知識情報・図書館学類 知識情報システム専攻";
    case "pops-economics":
      return "社会工学類 社会経済システム専攻";
    case "pops-management":
      return "社会工学類 経営工学専攻";
    case "pops-city-planning":
      return "社会工学類 都市計画専攻";
    case "esys-intelligence":
      return "工学システム学類 知的・機能工学システム専攻";
    case "esys-mechanics":
      return "工学システム学類 エネルギー・メカニクス主専攻";
    case "math":
      return "数学類";
    case "physics":
      return "物理学類";
    case "nichinichi":
      return "日本語・日本文化学類";
    case "nichinichi-japan-expert":
      return "日本語・日本文化学類 Japan-Expert";
    default:
      unreachable(m);
  }
}

type Instance = { year: number; major: Major; comment?: string };

function fillInPlaceholders(template: string, i: Instance): string {
  const title = `あきこ（${majorToString(i.major)} ${i.year}年度生）`;
  template = template.replaceAll("!!title!!", title);
  template = template.replaceAll("!!year!!", i.year.toString());
  template = template.replaceAll("!!major!!", majorToString(i.major));
  return template;
}

function createNavigationLinks(is: Instance[]): string {
  const yearToInstances = new Map<number, Instance[]>();
  for (const i of is) {
    const majors = yearToInstances.get(i.year);
    if (majors === undefined) {
      yearToInstances.set(i.year, [i]);
    } else {
      majors.push(i);
    }
  }

  const years = Array.from(yearToInstances.keys());
  years.sort((a, b) => b - a);

  let result = "";
  for (const year of years) {
    result += `<section><h3>${year}年度入学</h3><ul>`;
    for (const i of yearToInstances.get(year) ?? []) {
      result += `<li><a href="${year}/${i.major}">${majorToString(i.major)}</a>`;
      if (i.comment !== undefined) {
        result += " " + i.comment;
      }
      result += "</li>";
    }
    result += "</ul></section>";
  }

  return result;
}

function main(): void {
  const dstDir = "dist";

  const description =
    "筑波大生向けの履修サポートWebツールです。単位の計算・授業探し・Twinsへの登録を楽に終わらせましょう！";
  const instances: Instance[] = [
    { year: 2021, major: "coins", comment: "（選択科目のみ対応）" },
    { year: 2021, major: "mast", comment: "（選択科目のみ対応）" },

    { year: 2022, major: "coins", comment: "（選択科目のみ対応）" },

    { year: 2023, major: "coins" },
    { year: 2023, major: "klis-science", comment: "（ほぼ全て対応）" },
    { year: 2023, major: "klis-system", comment: "（ほぼ全て対応）" },
    { year: 2023, major: "mast", comment: "（ほぼ全て対応）" },
    { year: 2023, major: "physics", comment: "（ほぼ全て対応）" },
    { year: 2023, major: "nichinichi" },
    { year: 2023, major: "nichinichi-japan-expert" },

    { year: 2024, major: "coins" },
    { year: 2024, major: "math", comment: "（ほぼ全て対応）" },
    { year: 2024, major: "physics", comment: "（ほぼ全て対応）" },
    { year: 2024, major: "nichinichi" },
    { year: 2024, major: "nichinichi-japan-expert" },

    { year: 2025, major: "coins" },
    { year: 2025, major: "math", comment: "（ほぼ全て対応）" },
    { year: 2025, major: "physics", comment: "（ほぼ全て対応）" },
    { year: 2025, major: "nichinichi" },
    { year: 2025, major: "nichinichi-japan-expert" },
  ];

  const template = readFileSync("src/index.html", {
    encoding: "utf8",
  });
  const helpTemplate = readFileSync("src/docs/help.html", {
    encoding: "utf8",
  });
  const appTemplate = readFileSync("src/app-index.html", {
    encoding: "utf8",
  });

  const indexPath = path.join(dstDir, "index.html");
  console.log(`Generating ${indexPath}`);
  writeFileSync(
    indexPath,
    fillInDescription(
      template.replaceAll("!!links!!", createNavigationLinks(instances)),
      description,
    ),
    { encoding: "utf8" },
  );

  const helpPath = path.join(dstDir, "docs", "help.html");
  console.log(`Generating ${helpPath}`);
  mkdirSync(dirname(helpPath), { recursive: true });
  writeFileSync(helpPath, fillInDescription(helpTemplate, description), {
    encoding: "utf8",
  });

  for (const instance of instances) {
    const filename = path.join(
      dstDir,
      instance.year.toString(),
      instance.major,
      "index.html",
    );
    console.log(`Generating ${filename}`);
    const content = fillInDescription(
      fillInPlaceholders(appTemplate, instance),
      description,
    );
    writeFileSync(filename, content, {
      encoding: "utf8",
    });
  }
}

main();
