import { gradeIsPass, type CourseId, type RealCourse } from "$lib/akiko";

/**
 * 共通科目
 */
export function isKyoutsuu(id: string): boolean {
  return /^[1-6]/.test(id);
}

/**
 * ファーストイヤーセミナー
 */
export function isFirstYearSeminar(id: string): boolean {
  return id.startsWith("11");
}

/**
 * 学問への誘い
 */
export function isIzanai(id: string): boolean {
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
 * 体育（1年次必修）
 * 通常の曜時限で開講するものは21、集中で開講するものは25から始まる。
 */
export function isCompulsoryPe1(id: string): boolean {
  return id.startsWith("21") || id.startsWith("25");
}

/**
 * 体育（2年次必修）
 * 2年次必修の体育のみ、集中で開講されるものの科目番号が用意されていない。2年次
 * 必修かつ集中の体育は存在しないのかもしれないが、詳細は不明。
 */
export function isCompulsoryPe2(id: string): boolean {
  return id.startsWith("22");
}

/**
 * 体育（3年次必修）
 * 通常の曜時限で開講するものは23、集中で開講するものは26から始まる。
 */
export function isCompulsoryPe3(id: string): boolean {
  return id.startsWith("23") || id.startsWith("26");
}

/**
 * 体育（4年次必修）
 * 通常の曜時限で開講するものは24、集中で開講するものは27から始まる。
 */
export function isCompulsoryPe4(id: string): boolean {
  return id.startsWith("24") || id.startsWith("27");
}

/**
 * 体育（自由科目）
 */
export function isElectivePe(id: string): boolean {
  return id.startsWith("28");
}

/**
 * 英語
 */
function isEnglish(id: string): boolean {
  return id.startsWith("31");
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
  name = name.replaceAll(/\s+/g, " ");
  name = name.trim();
  name = name.toLowerCase();
  return (
    name === "english reading skills i" ||
    name === "english reading skills ii" ||
    name === "english presentation skills i" ||
    name === "english presentation skills ii"
  );
}

/**
 * 第一外国語(必修以外の英語)
 */
export function isNonCompulsoryEnglish(id: string): boolean {
  return isEnglish(id) && !isCompulsoryEnglishById(id);
}

/**
 * 第二外国語
 */
export function isSecondForeignLanguage(id: string): boolean {
  return id.startsWith("3") && !isEnglish(id);
}

/**
 * 外国語
 * TODO:
 * - Reading, Presentation Skills以外の英語も入る？
 * - 「...の言語と文化」とかも入る？
 */
export function isForeignLanguage(id: string): boolean {
  return id.startsWith("3") && !isCompulsoryEnglishById(id);
}

/**
 * 外国語としての日本語
 */
export function isJapaneseAsForeignLanguage(id: string): boolean {
  return id.startsWith("39");
}

/**
 * 芸術
 */
export function isArt(id: string): boolean {
  return id.startsWith("4");
}

/**
 * 国語I
 */
export function isJapanese1(id: string): boolean {
  return id.startsWith("51");
}

/**
 * 国語
 */
export function isJapanese(id: string): boolean {
  return id.startsWith("5");
}

/**
 * 情報リテラシー（講義）
 */
export function isInfoLiteracyLecture(id: string): boolean {
  return id.startsWith("61");
}

/**
 * 情報リテラシー（演習）
 */
export function isInfoLiteracyExercise(id: string): boolean {
  return id.startsWith("64");
}

/**
 * データサイエンス
 */
export function isDataScience(id: string): boolean {
  return id.startsWith("65");
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

/**
 * 人間学群学群コア・カリキュラム
 * https://www.tsukuba.ac.jp/education/ug-courses-openclass/2025/pdf/human-core-curriculum.pdf
 */
export function isHumanSciencesCoreCurriculum(id: string): boolean {
  return id.startsWith("CA1");
}

/**
 * 目標単位数にピッタリ合う科目の組み合わせを動的計画法(DP)で探す。
 * ピッタリの組み合わせが見つからない場合は、目標を超える組み合わせのうち
 * 最も合計単位数が小さいものを返す。
 * 落単した科目（gradeIsPassがfalseの科目）と単位数が不明な科目は自動的に除外する。
 * @param courses 利用可能な科目のリスト（RealCourse）
 * @param target 目標となる単位数
 * @returns 条件を満たす科目の配列、見つからない場合は undefined
 */
export function findExactCombination(
  courses: RealCourse[],
  target: number,
): RealCourse[] | undefined {
  // 落単していない＆単位数が確定している科目のみを対象にする
  const passedCourses = courses.filter(
    (c): c is RealCourse & { credit: number } =>
      gradeIsPass(c.grade) && c.credit !== undefined,
  );

  // 全科目の合計単位数を上限としてDPの範囲を決める
  const totalCredits = passedCourses.reduce((sum, c) => sum + c.credit, 0);
  if (totalCredits < target) return undefined;

  // dp[i] は「合計単位数を i にできる科目の組み合わせ（配列）」を保持する
  // 達成不可能な場合は undefined とする
  const dp: ((RealCourse & { credit: number })[] | undefined)[] = Array(
    totalCredits + 1,
  ).fill(undefined);

  // 初期状態: 合計0単位を作るための組み合わせは「何も選ばない（空の配列）」
  dp[0] = [];

  // 各科目について、上限値までの各単位数で組み合わせが作れるか更新していく
  for (const course of passedCourses) {
    // 同じ科目を複数回使わないよう、後ろ（大きい単位数）から前へループを回す
    for (
      let currentTarget = totalCredits;
      currentTarget >= course.credit;
      currentTarget--
    ) {
      const prevTarget = currentTarget - course.credit;

      // 「現在の科目単位数を引いた値(prevTarget)」が達成可能であり、
      // かつ「現在の目標値(currentTarget)」がまだ未達成の場合、組み合わせを記録する
      if (dp[prevTarget] !== undefined && dp[currentTarget] === undefined) {
        dp[currentTarget] = [...dp[prevTarget]!, course];
      }
    }
  }

  // target以上で最小の達成可能な単位数の組み合わせを返す
  for (let i = target; i <= totalCredits; i++) {
    if (dp[i] !== undefined) return dp[i];
  }
  return undefined;
}

/**
 * findExactCombinationを使ってマスにぴったり（もしくは最小超過）の組み合わせを
 * 選び、残りをオーバーフロー先に回す。
 * @param cs 全科目のリスト
 * @param courseIdToCellId 科目IDからセルIDへのマップ（この関数内で変更される）
 * @param sourceCellId オーバーフロー元のセルID
 * @param targetCredits 目標単位数
 * @param overflowCellId オーバーフロー先のセルID
 */
export function redistributeOverflow(
  cs: RealCourse[],
  courseIdToCellId: Map<CourseId, string>,
  sourceCellId: string,
  targetCredits: number,
  overflowCellId: string,
): void {
  // sourceCellIdに分類された科目を集める
  const coursesInCell: RealCourse[] = [];
  for (const c of cs) {
    if (courseIdToCellId.get(c.id) === sourceCellId) {
      coursesInCell.push(c);
    }
  }

  // findExactCombinationでぴったり（もしくは最小超過）の組み合わせを探す
  const bestCombination = findExactCombination(coursesInCell, targetCredits);

  if (bestCombination !== undefined) {
    // 選ばれた科目のIDセット
    const keepIds = new Set(bestCombination.map((c) => c.id));
    // 選ばれなかった科目をオーバーフロー先に回す
    for (const c of coursesInCell) {
      if (!keepIds.has(c.id) && gradeIsPass(c.grade)) {
        courseIdToCellId.set(c.id, overflowCellId);
      }
    }
  }
}
