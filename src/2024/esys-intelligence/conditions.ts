import {
  CourseId,
  FakeCourse,
  FakeCourseId,
  KnownCourse,
  RealCourse,
} from "../../akiko";
import { ClassifyOptions, SetupCreditRequirements } from "../../app-setup";
import { 
  isGakushikiban,
  isJiyuukamoku,
  isHakubutsukan
} from "../../conditions/common";

function isA1(id: string): boolean {
  return ( 
    //プログラミング序論C(所属主専攻の科目番号で履修登録)
    id === "FG20204" || 
    id === "FG30204" ||
    //プログラミング序論D(所属主専攻の科目番号で履修登録)
    id === "FG20214" ||
    id === "FG30214"
  );
}

function isA2(id: string): boolean {
  return (
    id === "FG19103" || //工学システム基礎実験A
    id === "FG19113" //工学システム基礎実験B
  );
}

function isA3(id: string): boolean {
  return (
    //知的・機能工学システム実験(所属主専攻の科目番号で履修登録)
    id === "FG29213" ||
    id === "FG39213"
  );
}

function isA4(id: string): boolean {
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

function isA5(id: string): boolean {
  return (
    id === "FG18101" //工学者のための倫理
  );
}

function isA6(id: string): boolean {
  return (
   //専門英語A
    id === "FG18102" || //2年1,2クラス
    id === "FG18112" || //2年3,4クラス
    //専門英語B
    id === "FG20222" || //知的・機能工学システム主専攻
    id === "FG30222" || //知的・機能工学システム主専攻
    // id === "FG40222" || //エネルギー・メカニクス主専攻
    // id === "FG50222" || //エネルギー・メカニクス主専攻
   //専門英語演習
    id === "FG20232" || //知的・機能工学システム主専攻
    id === "FG30232" //知的・機能工学システム主専攻
    // id === "FG40232" || //エネルギー・メカニクス主専攻
    // id === "FG50232" //エネルギー・メカニクス主専攻
  );
}

function isB1(id: string): boolean {
  return (
    id.startsWith("FG11") ||
    id.startsWith("FG21")
  );
}

function isB2(id: string): boolean {
  return (
    id.startsWith("FG12") ||
    id.startsWith("FG22")
  );
}

function isB3(id: string): boolean {
  return (
    id.startsWith("FG13") ||
    id.startsWith("FG23")
  );
}

function isB4(id: string): boolean {
  return (
    id.startsWith("FG17") ||
    id.startsWith("FG24") ||
    id.startsWith("FG25")
  );
}

function isB5(id: string): boolean {
  return (
    ( //FG, FF2-FF5, GB2-GB4で始まる科目
      id.startsWith("FG") ||
      /^FF[2-5]/.test(id) || //FF2-FF5
      /^GB[2-4]/.test(id) //GB2-GB4
    ) && !( //工学システム概論を除く
      id === "FG10641" || //2019年度および2020年度入学生の必修科目 2023は開講
      id === "FG16051" //2019年度以降入学生対象
    ) ||
    id.startsWith("FA00") || //FA00で始まる科目
    id.startsWith("FJ") //FJで始まる科目(学類長が指定する科目がわからない)
  );
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

function isC6(id: string): boolean {
  return (
    //微積分1
    id === "FA01331" || //工学システム学類(1,2クラス)
    id === "FA01341" //工学システム学類(3,4クラス)
    //総合からの移行生に限り情報学群開設の微分積分Aを理工学群開設の微積分1, 2へ読み替えられる
    // id === "GA15311" || //微分積分A 情報科学類1・2クラス
    // id === "GA15321" || //微分積分A 情報科学類3・4クラス
    // id === "GA15331" || //微分積分A 情報メディア創成学類生および総合学域群生
    // id === "GA15341" //微分積分A 知識学類生および総合学域群生
  );
}

function isC7(id: string): boolean {
  return (
    //微積分2
    id === "FA01431" || //工学システム学類(1,2クラス)
    id === "FA01441" //工学システム学類(3,4クラス)
    //総合からの移行生に限り情報学群開設の微分積分Aを理工学群開設の微積分1, 2へ読み替えられる
    // id === "GA15311" || //微分積分A 情報科学類1・2クラス
    // id === "GA15321" || //微分積分A 情報科学類3・4クラス
    // id === "GA15331" || //微分積分A 情報メディア創成学類生および総合学域群生
    // id === "GA15341" //微分積分A 知識学類生および総合学域群生
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
    id ==="FG10774" //2023開講 2019年度以降入学生対象(2年3, 4クラス)
  );
}

function isC20(id: string): boolean {
  return id === "FG10814"; //力学総論

}

function isC21(id: string): boolean {
  return (
    //電磁気学総論
    id === "FG10834" || //2023, 2024, 2025開講　2023は2019年度以降入学生対象(2年1, 2クラス) 2024, 2025はクラス分けなし
    id ==="FG10844" //2023開講 2019年度以降入学生対象(2年3, 4クラス)
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

function isE1(id: string): boolean {
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
    id === "1227501" //工シス4クラス
  );
}

function isE2(id: string): boolean {
  // return (
  //   // 曜日で絞ってないよ(工シスは基礎金1/応用木3/発展月4)
  //   id.startsWith("21") || //基礎体育
  //   id.startsWith("22") || //応用体育
  //   id.startsWith("23") //発展体育
  // );
  return false;
}

function isE3(id: string): boolean {
  //第1外国語(英語)「人文、応理、工シス、総学1組」
  return (
    id.startsWith("31HA") || //English Reading Skills I
    id.startsWith("31KA") || //English Reading Skills II
    id.startsWith("31JA") || //English Presentation Skills I
    id.startsWith("31LA") //English Presentation Skills II
  );
}

function isE4(id: string): boolean {
  return (
    //情報リテラシー(講義)
    id === "6116101" || //2023, 2024, 2025開講 2023は工シスA班, 総学第2類A班 2024, 2025は工シス対象でクラス分けなし
    id === "6116201" || //2023開講 工シスB班, 総学第2類B班
    //情報リテラシー(演習)
    id === "6416102" || //工シスA班
    id === "6416202" || //工シスB班
    //データサイエンス
    id === "6516102" || //工シスA班
    id === "6516202" //工シスB班
  );
}

function isF1(id: string): boolean {
  //総合科目(学士基盤科目)
  return isGakushikiban(id);
}

function isF2(id: string): boolean {
  //体育
  // return id.startsWith("28") //体育の自由科目は28から始まる　工シスで絞ってないよ
  return false;
}

function isF3(id: string): boolean {
  //第2外国語(初修外国語)
  // return id.startsWith("32") //英語以外の外国語 工シスで絞ってないよ
  return false;
}

function isF4(id: string): boolean {
  // 芸術
  return id.startsWith("4") //多分ここはOKだけど確認お願いします
}

function isF5(id: string): boolean {
  //国語 5から始まる
  // return (
  //   id === "5108021" || //国語I 全学群対象 ただし、主として総学1,2組・応理・工シス・社工
  //   id === "5208011" //国語II 全学群対象 ただし、主として総学1,2組・応理・工シス・社工
  // );
  return false;
}

function isH1(id: string): boolean {
  //他学群又は他学類の授業科目
  //ただしFF2-FF5, GB2-GB4で始まる科目、およびFBA146~FBA149, FBA15, FBA16で始まる科目、GA15で始まる科目は基礎科目関連科目選択科目に含めることはできない
  //理工学群共通科目とか工シス開講の学士基盤って含まれるの？？？
  //他の必修の英語とかも含まれないよね？？？
  return !(
    id.startsWith("FG") || //工シス開講
    /^FF[2-5]/.test(id) || //FF2-FF5
    /^GB[2-4]/.test(id) || //GB2-GB4
    /^FBA14[6-9]/.test(id) || //FBA146~FBA149
    id.startsWith("FBA15") || //FBA15
    id.startsWith("FBA16") || //FBA16
    id.startsWith("GA15") //GA15
  );
}

function isH2(id: string): boolean {
  return (
    //工学システム概論
    id === "FG10641" || //2023開講 2019年度および2020年度入学生の必修科目
    id === "FG16051" //2023, 2024, 2025開講 2019年度以降入学生対象
  );
}

function isH3(id: string): boolean {
  return (
    isHakubutsukan(id) || //博物館に関する科目
    /^9[0-8]/.test(id) || //教職に関する科目
    isJiyuukamoku(id) //特設自由科目
  );
}

export function classifyKnownCourses(cs: KnownCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    // 必修
    if (isA1(c.id)) {
      courseIdToCellId.set(c.id, "a1");
    } else if (isA2(c.id)) {
      courseIdToCellId.set(c.id, "a2");
    } else if (isA3(c.id)) {
      courseIdToCellId.set(c.id, "a3");
    } else if (isA4(c.id)) {
      courseIdToCellId.set(c.id, "a4");
    } else if (isA5(c.id)) {
      courseIdToCellId.set(c.id, "a5");
    } else if (isA6(c.id)) {
      courseIdToCellId.set(c.id, "a6");
    } else if (isC1(c.id)) {
      courseIdToCellId.set(c.id, "c1");
    } else if (isC2(c.id)) {
      courseIdToCellId.set(c.id, "c2");
    } else if (isC3(c.id)) {
      courseIdToCellId.set(c.id, "c3");
    } else if (isC4(c.id)) {
      courseIdToCellId.set(c.id, "c4");
    } else if (isC5(c.id)) {
      courseIdToCellId.set(c.id, "c5");
    } else if (isC6(c.id)) {
      courseIdToCellId.set(c.id, "c6");
    } else if (isC7(c.id)) {
      courseIdToCellId.set(c.id, "c7");
    } else if (isC8(c.id)) {
      courseIdToCellId.set(c.id, "c8");
    } else if (isC9(c.id)) {
      courseIdToCellId.set(c.id, "c9");
    } else if (isC10(c.id)) {
      courseIdToCellId.set(c.id, "c10");
    } else if (isC11(c.id)) {
      courseIdToCellId.set(c.id, "c11");
    } else if (isC12(c.id)) {
      courseIdToCellId.set(c.id, "c12");
    } else if (isC13(c.id)) {
      courseIdToCellId.set(c.id, "c13");
    } else if (isC14(c.id)) {
      courseIdToCellId.set(c.id, "c14");
    } else if (isC15(c.id)) {
      courseIdToCellId.set(c.id, "c15");
    } else if (isC16(c.id)) {
      courseIdToCellId.set(c.id, "c16");
    } else if (isC17(c.id)) {
      courseIdToCellId.set(c.id, "c17");
    } else if (isC18(c.id)) {
      courseIdToCellId.set(c.id, "c18");
    } else if (isC19(c.id)) {
      courseIdToCellId.set(c.id, "c19");
    } else if (isC20(c.id)) {
      courseIdToCellId.set(c.id, "c20");
    } else if (isC21(c.id)) {
      courseIdToCellId.set(c.id, "c21");
    } else if (isC22(c.id)) {
      courseIdToCellId.set(c.id, "c22");
    } else if (isC23(c.id)) {
      courseIdToCellId.set(c.id, "c23");
    } else if (isC24(c.id)) {
      courseIdToCellId.set(c.id, "c24");
    } else if (isC25(c.id)) {
      courseIdToCellId.set(c.id, "c25");
    } else if (isC26(c.id)) {
      courseIdToCellId.set(c.id, "c26");
    } else if (isC27(c.id)) {
      courseIdToCellId.set(c.id, "c27");
    } else if (isE1(c.id)) {
      courseIdToCellId.set(c.id, "e1");
    } else if (isE2(c.id)) {
      courseIdToCellId.set(c.id, "e2");
    } else if (isE3(c.name)) {
      courseIdToCellId.set(c.id, "e3");
    } else if (isE4(c.id)) {
      courseIdToCellId.set(c.id, "e4");
    }
    // 選択
    else if (isB1(c.id)) {
      courseIdToCellId.set(c.id, "b1");
    } else if (isB2(c.id)) {
      courseIdToCellId.set(c.id, "b2");
    } else if (isB3(c.id)) {
      courseIdToCellId.set(c.id, "b3");
    } else if (isB4(c.id)) {
      courseIdToCellId.set(c.id, "b4");
    } else if (isB5(c.id)) {
      courseIdToCellId.set(c.id, "b5");
    } else if (isF1(c.id)) {
      courseIdToCellId.set(c.id, "f1");
    } else if (isF2(c.id)) {
      courseIdToCellId.set(c.id, "f2");
    } else if (isF3(c.id)) {
      courseIdToCellId.set(c.id, "f3");
    } else if (isF4(c.id)) {
      courseIdToCellId.set(c.id, "f4");
    } else if (isF5(c.id)) {
      courseIdToCellId.set(c.id, "f5");
    } else if (isH2(c.id)) {
      courseIdToCellId.set(c.id, "h2");
    } else if (isH3(c.id)) {
      courseIdToCellId.set(c.id, "h3");
    } else if (isH1(c.id)) { //指定の科目以外なので最後にしてあります
      courseIdToCellId.set(c.id, "h1");
    }
  }
  return courseIdToCellId;
}

export function classifyRealCourses(
  cs: RealCourse[],
  opts: ClassifyOptions,
): Map<CourseId, string> {
  return new Map();
}

export function classifyFakeCourses(
  cs: FakeCourse[],
): Map<FakeCourseId, string> {
  return new Map();
}

export const creditRequirements: SetupCreditRequirements = {
  cells: {
    a1: { min: 3, max: 3},
    a2: { min: 4, max: 4},
    a3: { min: 6, max: 6},
    a4: { min: 8, max: 8},
    a5: { min: 1, max: 1},
    a6: { min: 3, max: 3},
    b1: { min: 6, max: undefined },
    b2: { min: 1, max: undefined },
    b3: { min: 1, max: undefined },
    b4: { min: 16, max: undefined },
    b5: { min: 0, max: undefined },
    c1:  { min: 1, max: 1 },
    c2:  { min: 1, max: 1 },
    c3:  { min: 1, max: 1 },
    c4:  { min: 1, max: 1 },
    c5:  { min: 1, max: 1 },
    c6:  { min: 1, max: 1 },
    c7:  { min: 1, max: 1 },
    c8:  { min: 1, max: 1 },
    c9:  { min: 1, max: 1 },
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
