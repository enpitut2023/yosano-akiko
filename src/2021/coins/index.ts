import { KnownCourse, CourseId, RealCourse, FakeCourseId } from "../../akiko";
import { setup } from "../../app";
import { courses } from "../../current-courses.js";
import cellIdToRect from "./cell-id-to-rect.json";

function convertToGb(id: string): string {
  switch (id) {
    case "BC12624": // コンピュータグラフィックス基礎
    case "GC23304": // CG基礎
      return "GB13704"; // コンピュータグラフィックス基礎

    case "GC50291": // オートマトンと形式言語
      return "GB20401"; // オートマトンと形式言語

    case "GC53701": // システム数理I
      return "GB22011"; // システム数理I

    case "GC53801": // システム数理II
      return "GB22021"; // システム数理II

    case "GC54301": // システム数理III
      return "GB22031"; // システム数理III

    case "BC12631": // インタラクティブCG
      return "GB22401"; // インタラクティブCG

    case "GC54601": // 情報線形代数
      return "GB22501"; // 情報線形代数

    case "GC54091": // 情報可視化
      return "GB22621"; // 情報可視化

    case "BC12871": // コンピュータネットワーク
    case "GC25301": // コンピュータネットワーク
      return "GB30101"; // コンピュータネットワーク

    case "BC12681": // 人工生命概論
      return "GB32301"; // 人工生命概論

    case "BC12651": // 情報セキュリティ
      return "GB40111"; // 情報セキュリティ

    case "BC12671": // ヒューマンインタフェース
    case "GE71101": // ヒューマンインタフェース
      return "GB40301"; // ヒューマンインタフェース

    case "BC12621": // 信号処理
      return "GB40411"; // 信号処理

    case "BC12881": // 機械学習
      return "GB40501"; // 機械学習

    case "GC54904": // アドバンストCG
      return "GB41104"; // アドバンストCG

    case "BC12601": // 音声聴覚情報処理
      return "GB41511"; // 音声聴覚情報処理

    case "GC53901": // 自然言語処理
      return "GB41611"; // 自然言語処理

    case "GC53601": // 視覚情報科学
      return "GB41711"; // 視覚情報科学

    case "BC12883": // 知能情報メディア実験A
      return "GB46403"; // 知能情報メディア実験A

    case "BC12893": // 知能情報メディア実験B
      return "GB46503"; // 知能情報メディア実験B

    case "GC59301": // 情報メディア創成特別講義C
      return "GB47001"; // 知能情報メディア特別講義A

    default:
      return id;
  }
}

function isB1(id: string): boolean {
  return (
    id.startsWith("GB20") || id.startsWith("GB30") || id.startsWith("GB40")
  );
}

function isB2(id: string): boolean {
  return (
    id === "GB13312" || //情報特別演習I
    id === "GB13322" || //情報特別演習II
    id === "GB13332" || //情報科学特別演習
    ((id.startsWith("GB2") ||
      id.startsWith("GB3") ||
      id.startsWith("GB4") ||
      id.startsWith("GA4")) &&
      id[3] !== "0" && // B1と排反
      id[3] !== "6") // 実験類を除く
  );
}

function isD1(id: string): boolean {
  return (
    id === "GB11601" || // 確率論
    id === "GB11621" || // 統計学
    id === "GB12301" || // 数値計算法
    id === "GB12601" || // 論理と形式化
    id === "GB11404" || // 電磁気学
    id === "GB12801" || // 論理システム
    id === "GB12812" // 論理システム演習
  );
}

function isD2(id: string): boolean {
  return (
    id === "GB13614" || // Computer Science in English A
    id === "GB13624" // Computer Science in English B
  );
}

function isD3(id: string): boolean {
  return (
    id !== "GB13312" && //情報特別演習I
    id !== "GB13322" && //情報特別演習II
    id !== "GB13332" && //情報科学特別演習
    id.startsWith("GB1") &&
    !isD1(id) &&
    !isD2(id) && //同列の他セルに含まれない
    !id.startsWith("GB19") && //他列に含まれない
    //必修を除外
    !(
      id.startsWith("GB102") ||
      id.startsWith("GB104") ||
      id.startsWith("GB108") ||
      id.startsWith("GB119") ||
      id.startsWith("GB122") ||
      id.startsWith("GB120")
    )
  );
}

function isD4(id: string): boolean {
  return (
    id.startsWith("GA1") &&
    //必修を除外
    !(id.startsWith("GA15") || id.startsWith("GA18"))
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

function isH1(id: string): boolean {
  return (
    !(
      id.startsWith("E") ||
      id.startsWith("F") ||
      id.startsWith("G") ||
      id.startsWith("H") ||
      // 共通科目及び教職に関する科目
      id.match(/^\d/)
    ) ||
    id.startsWith("8") ||
    id.startsWith("99")
  );
}

function isH2(id: string): boolean {
  return (
    id.startsWith("E") ||
    id.startsWith("F") ||
    id.startsWith("GC") ||
    id.startsWith("GE") ||
    id.startsWith("H")
  );
}

function classifyKnownCourses(cs: KnownCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    // 選択
    if (isB1(c.id)) {
      courseIdToCellId.set(c.id, "b1");
    } else if (isB2(c.id)) {
      courseIdToCellId.set(c.id, "b2");
    } else if (isD1(c.id)) {
      courseIdToCellId.set(c.id, "d1");
    } else if (isD2(c.id)) {
      courseIdToCellId.set(c.id, "d2");
    } else if (isD3(c.id)) {
      courseIdToCellId.set(c.id, "d3");
    } else if (isD4(c.id)) {
      courseIdToCellId.set(c.id, "d4");
    } else if (isF1(c.id)) {
      courseIdToCellId.set(c.id, "f1");
    } else if (isF2(c.id)) {
      courseIdToCellId.set(c.id, "f2");
    } else if (isH1(c.id)) {
      courseIdToCellId.set(c.id, "h1");
    } else if (isH2(c.id)) {
      courseIdToCellId.set(c.id, "h2");
    }
  }
  return courseIdToCellId;
}

function classifyRealCourses(cs: RealCourse[]): Map<CourseId, string> {
  const courseIdToCellId = new Map<CourseId, string>();
  for (const c of cs) {
    const id = convertToGb(c.id);
    // 選択
    if (isB1(id)) {
      courseIdToCellId.set(c.id, "b1");
    } else if (isB2(id)) {
      courseIdToCellId.set(c.id, "b2");
    } else if (isD1(id)) {
      courseIdToCellId.set(c.id, "d1");
    } else if (isD2(id)) {
      courseIdToCellId.set(c.id, "d2");
    } else if (isD3(id)) {
      courseIdToCellId.set(c.id, "d3");
    } else if (isD4(id)) {
      courseIdToCellId.set(c.id, "d4");
    } else if (isF1(id)) {
      courseIdToCellId.set(c.id, "f1");
    } else if (isF2(id)) {
      courseIdToCellId.set(c.id, "f2");
    } else if (isH1(id)) {
      courseIdToCellId.set(c.id, "h1");
    } else if (isH2(id)) {
      courseIdToCellId.set(c.id, "h2");
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
      b1: { min: 18, max: undefined },
      b2: { min: 0, max: 18 },
      d1: { min: 10, max: undefined },
      d2: { min: 2, max: undefined },
      d3: { min: 0, max: undefined },
      d4: { min: 8, max: undefined },
      f1: { min: 1, max: undefined },
      f2: { min: 0, max: 4 },
      h1: { min: 6, max: undefined },
      h2: { min: 0, max: 4 },
    },
    columns: {
      b: { min: 36, max: 36 },
      d: { min: 24, max: 24 },
      f: { min: 1, max: 5 },
      h: { min: 6, max: 10 },
    },
    compulsory: 54,
    elective: 71,
  },
  major: "coins",
  requirementsTableYear: 2021,
  cellIdToRectRecord: cellIdToRect,
  classifyKnownCourses,
  classifyRealCourses,
  classifyFakeCourses,
});
