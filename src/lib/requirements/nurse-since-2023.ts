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
  isCompulsoryEnglishById,
  isCompulsoryEnglishByName,
  isCompulsoryPe1,
  isCompulsoryPe2,
  isDataScience,
  isFirstYearSeminar,
  isGakushikiban,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
  isJapanese,
  isJapaneseAsForeignLanguage,
  isKyoutsuu,
  isSecondForeignLanguage,
} from "@/requirements/common";
import { unreachable } from "@/util";

export type Specialty = "nurse-n" | "nurse-phn" | "nurse-h";
type Mode = "known" | "real";

function classifyColumnA(
  id: CourseId,
  specialty: Specialty,
): string | undefined {
  const b = {
    // 臨床看護実践
    基礎看護学概論: id === "HC30141",
    基本看護技術: id === "HC30191",
    基本看護技術演習: id === "HC30192",
    フィジカルアセスメント: id === "HC30201",
    看護過程: id === "HC30181",
    看護生命倫理: id === "HC30071",
    看護技術実習: id === "HC30183",
    看護過程実習: id === "HC30193",
    臨床看護学概論: id === "HC32051",
    臨床看護方法論: id === "HC32081",
    "臨床看護学実習(クリティカルケア)": id === "HC32083",
    "臨床看護学実習(セルフケア)": id === "HC32093",
    // 生涯発達看護
    生涯発達と家族支援: id === "HC36191",
    子どもの発達支援学概論: id === "HC36161",
    子どもの発達支援方法論: id === "HC36171",
    "子どもの発達支援実習（保育所・施設ふれあい実習）": id === "HC36173",
    "子どもの発達支援実習（病院実習）": id === "HC36183",
    ウィメンズヘルス看護学概論: id === "HC35051",
    ウィメンズヘルス看護学方法論: id === "HC35211",
    ウィメンズヘルス看護学実習: id === "HC35043",
    高齢者看護学概論: id === "HC34001",
    高齢者看護方法論: id === "HC34051",
    高齢者看護学実習: id === "HC34083",
    // 地域看護実践
    "地域・在宅看護論": id === "HC37021",
    "地域・在宅看護方法論": id === "HC37031",
    "地域・在宅看護論実習": id === "HC37033",
    公衆衛生看護学概論: id === "HC31081" || id === "HC31091", // HC31091は2023年度に看護学類に移行した総合学域群生
    職域における保健活動: id === "HC31111",
    精神看護学概論: id === "HC33011",
    精神看護方法論: id === "HC33061",
    家族病理とメンタルヘルス: id === "HC37041",
    精神看護学実習: id === "HC33023",
    // 看護の発展
    ヘルスプロモーションと看護: id === "HC40011",
    災害看護学: id === "HC40041",
    看護マネジメント: id === "HC40031",
    国際看護学: id === "HC40051",
    "応用看護学演習I(OSCE)": id === "HC40072",
    "応用看護学演習II(IBT)": id === "HC40082",
    研究方法概論: id === "HC40061",
    看護学探究概説: id === "HC40121",
    看護学探究演習: id === "HC40122",
    ヘルスプロモーション実習I: id === "HC40003",
    ヘルスプロモーション実習II: id === "HC40013",
    医療チーム連携演習: id === "HC40112",
    応用看護学実習: id === "HC40023",
    // 保健師科目
    公衆衛生看護活動論: id === "HC41001",
    公衆衛生看護活動方法論: id === "HC41031",
    公衆衛生看護学応用論: id === "HC41052",
    公衆衛生看護管理論: id === "HC41061",
    公衆衛生看護学実習: id === "HC41003",
    // ヘルスケア原理
    国際ヘルスケア概論: id === "HC90011", // 2024は開講されない
    国際ヘルスケア演習: id === "HC90002", // 2021年10月以降入学者用 !!A!! HC90012 6単位の同名科目
    "ヘルスケア実習I(介護施設)": id === "HC90003",
    "ヘルスケア実習II(医療施設)": id === "HC90013",
  } as const;
  switch (specialty) {
    case "nurse-n":
      // 臨床看護実践
      if (b["基礎看護学概論"]) return "a1";
      if (b["基本看護技術"]) return "a2";
      if (b["基本看護技術演習"]) return "a3";
      if (b["フィジカルアセスメント"]) return "a4";
      if (b["看護過程"]) return "a5";
      if (b["看護生命倫理"]) return "a6";
      if (b["看護技術実習"]) return "a7";
      if (b["看護過程実習"]) return "a8";
      if (b["臨床看護学概論"]) return "a9";
      if (b["臨床看護方法論"]) return "a10";
      if (b["臨床看護学実習(クリティカルケア)"]) return "a11";
      if (b["臨床看護学実習(セルフケア)"]) return "a12";
      // 生涯発達看護
      if (b["生涯発達と家族支援"]) return "a13";
      if (b["子どもの発達支援学概論"]) return "a14";
      if (b["子どもの発達支援方法論"]) return "a15";
      if (b["子どもの発達支援実習（保育所・施設ふれあい実習）"]) return "a16";
      if (b["子どもの発達支援実習（病院実習）"]) return "a17";
      if (b["ウィメンズヘルス看護学概論"]) return "a18";
      if (b["ウィメンズヘルス看護学方法論"]) return "a19";
      if (b["ウィメンズヘルス看護学実習"]) return "a20";
      if (b["高齢者看護学概論"]) return "a21";
      if (b["高齢者看護方法論"]) return "a22";
      if (b["高齢者看護学実習"]) return "a23";
      // 地域看護実践
      if (b["地域・在宅看護論"]) return "a24";
      if (b["地域・在宅看護方法論"]) return "a25";
      if (b["地域・在宅看護論実習"]) return "a26";
      if (b["公衆衛生看護学概論"]) return "a27";
      if (b["職域における保健活動"]) return "a28";
      if (b["精神看護学概論"]) return "a29";
      if (b["精神看護方法論"]) return "a30";
      if (b["家族病理とメンタルヘルス"]) return "a31";
      if (b["精神看護学実習"]) return "a32";
      // 看護の発展
      if (b["ヘルスプロモーションと看護"]) return "a33";
      if (b["災害看護学"]) return "a34";
      if (b["看護マネジメント"]) return "a35";
      if (b["国際看護学"]) return "a36";
      if (b["応用看護学演習I(OSCE)"]) return "a37";
      if (b["応用看護学演習II(IBT)"]) return "a38";
      if (b["研究方法概論"]) return "a39";
      if (b["看護学探究概説"]) return "a40";
      if (b["看護学探究演習"]) return "a41";
      if (b["ヘルスプロモーション実習I"]) return "a42";
      if (b["ヘルスプロモーション実習II"]) return "a43";
      if (b["医療チーム連携演習"]) return "a44";
      if (b["応用看護学実習"]) return "a45";
      break;
    case "nurse-phn":
      // 臨床看護実践
      if (b["基礎看護学概論"]) return "a1";
      if (b["基本看護技術"]) return "a2";
      if (b["基本看護技術演習"]) return "a3";
      if (b["フィジカルアセスメント"]) return "a4";
      if (b["看護過程"]) return "a5";
      if (b["看護生命倫理"]) return "a6";
      if (b["看護技術実習"]) return "a7";
      if (b["看護過程実習"]) return "a8";
      if (b["臨床看護学概論"]) return "a9";
      if (b["臨床看護方法論"]) return "a10";
      if (b["臨床看護学実習(クリティカルケア)"]) return "a11";
      if (b["臨床看護学実習(セルフケア)"]) return "a12";
      // 生涯発達看護
      if (b["生涯発達と家族支援"]) return "a13";
      if (b["子どもの発達支援学概論"]) return "a14";
      if (b["子どもの発達支援方法論"]) return "a15";
      if (b["子どもの発達支援実習（保育所・施設ふれあい実習）"]) return "a16";
      if (b["子どもの発達支援実習（病院実習）"]) return "a17";
      if (b["ウィメンズヘルス看護学概論"]) return "a18";
      if (b["ウィメンズヘルス看護学方法論"]) return "a19";
      if (b["ウィメンズヘルス看護学実習"]) return "a20";
      if (b["高齢者看護学概論"]) return "a21";
      if (b["高齢者看護方法論"]) return "a22";
      if (b["高齢者看護学実習"]) return "a23";
      // 地域看護実践
      if (b["地域・在宅看護論"]) return "a24";
      if (b["地域・在宅看護方法論"]) return "a25";
      if (b["地域・在宅看護論実習"]) return "a26";
      if (b["公衆衛生看護学概論"]) return "a27";
      if (b["職域における保健活動"]) return "a28";
      if (b["精神看護学概論"]) return "a29";
      if (b["精神看護方法論"]) return "a30";
      if (b["家族病理とメンタルヘルス"]) return "a31";
      if (b["精神看護学実習"]) return "a32";
      // 看護の発展
      if (b["ヘルスプロモーションと看護"]) return "a33";
      if (b["災害看護学"]) return "a34";
      if (b["看護マネジメント"]) return "a35";
      if (b["国際看護学"]) return "a36";
      if (b["応用看護学演習I(OSCE)"]) return "a37";
      if (b["応用看護学演習II(IBT)"]) return "a38";
      if (b["研究方法概論"]) return "a39";
      if (b["看護学探究概説"]) return "a40";
      if (b["ヘルスプロモーション実習I"]) return "a41";
      if (b["ヘルスプロモーション実習II"]) return "a42";
      if (b["医療チーム連携演習"]) return "a43";
      if (b["応用看護学実習"]) return "a44";
      // 保健師科目
      if (b["公衆衛生看護活動論"]) return "a45";
      if (b["公衆衛生看護活動方法論"]) return "a46";
      if (b["公衆衛生看護学応用論"]) return "a47";
      if (b["公衆衛生看護管理論"]) return "a48";
      if (b["公衆衛生看護学実習"]) return "a49";
      break;
    case "nurse-h":
      // 臨床看護実践 (看護技術実習、看護過程実習なし)
      if (b["基礎看護学概論"]) return "a1";
      if (b["基本看護技術"]) return "a2";
      if (b["基本看護技術演習"]) return "a3";
      if (b["フィジカルアセスメント"]) return "a4";
      if (b["看護過程"]) return "a5";
      if (b["看護生命倫理"]) return "a6";
      if (b["臨床看護学概論"]) return "a7";
      if (b["臨床看護方法論"]) return "a8";
      // 生涯発達看護 (実習なし)
      if (b["生涯発達と家族支援"]) return "a9";
      if (b["子どもの発達支援学概論"]) return "a10";
      if (b["子どもの発達支援方法論"]) return "a11";
      if (b["ウィメンズヘルス看護学概論"]) return "a12";
      if (b["ウィメンズヘルス看護学方法論"]) return "a13";
      if (b["高齢者看護学概論"]) return "a14";
      if (b["高齢者看護方法論"]) return "a15";
      // 地域看護実践 (実習なし)
      if (b["地域・在宅看護論"]) return "a16";
      if (b["地域・在宅看護方法論"]) return "a17";
      if (b["公衆衛生看護学概論"]) return "a18";
      if (b["職域における保健活動"]) return "a19";
      if (b["精神看護学概論"]) return "a20";
      if (b["精神看護方法論"]) return "a21";
      if (b["家族病理とメンタルヘルス"]) return "a22";
      // 看護の発展 (演習I/II、看護学探究演習、実習なし)
      if (b["ヘルスプロモーションと看護"]) return "a23";
      if (b["災害看護学"]) return "a24";
      if (b["看護マネジメント"]) return "a25";
      if (b["国際看護学"]) return "a26";
      if (b["研究方法概論"]) return "a27";
      if (b["看護学探究概説"]) return "a28";
      // ヘルスケア原理
      if (b["国際ヘルスケア概論"]) return "a29";
      if (b["国際ヘルスケア演習"]) return "a30";
      if (b["ヘルスケア実習I(介護施設)"]) return "a31";
      if (b["ヘルスケア実習II(医療施設)"]) return "a32";
      break;
  }
}

function classifyColumnC(
  id: CourseId,
  specialty: Specialty,
  mode: Mode,
): string | undefined {
  const b = {
    // JEプログラム共通科目
    "Japan-Expert総論": id === "AE51K11",
    // 心と行動の科学分野
    人間関係論: id === "HC20001",
    心の健康と相談活動: id === "HC20021",
    行動科学: id === "HC20121",
    看護専門英語: id === "HC20152",
    "コミュニティ・エンパワメント論": id === "HC20151",
    // 人間と生命科学分野
    人体機能学: id === "HC21071",
    人体構造学: id === "HC21081",
    人体の代謝と栄養: id === "HC21091",
    臨床薬理学: id === "HC21031", // !!A!!看護学類生が他の臨床薬理学（HE30021、HE40231）を取ることはできるか
    遺伝と健康: id === "HC21151",
    微生物学: id === "HE21021" || id === "EC22101", // !!B!! 授業の違い
    疾病の治療と看護I: id === "HC21191",
    疾病の治療と看護II: id === "HC21211",
    子どもの健康と障害: id === "HC21221" || id === "HC21261", //HC21221は2022年度降入学生用、HC21261は2024年度入学編入生用
    老化と健康: id === "HC21231",
    "医療・生命科学とテクノロジー": id === "HE21051",
    // 生活支援科学分野
    保健統計学: id === "HC22081",
    保健医療福祉行政論I: id === "HC22231",
    保健医療福祉行政論II: id === "HC22241",
    疫学: id === "HC22021",
    障害理解: id === "HC22151",
    国際保健学: id === "HC22091",
    日本国憲法: {
      // !!A!!
      known:
        mode === "known" &&
        (id === "BB00301" || // 体育・看護・医療対象
          id === "BB00601"), // 全学対象(2年次以上),
      real:
        mode === "real" &&
        (id === "BB00101" ||
          id === "BB00201" ||
          id === "BB00401" ||
          id === "BB00501"),
    },
  } as const;
  switch (specialty) {
    case "nurse-n":
      // 心と行動の科学分野
      if (b["人間関係論"]) return "c1";
      if (b["心の健康と相談活動"]) return "c2";
      if (b["行動科学"]) return "c3";
      if (b["看護専門英語"]) return "c4";
      if (b["コミュニティ・エンパワメント論"]) return "c5";
      // 人間と生命科学分野
      if (b["人体機能学"]) return "c6";
      if (b["人体構造学"]) return "c7";
      if (b["人体の代謝と栄養"]) return "c8";
      if (b["臨床薬理学"]) return "c9";
      if (b["遺伝と健康"]) return "c10";
      if (b["微生物学"]) return "c11";
      if (b["疾病の治療と看護I"]) return "c12";
      if (b["疾病の治療と看護II"]) return "c13";
      if (b["子どもの健康と障害"]) return "c14";
      if (b["老化と健康"]) return "c15";
      if (b["医療・生命科学とテクノロジー"]) return "c16";
      // 生活支援科学分野
      if (b["保健統計学"]) return "c17";
      if (b["保健医療福祉行政論I"]) return "c18";
      if (b["保健医療福祉行政論II"]) return "c19";
      if (b["疫学"]) return "c20";
      if (b["障害理解"]) return "c21";
      if (b["国際保健学"]) return "c22";
      break;
    case "nurse-phn":
      // 心と行動の科学分野
      if (b["人間関係論"]) return "c1";
      if (b["心の健康と相談活動"]) return "c2";
      if (b["行動科学"]) return "c3";
      if (b["看護専門英語"]) return "c4";
      if (b["コミュニティ・エンパワメント論"]) return "c5";
      // 人間と生命科学分野
      if (b["人体機能学"]) return "c6";
      if (b["人体構造学"]) return "c7";
      if (b["人体の代謝と栄養"]) return "c8";
      if (b["臨床薬理学"]) return "c9";
      if (b["遺伝と健康"]) return "c10";
      if (b["微生物学"]) return "c11";
      if (b["疾病の治療と看護I"]) return "c12";
      if (b["疾病の治療と看護II"]) return "c13";
      if (b["子どもの健康と障害"]) return "c14";
      if (b["老化と健康"]) return "c15";
      if (b["医療・生命科学とテクノロジー"]) return "c16";
      // 生活支援科学分野
      if (b["保健統計学"]) return "c17";
      if (b["保健医療福祉行政論I"]) return "c18";
      if (b["保健医療福祉行政論II"]) return "c19";
      if (b["疫学"]) return "c20";
      if (b["障害理解"]) return "c21";
      if (b["国際保健学"]) return "c22";
      if (b["日本国憲法"].known || b["日本国憲法"].real) return "c23";
      break;
    case "nurse-h":
      // JEプログラム共通科目
      if (b["Japan-Expert総論"]) return "c1";
      // 心と行動の科学分野
      if (b["人間関係論"]) return "c2";
      if (b["心の健康と相談活動"]) return "c3";
      if (b["行動科学"]) return "c4";
      if (b["看護専門英語"]) return "c5";
      if (b["コミュニティ・エンパワメント論"]) return "c6";
      // 人間と生命科学分野
      if (b["人体機能学"]) return "c7";
      if (b["人体構造学"]) return "c8";
      if (b["人体の代謝と栄養"]) return "c9";
      if (b["臨床薬理学"]) return "c10";
      if (b["遺伝と健康"]) return "c11";
      if (b["微生物学"]) return "c12";
      if (b["疾病の治療と看護I"]) return "c13";
      if (b["疾病の治療と看護II"]) return "c14";
      if (b["子どもの健康と障害"]) return "c15";
      if (b["老化と健康"]) return "c16";
      if (b["医療・生命科学とテクノロジー"]) return "c17";
      // 生活支援科学分野
      if (b["保健統計学"]) return "c18";
      if (b["保健医療福祉行政論I"]) return "c19";
      if (b["保健医療福祉行政論II"]) return "c20";
      if (b["疫学"]) return "c21";
      if (b["障害理解"]) return "c22";
      if (b["国際保健学"]) return "c23";
      if (b["日本国憲法"].known || b["日本国憲法"].real) return "c24";
      break;
  }
}

function classifyColumnD(
  id: CourseId,
  specialty: Specialty,
  mode: Mode,
): string | undefined {
  const b = {
    // 生活支援科学分野
    医療経済学: id === "HC22101" || id === "HE22121", // !!B!! 授業の違い
    環境保健: id === "HC22251",
    日本国憲法: {
      // !!A!!
      known:
        mode === "known" &&
        (id === "BB00301" || // 体育・看護・医療対象
          id === "BB00601"), // 全学対象(2年次以上),
      real:
        mode === "real" &&
        (id === "BB00101" ||
          id === "BB00201" ||
          id === "BB00401" ||
          id === "BB00501"),
    },
  } as const;
  switch (specialty) {
    case "nurse-n":
      // 生活支援科学分野
      if (b["医療経済学"] || b["環境保健"] || b["日本国憲法"].known || b["日本国憲法"].real) return "d1";
      break;
    case "nurse-phn":
      // 生活支援科学分野
      if (b["医療経済学"] || b["環境保健"]) return "d1";
      break;
    case "nurse-h":
      // 障害科学類開設の授業科目
      if (
        id === "CE31571" || // 社会保障論I 2023年度より奇数年度開講
        id === "CE31551" || // 社会福祉経営論
        id === "CE31681" || // 公的扶助論 偶数年度開催
        id === "CE00011" || // 日本の障害科学!!B!!2023年度しかリザードンに出てこない
        id === "CA10161" || // Current Topics in Disability Sciences 2021年度までのCE12101と同一。
        // 国際総合学類開設の授業科目
        // d6 グローバルコミュニケーション論!!B!!リザードンにもKdBにも出てこない
        id === "BC12231" || // 教育開発論
        id === "BC11551" || // 人類学特講
        id === "BC50121" || // 国際学II  「国際学概論III」の単位を取得した者は履修不可。
        id === "BC50141" || // 国際学IV  「国際学概論V」の単位を取得した者は履修不可。
        id === "BC51101" || // 文化・開発論 // !!A!!
        id === "BB11451" || // 文化・開発論 // !!A!!
        // 情報学群開設の授業科目
        id === "GA10101" || // 情報社会と法制度
        id === "GA10201" || // 知的財産概論
        id === "GA14111" || // 知識情報概論 // !!A!!
        id === "GA14121" || // 知識情報概論 // !!A!!
        id === "GA14201" || // 知識情報システム概説
        // 知識情報・図書館学類開設の授業科目
        id === "GE21201" // コンピュータシステムとネットワーク
      )
        return "d1";
      // 生活支援科学分野
      if (b["医療経済学"] || b["環境保健"]) return "d2";
      break;
  }
}

function isE1(id: string, specialty: Specialty, mode: Mode): boolean {
  return (
    // ファーストイヤーセミナー
    id === "1122102" || // Aクラス
    id === "1122202" || // Bクラス
    id === "1122302" || // Cクラス
    id === "1122402" || // Dクラス !!B!!2025年度に存在しないが正しいか
    // Japan-Expertファーストイヤーセミナー
    (specialty === "nurse-h" && id === "1122502") ||
    // 学問への誘い
    id === "1227731" || // Aクラス
    id === "1227741" || // Bクラス
    id === "1227751" || // Cクラス
    id === "1227761" || // Dクラス !!B!!2025年度に存在しないが正しいか
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id);
}

function isE3(id: string, name: string, specialty: Specialty): boolean {
  return (
    ((specialty === "nurse-n" || specialty === "nurse-phn") &&
      isCompulsoryEnglishByName(name)) ||
    (specialty === "nurse-h" && isJapaneseAsForeignLanguage(id))
  );
}

function isE4(id: string, specialty: Specialty, mode: Mode): boolean {
  return (
    ((specialty === "nurse-n" || specialty === "nurse-phn") && // 看護師または保健師
      (id === "6118101" || // 情報リテラシー(講義)
        id === "6418102" || // 情報リテラシー(演習) 看護2班対象
        id === "6419102" || // 情報リテラシー(演習) 医療, 看護1班対象
        id === "6518102" || // データサイエンス 看護2班対象
        id === "6519102" || // データサイエンス 医療，看護1班対象
        (mode === "real" &&
          (isInfoLiteracyLecture(id) ||
            isInfoLiteracyExercise(id) ||
            isDataScience(id))))) ||
    (specialty === "nurse-h" && // ヘルスケア
      isCompulsoryEnglishById(id)) // 第２外国語（英語）!!B!!これは必修英語と同じ？
  );
}

function isE5(id: string, specialty: Specialty, mode: Mode): boolean {
  return (
    ((specialty === "nurse-n" || specialty === "nurse-phn") &&
      isJapanese(id)) ||
    (specialty === "nurse-h" &&
      (id === "6118101" || // 情報リテラシー(講義)
        id === "6418102" || // 情報リテラシー(演習) 看護2班対象
        id === "6419102" || // 情報リテラシー(演習) 医療, 看護1班対象
        id === "6518102" || // データサイエンス 看護2班対象
        id === "6519102" || // データサイエンス 医療，看護1班対象
        (mode === "real" &&
          (isInfoLiteracyLecture(id) ||
            isInfoLiteracyExercise(id) ||
            isDataScience(id)))))
  );
}

function isF1(id: string, specialty: Specialty): boolean {
  return (
    isGakushikiban(id) ||
    (specialty === "nurse-h" && isSecondForeignLanguage(id)) // !!B!!第２外国語（初修外国語）はこれで正しいか
  );
}

function isG1(id: string, specialty: Specialty): boolean {
  return (
    (specialty === "nurse-n" || specialty === "nurse-phn") &&
    (id === "AB00221" || // 哲学通論BII 全学対象 *哲学通論AII,CII,DIIと同一科目
      id === "AB00311" || // 哲学通論CI 全学対象 *哲学通論AI,BI,DIと同一科目
      id === "AB60A11" || // 哲学通論-a 2018年度以前入学者の人文・文化学群コアカリキュラム(人文学類生は学群コアカリキュラムとしては履修できない)
      id === "AB60A21") // 哲学通論-b
    // !!B!!どれが該当するか
  );
}

function isH1(
  id: string,
  specialty: Specialty,
  tableYear: number,
): boolean {

  if (tableYear === 2023 || tableYear === 2024) {
    if (
      id === "EC12131" || // 化学
      id === "EC12171" || // 物理学
      // !!B!!リザードンにない、生物学とは何か
      id.startsWith("CC") || // 心理学類
      id.startsWith("CE") || // 障害科学類
      id.startsWith("W") // 体育専門学群
    )
      return true;
    switch (specialty) {
      case "nurse-n":
      case "nurse-phn":
        if (
          id === "AB60A11" || // 哲学通論-a
          id === "AB60A21" || // 哲学通論-b
          id === "AB60B11" || // 倫理学通論-a
          id === "AB60B21" || // 倫理学通論-b
          id === "AB60C11" || // 宗教学通論-a
          id === "AB60C21" || // 宗教学通論-b
          id === "AB60G11" || // 東洋思想-a
          id === "AB60G21" || // 東洋思想-b
          id === "AB61A11" || // 哲学特講I-a (奇数年度)
          id === "AB61A21" || // 哲学特講I-b (奇数年度)
          id === "AB61A31" || // 哲学特講II-a (偶数年度)
          id === "AB61A41" || // 哲学特講II-b (偶数年度)
          id === "AB61A51" || // 哲学特講III-a
          id === "AB61A61" || // 哲学特講III-b
          id === "AB61A71" || // 哲学特講IV-a
          id === "AB61A81" || // 哲学特講IV-b
          id === "AB61C11" || // 哲学史I-a (奇数年度)
          id === "AB61C21" || // 哲学史I-b (奇数年度)
          id === "AB61C31" || // 哲学史II-a (偶数年度)
          id === "AB61C41" || // 哲学史II-b (偶数年度)
          id === "AB61C51" || // 哲学史III-a
          id === "AB61C61" || // 哲学史III-b
          id === "AB61C71" || // 哲学史IV-a
          id === "AB61C81" || // 哲学史IV-b
          id === "AB62A11" || // 倫理学特講I-a (奇数年度)
          id === "AB62A21" || // 倫理学特講I-b (奇数年度)
          id === "AB62A31" || // 倫理学特講II-a (偶数年度)
          id === "AB62A41" || // 倫理学特講II-b (偶数年度)
          id === "AB62A51" || // 倫理学特講III-a (奇数年度)
          id === "AB62A61" || // 倫理学特講III-b (奇数年度)
          id === "AB62A71" || // 倫理学特講IV-a (偶数年度)
          id === "AB62A81" || // 倫理学特講IV-b (偶数年度)
          id === "AB62C11" || // 倫理思想史I-a (奇数年度)
          id === "AB62C21" || // 倫理思想史I-b (奇数年度)
          id === "AB62C31" || // 倫理思想史II-a (偶数年度)
          id === "AB62C41" || // 倫理思想史II-b (偶数年度)
          id === "AB62C51" || // 倫理思想史III-a (奇数年度)
          id === "AB62C61" || // 倫理思想史III-b (奇数年度)
          id === "AB62E11" || // 倫理思想史V-a (奇数年度)
          id === "AB62E21" || // 倫理思想史V-b (偶数年度)
          id === "AB63A11" || // 宗教学-a (2025未開講)
          id === "AB63A21" || // 宗教学-b (2025未開講)
          id === "AB63A31" || // 宗教哲学-a (偶数年度)
          id === "AB63A41" || // 宗教哲学-b (偶数年度)
          id === "AB63A71" || // 比較思想論-a
          id === "AB63A81" || // 比較思想論-b
          id === "AB63B11" || // 東洋宗教思想史-a (2025未開講)
          id === "AB63B31" || // 西洋宗教思想史-a (奇数年度)
          id === "AB63B41"  // 西洋宗教思想史-b (奇数年度)
          // TODO: 倫理思想史IVが存在しない
        )
          return true;
        break;
      case "nurse-h":
        // !!B!!どれが該当するか
        if (
          id === "AB00221" || // 哲学通論BII
          id === "AB00311" || // 哲学通論CI
          id === "AB60A11" || // 哲学通論-a
          id === "AB60A21" // 哲学通論-b
        )
          return true;
        break;
      default:
        unreachable(specialty);
    }
  } else if (tableYear === 2025) {
    // 他学類の開設科目(専門科目および専門基礎科目に該当する科目は除く)
    if (!(id.startsWith("HC") || isKyoutsuu(id))) return true;
  }
  return false;
}

function isH2(id: string, specialty: Specialty): boolean {
  return (specialty === "nurse-h") && (
      id === "EC12301" || // 生物資源の開発・生産と持続利用
      id === "EC12501" || // 生物資源としての遺伝子とゲノム
      id === "EC12401" || // 生物資源と環境
      id === "EC12201" || // 生物資源学にみる食品科学・技術の最前線
      id === "4004013" || // 芸術(日本画実習)
      id === "4006012" || // 芸術(書A)
      id === "4006022" || // 芸術(書B)
      id === "4006032" || // 芸術(書C)
      id === "AE56A21" || // 共生のための日本語教育
      id === "AE56A11" || // 共生のための社会言語学
      id === "AE56A31" || // 共生のための人類学
      id === "AE56A41" // 共生のための歴史学
    );
}

function classify(
  id: CourseId,
  name: string,
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
  if (isE3(id, name, specialty)) return "e3";
  if (isE4(id, specialty, mode)) return "e4";
  if (isE5(id, specialty, mode)) return "e5";
  if (isG1(id, specialty)) return "g1";
  // 選択
  const d = classifyColumnD(id, specialty, mode);
  if (d !== undefined) return d;
  if (isF1(id, specialty)) return "f1";
  if (isH2(id, specialty)) return "h2";
  if (isH1(id, specialty, tableYear)) return "h1";
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
  tableYear: number,
  specialty: Specialty,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(
      c.id,
      c.name,
      specialty,
      opts.isNative,
      "known",
      tableYear,
    );
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
    const cellId = classify(
      c.id,
      c.name,
      specialty,
      opts.isNative,
      "real",
      tableYear,
    );
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyFakeCourses(
  cs: FakeCourse[],
  _opts: ClassifyOptions,
  _tableYear: number,
  specialty: Specialty,
): Map<FakeCourseId, string> {
  const fakeCourseIdToCellId = new Map<FakeCourseId, string>();
  for (const c of cs) {
    if (
      (isCompulsoryEnglishByName(c.name) && specialty === "nurse-n") ||
      specialty === "nurse-phn"
    ) {
      fakeCourseIdToCellId.set(c.id, "e3");
    }
  }
  return fakeCourseIdToCellId;
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
    c1: { min: 1, max: 1 },
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
    c1: { min: 1, max: 1 },
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
    c: { min: 32, max: 32 },
    d: { min: 11, max: 11 },
    e: { min: 28, max: 28 },
    f: { min: 1, max: 4 },
    h: { min: 6, max: 9 },
  },
  compulsory: 117,
  elective: 18,
};