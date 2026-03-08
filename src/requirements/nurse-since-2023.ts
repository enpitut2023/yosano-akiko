import {
  CourseId,
  FakeCourse,
  FakeCourseId,
  KnownCourse,
  RealCourse,
} from "@/akiko";
import { ClassifyOptions, SetupCreditRequirements } from "@/app-setup";
import {
  isArt,
  isCompulsoryPe1,
  isCompulsoryPe2,
  isDataScience,
  isFirstYearSeminar,
  isGakushikiban,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
  isJapanese,
  isSecondForeignLanguage,
} from "@/requirements/common";
import { table } from "node:console";
import { crc32 } from "node:zlib";
import { optional } from "zod";

export type Specialty = "nurse-n" | "nurse-phn" | "nurse-h";
type Mode = "known" | "real";

function classifyColumnA(id: CourseId, specialty: Specialty): string | undefined {
  let offset_phn = 0;
  let offset_h = 0;

  // 臨床看護実践
  if (id === "HC30141") return "a" + (1 + offset_phn + offset_h) // 基礎看護学概論
  if (id === "HC30191") return "a" + (2 + offset_phn + offset_h) // 基本看護技術 since 2022
  if (id === "HC30192") return "a" + (3 + offset_phn + offset_h) // 基本看護技術演習 since 2022
  if (id === "HC30201") return "a" + (4 + offset_phn + offset_h) // フィジカルアセスメント since 2022
  if (id === "HC30181") return "a" + (5 + offset_phn + offset_h) // 看護過程 since 2022
  if (id === "HC30071") return "a" + (6 + offset_phn + offset_h) // 看護生命倫理
  if (specialty === "nurse-n" || specialty === "nurse-phn") {
    if (id === "HC30183") return "a" + (7 + offset_phn + offset_h) // 看護技術実習 since 2019
    if (id === "HC30193") return "a" + (8 + offset_phn + offset_h) // 看護過程実習 since 2019
  } else {
    offset_h += -2
  }
  if (id === "HC32051") return "a" + (9 + offset_phn + offset_h) // 臨床看護学概論
  if (id === "HC32081") return "a" + (10 + offset_phn + offset_h) // 臨床看護方法論 since 2022 !!A!! HC32071は2021年度以前入学生向けという認識で正しいか
  if (specialty === "nurse-n" || specialty === "nurse-phn") {
    if (id === "HC32083") return "a" + (11 + offset_phn + offset_h) // 臨床看護学実習(クリティカルケア)
    if (id === "HC32093") return "a" + (12 + offset_phn + offset_h) // 臨床看護学実習(セルフケア)
  } else {
    offset_h += -2
  }

  // 生涯発達看護
  if (id === "HC36191") return "a" + (13 + offset_phn + offset_h) // 生涯発達と家族支援
  if (id === "HC36161") return "a" + (14 + offset_phn + offset_h) // 子どもの発達支援学概論 since 2022
  if (id === "HC36171") return "a" + (15 + offset_phn + offset_h) // 子どもの発達支援方法論 since 2022 !!A!! 2023の履修要覧にあるが、授業がリザードンにない
  if (specialty === "nurse-n" || specialty === "nurse-phn") {
    if (id === "HC36173") return "a" + (16 + offset_phn + offset_h) // 子どもの発達支援実習（保育所・施設ふれあい実習）since 2022 !!A!! 2023の履修要覧にあるが、授業がリザードンにない
    if (id === "HC36183") return "a" + (17 + offset_phn + offset_h) // 子どもの発達支援実習（病院実習）since 2022 !!A!! 2023の履修要覧にあるが、授業がリザードンにない
  } else {
    offset_h += -2
  }
  if (id === "HC35051") return "a" + (18 + offset_phn + offset_h) // ウィメンズヘルス看護学概論
  if (id === "HC35211") return "a" + (19 + offset_phn + offset_h) // ウィメンズヘルス看護学方法論 since 2022 !!A!! 2023の履修要覧にあるが、授業がリザードンにない
  if (specialty === "nurse-n" || specialty === "nurse-phn") {
    if (id === "HC35043") return "a" + (20 + offset_phn + offset_h) // ウィメンズヘルス看護学実習 since 2022 !!A!! 2023の履修要覧にあるが、授業がリザードンにない
  } else {
    offset_h += -1
  }
  if (id === "HC34001") return "a" + (21 + offset_phn + offset_h) // 高齢者看護学概論
  if (id === "HC34051") return "a" + (22 + offset_phn + offset_h) // 高齢者看護方法論 since 2022
  if (specialty === "nurse-n" || specialty === "nurse-phn") {
    if (id === "HC34083") return "a" + (23 + offset_phn + offset_h) // 高齢者看護学実習 since 2022 !!A!! 24.25のHC34073は2021年度以前入学生向けという認識で正しいか
  } else {
    offset_h += -1
  }

  // 地域看護実践
  if (id === "HC37021") return "a" + (24 + offset_phn + offset_h) // 地域・在宅看護論 since 2022 !!A!!2023の履修要覧にあるが、授業がリザードンにない
  if (id === "HC37031") return "a" + (25 + offset_phn + offset_h) // 地域・在宅看護方法論 since 2022 !!A!!2023の履修要覧にあるが、授業がリザードンにない

  if (specialty === "nurse-n" || specialty === "nurse-phn") {
    if (id === "HC37033") return "a" + (26 + offset_phn + offset_h) // 地域・在宅看護論実習 since 2022 !!A!!2023の履修要覧にあるが、授業がリザードンにない
  } else {
    offset_h += -1
  }
  if (id === "HC31081") return "a" + (27 + offset_phn + offset_h) // 公衆衛生看護学概論 HC31091は2023年度に看護学類に移行した総合学域群生
  if (id === "HC31111") return "a" + (28 + offset_phn + offset_h) // 職域における保健活動
  if (id === "HC33011") return "a" + (29 + offset_phn + offset_h) // 精神看護学概論
  if (id === "HC33061") return "a" + (30 + offset_phn + offset_h) // 精神看護方法論 since 2022 !!A!!2023の履修要覧にあるが、授業がリザードンにない
  if (id === "HC37041") return "a" + (31 + offset_phn + offset_h) // 家族病理とメンタルヘルス since 2022
  if (specialty === "nurse-n" || specialty === "nurse-phn") {
    if (id === "HC33023") return "a" + (32 + offset_phn + offset_h) // 精神看護学実習
  } else {
    offset_h += -1
  }

  // 看護の発展
  if (id === "HC40011") return "a" + (33 + offset_phn + offset_h) // ヘルスプロモーションと看護
  if (id === "HC40041") return "a" + (34 + offset_phn + offset_h) // 災害看護学
  if (id === "HC40031") return "a" + (35 + offset_phn + offset_h) // 看護マネジメント
  if (id === "HC40051") return "a" + (36 + offset_phn + offset_h) // 国際看護学
  if (specialty === "nurse-n" || specialty === "nurse-phn") {
    if (id === "HC40072") return "a" + (37 + offset_phn + offset_h) // 応用看護学演習I(OSCE) since 2019
    if (id === "HC40082") return "a" + (38 + offset_phn + offset_h) // 応用看護学演習II(IBT)
  } else {
    offset_h += -2
  }
  if (id === "HC40061") return "a" + (39 + offset_phn + offset_h) // 研究方法概論
  if (id === "HC40121") return "a" + (40 + offset_phn + offset_h) // 看護学探究概説 !!A!!23生はHC40071は取れずHC40121しか取れないという認識で正しいか
  if (specialty === "nurse-n") {
    if (id === "HC40122") return "a" + (41 + offset_phn + offset_h) // 看護学探究演習 !!A!!23生はHC40092は取れずHC40122しか取れないという認識で正しいか
  } else {
    offset_phn += -1;
    offset_h += -1;
  }
  if (specialty === "nurse-n" || specialty === "nurse-phn") {
    if (id === "HC40003") return "a" + (42 + offset_phn + offset_h) // ヘルスプロモーション実習I
    if (id === "HC40013") return "a" + (43 + offset_phn + offset_h) // ヘルスプロモーション実習II
    if (id === "HC40112") return "a" + (44 + offset_phn + offset_h) // 医療チーム連携演習
    if (id === "HC40023") return "a" + (45 + offset_phn + offset_h) // 応用看護学実習 since 2019
  } else {
    offset_h += -4
  }

  // 保健師科目
  if (specialty === "nurse-phn") {
    if (id === "HC41001") return "a" + (46 + offset_phn + offset_h) // 公衆衛生看護活動論
    if (id === "HC41031") return "a" + (47 + offset_phn + offset_h) // 公衆衛生看護活動方法論
    if (id === "HC41052") return "a" + (48 + offset_phn + offset_h) // 公衆衛生看護学応用論 !!A!!23生はHC41051は取れずHC41052しか取れないという認識で正しいか
    if (id === "HC41061") return "a" + (49 + offset_phn + offset_h) // 公衆衛生看護管理論 since 2019
    if (id === "HC41003") return "a" + (50 + offset_phn + offset_h) // 公衆衛生看護学実習
  }

  // ヘルスケア原理
  if (specialty === "nurse-h") {
    if (id === "HC90011") return "a" + (46 + offset_phn + offset_h) // 国際ヘルスケア概論 2024は開講されない
    if (id === "HC90012") return "a" + (47 + offset_phn + offset_h) // 国際ヘルスケア演習 since 2021-10 !!A!!HC90012は誰用
    if (id === "HC90003") return "a" + (48 + offset_phn + offset_h) // ヘルスケア実習I(介護施設)
    if (id === "HC90013") return "a" + (49 + offset_phn + offset_h) // ヘルスケア実習II(医療施設)
  }
}

function classifyColumnC(id: CourseId, specialty: Specialty, mode: Mode): string | undefined {
  let offset_phn = 0;
  let offset_h = 0;

  // JEプログラム共通科目
  if (specialty === "nurse-h") {
    offset_h += 1
    if (id === "AE51K11") return "c" + (0 + offset_phn + offset_h) // Japan-Expert総論
  }

  // 心と行動の科学分野
  if (id === "HC20001") return "c" + (1 + offset_phn + offset_h) // 人間関係論
  if (id === "HC20021") return "c" + (2 + offset_phn + offset_h) // 心の健康と相談活動
  if (id === "HC20121") return "c" + (3 + offset_phn + offset_h) // 行動科学
  if (id === "HC20152") return "c" + (4 + offset_phn + offset_h) // 看護専門英語!!A!!23生はHC20142は取れずHC20152しか取れないという認識で正しいか、2023の履修要覧にあるが、授業がリザードンにない
  if (id === "HC20151") return "c" + (5 + offset_phn + offset_h) // コミュニティ・エンパワメント論 since 2019

  // 人間と生命科学分野
  if (id === "HC21071") return "c" + (6 + offset_phn + offset_h) // 人体機能学
  if (id === "HC21081") return "c" + (7 + offset_phn + offset_h) // 人体構造学
  if (id === "HC21091") return "c" + (8 + offset_phn + offset_h) // 人体の代謝と栄養
  if (id === "HC21031") return "c" + (9 + offset_phn + offset_h) // 臨床薬理学!!A!!看護学類生が他の臨床薬理学（HE30021、HE40231）を取ることはできるか
  if (id === "HC21151") return "c" + (10 + offset_phn + offset_h) // 遺伝と健康!!A!!HE32051と同一。
  if (id === "HE21021") return "c" + (11 + offset_phn + offset_h) // 微生物学!!A!!EC22101とHE21021があるがどちらでもかまわないか
  if (id === "HC21191") return "c" + (12 + offset_phn + offset_h) // 疾病の治療と看護I since 2022
  if (id === "HC21211") return "c" + (13 + offset_phn + offset_h) // 疾病の治療と看護II since 2022
  if (id === "HC21221") return "c" + (14 + offset_phn + offset_h) // 子どもの健康と障害 since 2022 HC21261は2024年度入学編入生用
  if (id === "HC21231") return "c" + (15 + offset_phn + offset_h) // 老化と健康 since 2022
  if (id === "HE21051") return "c" + (16 + offset_phn + offset_h) // 医療・生命科学とテクノロジー

  // 生活支援科学分野
  if (id === "HC22081") return "c" + (17 + offset_phn + offset_h) // 保健統計学
  if (id === "HC22231") return "c" + (18 + offset_phn + offset_h) // 保健医療福祉行政論I HE22011と同一 HE22011と同一
  if (id === "HC22241") return "c" + (19 + offset_phn + offset_h) // 保健医療福祉行政論II
  if (id === "HC22021") return "c" + (20 + offset_phn + offset_h) // 疫学
  if (id === "HC22151") return "c" + (21 + offset_phn + offset_h) // 障害理解
  if (id === "HC22091") return "c" + (22 + offset_phn + offset_h) // 国際保健学
  if ((specialty === "nurse-phn" || specialty === "nurse-h") && 
    mode === "known" && id === "BB00301"
  ) {
    return "c" + (23 + offset_phn + offset_h)
  }
  if ((specialty === "nurse-phn" || specialty === "nurse-h") &&
    mode === "real" &&
    (id === "BB00101" ||
      id === "BB00201" ||
      id === "BB00301" ||
      id === "BB00401" ||
      id === "BB00501" ||
      id === "BB00601")
  ) {
    return "c" + (23 + offset_phn + offset_h) // 日本国憲法!!A!!他の学類対象の日本国憲法を取る可能性があるか
  }

  return undefined
}

function classifyColumnD(id: CourseId, specialty: Specialty, mode: Mode): string | undefined {
  let offset_h = 0;

  // 障害科学分野

    // 障害科学類開設の授業科目
  if (specialty === "nurse-h") {
    if (id === "CE31571") return "d" + (1 + offset_h) // 社会保障論I 2023年度より奇数年度開講
    if (id === "CE31551") return "d" + (2 + offset_h) // 社会福祉経営論
    if (id === "CE31681") return "d" + (3 + offset_h) // 公的扶助論 偶数年度開催
    if (id === "CE00011") return "d" + (4 + offset_h) // 日本の障害科学!!A!!2023年度しかリザードンに出てこない
    if (id === "CA10161") return "d" + (5 + offset_h) // Current Topics in Disability Sciences 2021年度までのCE12101と同一。

  // 国際・情報理解分野

    // 国際総合学類開設の授業科目
    // d6 グローバルコミュニケーション論!!A!!リザードンにもKdBにも出てこない
    if (id === "BC12231") return "d" + (7 + offset_h) // 教育開発論
    if (id === "BC11551") return "d" + (8 + offset_h) // 人類学特講
    if (id === "BC50121") return "d" + (9 + offset_h) // 国際学II  「国際学概論III」の単位を取得した者は履修不可。
    if (id === "BC50141") return "d" + (10 + offset_h) // 国際学IV  「国際学概論V」の単位を取得した者は履修不可。
    if (id === "BC51101") return "d" + (11 + offset_h) // 文化・開発論  BB11451と同一。!!A!!BB11451とBC51101のどちらでもかまわないか

    // 情報学群開設の授業科目
    if (id === "GA10101") return "d" + (12 + offset_h) // 情報社会と法制度
    if (id === "GA10201") return "d" + (13 + offset_h) // 知的財産概論
    if (id === "GA14111") return "d" + (14 + offset_h) // 知識情報概論 (GA14121)の単位修得済みの者は履修不可。!!A!!GA14111とGA14121のどちらでもかまわないか
    if (id === "GA14201") return "d" + (15 + offset_h) // 知識情報システム概説

    // 知識情報・図書館学類開設の授業科目
    if (id === "GE21201") return "d" + (16 + offset_h) // コンピュータシステムとネットワーク
    offset_h += 16;
  }

  // 生活支援科学分野
  if (id === "HC22101") return "d" + (1 + offset_h) // 医療経済学 HE22121と同一。 !!A!!どちらでも構わないか
  if (id === "HC22251") return "d" + (2 + offset_h) // 環境保健
  if (specialty === "nurse-n") {
    if (
      (mode === "known" && id === "BB00301") ||
      (mode === "real" &&
        (id === "BB00101" ||
          id === "BB00201" ||
          id === "BB00301" ||
          id === "BB00401" ||
          id === "BB00501" ||
          id === "BB00601")
      )
    ) {
      return "d" + (3 + offset_h) // 日本国憲法!!A!!他の学類対象の日本国憲法を取る可能性があるか
    }
  }

  return undefined
}

function isE1(id: string, specialty: Specialty, mode: Mode): boolean {
  return (
    // ファーストイヤーセミナー
    id === "1122102" || // Aクラス
    id === "1122202" || // Bクラス
    id === "1122302" || // Cクラス
    id === "1122402" || // Dクラス !!A!!2025年度に存在しないが正しいか
    // Japan-Expertファーストイヤーセミナー
    (specialty === "nurse-h" && (
      id === "1122502" // Japan-Expert(学士)プログラム生に限る
    )) ||
    // 学問への誘い
    id === "1227731" || // Aクラス
    id === "1227741" || // Bクラス
    id === "1227751" || // Cクラス
    id === "1227761" || // Dクラス !!A!!2025年度に存在しないが正しいか
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id); // !!A!!基礎体育の時に種目が違うか、応用の時に種目が同じかチェック
}

function isE3(id: string, specialty: Specialty): boolean {
  return (
    (
      (specialty === "nurse-n" || specialty === "nurse-phn") && // 看護師または保健師
      false // 第１外国語（英語）!!A!!これは必修英語と第一外国語（英語）全部含めるのか
    ) ||
    (
      specialty === "nurse-h" && // ヘルスケア
      false // !!A!!第１外国語（日本語）とは
    )
  );
}

function isE4(id: string, specialty: Specialty, mode: Mode): boolean {
  return (
    (
      (specialty === "nurse-n" || specialty === "nurse-phn") &&// 看護師または保健師
      (id === "6118101" || // 情報リテラシー(講義)
        id === "6418102" || // 情報リテラシー(演習) 看護2班対象
        id === "6419102" || // 情報リテラシー(演習) 医療, 看護1班対象
        id === "6518102" || // データサイエンス 看護2班対象
        id === "6519102" || // データサイエンス 医療，看護1班対象
        (mode === "real" &&
          (isInfoLiteracyLecture(id) ||
            isInfoLiteracyExercise(id) ||
            isDataScience(id))))
    ) ||
    (
      specialty === "nurse-h" && // ヘルスケア
      false// 第２外国語（英語）!!A!!これは必修英語と第一外国語（英語）全部含めるのか
    )
  );
}

function isE5(id: string, specialty: Specialty, mode: Mode): boolean {
  return (
    (
      (specialty === "nurse-n" || specialty === "nurse-phn") && //看護師または保健師
      isJapanese(id)
    ) ||
    (
      specialty === "nurse-h" && //ヘルスケア
      (
        id === "6118101" || // 情報リテラシー(講義)
        id === "6418102" || // 情報リテラシー(演習) 看護2班対象
        id === "6419102" || // 情報リテラシー(演習) 医療, 看護1班対象
        id === "6518102" || // データサイエンス 看護2班対象
        id === "6519102" || // データサイエンス 医療，看護1班対象
        (mode === "real" &&
          (isInfoLiteracyLecture(id) ||
            isInfoLiteracyExercise(id) ||
            isDataScience(id)))
      )
    )
  );
}

function isF1(id: string, specialty: Specialty): boolean {
  return (
    isGakushikiban(id) ||
    (specialty === "nurse-h" && isSecondForeignLanguage(id)) // !!A!!第２外国語（初修外国語）はこれで正しいか
  );
}

function isG1(id: string, specialty: Specialty): boolean {
  return (
    (specialty === "nurse-n" || specialty === "nurse-phn") &&
    (
      id === "AB00221" || // 哲学通論BII 全学対象 *哲学通論AII,CII,DIIと同一科目
      id === "AB00311" || // 哲学通論CI 全学対象 *哲学通論AI,BI,DIと同一科目
      id === "AB60A11" || // 哲学通論-a ★2018年度以前入学者の人文・文化学群コアカリキュラム(人文学類生は学群コアカリキュラムとしては履修できない)
      id === "AB60A21" // 哲学通論-b
      // !!A!!どれが該当するか
    )
  );
}

function isH1(id: string, tableYear: number): boolean {
  return (
    (tableYear === 2023 || tableYear === 2024) && (
      id === "EC12131" || // 化学 「化学」(EC12101)、「化学Ⅰ」(EC12111)及び「化学II」(EC12121)を修得済みの者は履修できない。!!A!!EC12101との違いは何か。
      id === "EC12171" // 物理学 「物理学」(EC12081)、「物理学I」(EC12181)及び「物理学II」(EC12191)を修得した者は履修できない。!!A!!EC12081との違いは何か。
      // !!A!!リザードンにない、生物学とは何か
      // !!A!!「共通科目は除く」とは「学類共通（専門基礎科目）」を除くという意味で正しいか
      // CC21~27 || CE21~32 人間学群心理学類及び障害科学類開設の授業科目(共通科目は除く)!!A!!「心理学類生に限る。」が含まれている。「人間学群生に限る。」が含まれている。卒業研究などが入っている。
      // 体育専門学群開設の授業科目(共通科目は除く)!!A!!どれを指しているかわからない
      // AB7~9 人文・文化学群人文学類開設の授業科目のうち「哲学､倫理学、宗教学」分野の授業科目(共通科目は除く)!!A!!卒業研究などが入っている
      // 教育職員免許法に定める教科に関する専門的事項の「哲学、倫理学、宗教学」に対応する科目として人文・文化学群比較文化学類が開設する授業科目!!A!!どれを指しているかわからない
    ) ||
    (tableYear === 2025 && (
      // 他学類の開設科目(専門科目および専門基礎科目に該当する科目は除く)!!A!!どれを指しているかわからない
      false
    ))
  );
}

function classifyColumnH(id: string, speciality: Specialty, tableYear: number): string | undefined {
  if (isH1(id, tableYear)) return "h1";
  // JEプログラム他コース提供科目
  if (speciality === "nurse-h") {
    if (id === "EC12301") return "h2" // 生物資源の開発・生産と持続利用
    if (id === "EC12501") return "h3" // 生物資源としての遺伝子とゲノム
    if (id === "EC12401") return "h4" // 生物資源と環境
    if (id === "EC12201") return "h5" // 生物資源学にみる食品科学・技術の最前線
    if (id === "4004013") return "h6" // 芸術(日本画実習)
    if (id === "4006012") return "h7" // 芸術(書A)
    if (id === "4006022") return "h8" // 芸術(書B)
    if (id === "4006032") return "h9" // 芸術(書C)
    if (id === "AE56A21") return "h10" // 共生のための日本語教育
    if (id === "AE56A11") return "h11" // 共生のための社会言語学
    if (id === "AE56A31") return "h12" // 共生のための人類学
    if (id === "AE56A41") return "h13" // 共生のための歴史学
  }

  return undefined
}

function classify(
  id: CourseId,
  specialty: Specialty,
  _isNative: boolean,
  mode: Mode,
  tableYear: number,
): string | undefined {
  // 必修
  const a = classifyColumnA(id, specialty);
  if (a !== undefined) return a;
  const c = classifyColumnC(id, specialty, mode);
  if (c !== undefined) return c;
  if (isE1(id, specialty, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(id, specialty)) return "e3";
  if (isE4(id, specialty, mode)) return "e4";
  if (isE5(id, specialty, mode)) return "e5";
  if (isG1(id, specialty)) return "g1";
  // 選択
  const d = classifyColumnD(id, specialty, mode);
  if (d !== undefined) return d;
  if (isF1(id, specialty)) return "f1";
  const h = classifyColumnH(id, specialty, tableYear);
  if (h !== undefined) return h;
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
  tableYear: number,
  specialty: Specialty,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, specialty, opts.isNative, "known", tableYear);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  opts: ClassifyOptions,
  tableYear: number,
  specialty: Specialty,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, specialty, opts.isNative, "real", tableYear);
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  _cs: FakeCourse[],
  _opts: ClassifyOptions,
  _tableYear: number,
  _specialty: Specialty,
) {
  return undefined; // FakeCoursesがよくわからん
}

export const creditRequirementsN: SetupCreditRequirements = {
  cells: {
    a1: { min: 1, max: 1 },
    a2: { min: 3, max: 3 },
    a3: { min: 2, max: 2 },
    a4: { min: 2, max: 2 },
    a5: { min: 2, max: 2 },
    a6: { min: 1, max: 1 },
    a7: { min: 1, max: 1 },
    a8: { min: 2, max: 2 },
    a9: { min: 1, max: 1 },
    a10: { min: 3, max: 3 },
    a11: { min: 2, max: 2 },
    a12: { min: 2, max: 2 },
    a13: { min: 2, max: 2 },
    a14: { min: 1, max: 1 },
    a15: { min: 2, max: 2 },
    a16: { min: 1, max: 1 },
    a17: { min: 1, max: 1 },
    a18: { min: 1, max: 1 },
    a19: { min: 2, max: 2 },
    a20: { min: 2, max: 2 },
    a21: { min: 1, max: 1 },
    a22: { min: 2, max: 2 },
    a23: { min: 2, max: 2 },
    a24: { min: 1, max: 1 },
    a25: { min: 2, max: 2 },
    a26: { min: 2, max: 2 },
    a27: { min: 2, max: 2 },
    a28: { min: 1, max: 1 },
    a29: { min: 1, max: 1 },
    a30: { min: 2, max: 2 },
    a31: { min: 1, max: 1 },
    a32: { min: 2, max: 2 },
    a33: { min: 1, max: 1 },
    a34: { min: 1, max: 1 },
    a35: { min: 1, max: 1 },
    a36: { min: 1, max: 1 },
    a37: { min: 1, max: 1 },
    a38: { min: 1, max: 1 },
    a39: { min: 2, max: 2 },
    a40: { min: 2, max: 2 },
    a41: { min: 4, max: 4 },
    a42: { min: 2, max: 2 },
    a43: { min: 2, max: 2 },
    a44: { min: 1, max: 1 },
    a45: { min: 2, max: 2 },

    c1: { min: 1, max: 1 },
    c2: { min: 1, max: 1 },
    c3: { min: 1, max: 1 },
    c4: { min: 1, max: 1 },
    c5: { min: 1, max: 1 },
    c6: { min: 2, max: 2 },
    c7: { min: 2, max: 2 },
    c8: { min: 1, max: 1 },
    c9: { min: 1, max: 1 },
    c10: { min: 1, max: 1 },
    c11: { min: 2, max: 2 },
    c12: { min: 2, max: 2 },
    c13: { min: 2, max: 2 },
    c14: { min: 1, max: 1 },
    c15: { min: 1, max: 1 },
    c16: { min: 1, max: 1 },
    c17: { min: 2, max: 2 },
    c18: { min: 1, max: 1 },
    c19: { min: 1, max: 1 },
    c20: { min: 2, max: 2 },
    c21: { min: 1, max: 1 },
    c22: { min: 1, max: 1 },

    d1: { min: 1, max: 1 },

    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 1, max: 1 },

    f1: { min: 1, max: 1 },

    g1: { min: 2, max: 2 },

    h1: { min: 4, max: 4 },
  },
  columns: {
    a: { min: 74, max: 74 },
    b: { min: 0, max: 0 },
    c: { min: 29, max: 29 },
    d: { min: 1, max: 1 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 1 },
    g: { min: 2, max: 2 },
    h: { min: 4, max: 4 },
  },
  compulsory: 118, // !!A!!必修の合計は118で正しいか、116は関係ないか
  elective: 6,
};

export const creditRequirementsPhn: SetupCreditRequirements = {
  cells: {
    a1: { min: 1, max: 1 },
    a2: { min: 3, max: 3 },
    a3: { min: 2, max: 2 },
    a4: { min: 2, max: 2 },
    a5: { min: 2, max: 2 },
    a6: { min: 1, max: 1 },
    a7: { min: 1, max: 1 },
    a8: { min: 2, max: 2 },
    a9: { min: 1, max: 1 },
    a10: { min: 3, max: 3 },
    a11: { min: 2, max: 2 },
    a12: { min: 2, max: 2 },
    a13: { min: 2, max: 2 },
    a14: { min: 1, max: 1 },
    a15: { min: 2, max: 2 },
    a16: { min: 1, max: 1 },
    a17: { min: 1, max: 1 },
    a18: { min: 1, max: 1 },
    a19: { min: 2, max: 2 },
    a20: { min: 2, max: 2 },
    a21: { min: 1, max: 1 },
    a22: { min: 2, max: 2 },
    a23: { min: 2, max: 2 },
    a24: { min: 1, max: 1 },
    a25: { min: 2, max: 2 },
    a26: { min: 2, max: 2 },
    a27: { min: 2, max: 2 },
    a28: { min: 1, max: 1 },
    a29: { min: 1, max: 1 },
    a30: { min: 2, max: 2 },
    a31: { min: 1, max: 1 },
    a32: { min: 2, max: 2 },
    a33: { min: 1, max: 1 },
    a34: { min: 1, max: 1 },
    a35: { min: 1, max: 1 },
    a36: { min: 1, max: 1 },
    a37: { min: 1, max: 1 },
    a38: { min: 1, max: 1 },
    a39: { min: 2, max: 2 },
    a40: { min: 2, max: 2 },
    a41: { min: 2, max: 2 },
    a42: { min: 2, max: 2 },
    a43: { min: 1, max: 1 },
    a44: { min: 2, max: 2 },

    a45: { min: 2, max: 2 },
    a46: { min: 4, max: 4 },
    a47: { min: 4, max: 4 },
    a48: { min: 2, max: 2 },
    a49: { min: 3, max: 3 },

    c1: { min: 1, max: 1 },
    c2: { min: 1, max: 1 },
    c3: { min: 1, max: 1 },
    c4: { min: 1, max: 1 },
    c5: { min: 1, max: 1 },
    c6: { min: 2, max: 2 },
    c7: { min: 2, max: 2 },
    c8: { min: 1, max: 1 },
    c9: { min: 1, max: 1 },
    c10: { min: 1, max: 1 },
    c11: { min: 2, max: 2 },
    c12: { min: 2, max: 2 },
    c13: { min: 2, max: 2 },
    c14: { min: 1, max: 1 },
    c15: { min: 1, max: 1 },
    c16: { min: 1, max: 1 },
    c17: { min: 2, max: 2 },
    c18: { min: 1, max: 1 },
    c19: { min: 1, max: 1 },
    c20: { min: 2, max: 2 },
    c21: { min: 1, max: 1 },
    c22: { min: 1, max: 1 },
    c23: { min: 2, max: 2 },

    d1: { min: 1, max: 1 },

    e1: { min: 2, max: 2 },
    e2: { min: 2, max: 2 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    e5: { min: 1, max: 1 },

    f1: { min: 1, max: 1 },

    g1: { min: 2, max: 2 },

    h1: { min: 4, max: 4 },
  },
  columns: {
    a: { min: 85, max: 85 },
    b: { min: 0, max: 0 },
    c: { min: 31, max: 31 },
    d: { min: 1, max: 1 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 1 },
    g: { min: 2, max: 2 },
    h: { min: 4, max: 4 },
  },
  compulsory: 131,
  elective: 6,
};

export const creditRequirementsH2023: SetupCreditRequirements = {
  cells: {
    a1: { min: 1, max: 1 },
    a2: { min: 3, max: 3 },
    a3: { min: 2, max: 2 },
    a4: { min: 2, max: 2 },
    a5: { min: 2, max: 2 },
    a6: { min: 1, max: 1 },
    a7: { min: 1, max: 1 },
    a8: { min: 3, max: 3 },
    a9: { min: 2, max: 2 },
    a10: { min: 1, max: 1 },
    a11: { min: 2, max: 2 },
    a12: { min: 1, max: 1 },
    a13: { min: 2, max: 2 },
    a14: { min: 1, max: 1 },
    a15: { min: 2, max: 2 },
    a16: { min: 1, max: 1 },
    a17: { min: 2, max: 2 },
    a18: { min: 2, max: 2 },
    a19: { min: 1, max: 1 },
    a20: { min: 1, max: 1 },
    a21: { min: 2, max: 2 },
    a22: { min: 1, max: 1 },
    a23: { min: 1, max: 1 },
    a24: { min: 1, max: 1 },
    a25: { min: 1, max: 1 },
    a26: { min: 1, max: 1 },
    a27: { min: 2, max: 2 },
    a28: { min: 2, max: 2 },
    a29: { min: 1, max: 1 },
    a30: { min: 4, max: 4 },
    a31: { min: 4, max: 4 },
    a32: { min: 4, max: 4 },

    c1: { min: 1, max: 1 }, // Japan-Expert総論
    c2: { min: 1, max: 1 },
    c3: { min: 1, max: 1 },
    c4: { min: 1, max: 1 },
    c5: { min: 1, max: 1 },
    c6: { min: 1, max: 1 },
    c7: { min: 2, max: 2 },
    c8: { min: 2, max: 2 },
    c9: { min: 1, max: 1 },
    c10: { min: 1, max: 1 },
    c11: { min: 1, max: 1 },
    c12: { min: 2, max: 2 },
    c13: { min: 2, max: 2 },
    c14: { min: 2, max: 2 },
    c15: { min: 1, max: 1 },
    c16: { min: 1, max: 1 },
    c17: { min: 1, max: 1 },
    c18: { min: 2, max: 2 },
    c19: { min: 1, max: 1 },
    c20: { min: 1, max: 1 },
    c21: { min: 2, max: 2 },
    c22: { min: 1, max: 1 },
    c23: { min: 1, max: 1 },
    c24: { min: 2, max: 2 },

    d1: { min: 10, max: 10 },
    d2: { min: 1, max: 1 },

    e1: { min: 3, max: 3 },
    e2: { min: 2, max: 2 },
    e3: { min: 17, max: 17 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },

    f1: { min: 1, max: 4 },

    h1: { min: 5, max: 8 },
    h2: { min: 1, max: 1 },
  },
  columns: {
    a: { min: 57, max: 57 },
    b: { min: 0, max: 0 },
    c: { min: 32, max: 32 },
    d: { min: 11, max: 11 },
    e: { min: 30, max: 30 },
    f: { min: 1, max: 4 },
    h: { min: 6, max: 9 },
  },
  compulsory: 119,
  elective: 18,
};

export const creditRequirementsHSince2024: SetupCreditRequirements = {
  cells: {
    a1: { min: 1, max: 1 },
    a2: { min: 3, max: 3 },
    a3: { min: 2, max: 2 },
    a4: { min: 2, max: 2 },
    a5: { min: 2, max: 2 },
    a6: { min: 1, max: 1 },
    a7: { min: 1, max: 1 },
    a8: { min: 3, max: 3 },
    a9: { min: 2, max: 2 },
    a10: { min: 1, max: 1 },
    a11: { min: 2, max: 2 },
    a12: { min: 1, max: 1 },
    a13: { min: 2, max: 2 },
    a14: { min: 1, max: 1 },
    a15: { min: 2, max: 2 },
    a16: { min: 1, max: 1 },
    a17: { min: 2, max: 2 },
    a18: { min: 2, max: 2 },
    a19: { min: 1, max: 1 },
    a20: { min: 1, max: 1 },
    a21: { min: 2, max: 2 },
    a22: { min: 1, max: 1 },
    a23: { min: 1, max: 1 },
    a24: { min: 1, max: 1 },
    a25: { min: 1, max: 1 },
    a26: { min: 1, max: 1 },
    a27: { min: 2, max: 2 },
    a28: { min: 2, max: 2 },
    a29: { min: 1, max: 1 },
    a30: { min: 4, max: 4 },
    a31: { min: 4, max: 4 },
    a32: { min: 4, max: 4 },

    c1: { min: 1, max: 1 }, // Japan-Expert総論
    c2: { min: 1, max: 1 },
    c3: { min: 1, max: 1 },
    c4: { min: 1, max: 1 },
    c5: { min: 1, max: 1 },
    c6: { min: 1, max: 1 },
    c7: { min: 2, max: 2 },
    c8: { min: 2, max: 2 },
    c9: { min: 1, max: 1 },
    c10: { min: 1, max: 1 },
    c11: { min: 1, max: 1 },
    c12: { min: 2, max: 2 },
    c13: { min: 2, max: 2 },
    c14: { min: 2, max: 2 },
    c15: { min: 1, max: 1 },
    c16: { min: 1, max: 1 },
    c17: { min: 1, max: 1 },
    c18: { min: 2, max: 2 },
    c19: { min: 1, max: 1 },
    c20: { min: 1, max: 1 },
    c21: { min: 2, max: 2 },
    c22: { min: 1, max: 1 },
    c23: { min: 1, max: 1 },
    c24: { min: 2, max: 2 },

    d1: { min: 10, max: 10 },
    d2: { min: 1, max: 1 },

    e1: { min: 3, max: 3 },
    e2: { min: 2, max: 2 },
    e3: { min: 15, max: 15 },
    e4: { min: 4, max: 4 },
    e5: { min: 4, max: 4 },

    f1: { min: 1, max: 4 },

    h1: { min: 5, max: 8 },
    h2: { min: 1, max: 1 },
  },
  columns: {
    a: { min: 57, max: 57 },
    b: { min: 0, max: 0 },
    c: { min: 32, max: 32 },
    d: { min: 11, max: 11 },
    e: { min: 28, max: 28 },
    f: { min: 1, max: 4 },
    h: { min: 6, max: 9 },
  },
  compulsory: 117,
  elective: 18,
};