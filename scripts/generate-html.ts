import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path, { join } from "node:path";
import { exit } from "node:process";
import nunjucks from "nunjucks";

function unreachable(_: never): never {
  throw new Error("Should be unreachable");
}

type Major =
  | "coins"
  | "coins-cs"
  | "coins-mimt"
  | "mast"
  | "klis-science"
  | "klis-system"
  | "klis-rm"
  | "pops-ses" // Social and Economic Sciences
  | "pops-mse" // Management Science and Engineering
  | "pops-urp" // Urban and Regional Planning
  | "esys-ies"
  | "esys-eme"
  | "math"
  | "physics"
  | "coens-ap"
  | "coens-eqe"
  | "coens-mse"
  | "coens-mme"
  | "chem";

// TODO
// function majorCompare(a: Major, b: Major): number {
//   return 0;
// }

function majorToString(m: Major): string {
  switch (m) {
    case "coins":
      return "情報科学類 ソフトウェアサイエンス主専攻";
    case "coins-cs":
      return "情報科学類 情報システム主専攻";
    case "coins-mimt":
      return "情報科学類 知能情報メディア主専攻";
    case "mast":
      return "情報メディア創成学類";
    case "klis-science":
      return "知識情報・図書館学類 知識科学専攻";
    case "klis-system":
      return "知識情報・図書館学類 知識情報システム専攻";
    case "klis-rm":
      return "知識情報・図書館学類 情報資源経営主専攻";
    case "pops-ses":
      return "社会工学類 社会経済システム専攻";
    case "pops-mse":
      return "社会工学類 経営工学専攻";
    case "pops-urp":
      return "社会工学類 都市計画専攻";
    case "esys-ies":
      return "工学システム学類 知的・機能工学システム専攻";
    case "esys-eme":
      return "工学システム学類 エネルギー・メカニクス主専攻";
    case "math":
      return "数学類";
    case "physics":
      return "物理学類";
    case "coens-ap":
      return "応用理工学類 応用物理主専攻";
    case "coens-eqe":
      return "応用理工学類 電子・量子工学主専攻";
    case "coens-mse":
      return "応用理工学類 物性工学主専攻";
    case "coens-mme":
      return "応用理工学類 物質・分子工学主専攻";
    case "chem":
      return "化学類";
    default:
      unreachable(m);
  }
}

const DOCS_PAGE_NAMES = [
  "coins",
  "mast",
  "klis",
  "pops",
  "esys",
  "math",
  "physics",
  "coens",
  "chem",
] as const;

type DocsPageName = (typeof DOCS_PAGE_NAMES)[number];

function majorToDocsPageName(m: Major): DocsPageName {
  switch (m) {
    case "mast":
    case "math":
    case "physics":
    case "chem":
      return m;
    case "coins":
    case "coins-cs":
    case "coins-mimt":
      return "coins";
    case "klis-science":
    case "klis-system":
    case "klis-rm":
      return "klis";
    case "pops-ses":
    case "pops-mse":
    case "pops-urp":
      return "pops";
    case "esys-ies":
    case "esys-eme":
      return "esys";
    case "coens-ap":
    case "coens-eqe":
    case "coens-mse":
    case "coens-mme":
      return "coens";
    default:
      unreachable(m);
  }
}

function docsPageNameToJa(d: DocsPageName): string {
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
    case "coens":
      return "応用理工学類";
    case "chem":
      return "化学類";
    default:
      unreachable(d);
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

  const sections = years.map((year) => {
    const instances: object[] = [];
    const is = yearToInstances.get(year) ?? [];
    for (let j = 0; j < is.length; j++) {
      const i = is[j];
      const gap =
        j > 0 &&
        majorToDocsPageName(is[j - 1].major) !== majorToDocsPageName(i.major);
      instances.push({
        major: i.major,
        majorName: majorToString(i.major),
        comment: i.comment,
        gap,
      });
    }
    return { year, instances };
  });

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
    { year: 2023, major: "coins-cs" },
    { year: 2023, major: "coins-mimt" },
    { year: 2023, major: "klis-science" },
    { year: 2023, major: "klis-system" },
    { year: 2023, major: "klis-rm" },
    { year: 2023, major: "mast" },
    { year: 2023, major: "math" },
    { year: 2023, major: "physics" },
    { year: 2023, major: "esys-ies" },
    { year: 2023, major: "esys-eme" },
    { year: 2023, major: "coens-ap" },
    { year: 2023, major: "coens-eqe" },
    { year: 2023, major: "coens-mse" },
    { year: 2023, major: "coens-mme" },
    { year: 2023, major: "pops-ses" },
    { year: 2023, major: "pops-mse" },
    { year: 2023, major: "pops-urp" },
    { year: 2023, major: "chem" },

    { year: 2024, major: "coins" },
    { year: 2024, major: "coins-cs" },
    { year: 2024, major: "coins-mimt" },
    { year: 2024, major: "klis-science" },
    { year: 2024, major: "klis-system" },
    { year: 2024, major: "klis-rm" },
    { year: 2024, major: "mast" },
    { year: 2024, major: "math" },
    { year: 2024, major: "physics" },
    { year: 2024, major: "esys-ies" },
    { year: 2024, major: "esys-eme" },
    { year: 2024, major: "coens-ap" },
    { year: 2024, major: "coens-eqe" },
    { year: 2024, major: "coens-mse" },
    { year: 2024, major: "coens-mme" },
    { year: 2024, major: "pops-ses" },
    { year: 2024, major: "pops-mse" },
    { year: 2024, major: "pops-urp" },
    { year: 2024, major: "chem" },

    { year: 2025, major: "coins" },
    { year: 2025, major: "coins-cs" },
    { year: 2025, major: "coins-mimt" },
    { year: 2025, major: "klis-science" },
    { year: 2025, major: "klis-system" },
    { year: 2025, major: "klis-rm" },
    { year: 2025, major: "mast" },
    { year: 2025, major: "math" },
    { year: 2025, major: "physics" },
    { year: 2025, major: "esys-ies" },
    { year: 2025, major: "esys-eme" },
    { year: 2025, major: "coens-ap" },
    { year: 2025, major: "coens-eqe" },
    { year: 2025, major: "coens-mse" },
    { year: 2025, major: "coens-mme" },
    { year: 2025, major: "pops-ses" },
    { year: 2025, major: "pops-mse" },
    { year: 2025, major: "pops-urp" },
    { year: 2025, major: "chem" },
  ];

  const indexTemplate = readFileSync("src/index.html", {
    encoding: "utf8",
  });
  const appTemplate = readFileSync("src/app-index.html", {
    encoding: "utf8",
  });

  nunjucks.configure(".", { autoescape: true });

  const docsDir = "src/docs";
  const missingDocs: string[] = [];
  for (const name of DOCS_PAGE_NAMES) {
    const inPath = join(docsDir, name + ".html");
    const outPath = join("dist", "docs", name + ".html");
    const stat = statSync(inPath, { throwIfNoEntry: false });
    if (stat === undefined) {
      missingDocs.push(name);
      continue;
    }
    const template = readFileSync(inPath, { encoding: "utf8" });
    console.log(`Rendering ${outPath}`);
    const ja = docsPageNameToJa(name);
    const output = nunjucks.renderString(template, {
      title: `あきこ未対応の部分など | ${ja}`,
      description: `${ja}のあきこが科目判定に対応していない部分、単位計算が正しくない部分などの説明です。`,
    });
    writeFileSync(outPath, output);
  }
  if (missingDocs.length > 0) {
    for (const d of missingDocs) {
      console.log(`Missing documentation for ${d}`);
    }
    exit(1);
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
