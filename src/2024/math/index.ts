import { CourseId, FakeCourseId, KnownCourse } from "../../akiko";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRect from "./cell-id-to-rect.json";
import tableViewBox from "./table-view-box.json";

function isA1(id: string): boolean {
  return id === "FB14908"; // 卒業研究
}

function isA2(id: string): boolean {
  return id === "FB13901"; // 卒業予備研究
}

function isA3(id: string): boolean {
  return ( // 数学外書輪講II
    id === "FB13501" || // 学籍番号の下5桁が10800未満
    id === "FB13511" || // 学籍番号の下5桁が11600以上
    id === "FB13521" // 学籍番号の下5桁が10800以上11600未満
  );
}

function isB1(id: string): boolean {
  return (
    id.startsWith("FB12")
    || id.startsWith("FB13")
    || id.startsWith("FB14")
  );
}

function isC1(id: string): boolean {
  return (
    id === "FA01371" || //微積分1(2024以降)
    id === "FA01471" //微積分2(2024以降)
    //微分積分Aは総合に所属時にのみ認める
    // id === "GA15311" || //微分積分A 情報科学類1・2クラス
    // id === "GA15321" || //微分積分A 情報科学類3・4クラス
    // id === "GA15331" || //微分積分A 情報メディア創成学類生および総合学域群生
    // id === "GA15341" //微分積分A 知識学類生および総合学域群生
  );
}

function isC2(id: string): boolean {
  return (
    id === "FA01671" || //線形代数1(2024以降)
    id === "FA01771" //線形代数2(2024以降)
    //線形代数Aは総合に所属時にのみ認める
    // id === "FF18724" || //線形代数A 応用理工学類1・2クラス
    // id === "FF18734" || //線形代数A 応用理工学類3・4クラス
    // id === "GA15211" || //線形代数A 情報科学類生1・2クラスおよび総合学域群生
    // id === "GA15221" || //線形代数A 情報科学類生3・4クラスおよび総合学域群生
    // id === "GA15231" || //線形代数A 情報メディア創成学類生および総合学域群生
    // id === "GA15241" //線形代数A 知識学類生および総合学域群生
  );
}

function isC3(id: string): boolean {
  return (
    id === "FA01171" || //数学リテラシー1(数学類1年次)
    id === "FA011B1" //数学リテラシー1(数学類, 物理学類, 化学類, 地球学類2年次)
  );
}

function isC4(id: string): boolean {
  return (
    id === "FA01271" || //数学リテラシー2(数学類1年次)
    id === "FA012B1" //数学リテラシー2(数学類, 物理学類, 化学類, 地球学類2年次)
  );
}

function isD1(id: string): boolean {
  return (
    id.startsWith("FBA") ||
    id.startsWith("FC") ||
    id.startsWith("FE") ||
    id.startsWith("EE") ||
    id === "FA01571" || //微積分3
    id === "FA01871" || //線形代数3
    id === "EB00001" || //生物学序説(秋AB)
    id === "EB00011" || //生物学序説(春C)
    id === "EB00021" || //生物学序説(春A)
    id === "EB11311" || //遺伝学概論(春C)
    id === "EB11351" || //遺伝学概論(秋C)
    id === "EB11221" || //分子細胞生物学概論(春B)
    id === "EB11251" || //分子細胞生物学概論(秋AB)
    id === "EB11131" || //系統分類・進化学概論(秋A)
    id === "EB11151" || //系統分類・進化学概論(秋C)
    id === "EB11611" || //生態学概論(秋A)
    id === "EB11651" || //生態学概論(秋AB)
    id === "EB11721" || //動物生理学概論(秋B)
    id === "EB11751" || //動物生理学概論(春AB)
    id === "EB11811" || //植物生理学概論(秋B)
    id === "EB11851" //植物生理学概論(春AB)
  );
}

function isE1(id: string): boolean {
  return (
    id === "1112102" || //ファーストイヤーセミナー
    id === "1227371" //学問への誘い
  );
}

function isE2(id: string): boolean {
  // return (
  //   //曜日で絞ってないよ(数学類は基礎火3/応用水3)
  //   // id.startsWith("21") || //基礎体育
  //   // id.startsWith("22") //応用体育
  // );
  return false;
}

function isE3(id: string): boolean {
  //第1外国語「生物、地球、数学、物理、化学、創成、総学3組」
  //「生物、地球、数学、物理、化学、創成、総学3組」 6班対象は2024開講なし
  return (
    id.startsWith("31HC") || //English Reading Skills I
    id.startsWith("31KC") || //English Reading Skills II
    id.startsWith("31JC") || //English Presentation Skills I
    id.startsWith("31LC") //English Presentation Skills II
  );
}

function isE4(id: string): boolean {
  return (
    id === "6112101" || //情報リテラシー(講義)
    id === "6412102" || //情報リテラシー(演習)
    id === "6512102" //データサイエンス
  );
}

function isF1(id: string): boolean {
  // return (
  //   //英語科目ってどうするの？？？
  //   //除外していいなら1227000-1228721を12スタートから除外
  //   //1290181:Inclusive Smart Society 概論Ⅰ, 1290191:Inclusive Smart Society 概論IIは日本語シラバスにもあり
  //   // id.startsWith("12") && !(id >= "1227000" && id <= "1228721") || //学士基盤科目
  //   // id.startsWith("14") //学士基盤科目-高年次向け-
  // );
  // return isGakushikiban(id);
  return false;
}

function isF2(id: string): boolean {
  // return (
    // 総合科目(学士基盤科目), 体育, 外国語, 情報, 国語, 芸術
    // (isGakushikiban(id) || //学士基盤科目
      // id.startsWith("28") || //体育　数学類で絞ってないよ
      // id.startsWith("3") || //外国語 数学類で絞ってないよ
      //情報
      // id.startsWith("4") || //芸術ここはOK
      // id.startsWith("5") //国語　数学類で絞ってないよ
    // ) &&
    // 必修の外国語を除外
    // !(
  //     id.startsWith("31H") ||
  //     id.startsWith("31J") ||
  //     id.startsWith("31K") ||
  //     id.startsWith("31L")
  //   )
  // );
  return false;
}

function isH1(id: string): boolean {
  return false;
  //専門科目および専門基礎科目で指定した科目以外
  //教職に関する科目については教科指導法(数学)に関する科目のみ→何が該当するかわからないのでパスしました
}

function classifyKnownCourses(cs: KnownCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    // 必修
    if (isA1(c.id)) {
      courseIdToCellId.set(c.id, "a1");
    } else if (isA2(c.id)) {
      courseIdToCellId.set(c.id, "a2");
    } else if (isA3(c.id)) {
      courseIdToCellId.set(c.id, "a3");
    } else if (isC1(c.id)) {
      courseIdToCellId.set(c.id, "c1");
    } else if (isC2(c.id)) {
      courseIdToCellId.set(c.id, "c2");
    } else if (isC3(c.id)) {
      courseIdToCellId.set(c.id, "c3");
    } else if (isC4(c.id)) {
      courseIdToCellId.set(c.id, "c4");
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
    } else if (isD1(c.id)) {
      courseIdToCellId.set(c.id, "d1");
    } else if (isF1(c.id)) {
      courseIdToCellId.set(c.id, "f1");
    } else if (isF2(c.id)) {
      courseIdToCellId.set(c.id, "f2");
    } else if (isH1(c.id)) {
      courseIdToCellId.set(c.id, "h1");
    }
  }
  return courseIdToCellId;
}

function classifyRealCourses(): Map<CourseId, string> {
  return new Map<CourseId, string>();
}

function classifyFakeCourses(): Map<FakeCourseId, string> {
  return new Map<FakeCourseId, string>();
}

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: {
    cells: {
      a1: { min: 9, max: 9 },
      a2: { min: 3, max: 3 },
      a3: { min: 2, max: 2 },
      b1: { min: 46, max: 70 },
      c1: { min: 2, max: 2 },
      c2: { min: 2, max: 2 },
      c3: { min: 1, max: 1 },
      c4: { min: 1, max: 1 },
      d1: { min: 15, max: 47 },
      e1: { min: 2, max: 2 },
      e2: { min: 2, max: 2 },
      e3: { min: 4, max: 4 },
      e4: { min: 4, max: 4 },
      f1: { min: 1, max: 1 },
      f2: { min: 0, max: 16 },
      h1: { min: 6, max: 16 },
    },
    columns: {
      a: { min: 14, max: 14 },
      b: { min: 46, max: 70 },
      c: { min: 6, max: 6 },
      d: { min: 15, max: 47 },
      e: { min: 12, max: 12 },
      f: { min: 1, max: 17 },
      h: { min: 6, max: 16 },
    },
    compulsory: 32,
    elective: 92,
  },
  major: "math",
  requirementsTableYear: 2024,
  cellIdToRectRecord: cellIdToRect,
  tableViewBox,
  classifyKnownCourses,
  classifyRealCourses,
  classifyFakeCourses,
});
