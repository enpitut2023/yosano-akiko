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
  isCompulsoryPe1,
  isCompulsoryPe2,
  isCompulsoryPe3,
  isDataScience,
  isElectivePe,
  isFirstYearSeminar,
  isForeignLanguage,
  isGakushikiban,
  isHakubutsukan,
  isInfoLiteracyExercise,
  isInfoLiteracyLecture,
  isIzanai,
  isJapanese,
  isJiyuukamoku,
  isKyoushoku,
  isKyoutsuu,
} from "@/requirements/common";
import { unreachable } from "@/util";

export type Specialty =
  // Intelligent Engineering Systems
  | "ies"
  // Engineering Mechanics and Energy
  | "eme";
type Mode = "known" | "real";

/**
 * 工学システム基礎実験A, B
 */
function isKisojikken(id: string): boolean {
  return (
    id === "FG19103" || //工学システム基礎実験A
    id === "FG19113" //工学システム基礎実験B
  );
}

/**
 * 卒業研究
 */
function isThesis(id: string): boolean {
  return (
    //卒業研究A(春ABC)
    id === "FG19208" || //2024以降
    id === "FG29948" || //2023
    id === "FG39948" || //2023
    id === "FG49948" || //2023
    id === "FG59948" || //2023
    //卒業研究B(秋ABC)
    id === "FG19218" || //2024以降
    id === "FG29958" || //2023
    id === "FG39958" || //2023
    id === "FG49958" || //2023
    id === "FG59958" || //2023
    //卒業研究a(秋ABC)
    id === "FG19228" || //2024以降
    id === "FG29968" || //2023
    id === "FG39968" || //2023
    id === "FG49968" || //2023
    id === "FG59968" || //2023
    //卒業研究b(春ABC)
    id === "FG19238" || //2024以降
    id === "FG29978" || //2023
    id === "FG39978" || //2023
    id === "FG49978" || //2023
    id === "FG59978" || //2023
    //特別卒業研究A 早期卒業用(春ABC)2023, 24, 25で同じ
    id === "FG19358" ||
    //特別卒業研究B 早期卒業用(秋ABC)2023, 24, 25で同じ
    id === "FG19348"
  );
}

/**
 * 専門英語A
 */
function isAcademicEnglishA(id: string): boolean {
  return (
    id === "FG18102" || //2年1,2クラス
    id === "FG18112" //2年3,4クラス
  );
}

/**
 * 工学システム概論
 */
function isKougakuSystemGairon(id: string): boolean {
  return (
    id === "FG10641" || //2023開講 2019年度および2020年度入学生の必修科目
    id === "FG16051" //2023, 2024, 2025開講 2019年度以降入学生対象
  );
}

/**
 * 建築士試験受験資格の指定科目に対応する科目
 * 2025年度の指定科目一覧: https://www.esys.tsukuba.ac.jp/wordpress/wp-content/uploads/2025/04/tebiki2025_30-33.pdf
 * 指定科目一覧のリンクがあるページ: https://www.esys.tsukuba.ac.jp/subjects/guide
 */
function isForArchitectExam(id: string): boolean {
  return (
    id === "FG45876" || //建築設計製図I
    id === "FG45886" || //建築設計製図II
    id === "FG45896" || //建築設計製図III
    id === "FH45092" || //施設設計演習
    //設計計画論
    id === "FG43811" || //2023, 2024, 2025開講
    id === "FG43821" || //2023開講 2016〜2018年度入学者対象
    id === "FH46031" || //空間デザイン論
    id === "FH46021" || //住環境計画概論 BC12551と同一
    //都市計画の歴史
    id === "FH45211" || //2023, 2024, 2025開講 BC12831と同一
    id === "FH63081" || //2024, 2025開講 2018年度以前入学者の選択必修科目 2018年度以前入学者はFH45211の履修により本科目の履修に代えることができる
    id === "YBQ4061" || //建築計画論
    id === "YBQ3601" || //建築設計論
    id === "YBQ4041" || //建築通史
    id === "YBQ0411" || //世界建築史
    //建築環境工学
    id === "FG45911" ||
    id === "FG55911" ||
    id === "YBQ3811" || //建築環境計画論
    id === "FG45901" || //建築設備
    //建築設備計画論 該当科目なし？ 建築設備計画演習の備考には「YBQ3811建築環境計画論...」という言及がある
    //材料力学基礎
    id === "FG10864" || //2023, 2024, 2025開講 2023は2018年度以前入学者で環境開発工学、エネルギー工学主専攻の学生は所属主専攻の科目番号で履修登録(FG45554, FG55554と同一)
    id === "FG45554" || //2023開講
    id === "FG55554" || //2023開講
    //応用材料力学I
    id === "FG45564" ||
    id === "FG55564" ||
    //応用材料力学II
    id === "FG45604" ||
    id === "FG55604" ||
    //構造力学I
    id === "FG45434" ||
    id === "FG55434" ||
    //構造力学II
    id === "FG45721" ||
    id === "FG55721" ||
    //振動工学
    id === "FG45611" ||
    id === "FG55611" ||
    id === "FG45451" || //土質力学
    //地盤工学
    id === "FG45771" || //2023開講　2018年度以前の入学者対象 2018年度以前の入学者で、建築士受験資格の取得を目指す者は、FG45831より、本科目を履修することが望ましい
    id === "FG45831" || //2023, 2024, 2025開講 2019年度以降入学者対象
    id === "YBQ5021" || //構造計画 西暦奇数年度開講 2023, 2025開講
    id === "FG45791" || //鉄筋コンクリート構造学
    id === "FG45801" || //鋼構造学
    //防災工学
    id === "FG45751" || //2023, 2024, 2025開講
    id === "FG45821" || //2023開講 2018年度以前入学者対象　2018年度以前の入学者で、建築士受験資格の取得を目指す者は、FG45751より、本科目を履修することが望ましい
    id === "YBQ4201" || //建築構法論
    id === "YBQ4202" || //建築構法論演習
    //材料学基礎
    id === "FG12021" || //2023, 2024, 2025開講 2023は2018年度以前入学者は所属主専攻の科目番号の科目番号で履修登録　FG22301, FG32301, FG42261, FG52261と同一
    id === "FG22301" || //2023開講 2019年度以降入学生はFG12021
    id === "FG32301" || //2023開講
    id === "FG42261" || //2023開講
    id === "FG52261" || //2023開講
    //応用材料学
    id === "FG42271" ||
    id === "FG52271" ||
    id === "FG42251" || //コンクリート工学
    //複合材料学
    id === "FG42621" ||
    id === "FG52621" ||
    id === "YBQ0821" || //建築材料論 西暦偶数年度開講 2024開講
    id === "FH45061" || //建築経済
    id === "FH45071" || //建築生産
    id === "FH45051" || //建築関連法規
    id === "FG18101" || //工学者のための倫理
    //エネルギー・メカニクス専門実験(所属主専攻の科目番号で履修登録)
    id === "FG49873" ||
    id === "FG59873" ||
    id === "YBP3401" || //ランドスケープデザイン論
    id === "YAX1601" || //世界遺産学入門
    id === "YAZ1411" || //デザイン史概説A
    id === "YAZ1421" || //デザイン史概説B
    id === "YBQ4051" || //現代デザイン論
    id === "YAQ1011" || //建築デザイン概論
    id === "YAP1011" || //環境デザイン概論
    id === "YBP3301" || //都市デザイン論
    id === "1425011" || //社会のなかの建築デザイン
    //都市計画原論
    id === "FH45201" || //2023, 2024, 2025開講 BC12721と同一  2018年度以前入学者はFH63071の履修に代えることができる
    id === "FH63071" || //2024, 2025開講 2018年度以前入学者の選択必修科目 2019年度以降入学者はFH45201を履修すること
    id === "FH47041" || //都市防災計画
    id === "FH46041" || //都市緑地計画
    id === "FH46051" || //現代まちづくり論
    id === "FH47021" || //土地利用計画
    id === "YBP2831" //地域まちづくり論特講
  );
}

function isA1Ies(id: string): boolean {
  return (
    //プログラミング序論C(所属主専攻の科目番号で履修登録)
    id === "FG20204" ||
    id === "FG30204" ||
    //プログラミング序論D(所属主専攻の科目番号で履修登録)
    id === "FG20214" ||
    id === "FG30214"
  );
}

function isA2Ies(id: string): boolean {
  return isKisojikken(id);
}

function isA3Ies(id: string): boolean {
  return (
    //知的・機能工学システム実験(所属主専攻の科目番号で履修登録)
    id === "FG29213" || id === "FG39213"
  );
}

function isA4Ies(id: string): boolean {
  return isThesis(id);
}

function isA5Ies(id: string): boolean {
  return (
    id === "FG18101" //工学者のための倫理
  );
}

function isA6Ies(id: string): boolean {
  return (
    isAcademicEnglishA(id) ||
    //専門英語B
    id === "FG20222" ||
    id === "FG30222" ||
    //専門英語演習
    id === "FG20232" ||
    id === "FG30232"
  );
}

function isA1Eme(id: string): boolean {
  return isKisojikken(id);
}

function isA2Eme(id: string): boolean {
  return (
    //エネルギー・メカニクス専門実験(所属主専攻の科目番号で履修登録)
    id === "FG49873" ||
    id === "FG59873" ||
    //エネルギー・メカニクス応用実験(所属主専攻の科目番号で履修登録)
    id === "FG49883" ||
    id === "FG59883"
  );
}

function isA3Eme(id: string): boolean {
  return isThesis(id);
}

function isA4Eme(id: string): boolean {
  return (
    id === "FG18101" //工学者のための倫理
  );
}

function isA5Eme(id: string): boolean {
  return (
    isAcademicEnglishA(id) ||
    //専門英語B
    id === "FG40222" ||
    id === "FG50222" ||
    //専門英語演習
    id === "FG40232" ||
    id === "FG50232"
  );
}

function isA6Eme(id: string): boolean {
  return (
    //数値計算法 2023, 2024, 2025開講　2024以降は所属主専攻の科目番号で履修登録
    id === "FG40354" || id === "FG50354"
  );
}

function classifyColumnA(id: string, specialty: Specialty): string | undefined {
  switch (specialty) {
    case "ies":
      if (isA1Ies(id)) return "a1";
      if (isA2Ies(id)) return "a2";
      if (isA3Ies(id)) return "a3";
      if (isA4Ies(id)) return "a4";
      if (isA5Ies(id)) return "a5";
      if (isA6Ies(id)) return "a6";
      break;
    case "eme":
      if (isA1Eme(id)) return "a1";
      if (isA2Eme(id)) return "a2";
      if (isA3Eme(id)) return "a3";
      if (isA4Eme(id)) return "a4";
      if (isA5Eme(id)) return "a5";
      if (isA6Eme(id)) return "a6";
      break;
    default:
      unreachable(specialty);
  }
}

function isB1(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "ies":
      return id.startsWith("FG11") || id.startsWith("FG21");
    case "eme":
      return id.startsWith("FG11") || id.startsWith("FG41");
    default:
      unreachable(specialty);
  }
}

function isB2(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "ies":
      return id.startsWith("FG12") || id.startsWith("FG22");
    case "eme":
      return id.startsWith("FG12") || id.startsWith("FG42");
    default:
      unreachable(specialty);
  }
}

function isB3(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "ies":
      return id.startsWith("FG13") || id.startsWith("FG23");
    case "eme":
      return id.startsWith("FG13") || id.startsWith("FG43");
    default:
      unreachable(specialty);
  }
}

function isB4(id: string, specialty: Specialty): boolean {
  switch (specialty) {
    case "ies":
      return (
        id.startsWith("FG17") || id.startsWith("FG24") || id.startsWith("FG25")
      );
    case "eme":
      return (
        id.startsWith("FG17") || id.startsWith("FG44") || id.startsWith("FG45")
      );
    default:
      unreachable(specialty);
  }
}

function isB5(id: string, specialty: Specialty): boolean {
  if (specialty === "eme" && isForArchitectExam(id) && /^(FH|YA|YB)/.test(id)) {
    return true;
  }
  return /^(FG|FF[2-5]|GB[2-4]|FA00|FJ)/.test(id) && !isKougakuSystemGairon(id);
}

function isC1(id: string): boolean {
  return (
    //数学リテラシー1
    id === "FA01131" || //工学システム学類(1,2クラス)
    id === "FA01141" //工学システム学類(3,4クラス)
  );
}

function isC2(id: string): boolean {
  return (
    //数学リテラシー2
    id === "FA01231" || //工学システム学類(1,2クラス)
    id === "FA01241" //工学システム学類(3,4クラス)
  );
}

function isC3(id: string): boolean {
  return (
    //線形代数1
    id === "FA01631" || //工学システム学類(1,2クラス)
    id === "FA01641" //工学システム学類(3,4クラス)
  );
}

function isC4(id: string): boolean {
  return (
    //線形代数2
    id === "FA01731" || //工学システム学類(1,2クラス)
    id === "FA01741" //工学システム学類(3,4クラス)
  );
}

function isC5(id: string): boolean {
  return (
    //線形代数3
    id === "FA01831" || //工学システム学類(1,2クラス)
    id === "FA01841" //工学システム学類(3,4クラス)
  );
}

function isC6(id: string, isNative: boolean, mode: Mode): boolean {
  return (
    //微積分1
    id === "FA01331" || //工学システム学類(1,2クラス)
    id === "FA01341" || //工学システム学類(3,4クラス)
    //総合からの移行生に限り情報学群開設の微分積分Aを理工学群開設の微積分1, 2へ読み替えられる
    (!isNative &&
      mode === "real" &&
      (id === "GA15311" || //微分積分A 情報科学類1・2クラス
        id === "GA15321" || //微分積分A 情報科学類3・4クラス
        id === "GA15331" || //微分積分A 情報メディア創成学類生および総合学域群生
        id === "GA15341")) //微分積分A 知識学類生および総合学域群生
  );
}

function isC7(id: string, isNative: boolean, mode: Mode): boolean {
  return (
    //微積分2
    id === "FA01431" || //工学システム学類(1,2クラス)
    id === "FA01441" || //工学システム学類(3,4クラス)
    //総合からの移行生に限り情報学群開設の微分積分Aを理工学群開設の微積分1, 2へ読み替えられる
    (!isNative &&
      mode === "real" &&
      (id === "GA15311" || //微分積分A 情報科学類1・2クラス
        id === "GA15321" || //微分積分A 情報科学類3・4クラス
        id === "GA15331" || //微分積分A 情報メディア創成学類生および総合学域群生
        id === "GA15341")) //微分積分A 知識学類生および総合学域群生
  );
}

function isC8(id: string): boolean {
  return (
    //微積分3
    id === "FA01531" || //工学システム学類(1,2クラス)
    id === "FA01541" //工学システム学類(3,4クラス)
  );
}

function isC9(id: string): boolean {
  return id === "FCB1201"; //力学1 応用理工学類・工学システム学類
}

function isC10(id: string): boolean {
  return id === "FCB1241"; //力学2 応用理工学類・工学システム学類
}

function isC11(id: string): boolean {
  return id === "FCB1291"; //力学3 応用理工学類・工学システム学類
}

function isC12(id: string): boolean {
  return id === "FCB1321"; //電磁気学1 応用理工学類・工学システム学類
}

function isC13(id: string): boolean {
  return id === "FCB1361"; //電磁気学2 応用理工学類・工学システム学類
}

function isC14(id: string): boolean {
  return id === "FCB1381"; //電磁気学3 応用理工学類・工学システム学類
}

function isC15(id: string): boolean {
  return id === "FG10651"; //工学システム原論
}

function isC16(id: string): boolean {
  return id === "FG10704"; //線形代数総論A
}

function isC17(id: string): boolean {
  return id === "FG10724"; //線形代数総論B
}

function isC18(id: string): boolean {
  return (
    //解析学総論
    id === "FG10744" || //2023, 2024, 2025開講　2023は2019年度以降入学生対象(2年1, 2クラス) 2024, 2025はクラス分けなし
    id === "FG10754" //2023開講 2019年度以降入学生対象(2年3, 4クラス)
  );
}

function isC19(id: string): boolean {
  return (
    //常微分方程式
    id === "FG10764" || //2023, 2024, 2025開講　2023は2019年度以降入学生対象(2年1, 2クラス) 2024, 2025はクラス分けなし
    id === "FG10774" //2023開講 2019年度以降入学生対象(2年3, 4クラス)
  );
}

function isC20(id: string): boolean {
  return id === "FG10814"; //力学総論
}

function isC21(id: string): boolean {
  return (
    //電磁気学総論
    id === "FG10834" || //2023, 2024, 2025開講　2023は2019年度以降入学生対象(2年1, 2クラス) 2024, 2025はクラス分けなし
    id === "FG10844" //2023開講 2019年度以降入学生対象(2年3, 4クラス)
  );
}

function isC22(id: string): boolean {
  return (
    //材料力学基礎
    id === "FG10864" || //2023, 2024, 2025開講　2023は2019年度以降入学生の必修科目 2018年度以前入学者で環境開発工学、エネルギー工学主専攻の学生は所属主専攻の科目番号で履修登録 2024, 2025はクラス分けなし
    id === "FG45554" || //2018年度以前入学者で環境開発工学、エネルギー工学主専攻の学生は所属主専攻の科目番号で履修登録
    id === "FG55554" //2018年度以前入学者で環境開発工学、エネルギー工学主専攻の学生は所属主専攻の科目番号で履修登録
  );
}

function isC23(id: string): boolean {
  return id === "FG10911"; //熱力学基礎
}

function isC24(id: string): boolean {
  return (
    //流体力学基礎
    id === "FG10851" || //2023, 2024, 2025開講　2023は2019年度以降入学生の必修科目 2018年度以前入学者で環境開発工学、エネルギー工学主専攻の学生は所属主専攻の科目番号で履修登録 2024, 2025はクラス分けなし
    id === "FG45571" || //2018年度以前入学者で環境開発工学、エネルギー工学主専攻の学生は所属主専攻の科目番号で履修登録
    id === "FG55571" //2018年度以前入学者で環境開発工学、エネルギー工学主専攻の学生は所属主専攻の科目番号で履修登録
  );
}

function isC25(id: string): boolean {
  return (
    //複素解析 FB14271は数学類　2023, 2024, 2025開講
    id === "FG10784" || //2023, 2024, 2025開講 2023は2019年度以降入学生対象(2年1,2クラス) 2024, 2025はクラス分けなし
    id === "FG10794" || //2023開講 2019年度以降入学生対象(2年3, 4クラス)
    id === "FG20144" || //2023開講 2018年度以前入学者対象 所属主専攻の科目番号で履修登録
    id === "FG30144" //2023開講 2018年度以前入学者対象 所属主専攻の科目番号で履修登録
  );
}

function isC26(id: string): boolean {
  return (
    //プログラミング序論A
    id === "FG10874" || //2023, 2024, 2025開講 2023は2019年度以降入学生対象(2年3, 4クラス)
    id === "FG10894" || //2023 2019年度以降入学生対象(2年1, 2クラス)
    id === "FG20184" || //2023 2015年度以降2018年度以前入学者対象  所属主専攻の科目番号で履修登録
    id === "FG30184" //2023 2015年度以降2018年度以前入学者対象  所属主専攻の科目番号で履修登録
  );
}

function isC27(id: string): boolean {
  return (
    //プログラミング序論B
    id === "FG10884" || //2023 2019年度以降入学生対象(2年3, 4クラス)
    id === "FG10904" || //2023, 2024, 2025開講 2023は2019年度以降入学生対象(2年1, 2クラス)
    id === "FG20194" || //2023 2015年度以降2018年度以前入学者対象  所属主専攻の科目番号で履修登録
    id === "FG30194" //2023 2015年度以降2018年度以前入学者対象  所属主専攻の科目番号で履修登録
  );
}

function isE1(id: string, mode: Mode): boolean {
  return (
    //ファーストイヤーセミナー
    id === "1116102" || //工シス1クラス
    id === "1116202" || //工シス2クラス
    id === "1116302" || //工シス3クラス
    id === "1116402" || //工シス4クラス
    //学問への誘い
    id === "1227471" || //工シス1クラス
    id === "1227481" || //工シス2クラス
    id === "1227491" || //工シス3クラス
    id === "1227501" || //工シス4クラス
    (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
  );
}

function isE2(id: string): boolean {
  return isCompulsoryPe1(id) || isCompulsoryPe2(id) || isCompulsoryPe3(id);
}

function isE3(id: string, mode: Mode): boolean {
  //第1外国語(英語)「人文、応理、工シス、総学1組」
  return (
    id.startsWith("31HA") || //English Reading Skills I
    id.startsWith("31KA") || //English Reading Skills II
    id.startsWith("31JA") || //English Presentation Skills I
    id.startsWith("31LA") || //English Presentation Skills II
    (mode === "real" && isCompulsoryEnglishById(id))
  );
}

function isE4(id: string, mode: Mode): boolean {
  return (
    //情報リテラシー(講義)
    id === "6116101" || //2023, 2024, 2025開講 2023は工シスA班, 総学第2類A班 2024, 2025は工シス対象でクラス分けなし
    id === "6116201" || //2023開講 工シスB班, 総学第2類B班
    //情報リテラシー(演習)
    id === "6416102" || //工シスA班
    id === "6416202" || //工シスB班
    //データサイエンス
    id === "6516102" || //工シスA班
    id === "6516202" || //工シスB班
    (mode === "real" &&
      (isInfoLiteracyLecture(id) ||
        isInfoLiteracyExercise(id) ||
        isDataScience(id)))
  );
}

function isF1(id: string): boolean {
  return isGakushikiban(id);
}

function isF2(id: string): boolean {
  return isElectivePe(id);
}

function isF3(id: string): boolean {
  return isForeignLanguage(id);
}

function isF4(id: string): boolean {
  return isArt(id);
}

function isF5(id: string): boolean {
  return isJapanese(id);
}

function isH1(id: string): boolean {
  //他学群又は他学類の授業科目
  //ただしFF2-FF5, GB2-GB4で始まる科目、およびFBA146~FBA149, FBA15, FBA16で始まる科目、GA15で始まる科目は基礎科目関連科目選択科目に含めることはできない
  return !(
    /^(FG|FF[2-5]|GB[2-4]|FBA14[6-9]|FBA15|FBA16|GA15)/.test(id) || // FGから始まる科目は工シス開講
    isKyoutsuu(id)
  );
}

function isH2(id: string): boolean {
  return isKougakuSystemGairon(id);
}

function isH3(id: string): boolean {
  return (
    isHakubutsukan(id) || //博物館に関する科目
    isKyoushoku(id) || //教職に関する科目
    isJiyuukamoku(id) //特設自由科目
  );
}

function classify(
  id: CourseId,
  specialty: Specialty,
  isNative: boolean,
  mode: Mode,
): string | undefined {
  // 必修
  const a = classifyColumnA(id, specialty);
  if (a !== undefined) return a;
  if (isC1(id)) return "c1";
  if (isC2(id)) return "c2";
  if (isC3(id)) return "c3";
  if (isC4(id)) return "c4";
  if (isC5(id)) return "c5";
  if (isC6(id, isNative, mode)) return "c6";
  if (isC7(id, isNative, mode)) return "c7";
  if (isC8(id)) return "c8";
  if (isC9(id)) return "c9";
  if (isC10(id)) return "c10";
  if (isC11(id)) return "c11";
  if (isC12(id)) return "c12";
  if (isC13(id)) return "c13";
  if (isC14(id)) return "c14";
  if (isC15(id)) return "c15";
  if (isC16(id)) return "c16";
  if (isC17(id)) return "c17";
  if (isC18(id)) return "c18";
  if (isC19(id)) return "c19";
  if (isC20(id)) return "c20";
  if (isC21(id)) return "c21";
  if (isC22(id)) return "c22";
  if (isC23(id)) return "c23";
  if (isC24(id)) return "c24";
  if (isC25(id)) return "c25";
  if (isC26(id)) return "c26";
  if (isC27(id)) return "c27";
  if (isE1(id, mode)) return "e1";
  if (isE2(id)) return "e2";
  if (isE3(id, mode)) return "e3";
  if (isE4(id, mode)) return "e4";
  // 選択
  if (isB1(id, specialty)) return "b1";
  if (isB2(id, specialty)) return "b2";
  if (isB3(id, specialty)) return "b3";
  if (isB4(id, specialty)) return "b4";
  if (isB5(id, specialty)) return "b5";
  if (isF1(id)) return "f1";
  if (isF2(id)) return "f2";
  if (isF3(id)) return "f3";
  if (isF4(id)) return "f4";
  if (isF5(id)) return "f5";
  if (isH2(id)) return "h2";
  if (isH3(id)) return "h3";
  if (isH1(id)) return "h1"; // 「...以外」なので最後
}

export function classifyKnownCourses(
  cs: KnownCourse[],
  opts: ClassifyOptions,
  _tableYear: number,
  specialty: Specialty,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, specialty, opts.isNative, "known");
    if (cellId !== undefined) {
      courseIdToCellId.set(c.id, cellId);
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  opts: ClassifyOptions,
  _tableYear: number,
  specialty: Specialty,
): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const cellId = classify(c.id, specialty, opts.isNative, "real");
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
): Map<FakeCourseId, string> {
  return new Map();
}

export const creditRequirementsIes: SetupCreditRequirements = {
  cells: {
    a1: { min: 3, max: 3 },
    a2: { min: 4, max: 4 },
    a3: { min: 6, max: 6 },
    a4: { min: 8, max: 8 },
    a5: { min: 1, max: 1 },
    a6: { min: 3, max: 3 },
    b1: { min: 6, max: undefined },
    b2: { min: 1, max: undefined },
    b3: { min: 1, max: undefined },
    b4: { min: 16, max: undefined },
    b5: { min: 0, max: undefined },
    c1: { min: 1, max: 1 },
    c2: { min: 1, max: 1 },
    c3: { min: 1, max: 1 },
    c4: { min: 1, max: 1 },
    c5: { min: 1, max: 1 },
    c6: { min: 1, max: 1 },
    c7: { min: 1, max: 1 },
    c8: { min: 1, max: 1 },
    c9: { min: 1, max: 1 },
    c10: { min: 1, max: 1 },
    c11: { min: 1, max: 1 },
    c12: { min: 1, max: 1 },
    c13: { min: 1, max: 1 },
    c14: { min: 1, max: 1 },
    c15: { min: 1, max: 1 },
    c16: { min: 1, max: 1 },
    c17: { min: 2, max: 2 },
    c18: { min: 1, max: 1 },
    c19: { min: 2, max: 2 },
    c20: { min: 1, max: 1 },
    c21: { min: 1, max: 1 },
    c22: { min: 1, max: 1 },
    c23: { min: 1, max: 1 },
    c24: { min: 1, max: 1 },
    c25: { min: 2, max: 2 },
    c26: { min: 2, max: 2 },
    c27: { min: 1, max: 1 },
    e1: { min: 2, max: 2 },
    e2: { min: 3, max: 3 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 1 },
    f3: { min: 0, max: 4 },
    f4: { min: 0, max: 1 },
    f5: { min: 0, max: 1 },
    h1: { min: 6, max: undefined },
    h2: { min: 0, max: 1 },
    h3: { min: 0, max: undefined },
  },
  columns: {
    a: { min: 25, max: 25 },
    b: { min: 40, max: 49 },
    c: { min: 31, max: 31 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 10 },
    h: { min: 6, max: 15 },
  },
  compulsory: 69,
  elective: 56,
};

export const creditRequirementsEme: SetupCreditRequirements = {
  cells: {
    a1: { min: 4, max: 4 },
    a2: { min: 6, max: 6 },
    a3: { min: 8, max: 8 },
    a4: { min: 1, max: 1 },
    a5: { min: 3, max: 3 },
    a6: { min: 3, max: 3 },
    b1: { min: 1, max: undefined },
    b2: { min: 1, max: undefined },
    b3: { min: 1, max: undefined },
    b4: { min: 23, max: undefined },
    b5: { min: 0, max: undefined },
    c1: { min: 1, max: 1 },
    c2: { min: 1, max: 1 },
    c3: { min: 1, max: 1 },
    c4: { min: 1, max: 1 },
    c5: { min: 1, max: 1 },
    c6: { min: 1, max: 1 },
    c7: { min: 1, max: 1 },
    c8: { min: 1, max: 1 },
    c9: { min: 1, max: 1 },
    c10: { min: 1, max: 1 },
    c11: { min: 1, max: 1 },
    c12: { min: 1, max: 1 },
    c13: { min: 1, max: 1 },
    c14: { min: 1, max: 1 },
    c15: { min: 1, max: 1 },
    c16: { min: 1, max: 1 },
    c17: { min: 2, max: 2 },
    c18: { min: 1, max: 1 },
    c19: { min: 2, max: 2 },
    c20: { min: 1, max: 1 },
    c21: { min: 1, max: 1 },
    c22: { min: 1, max: 1 },
    c23: { min: 1, max: 1 },
    c24: { min: 1, max: 1 },
    c25: { min: 2, max: 2 },
    c26: { min: 2, max: 2 },
    c27: { min: 1, max: 1 },
    e1: { min: 2, max: 2 },
    e2: { min: 3, max: 3 },
    e3: { min: 4, max: 4 },
    e4: { min: 4, max: 4 },
    f1: { min: 1, max: 3 },
    f2: { min: 0, max: 1 },
    f3: { min: 0, max: 4 },
    f4: { min: 0, max: 1 },
    f5: { min: 0, max: 1 },
    h1: { min: 6, max: undefined },
    h2: { min: 0, max: 1 },
    h3: { min: 0, max: undefined },
  },
  columns: {
    a: { min: 25, max: 25 },
    b: { min: 40, max: 49 },
    c: { min: 31, max: 31 },
    e: { min: 13, max: 13 },
    f: { min: 1, max: 10 },
    h: { min: 6, max: 15 },
  },
  compulsory: 69,
  elective: 56,
};
