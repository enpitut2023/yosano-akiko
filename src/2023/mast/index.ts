import { KnownCourse, CourseId, RealCourse, FakeCourseId } from "../../akiko";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRect from "./cell-id-to-rect.json";

function isB1(id: string): boolean {
  return id.startsWith("GC5") || id.startsWith("GA4");
}

function isD1(id: string): boolean {
  return (
    id !== "GA15111" && //情報数学A
    id !== "GA15121" &&
    id !== "GA15131" &&
    id !== "GA15141" &&
    id !== "GA15211" && //線形代数A
    id !== "GA15221" &&
    id !== "GA15231" &&
    id !== "GA15241" &&
    id !== "GA15311" && //微分積分A
    id !== "GA15321" &&
    id !== "GA15331" &&
    id !== "GA15341" &&
    id !== "GA18212" && //プログラミング入門A
    id !== "GA18222" &&
    id !== "GA18232" &&
    id !== "GA18312" && //プログラミング入門B
    id !== "GA18322" &&
    id !== "GA18332" &&
    (id.startsWith("GC2") || id.startsWith("GA1"))
  );
}

function isF1(id: string): boolean {
  return (
    (id.startsWith("12") || id.startsWith("14")) &&
    // 総合科目(学士基盤科目)
    !["27", "28", "30", "90"].includes(id.substring(2, 4))
  );
}

function isF2(id: string): boolean {
  return id.startsWith("28"); // 体育（自由科目）
}

function isF3(id: string): boolean {
  return (
    id.startsWith("3") && // 外国語（英語）
    !(
      id.startsWith("31H") ||
      id.startsWith("31J") ||
      id.startsWith("31K") ||
      id.startsWith("31L")
    )
  );
}

function isF4(id: string): boolean {
  return id.startsWith("5"); // 国語
}

function isF5(id: string): boolean {
  return id.startsWith("4"); // 芸術
}

function isH1(id: string): boolean {
  return !(
    id.startsWith("GA") ||
    id.startsWith("GB") ||
    id.startsWith("GC") ||
    id.startsWith("GE") ||
    // 共通科目及び教職に関する科目
    id.match(/^\d/)
  );
}

function isH2(id: string): boolean {
  return (
    (id.startsWith("GB") || id.startsWith("GE")) &&
    !(
      (
        id.startsWith("GB102") || //線形代数B
        id.startsWith("GB104") || //微分積分B
        id === "GB11931" || //データ構造とアルゴリズム
        id === "GB11956" || //データ構造とアルゴリズム実験
        id === "GB11966" || //データ構造とアルゴリズム実験
        id.startsWith("GB133") || //情報特別演習（情科）
        id.startsWith("GB139") || //インターンシップ（情科）
        id === "GB17401" || //情報科学特別講義E
        id.startsWith("GB19") || //専門英語、卒業研究、特別研究（情科）
        id.startsWith("GB26") || //ソフトウェアサイエンス実験A、B
        id.startsWith("GB27") || //ソフトウェアサイエンス特別講義A、B、C、D
        id.startsWith("GB36") || //情報システム実験A、B
        id.startsWith("GB37") || //情報システム特別講義A、B、C、D
        id.startsWith("GB46") || //知能情報メディア実験A、B
        id.startsWith("GB47") || //知能情報メディア特別講義A、B、C、D
        id.startsWith("GE116") || //専門英語A1（知識）
        id.startsWith("GE117") || //専門英語A2（知識）
        id.startsWith("GE121") || //アカデミックスキルズ（知識）
        id === "GE40603" || //インターンシップ（知識）
        id === "GE40703" || //国際インターンシップ（知識）
        id.startsWith("GE42") || //国際学術演習A、B
        id.startsWith("GE50") || //知識情報持論、専門英語B-C
        id.startsWith("GE51") || //卒業研究（知識）
        id.startsWith("GE601") || //知識科学実習A、B
        id.startsWith("GE701") || //知識情報システム実習A、B
        id.startsWith("GE801")
      ) //情報資源経営実習A、B
    )
  );
}

function isH3(id: string): boolean {
  return id.startsWith("99"); //博物館に関する科目　自由科目（特設）
}

function classifyKnownCourses(cs: KnownCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    // 選択
    if (isB1(c.id)) {
      courseIdToCellId.set(c.id, "b1");
    } else if (isD1(c.id)) {
      courseIdToCellId.set(c.id, "d1");
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
    } else if (isH1(c.id)) {
      courseIdToCellId.set(c.id, "h1");
    } else if (isH2(c.id)) {
      courseIdToCellId.set(c.id, "h2");
    } else if (isH3(c.id)) {
      courseIdToCellId.set(c.id, "h3");
    }
  }
  return courseIdToCellId;
}

function classifyRealCourses(cs: RealCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    if (isB1(c.id)) {
      courseIdToCellId.set(c.id, "b1");
    } else if (isD1(c.id)) {
      courseIdToCellId.set(c.id, "d1");
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
    } else if (isH1(c.id)) {
      courseIdToCellId.set(c.id, "h1");
    } else if (isH2(c.id)) {
      courseIdToCellId.set(c.id, "h2");
    } else if (isH3(c.id)) {
      courseIdToCellId.set(c.id, "h3");
    }
  }
  return courseIdToCellId;
}

function classifyFakeCourses(): Map<FakeCourseId, string> {
  const fakeCourseIdToCellId = new Map<FakeCourseId, string>();
  return fakeCourseIdToCellId;
}

setup({
  knownCourses: courses as KnownCourse[],
  knownCourseYear: 2025,
  creditRequirements: {
    cells: {
      b1: { min: 20, max: 35 },
      d1: { min: 32, max: 47 },
      f1: { min: 1, max: 4 },
      f2: { min: 0, max: 2 },
      f3: { min: 0, max: 6 },
      f4: { min: 0, max: 2 },
      f5: { min: 0, max: 6 },
      h1: { min: 6, max: 15 },
      h2: { min: 0, max: 9 },
      h3: { min: 0, max: 9 },
    },
    columns: {
      b: { min: 20, max: 35 },
      d: { min: 32, max: 47 },
      f: { min: 1, max: 10 },
      h: { min: 6, max: 15 },
    },
    compulsory: 50,
    elective: 74,
  },
  major: "mast",
  requirementsTableYear: 2023,
  cellIdToRectRecord: cellIdToRect,
  classifyKnownCourses,
  classifyRealCourses,
  classifyFakeCourses,
});
