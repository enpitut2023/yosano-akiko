import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path, { basename, extname, join } from "node:path";
import nunjucks from "nunjucks";

function unreachable(_: never): never {
  throw new Error("Should be unreachable");
}

type Major =
  | "coins"
  | "mast"
  | "klis-science"
  | "klis-system"
  | "klis-rm"
  | "pops-economics"
  | "pops-management"
  | "pops-city-planning"
  | "esys-intelligence"
  | "esys-mechanics"
  | "math"
  | "physics";

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
    case "klis-rm":
      return "知識情報・図書館学類 情報資源経営主専攻";
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
    default:
      unreachable(m);
  }
}

type DocsPageName =
  | "coins"
  | "mast"
  | "klis"
  | "pops"
  | "esys"
  | "math"
  | "physics";

function isDocsPageName(s: string): s is DocsPageName {
  switch (s) {
    case "coins":
    case "mast":
    case "klis":
    case "pops":
    case "esys":
    case "math":
    case "physics":
      return true;
    default:
      return false;
  }
}

function majorToDocsPageName(m: Major): DocsPageName {
  switch (m) {
    case "coins":
    case "mast":
    case "math":
    case "physics":
      return m;
    case "klis-science":
    case "klis-system":
    case "klis-rm":
      return "klis";
    case "pops-economics":
    case "pops-management":
    case "pops-city-planning":
      return "pops";
    case "esys-intelligence":
    case "esys-mechanics":
      return "esys";
  }
}

function docsPageNameToString(d: DocsPageName): string {
  switch (d) {
    case "coins":
      return "情報科学類";
    case "mast":
      return "情報メディア創成学類";
    case "klis":
      return "知識情報・図書館学類";
    case "pops":
      return "社会工学類";
    case "esys":
      return "工学システム学類";
    case "math":
      return "数学類";
    case "physics":
      return "物理学類";
  }
}

type Instance = { year: number; major: Major; comment?: string };

function createIndexTemplateContext(is: Instance[], description: string) {
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

  const sections = years.map((year) => ({
    year,
    instances: (yearToInstances.get(year) ?? []).map((i) => ({
      major: i.major,
      majorName: majorToString(i.major),
      comment: i.comment,
    })),
  }));

  return { sections, description };
}

function main(): void {
  const dstDir = "dist";
  mkdirSync(join(dstDir, "docs"), { recursive: true });

  const description =
    "筑波大生向けの履修サポートWebツールです。単位の計算・授業探し・Twinsへの登録を楽に終わらせましょう！";
  const instances: Instance[] = [
    { year: 2021, major: "coins", comment: "（選択科目のみ対応）" },
    { year: 2021, major: "mast", comment: "（選択科目のみ対応）" },

    { year: 2022, major: "coins", comment: "（選択科目のみ対応）" },

    { year: 2023, major: "coins" },
    { year: 2023, major: "klis-science", comment: "（ほぼ全て対応）" },
    { year: 2023, major: "klis-system", comment: "（ほぼ全て対応）" },
    { year: 2023, major: "klis-rm" },
    { year: 2023, major: "mast", comment: "（ほぼ全て対応）" },
    { year: 2023, major: "physics", comment: "（ほぼ全て対応）" },

    { year: 2024, major: "coins" },
    { year: 2024, major: "klis-science" },
    { year: 2024, major: "klis-system" },
    { year: 2024, major: "klis-rm" },
    { year: 2024, major: "math", comment: "（ほぼ全て対応）" },
    { year: 2024, major: "physics", comment: "（ほぼ全て対応）" },

    { year: 2025, major: "coins" },
    { year: 2025, major: "klis-science" },
    { year: 2025, major: "klis-system" },
    { year: 2025, major: "klis-rm" },
    { year: 2025, major: "math", comment: "（ほぼ全て対応）" },
    { year: 2025, major: "physics", comment: "（ほぼ全て対応）" },
  ];

  const indexTemplate = readFileSync("src/index.html", {
    encoding: "utf8",
  });
  const appTemplate = readFileSync("src/app-index.html", {
    encoding: "utf8",
  });

  nunjucks.configure(".", { autoescape: true });

  const docsDir = "src/docs";
  for (const entry of readdirSync(docsDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const ext = extname(entry.name);
    if (ext !== ".html") continue;
    const base = basename(entry.name, ext);
    if (!isDocsPageName(base)) continue;
    const inPath = join(docsDir, entry.name);
    const outPath = join("dist", "docs", entry.name);
    console.log(`Rendering ${outPath}`);
    const name = docsPageNameToString(base);
    const output = nunjucks.renderString(
      readFileSync(inPath, { encoding: "utf8" }),
      {
        title: `あきこ未対応の部分など | ${name}`,
        description: `${name}のあきこが科目判定に対応していない部分、単位計算が正しくない部分などの説明です。`,
      },
    );
    writeFileSync(join("dist/docs", entry.name), output, { encoding: "utf8" });
  }

  const indexPath = path.join(dstDir, "index.html");
  console.log(`Rendering ${indexPath}`);
  writeFileSync(
    indexPath,
    nunjucks.renderString(
      indexTemplate,
      createIndexTemplateContext(instances, description),
    ),
  );

  const helpPath = path.join(dstDir, "docs", "help.html");
  console.log(`Rendering ${helpPath}`);
  writeFileSync(
    helpPath,
    nunjucks.renderString(
      readFileSync("src/docs/help.html", { encoding: "utf8" }),
      {},
    ),
  );

  for (const i of instances) {
    const filename = path.join(
      dstDir,
      i.year.toString(),
      i.major,
      "index.html",
    );
    console.log(`Rendering ${filename}`);
    const title = `あきこ（${majorToString(i.major)} ${i.year}年度生）`;
    const output = nunjucks.renderString(appTemplate, {
      title,
      description,
      year: i.year.toString(),
      major: majorToString(i.major),
      docsPageName: majorToDocsPageName(i.major),
    });
    writeFileSync(filename, output);
  }
}

main();
