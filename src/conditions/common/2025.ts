/**
 * 共通科目
 */
export function isKyoutsuu(id: string): boolean {
  return /^[1-6]/.test(id);
}

/**
 * 必修の英語を科目番号で判定
 * - English Reading Skills I: 31H...
 * - English Presentation Skills I: 31J...
 * - English Reading Skills II: 31K...
 * - English Presentation Skills II: 31L...
 */
export function isCompulsoryEnglishById(id: string): boolean {
  return /^31[HJKL]/.test(id);
}

/**
 * 必修の英語を科目名で判定
 * English Reading Skills I, IIとEnglish Presentation Skills I, IIが認定された
 * 単位である場合、認定単位には科目番号が存在せず科目名のみ存在するため、これを
 * 使って判定できる。
 */
export function isCompulsoryEnglishByName(name: string): boolean {
  name = name.trim();
  name = name.replaceAll(/\s+/g, " ");
  name = name.toLowerCase();
  return (
    name === "english reading skills i" ||
    name === "english reading skills ii" ||
    name === "english presentation skills i" ||
    name === "english presentation skills ii"
  );
}

/**
 * 学問への誘い
 */
function isIzanai(id: string): boolean {
  return id.startsWith("1227") || id.startsWith("1228");
}

/**
 * 学士基盤科目
 * 12から始まるものは低年次向け、14から始まるものは高年次向けの科目。ただし、
 * 1227もしくは1228から始まる科目は学問への誘い。
 * 学士基盤科目の一覧のPDFを大学が提供しているが、これの日本語版には日本人学生
 * 向けの科目一覧、英語版には外国人学生向けの科目一覧が記載されている。そのため、
 * いずれの一覧も完全な学士基盤科目の一覧にはなっていない。
 * 科目番号表にある「総合科目I」は学士基盤科目の昔の名前らしい。
 */
export function isGakushikiban(id: string): boolean {
  return (id.startsWith("12") && !isIzanai(id)) || id.startsWith("14");
}

/**
 * 自由科目
 * 「自由科目（特設）」や「特設自由科目」と書かれていることがあるが、特設ではな
 * い自由科目は存在しない模様。
 */
export function isJiyuukamoku(id: string): boolean {
  return id.startsWith("8");
}

/**
 * 博物館に関する科目
 */
export function isHakubutsukan(id: string): boolean {
  return id.startsWith("99");
}

/**
 * 教職に関する科目
 */
export function isKyoushoku(id: string): boolean {
  return id.startsWith("9") && !isHakubutsukan(id);
}
