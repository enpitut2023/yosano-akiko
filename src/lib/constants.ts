import { assert } from "./util";

export const MAJORS = [
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
export type Major = (typeof MAJORS)[number];

const MAJOR_SET = new Set<string>(MAJORS);
export function isMajor(s: string): s is Major {
  return MAJOR_SET.has(s);
}

export const MAJOR_TO_JA = {
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

export function majorCompare(a: Major, b: Major): number {
  const ai = MAJOR_TO_INDEX.get(a);
  const bi = MAJOR_TO_INDEX.get(b);
  assert(ai !== undefined && bi !== undefined);
  return ai - bi;
}

export const DOCS_PAGE_NAMES = [
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
export type DocsPageName = (typeof DOCS_PAGE_NAMES)[number];

export function isDocsPageName(s: string): s is DocsPageName {
  return (DOCS_PAGE_NAMES as readonly string[]).includes(s);
}

export const MAJOR_TO_DOCS_PAGE_NAME = {
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

export const DOCS_PAGE_NAME_TO_JA = {
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

export type Instance = {
  tableYear: number;
  major: Major;
  comment?: string;
  checked?: true;
};

export const instances: Instance[] = [
  { tableYear: 2021, major: "coins", checked: true },
  { tableYear: 2021, major: "coins-cs", checked: true },
  { tableYear: 2021, major: "coins-mimt", checked: true },
  { tableYear: 2021, major: "mast" },

  { tableYear: 2022, major: "coins", checked: true },
  { tableYear: 2022, major: "coins-cs", checked: true },
  { tableYear: 2022, major: "coins-mimt", checked: true },
  { tableYear: 2022, major: "mast" },

  { tableYear: 2023, major: "coins", checked: true },
  { tableYear: 2023, major: "coins-cs", checked: true },
  { tableYear: 2023, major: "coins-mimt", checked: true },
  { tableYear: 2023, major: "klis-science" },
  { tableYear: 2023, major: "klis-system" },
  { tableYear: 2023, major: "klis-rm" },
  { tableYear: 2023, major: "mast" },
  { tableYear: 2023, major: "math" },
  { tableYear: 2023, major: "physics" },
  { tableYear: 2023, major: "esys-ies" },
  { tableYear: 2023, major: "esys-eme" },
  { tableYear: 2023, major: "coens-ap" },
  { tableYear: 2023, major: "coens-eqe" },
  { tableYear: 2023, major: "coens-mse" },
  { tableYear: 2023, major: "coens-mme" },
  { tableYear: 2023, major: "pops-ses" },
  { tableYear: 2023, major: "pops-mse" },
  { tableYear: 2023, major: "pops-urp" },
  { tableYear: 2023, major: "chem" },
  { tableYear: 2023, major: "jpjp" },
  { tableYear: 2023, major: "jpjp-jltt" },
  { tableYear: 2023, major: "ccc" },
  { tableYear: 2023, major: "earth-gs" },
  { tableYear: 2023, major: "earth-ees" },
  { tableYear: 2023, major: "edu" },
  { tableYear: 2023, major: "psy" },
  { tableYear: 2023, major: "ds" },
  { tableYear: 2023, major: "cis-ir" },
  { tableYear: 2023, major: "cis-id" },
  { tableYear: 2023, major: "pe" },
  { tableYear: 2023, major: "med" },
  { tableYear: 2023, major: "med-new" },
  { tableYear: 2023, major: "med-2" },
  { tableYear: 2023, major: "med-2-new" },
  { tableYear: 2023, major: "meds-ms" },
  { tableYear: 2023, major: "meds-ims" },
  { tableYear: 2023, major: "meds-mspis" },
  { tableYear: 2023, major: "bres" },
  { tableYear: 2023, major: "bres-as" },
  { tableYear: 2023, major: "bres-les" },
  { tableYear: 2023, major: "nurse-n" },
  { tableYear: 2023, major: "nurse-phn" },
  { tableYear: 2023, major: "nurse-h" },
  { tableYear: 2023, major: "art" },
  { tableYear: 2023, major: "art-jad" },
  { tableYear: 2023, major: "help-p" },
  { tableYear: 2023, major: "help-h" },
  { tableYear: 2023, major: "help-af" },
  { tableYear: 2023, major: "help-l" },

  { tableYear: 2024, major: "coins", checked: true },
  { tableYear: 2024, major: "coins-cs", checked: true },
  { tableYear: 2024, major: "coins-mimt", checked: true },
  { tableYear: 2024, major: "klis-science" },
  { tableYear: 2024, major: "klis-system" },
  { tableYear: 2024, major: "klis-rm" },
  { tableYear: 2024, major: "mast" },
  { tableYear: 2024, major: "math" },
  { tableYear: 2024, major: "physics" },
  { tableYear: 2024, major: "esys-ies" },
  { tableYear: 2024, major: "esys-eme" },
  { tableYear: 2024, major: "coens-ap" },
  { tableYear: 2024, major: "coens-eqe" },
  { tableYear: 2024, major: "coens-mse" },
  { tableYear: 2024, major: "coens-mme" },
  { tableYear: 2024, major: "pops-ses" },
  { tableYear: 2024, major: "pops-mse" },
  { tableYear: 2024, major: "pops-urp" },
  { tableYear: 2024, major: "chem" },
  { tableYear: 2024, major: "jpjp" },
  { tableYear: 2024, major: "jpjp-jltt" },
  { tableYear: 2024, major: "ccc" },
  { tableYear: 2024, major: "earth-gs" },
  { tableYear: 2024, major: "earth-ees" },
  { tableYear: 2024, major: "earth-les" },
  { tableYear: 2024, major: "edu" },
  { tableYear: 2024, major: "psy" },
  { tableYear: 2024, major: "ds" },
  { tableYear: 2024, major: "cis-ir" },
  { tableYear: 2024, major: "cis-id" },
  { tableYear: 2024, major: "pe" },
  { tableYear: 2024, major: "med" },
  { tableYear: 2024, major: "med-new" },
  { tableYear: 2024, major: "med-2" },
  { tableYear: 2024, major: "med-2-new" },
  { tableYear: 2024, major: "meds-ms" },
  { tableYear: 2024, major: "meds-ims" },
  { tableYear: 2024, major: "meds-mspis" },
  { tableYear: 2024, major: "bres" },
  { tableYear: 2024, major: "bres-as" },
  { tableYear: 2024, major: "bres-les" },
  { tableYear: 2024, major: "nurse-n" },
  { tableYear: 2024, major: "nurse-phn" },
  { tableYear: 2024, major: "nurse-h" },
  { tableYear: 2024, major: "art" },
  { tableYear: 2024, major: "art-jad" },
  { tableYear: 2024, major: "help-p" },
  { tableYear: 2024, major: "help-h" },
  { tableYear: 2024, major: "help-af" },
  { tableYear: 2024, major: "help-l" },

  { tableYear: 2025, major: "coins", checked: true },
  { tableYear: 2025, major: "coins-cs", checked: true },
  { tableYear: 2025, major: "coins-mimt", checked: true },
  { tableYear: 2025, major: "klis-science" },
  { tableYear: 2025, major: "klis-system" },
  { tableYear: 2025, major: "klis-rm" },
  { tableYear: 2025, major: "mast" },
  { tableYear: 2025, major: "math" },
  { tableYear: 2025, major: "physics" },
  { tableYear: 2025, major: "esys-ies" },
  { tableYear: 2025, major: "esys-eme" },
  { tableYear: 2025, major: "coens-ap" },
  { tableYear: 2025, major: "coens-eqe" },
  { tableYear: 2025, major: "coens-mse" },
  { tableYear: 2025, major: "coens-mme" },
  { tableYear: 2025, major: "pops-ses" },
  { tableYear: 2025, major: "pops-mse" },
  { tableYear: 2025, major: "pops-urp" },
  { tableYear: 2025, major: "chem" },
  { tableYear: 2025, major: "jpjp" },
  { tableYear: 2025, major: "jpjp-jltt" },
  { tableYear: 2025, major: "ccc" },
  { tableYear: 2025, major: "earth-gs" },
  { tableYear: 2025, major: "earth-ees" },
  { tableYear: 2025, major: "earth-les" },
  { tableYear: 2025, major: "edu" },
  { tableYear: 2025, major: "psy" },
  { tableYear: 2025, major: "ds" },
  { tableYear: 2025, major: "cis-ir" },
  { tableYear: 2025, major: "cis-id" },
  { tableYear: 2025, major: "pe" },
  { tableYear: 2025, major: "med" },
  { tableYear: 2025, major: "med-new" },
  { tableYear: 2025, major: "med-2" },
  { tableYear: 2025, major: "med-2-new" },
  { tableYear: 2025, major: "meds-ms" },
  { tableYear: 2025, major: "meds-ims" },
  { tableYear: 2025, major: "meds-mspis" },
  { tableYear: 2025, major: "bres" },
  { tableYear: 2025, major: "bres-as" },
  { tableYear: 2025, major: "bres-les" },
  { tableYear: 2025, major: "nurse-n" },
  { tableYear: 2025, major: "nurse-phn" },
  { tableYear: 2025, major: "nurse-h" },
  { tableYear: 2025, major: "art" },
  { tableYear: 2025, major: "art-jad" },
  { tableYear: 2025, major: "help-p" },
  { tableYear: 2025, major: "help-h" },
  { tableYear: 2025, major: "help-af" },
  { tableYear: 2025, major: "help-l" },
];

export function getDocMeta(name: DocsPageName) {
  if (name === "help") {
    return {
      title: "あきこの使い方",
      description: "あきこの使い方やTWINSとの連携方法などの説明です。",
    };
  }
  const ja = DOCS_PAGE_NAME_TO_JA[name];
  return {
    title: `あきこ未対応の部分など | ${ja}`,
    description: `${ja}のあきこが科目判定に対応していない部分、単位計算が正しくない部分などの説明です。`,
  };
}
