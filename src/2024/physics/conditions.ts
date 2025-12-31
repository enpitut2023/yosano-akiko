import { isInt16Array } from "node:util/types";
import { CourseId, FakeCourseId, KnownCourse } from "../../akiko";
import { SetupCreditRequirements } from "../../app-setup";
import { isGakushikiban } from "../../conditions/common";
import { is } from "zod/v4/locales";

function isA1(id: string):boolean{
  return id === "FCC2733"
}

function isA2(id: string):boolean{
  return id === "FCC3733"
}

function isA3(id: string):boolean{
  return id === "FCC4808"
  // 留学等の特別な理由で事前に申し出た者について、「卒業研究」（10単位）を、「卒業研究Ⅰ」（５単位）及び「卒業単位Ⅱ」（５単位）の履修により修得を認める場合がある。
  // 「卒業研究Ⅰ」（５単位）、「卒業単位Ⅱ」（５単位）ともにあきこリザードン上で発見できず。
}

function isA4(id: string):boolean{
  return (
    id ==="FCC2202" || // 解析学入門
    id === "FCC2464"//解析力学
  )
}

function isB1(id: string):boolean{
  return (
    id === "FCC2231" || //量子力学序論(2025開設)
    id === "FCC2234" || //量子力学序論(2023,2024解説)
    id === "FCC2244" || //量子力学Ⅰ
    id === "FCC3134" || //量子力学Ⅱ
    id === "FCC3144"  //量子力学Ⅲ
    // 他学類開設の授業で同科目名の授業あり。
  )
}

function isB2(id: string):boolean{
  return(
    id === "FCC2414" || //熱物理学
    id === "FCC3154" || //統計力学Ⅰ
    id === "FCC3164"  //統計力学Ⅱ
    // 他学類開設の授業で同科目名の授業あり。 
  )
}

function isB3(id: string):boolean{
  return(
    id === "FCC2374" || //専門電磁気学Ⅰ
    id === "FCC2384" || //専門電磁気学Ⅱ
    id === "FCC3094"    //専門電磁気学Ⅲ
  )
}

function isB4(id: string):boolean{
  return(
    (!(isA1(id) || isA2(id) || isA3(id)|| isA4(id) || isB1(id) || isB2(id) || isB3(id))) && //A1~B3に含まれているものを省くため
    id.startsWith("FCC2") ||
    id.startsWith("FCC3") ||
    id.startsWith("FCC4") 
  )
}

function isD1(id: string):boolean{
  return(
    id === "FCB1201" || //力学1(応用理工学類・工学システム学類の学生向け)
    id === "FCB1211" || //力学1(物理学類、化学類、数学類、地球学類、生物学類の学生向け)
    id === "FCB1221" || //力学1(医学類・医療科学学類の学生向け)
    id === "FCB1231" || //力学1(総合学域群の学生向け)
    id === "FCB1241" || //力学2(応用理工学類・工学システム学類の学生向け)
    id === "FCB1251" || //力学2(物理学類、化学類、数学類、地球学類、生物学類の学生向け)
    id === "FCB1261" || //力学2(総合学域群の学生向け)
    id === "FCB1271" || //力学3(物理学類、化学類、数学類、地球学類、生物学類の学生向け)
    id === "FCB1281" || //力学3(総合学域群の学生向け)
    id === "FCB1291" || //力学3(応用理工学類・工学システム学類の学生向け)
    id === "FCB1301" || //電磁気学1(総合学域群の学生向け)
    id === "FCB1311" || //電磁気学1(物理学類、化学類、数学類、地球学類、生物学類の学生向け)
    id === "FCB1321" || //電磁気学1(応用理工学類・工学システム学類の学生向け)
    id === "FCB1331" || //電磁気学1(医学類・医療科学類の学生向け)
    id === "FCB1341" || //電磁気学2(物理学類、化学類、数学類、地球学類、生物学類の学生向け)
    id === "FCB1351" || //電磁気学2(総合学域群の学生向け)
    id === "FCB1361" || //電磁気学2(応用理工学類・工学システム学類の学生向け)
    id === "FCB1371" || //電磁気学3(物理学類、化学類、数学類、地球学類、生物学類の学生向け)
    id === "FCB1381" || //電磁気学3(応用理工学類・工学システム学類の学生向け)
    id === "FCB1391" || //電磁気学3(総合学域群の学生向け)
    id === "FCB1401"  //物理学概論
  )
}

function isD2(id: string):boolean{
  // 1. 「微積分1,2または微分積分A」、「線形代数1,2または線形代数A」との記述があったため、線形代数1と線形代数Aを取得していた場合はどちらかのみ加算されると考えられるが、その処理はしていない。
  // 2. "FF18724","FF18734"も「線形代数A」とい名前で解説されているが、シラバスによると、他学類開設の授業であり、この区分に該当する授業ではないと判断したため、記述していない。
  return(
    id === "FA01311" || //微積分1(応用理工学類(学籍番号奇数)の学生)
    id === "FA01321" || //微積分1(応用理工学類(学籍番号偶数)の学生)
    id === "FA01331" || //微積分1(工学システム学類(1,2クラス)の学生)
    id === "FA01341" || //微積分1(工学システム学類(3,4クラス)の学生)
    id === "FA01351" || //微積分1(社会工学類(1,2クラス)の学生)
    id === "FA01361" || //微積分1(社会工学類(3,4クラス)の学生)
    id === "FA01371" || //微積分1(数学類の学生(2024年度以降入学者))
    id === "FA01381" || //微積分1(物理学類の学生(2024年度以降入学者))
    id === "FA01391" || //微積分1(化学類の学生(2024年度以降入学者))
    id === "FA013A1" || //微積分1(地球学類の学生(2024年度以降入学者))
    id === "FA013C1" || //微積分1(総合学域群の学生)
    id === "FA013D1" || //微積分1(総合学域群の学生)
    id === "FA01411" || //微積分2(応用理工学類(学籍番号奇数)の学生)
    id === "FA01421" || //微積分2(応用理工学類(学籍番号偶数)の学生)
    id === "FA01431" || //微積分2(工学システム学類(1,2クラス)の学生)
    id === "FA01441" || //微積分2(工学システム学類(3,4クラス)の学生)
    id === "FA01451" || //微積分2(社会工学類(1,2クラス)の学生)
    id === "FA01461" || //微積分2(社会工学類(3,4クラス)の学生)
    id === "FA01471" || //微積分2(数学類の学生(2024年度以降入学者))
    id === "FA01481" || //微積分2(物理学類の学生(2024年度以降入学者))
    id === "FA01491" || //微積分2(化学類の学生(2024年度以降入学者))
    id === "FA014A1" || //微積分2(地球学類の学生(2024年度以降入学者))
    id === "FA014C1" || //微積分2(総合学域群の学生)
    id === "FA014D1" || //微積分2(総合学域群の学生)
    id === "FA01511" || //微積分3(応用理工学類(学籍番号奇数)の学生)
    id === "FA01521" || //微積分3(応用理工学類(学籍番号偶数)の学生)
    id === "FA01531" || //微積分3(工学システム学類(1,2クラス)の学生)
    id === "FA01541" || //微積分3(工学システム学類(3,4クラス)の学生)
    id === "FA01551" || //微積分3(社会工学類(1,2クラス)の学生)
    id === "FA01561" || //微積分3(社会工学類(3,4クラス)の学生)
    id === "FA01571" || //微積分3(数学類の学生(2024年度以降入学者))
    id === "FA01581" || //微積分3(物理学類の学生(2024年度以降入学者))
    id === "FA01591" || //微積分3(化学類の学生(2024年度以降入学者))
    id === "FA015A1" || //微積分3(地球学類の学生(2024年度以降入学者))
    id === "FA015C1" || //微積分3(総合学域群の学生)
    id === "FA015D1" || //微積分3(総合学域群の学生)
    id === "FA01611" || //線形代数1(応用理工学類(学籍番号奇数)の学生)
    id === "FA01621" || //線形代数1(応用理工学類(学籍番号偶数)の学生)
    id === "FA01631" || //線形代数1(工学システム学類(1,2クラス)の学生)
    id === "FA01641" || //線形代数1(工学システム学類(3,4クラス)の学生)
    id === "FA01651" || //線形代数1(社会工学類(1,2クラス)の学生)
    id === "FA01661" || //線形代数1(社会工学類(3,4クラス)の学生)
    id === "FA01671" || //線形代数1(数学類の学生(2024年度以降入学者))
    id === "FA01681" || //線形代数1(物理学類の学生(2024年度以降入学者))
    id === "FA01691" || //線形代数1(化学類の学生(2024年度以降入学者))
    id === "FA016A1" || //線形代数1(地球学類の学生(2024年度以降入学者))
    id === "FA016C1" || //線形代数1(総合学域群の学生)
    id === "FA016D1" || //線形代数1(総合学域群の学生)
    id === "FA01711" || //線形代数2(応用理工学類(学籍番号奇数)の学生)
    id === "FA01721" || //線形代数2(応用理工学類(学籍番号偶数)の学生)
    id === "FA01731" || //線形代数2(工学システム学類(1,2クラス)の学生)
    id === "FA01741" || //線形代数2(工学システム学類(3,4クラス)の学生)
    id === "FA01751" || //線形代数2(社会工学類(1,2クラス)の学生)
    id === "FA01761" || //線形代数2(社会工学類(3,4クラス)の学生)
    id === "FA01771" || //線形代数2(数学類の学生(2024年度以降入学者))
    id === "FA01781" || //線形代数2(物理学類の学生(2024年度以降入学者))
    id === "FA01791" || //線形代数2(化学類の学生(2024年度以降入学者))
    id === "FA017A1" || //線形代数2(地球学類の学生(2024年度以降入学者))
    id === "FA017C1" || //線形代数2(総合学域群の学生)
    id === "FA017D1" || //線形代数2(総合学域群の学生)
    id === "FA01811" || //線形代数3(応用理工学類(学籍番号奇数)の学生)
    id === "FA01821" || //線形代数3(応用理工学類(学籍番号偶数)の学生)
    id === "FA01831" || //線形代数3(工学システム学類(1,2クラス)の学生)
    id === "FA01841" || //線形代数3(工学システム学類(3,4クラス)の学生)
    id === "FA01851" || //線形代数3(社会工学類(1,2クラス)の学生)
    id === "FA01861" || //線形代数3(社会工学類(3,4クラス)の学生)
    id === "FA01871" || //線形代数3(数学類の学生(2024年度以降入学者))
    id === "FA01881" || //線形代数3(物理学類の学生(2024年度以降入学者))
    id === "FA01891" || //線形代数3(化学類の学生(2024年度以降入学者))
    id === "FA018A1" || //線形代数3(地球学類の学生(2024年度以降入学者))
    id === "FA018C1" || //線形代数3(総合学域群の学生)
    id === "FA018D1" || //線形代数3(総合学域群の学生)
    id === "FA01111" || //数学リテラシー(応用理工学類(学籍番号奇数))
    id === "FA01121" || //数学リテラシー(応用理工学類(学籍番号偶数))
    id === "FA01131" || //数学リテラシー(工学システム学類(1,2クラス)の学生)
    id === "FA01141" || //数学リテラシー(工学システム学類(3,4クラス)の学生)
    id === "FA01151" || //数学リテラシー(社会工学類(1,2クラス)の学生)
    id === "FA01161" || //数学リテラシー(社会工学類(3,4クラス)の学生)
    id === "FA01171" || //数学リテラシー(数学類の学生)
    id === "FA01181" || //数学リテラシー(物理学類の学生)
    id === "FA01191" || //数学リテラシー(化学類の学生)
    id === "FA011A1" || //数学リテラシー(地球学類の学生)
    id === "FA011B1" || //数学リテラシー(生物学類の学生, および数学類, 物理学類, 化学類, 地球学類の２年次以上の学生)
    id === "FA011C1" || //数学リテラシー(総合学域群の学生)
    id === "FA011D1" || //数学リテラシー(総合学域群の学生)
    id === "FA011E1" || //数学リテラシー(総合学域群の学生)
    id === "FA01211" || //数学リテラシー(応用理工学類(学籍番号奇数))
    id === "FA01221" || //数学リテラシー(応用理工学類(学籍番号偶数))
    id === "FA01231" || //数学リテラシー(社会工学類(1,2クラス)の学生)
    id === "FA01241" || //数学リテラシー(社会工学類(3,4クラス)の学生)
    id === "FA01251" || //数学リテラシー(社会工学類(1,2クラス)の学生)
    id === "FA01261" || //数学リテラシー(社会工学類(3,4クラス)の学生)
    id === "FA01271" || //数学リテラシー(数学類の学生)
    id === "FA01281" || //数学リテラシー(物理学類の学生)
    id === "FA01291" || //数学リテラシー(化学類の学生)
    id === "FA012A1" || //数学リテラシー(地球学類の学生)
    id === "FA012B1" || //数学リテラシー(生物学類の学生, および数学類, 物理学類, 化学類, 地球学類の２年次以上の学生)
    id === "FA012C1" || //数学リテラシー(総合学域群の学生)
    id === "FA012D1" || //数学リテラシー(総合学域群の学生)
    id === "FA012E1" || //数学リテラシー(総合学域群の学生)
    id === "GA15311" || //微分積分A(情報科学類生および総合学域群生(情報科学類への移行希望者・学籍番号の下一桁が奇数)優先)
    id === "GA15321" || //微分積分A(情報科学類生および総合学域群生(情報科学類への移行希望者・学籍番号の下一桁が偶数)優先)
    id === "GA15331" || //微分積分A(情報メディア創成学類生および総合学域群生（情報メディア創成学類への移行希望者）優先)
    id === "GA15341" || //微分積分A(知識学類生および総合学域群生（知識学類への移行希望者）優先)
    id === "GA15211" || //線形代数A(情報科学類生および総合学域群生(情報科学類への移行希望者・学籍番号の下一桁が奇数)優先)
    id === "GA15221" || //線形代数A(情報科学類生および総合学域群生(情報科学類への移行希望者・学籍番号の下一桁が偶数)優先)
    id === "GA15231" || //線形代数A(情報メディア創成学類生および総合学域群生（情報メディア創成学類への移行希望者）優先)
    id === "GA15241"  //線形代数A(知識学類生および総合学域群生（知識学類への移行希望者）優先)
  )
}

function isD3(id: string):boolean{
  return(
    id.startsWith("FA")||
    id.startsWith("FB")||
    (id.startsWith("FC") && !id.startsWith("FCC") && !isD1(id))|| //FCで始まるFCC以外かつD1に属さないもの (←A1~D2が除外されているはず)
    id.startsWith("FE")||
    id.startsWith("EE")
  )
}

function isE1(id: string):boolean{
  return(
    id === "1113102" || // ファーストイヤーセミナー
    id === "1227391"    // 学問への誘い
  )
}

// coins2023使いまわし
function isE2(id: string): boolean {
  return (
    // TODO: 基礎体育の時に種目が違うか、応用の時に種目が同じかチェック
    id.startsWith("21") || // 基礎体育
    id.startsWith("22") // 応用体育
  );
}

// coins2023使いまわし
function isE3(name: string): boolean {
  // TODO:
  // 編入とかで英語を認定された人は「英語」という名前の4単位の授業を与えられる
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

// coins2023使いまわし
function isE4(id: string): boolean {
  // TODO:
  // 編入とかで情報を認定された人は「情報」という名前の4単位の授業を与えられる
  return (
    // 情報リテラシー講義
    id.startsWith("61") ||
    // 情報リテラシー演習
    id.startsWith("64") ||
    // データサイエンス
    id.startsWith("65")
  );
}

//coins2023使いまわし
function isF1(id: string): boolean {
  return isGakushikiban(id);
}

//coins2023使いまわし
function isF2(id: string): boolean {
  return (
    // 体育（自由科目）、外国語、国語、芸術
    (id.startsWith("28") ||
      id.startsWith("3") ||
      id.startsWith("4") ||
      id.startsWith("5")) &&
    // 必修の外国語を除外
    !(
      id.startsWith("31H") ||
      id.startsWith("31J") ||
      id.startsWith("31K") ||
      id.startsWith("31L")
    )
  );
}

function isH1(id: string):boolean{
  return(
    id.startsWith("A") ||
    id.startsWith("B") ||
    id.startsWith("C")
  )
}

function isH2(id: string):boolean{
  return(
    !(id.startsWith("FA") || id.startsWith("FB") || id.startsWith("FC") || id.startsWith("FE") || id.startsWith("EE")) && // FA, FB, FC, FE, EEで始まる科目の除外 
    !isH1(id) && // A,B,Cで始まる科目の除外。
    !(isA1(id) || isA2(id) || isA3(id) || isA4(id) || isB1(id) || isB2(id) || isB3(id) || isB4(id)) && // 専門科目の除外
    
    true
    // 「教職に関する科目については、教育指導法（数学、理科）に関する科目に限る」とあるが、どの科目が該当科目が分からなかったので実装していません。
  )
}

export function classifyKnownCourses(cs: KnownCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    if (isA1(c.id))
      courseIdToCellId.set(c.id, "a1");
    else if (isA2(c.id))
      courseIdToCellId.set(c.id, "a2");
    else if(isA3(c.id))
      courseIdToCellId.set(c.id, "a3");
    else if(isA4(c.id))
      courseIdToCellId.set(c.id, "a4");
    else if(isB1(c.id))
      courseIdToCellId.set(c.id, "b1");
    else if(isB2(c.id))
      courseIdToCellId.set(c.id, "b2");
    else if(isB3(c.id))
      courseIdToCellId.set(c.id, "b3");
    else if(isB4(c.id))
      courseIdToCellId.set(c.id, "b4");
    else if(isD1(c.id))
      courseIdToCellId.set(c.id, "d1");
    else if(isD2(c.id))
      courseIdToCellId.set(c.id, "d2");
    else if(isD3(c.id))
      courseIdToCellId.set(c.id, "d3");
    else if(isE1(c.id))
      courseIdToCellId.set(c.id, "e1");
    else if(isE2(c.id))
      courseIdToCellId.set(c.id, "e2");
    else if(isE3(c.name))
      courseIdToCellId.set(c.id, "e3");
    else if(isE4(c.id))
      courseIdToCellId.set(c.id, "e4");
    else if(isF1(c.id))
      courseIdToCellId.set(c.id, "f1");
    else if(isF2(c.id))
      courseIdToCellId.set(c.id, "f2");
    else if(isH1(c.id))
      courseIdToCellId.set(c.id, "h1");
    else if(isH2(c.id))
      courseIdToCellId.set(c.id, "h2");
  }
  return courseIdToCellId;
}

export function classifyRealCourses(): Map<CourseId, string> {
  return new Map<CourseId, string>();
}

export function classifyFakeCourses(): Map<FakeCourseId, string> {
  return new Map<FakeCourseId, string>();
}

export const creditRequirements: SetupCreditRequirements = {
  cells: {
    a1: {min: 2, max: 2},
    a2: {min: 6, max: 6},
    a3: {min: 10, max: 10},
    a4: {min: 3, max: 3},
    b1: {min: 5, max: 11},
    b2: {min: 5, max: 8},
    b3: {min: 2, max: 6},
    b4: {min: 23, max: 47},
    d1: {min: 5, max:7},
    d2: {min: 4, max:8},
    d3: {min: 16, max: 34},
    e1: {min:2, max:2},
    e2: {min:2, max:2},
    e3: {min:4, max:4},
    e4: {min:4, max:4},
    f1: {min:1, max:6},
    f2: {min:0, max:18},
    h1: {min:6, max:8},
    h2: {min:0, max:18}
  },
  columns: {
    a: {min:21, max:21},
    b: {min:35, max:59},
    // c該当なし
    d: {min:25, max:49},
    e: {min:12, max:12},
    f: {min:1, max:24},
    h: {min:6, max:24}
  },
  compulsory: 33, // TODO
  elective: 91, // TOD
};
