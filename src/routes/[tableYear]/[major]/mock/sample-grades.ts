import { isCourseId, type Grade, type RealCourse } from "#lib/akiko.ts";
import { assert } from "#lib/util.ts";

// Years are counted from the catalog's, so 履修中 courses are this year's
const ROWS: [string, string, number, number, Grade][] = [
  ["1101102", "ファーストイヤーセミナー", 1, -2, "pass"],
  ["GA15211", "線形代数A", 2, -2, "a"],
  ["GA15311", "微分積分A", 2, -2, "b"],
  ["GA18212", "プログラミング入門A", 2, -2, "a+"],
  ["GA18312", "プログラミング入門B", 1, -2, "a"],
  ["GB10234", "線形代数B", 2, -1, "b"],
  ["GB10444", "微分積分B", 2, -1, "c"],
  ["GB10804", "論理回路", 2, -1, "a"],
  ["GB11964", "コンピュータとプログラミング", 3, -1, "a"],
  ["GB11601", "確率論", 2, -1, "a"],
  ["GB12301", "数値計算法", 2, -1, "b"],
  ["GB12601", "論理と形式化", 2, -1, "d"],
  ["GB11931", "データ構造とアルゴリズム", 3, 0, "wip"],
  ["GB11956", "データ構造とアルゴリズム実験", 2, 0, "wip"],
  ["GB11621", "統計学", 2, 0, "wip"],
];

/** Made-up grades of a coins student, for trying the mock without a file. */
export function sampleGrades(catalogYear: number): RealCourse[] {
  return ROWS.map(([id, name, credit, yearOffset, grade]) => {
    assert(isCourseId(id), `Bad course id: "${id}"`);
    return { id, name, credit, takenYear: catalogYear + yearOffset, grade };
  });
}
