import { readFileSync } from "node:fs";
import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirements,
} from "@/requirements/coins-since-2023";
import { assertCreditStatsEqual, getCreditStats } from "@/test-util";

function test2(): void {
  const csv = readFileSync("grade-csvs/2023/coins-1.csv", { encoding: "utf8" });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements,
    classifyRealCourses: (cs, opts) => classifyRealCourses(cs, opts, "scs"),
    classifyFakeCourses: (cs, opts) => classifyFakeCourses(cs, opts, "scs"),
  });
  assertCreditStatsEqual(got, {
    cells: {
      a1: { taken: 3, mightTake: 3 },
      b1: { taken: 13, mightTake: 2 },
      b2: { taken: 12, mightTake: 5 },
      c1: { taken: 2 },
      c2: { taken: 2 },
      c3: { taken: 2 },
      c4: { taken: 2 },
      c5: { taken: 2 },
      c6: { taken: 1 },
      c7: { taken: 2 },
      c8: { taken: 1 },
      c9: { taken: 3 },
      c10: { taken: 3 },
      c11: { taken: 2 },
      c12: { taken: 2 },
      c13: { taken: 2 },
      d1: { taken: 9 },
      d2: { taken: 2 },
      d3: { taken: 4 },
      d4: { taken: 11 },
      e1: { taken: 2 },
      e2: { taken: 2 },
      e3: { taken: 4 },
      e4: { taken: 4 },
      f1: { mightTake: 1 },
      h1: { taken: 8 },
      h2: { taken: 4 },
    },
    columns: {
      a: { taken: 3, mightTake: 3 },
      b: { taken: 25, mightTake: 7 },
      c: { taken: 26 },
      d: { taken: 26 },
      e: { taken: 12 },
      f: { mightTake: 1 },
      h: { rawTaken: 12, effectiveTaken: 10 },
    },
    compulsory: { taken: 41, mightTake: 3 },
    elective: { taken: 61, mightTake: 8 },
  });
}

function test3(): void {
  const csv = `
学籍番号,学生氏名,科目番号,科目名,単位数,春学期,秋学期,総合評価,科目区分,開講年度,開講区分,コメント
,,FA016C1,線形代数1,1.0,-,-,A,C,2025,通常,総合の人間が線形代数をFAで取っていた時にちゃんと反映される
,,FA017C1,線形代数2,1.0,-,-,A,,2025,通常,総合の人間が線形代数をFAで取っていた時にちゃんと反映される
,,BC12624,コンピュータグラフィックス基礎,2.0,-,-,A,,2025,通常,コードシェア科目の読み替えcoins全部
,,31JA012,English Presentation Skills I,1.0,-,-,A,,2025,通常,名前で成績判定される英語は名前で判定される
,,GB22621,情報可視化,2.0,-,-,A+,A,2025,通常,b2が18単位を超えている場合でも18単位しか換算されない
,,GB31611,データベース概論B,1.0,-,-,A,A,2025,通常,
,,GB31111,並列処理アーキテクチャI,1.0,-,-,A,A,2025,通常,
,,GB41511,音声聴覚情報処理,1.0,-,-,A,A,2025,通常,
,,GB42301,画像認識工学,2.0,-,-,B,A,2025,通常,
,,GB21201,プログラム言語論,1.0,-,-,B,A,2024,通常,
,,GB31401,システムプログラム,2.0,-,-,B,A,2024,通常,
,,GB13322,情報特別演習II,2.0,-,-,B,A,2024,通常,
,,GB22401,インタラクティブCG,2.0,-,-,B,A,2024,通常,
,,GB22501,情報線形代数,2.0,-,-,B,A,2024,通常,
,,GB31201,VLSI工学,2.0,-,-,B,A,2024,通常,
,,GB31701,情報検索概論,2.0,-,-,B,A,2024,通常,
,,GB31121,並列処理アーキテクチャII,2.0,-,-,B,A,2024,通常,
,,GB22031,システム数理III,1.0,-,-,A+,A,2024,通常,
,,GB22031,システム数理III,1.0,-,-,D,A,2023,通常,落単して再度履修した場合
,,GB13312,情報特別演習I,2.0,-,-,B,A,2024,通常,情報特別演習がB2に表示される
,,FF18724,線形代数A,1.0,-,-,A,A,2025,通常,coins以外の線形代数をとっていても必修が埋まらない
,,GB30101,コンピュータネットワーク,2.0,-,-,A,A,2024,通常,GB30がGB3のところにでてこない
,,8042104,海外武者修行,1.0,-,-,A,A,2025,通常,f列とh列合計で11単位とっていても、f列で7単位、h列で4単位の場合は11単位にならない
,,8049911,日本の歴史,1.0,-,-,A,A,2025,通常,
,,8050011,ポスト・アントロポセン,1.0,-,-,A,A,2025,通常,
,,1207011,ピア・サポートを学ぶ~支えあいの大学のために,1.0,-,-,A,A,2025,通常,
,,1210231,森林,1.0,-,-,A,A,2025,通常,
,,8050001,TSUKUBAポスト・コロナ学,1.0,-,-,A,A,2025,通常,
,,2803343,インラインスケート,0.5,-,-,A,A,2025,通常,
,,3911212,研究日本語基礎I-A-2,2.0,-,-,A,A,2025,通常,
,,3911122,研究日本語基礎II-A-1,2.0,-,-,A,A,2025,通常,
,,3911112,研究日本語基礎I-A-1,2.0,-,-,A,A,2025,通常,
,,GB26503,ソフトウェアサイエンス実験B,3.0,-,-,D,A,2025,通常,落単の科目は判定されず、落単済みと表示される
,,2800343,合気道,0.5,-,-,A,A,2025,通常,h1の共通科目が弾かれている
,,9100111,こころの発達,1.0,-,-,A,A,2025,通常,h1の教職科目がはじかれている
`.trim();
  const isNative = false;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements,
    classifyRealCourses: (cs, opts) => classifyRealCourses(cs, opts, "scs"),
    classifyFakeCourses: (cs, opts) => classifyFakeCourses(cs, opts, "scs"),
  });
  assertCreditStatsEqual(got, {
    cells: {
      b1: { taken: 2 },
      b2: { rawTaken: 25, effectiveTaken: 18 },
      c1: { taken: 2 },
      d3: { taken: 2 },
      e3: { taken: 1 },
      f1: { taken: 2 },
      f2: { rawTaken: 7, effectiveTaken: 4 },
      h1: { taken: 4 },
      // FF18724 線形代数A の1単位がh2に入っている。情報科学類の学生は必修と内
      // 容が被っている他学類の線形代数などを履修することができない。そのため、
      // 本来は卒業単位として数えられないが、履修がそもそもできないなら数えてし
      // まっても問題ないとする。
      h2: { taken: 1 },
    },
    columns: {
      b: { taken: 20 },
      c: { taken: 2 },
      d: { taken: 2 },
      e: { taken: 1 },
      f: { rawTaken: 6, effectiveTaken: 5 },
      h: { taken: 5 },
    },
    compulsory: { taken: 3 },
    elective: { taken: 32 },
  });
}

test2();
test3();
console.log(__filename, "ok");
