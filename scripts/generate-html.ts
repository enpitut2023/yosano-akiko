import assert from "node:assert";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path, { join } from "node:path";
import { exit } from "node:process";
import nunjucks from "nunjucks";

const MAJORS = [
  "help-p", // Philosophy
  "help-h", // History
  "help-af", // Archaeology and Folklore
  "help-l", // Linguistics
  "ccc",
  "jpjp",
  "jpjp-jltt", // Japanese Language Teacher Training Course
  "css-s", // Sociology
  "css-l", // Law
  "css-ps", // Political Science
  "css-e", // Economics
  "cis-ir", // International Relations
  "cis-id", //International Development
  "edu",
  "psy",
  "ds",
  "biol",
  "bres",
  "bres-as", // Agricultural Science Course
  "bres-les", // Life and Environmental Sciences
  "earth-gs", // Geoenvironmental Sciences
  "earth-ees", // Earth Evolution Science
  "earth-les", // Life and Environmental Sciences
  "math",
  "physics",
  "chem",
  "coens-ap", // Applied Physics
  "coens-eqe", // Electronics and Quantum Engineering
  "coens-mse", // Material Science and Engineering
  "coens-mme", // Material and Molecular Engineering
  "esys-ies", // Intelligent Engineering Systems
  "esys-eme", // Engineering Mechanics and Energy
  "pops-ses", // Social and Economic Sciences
  "pops-mse", // Management Science and Engineering
  "pops-urp", // Urban and Regional Planning
  "coins", // Software & Computing Science
  "coins-cs", // Computer Systems
  "coins-mimt", // Machine Intelligence & Media Technologies
  "mast",
  "klis-science", // Knowledge Studies
  "klis-system", // Knowledge Information Systems
  "klis-rm", // Information Resources Management
  "med",
  "med-new", // New Major in Medicine
  "med-2",
  "med-2-new", // New Major in Medicine
  "nurse-n", // Nurse
  "nurse-phn", // Publich Health Nurse
  "nurse-h", // Healthcare Course
  "meds-ms", // Medical Science Course
  "meds-ims", // International Medical Science Course
  "meds-mspis", // Medical Science Program for International Students
  "pe",
  "art",
  "art-jad", // Japanese Art and Design Course
] as const;
type Major = (typeof MAJORS)[number];

const MAJOR_TO_JA = {
  "help-p": "人文学類 哲学主専攻",
  "help-h": "人文学類 史学主専攻",
  "help-af": "人文学類 考古学・民俗学主専攻",
  "help-l": "人文学類 言語学主専攻",
  ccc: "比較文化学類",
  jpjp: "日本語・日本文化学類",
  "jpjp-jltt": "日本語・日本文化学類 Japan-Expert 日本語教師養成コース",
  "css-s": "社会学類 社会学主専攻",
  "css-l": "社会学類 法学主専攻",
  "css-ps": "社会学類 政治学主専攻",
  "css-e": "社会学類 経済学主専攻",
  "cis-ir": "国際総合学類 国際関係学主専攻",
  "cis-id": "国際総合学類 国際開発学主専攻 ",
  edu: "教育学類",
  psy: "心理学類",
  ds: "障害科学類",
  biol: "生物学類",
  bres: "生物資源学類",
  "bres-as": "生物資源学類 Japan-Expert アグロノミスト養成コース",
  "bres-les": "生物資源学類 生命環境学際プログラム",
  "earth-gs": "地球学類 地球環境学主専攻",
  "earth-ees": "地球学類 地球進化学主専攻",
  "earth-les": "地球学類 生命環境学際プログラム",
  math: "数学類",
  physics: "物理学類",
  chem: "化学類",
  "coens-ap": "応用理工学類 応用物理主専攻",
  "coens-eqe": "応用理工学類 電子・量子工学主専攻",
  "coens-mse": "応用理工学類 物性工学主専攻",
  "coens-mme": "応用理工学類 物質・分子工学主専攻",
  "esys-ies": "工学システム学類 知的・機能工学システム主専攻",
  "esys-eme": "工学システム学類 エネルギー・メカニクス主専攻",
  "pops-ses": "社会工学類 社会経済システム主専攻",
  "pops-mse": "社会工学類 経営工学主専攻",
  "pops-urp": "社会工学類 都市計画主専攻",
  coins: "情報科学類 ソフトウェアサイエンス主専攻",
  "coins-cs": "情報科学類 情報システム主専攻",
  "coins-mimt": "情報科学類 知能情報メディア主専攻",
  mast: "情報メディア創成学類",
  "klis-science": "知識情報・図書館学類 知識科学主専攻",
  "klis-system": "知識情報・図書館学類 知識情報システム主専攻",
  "klis-rm": "知識情報・図書館学類 情報資源経営主専攻",
  med: "医学類",
  "med-new": "医学類 新医学主専攻",
  "med-2": "医学類 2年次編入",
  "med-2-new": "医学類 2年次編入 新医学主専攻",
  "nurse-n": "看護学類 看護師",
  "nurse-phn": "看護学類 保健師",
  "nurse-h": "看護学類 Japan-Expert ヘルスケアコース",
  "meds-ms": "医療科学類 医療科学主専攻",
  "meds-ims": "医療科学類 国際医療科学主専攻",
  "meds-mspis": "医療科学類 国際医療科学人養成プログラム",
  pe: "体育専門学群",
  art: "芸術専門学群",
  "art-jad": "芸術専門学群 Japan-Expert 日本芸術コース",
} as const satisfies { [K in Major]: string };

const MAJOR_TO_INDEX = (() => {
  const m = new Map<Major, number>();
  for (let i = 0; i < MAJORS.length; i++) {
    m.set(MAJORS[i], i);
  }
  return m;
})();

function majorCompare(a: Major, b: Major): number {
  const ai = MAJOR_TO_INDEX.get(a);
  const bi = MAJOR_TO_INDEX.get(b);
  assert(ai !== undefined && bi !== undefined);
  return ai - bi;
}

const DOCS_PAGE_NAMES = [
  "help",
  "ccc",
  "jpjp",
  "css",
  "cis",
  "edu",
  "psy",
  "ds",
  "biol",
  "bres",
  "earth",
  "math",
  "physics",
  "chem",
  "coens",
  "esys",
  "pops",
  "coins",
  "mast",
  "klis",
  "med",
  "nurse",
  "meds",
  "pe",
  "art",
] as const;
type DocsPageName = (typeof DOCS_PAGE_NAMES)[number];

const MAJOR_TO_DOCS_PAGE_NAME = {
  "help-p": "help",
  "help-h": "help",
  "help-af": "help",
  "help-l": "help",
  ccc: "ccc",
  jpjp: "jpjp",
  "jpjp-jltt": "jpjp",
  "css-s": "css",
  "css-l": "css",
  "css-ps": "css",
  "css-e": "css",
  "cis-ir": "cis",
  "cis-id": "cis",
  edu: "edu",
  psy: "psy",
  ds: "ds",
  biol: "biol",
  bres: "bres",
  "bres-as": "bres",
  "bres-les": "bres",
  "earth-gs": "earth",
  "earth-ees": "earth",
  "earth-les": "earth",
  math: "math",
  physics: "physics",
  chem: "chem",
  "coens-ap": "coens",
  "coens-eqe": "coens",
  "coens-mse": "coens",
  "coens-mme": "coens",
  "esys-ies": "esys",
  "esys-eme": "esys",
  "pops-ses": "pops",
  "pops-mse": "pops",
  "pops-urp": "pops",
  coins: "coins",
  "coins-cs": "coins",
  "coins-mimt": "coins",
  mast: "mast",
  "klis-science": "klis",
  "klis-system": "klis",
  "klis-rm": "klis",
  med: "med",
  "med-new": "med",
  "med-2": "med",
  "med-2-new": "med",
  "nurse-n": "nurse",
  "nurse-phn": "nurse",
  "nurse-h": "nurse",
  "meds-ms": "meds",
  "meds-ims": "meds",
  "meds-mspis": "meds",
  pe: "pe",
  art: "art",
  "art-jad": "art",
} as const satisfies { [K in Major]: DocsPageName };

const DOCS_PAGE_NAME_TO_JA = {
  help: "人文学類",
  ccc: "比較文化学類",
  jpjp: "日本語・日本文化学類",
  css: "社会学類",
  cis: "国際総合学類",
  edu: "教育学類",
  psy: "心理学類",
  ds: "障害科学類",
  biol: "生物学類",
  bres: "生物資源学類",
  earth: "地球学類",
  math: "数学類",
  physics: "物理学類",
  chem: "化学類",
  coens: "応用理工学類",
  esys: "工学システム学類",
  pops: "社会工学類",
  coins: "情報科学類",
  mast: "情報メディア創成学類",
  klis: "知識情報・図書館学類",
  med: "医学類",
  nurse: "看護学類",
  meds: "医療科学類",
  pe: "体育専門学群",
  art: "芸術専門学群",
} as const satisfies { [K in DocsPageName]: string };

type Instance = {
  year: number;
  major: Major;
  comment?: string;
  checked?: true;
};

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
  for (const is of yearToInstances.values()) {
    is.sort((a, b) => majorCompare(a.major, b.major));
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
        MAJOR_TO_DOCS_PAGE_NAME[is[j - 1].major] !==
          MAJOR_TO_DOCS_PAGE_NAME[i.major];
      instances.push({
        major: i.major,
        majorJa: MAJOR_TO_JA[i.major],
        comment: i.comment,
        gap,
        checked: i.checked,
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

    { year: 2023, major: "coins", checked: true },
    { year: 2023, major: "coins-cs", checked: true },
    { year: 2023, major: "coins-mimt", checked: true },
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
    { year: 2023, major: "jpjp" },
    { year: 2023, major: "jpjp-jltt" },

    { year: 2024, major: "coins", checked: true },
    { year: 2024, major: "coins-cs", checked: true },
    { year: 2024, major: "coins-mimt", checked: true },
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
    { year: 2024, major: "jpjp" },
    { year: 2024, major: "jpjp-jltt" },

    { year: 2025, major: "coins", checked: true },
    { year: 2025, major: "coins-cs", checked: true },
    { year: 2025, major: "coins-mimt", checked: true },
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
    { year: 2025, major: "jpjp" },
    { year: 2025, major: "jpjp-jltt" },
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
    const ja = DOCS_PAGE_NAME_TO_JA[name];
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
    const title = `あきこ（${MAJOR_TO_JA[i.major]} ${i.year}年度生）`;
    const output = nunjucks.renderString(appTemplate, {
      title,
      description,
      year: i.year.toString(),
      major: MAJOR_TO_JA[i.major],
      docsPageName: MAJOR_TO_DOCS_PAGE_NAME[i.major],
    });
    writeFileSync(filename, output);
  }
}

main();
