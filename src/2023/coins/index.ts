import { CellFilterArgs, setup } from "../../app";
import { courses } from "../../current-courses.js";

function convertToGb(id: string): string {
  return id; // FIXME
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

function isA1(id: string): boolean {
  return (
    id === "GB26403" || // ソフトウェアサイエンス実験A
    id === "GB26503" // ソフトウェアサイエンス実験B
  );
}

function isA2(id: string): boolean {
  return (
    id === "GB19848" || // 特別卒業研究A
    id === "GB19948" || // 卒業研究A
    id === "GB19988" || // 卒業研究A 秋
    id === "GB19858" || // 特別卒業研究B
    id === "GB19958" || // 卒業研究B
    id === "GB19998" // 卒業研究B　春
  );
}

function isA3(id: string): boolean {
  return (
    id === "GB19141" || // 特別専門語学A
    id === "GB19091" || // 専門語学A
    id === "GB19111" || // 専門語学A 秋
    id === "GB19151" || // 特別専門語学B
    id === "GB19101" || // 専門語学B
    id === "GB19121" // 専門語学B 春
  );
}

function isB1(id: string): boolean {
  id = convertToGb(id);
  return (
    id.startsWith("GB20") || id.startsWith("GB30") || id.startsWith("GB40")
  );
}

function isB2(id: string): boolean {
  id = convertToGb(id);
  return (
    id === "GB13312" || //情報特別演習I
    id === "GB13322" || //情報特別演習II
    id === "GB13332" || //情報科学特別演習
    ((id.startsWith("GB2") || id.startsWith("GB3") || id.startsWith("GB4")) &&
      id[3] !== "0" &&
      id[3] !== "6")
  );
}

function isC1(id: string, args: CellFilterArgs): boolean {
  return (
    id === "GA15211" || //1・2クラス
    id === "GA15221" || //3・4クラス
    // 移行生はFAから始まる線形代数1をcoinsの線形代数Aとして使える
    // TODO: 1年の時にFA...を取らなかった移行生がこれを見ると、2年になってから
    // FA...を取ることができると勘違いするかも？
    (!args.native &&
      (id === "FA01611" ||
        id === "FA01621" ||
        id === "FA01631" ||
        id === "FA01641" ||
        id === "FA01651" ||
        id === "FA01661" ||
        id === "FA01671" ||
        id === "FA01681" ||
        id === "FA01691" ||
        id === "FA016A1" ||
        id === "FA016C1" ||
        id === "FA016D1"))
  );
}

function isC2(id: string): boolean {
  return (
    id === "GB10234" || //1・2クラス
    id === "GB10244" //3・4クラス
  );
}

function isC3(id: string, args: CellFilterArgs): boolean {
  return (
    id === "GA15311" || //1・2クラス
    id === "GA15321" || //3・4クラス
    // 移行生はFAから始まる微積分1をcoinsの微分積分Aとして使える
    // TODO: C1と同じ懸念
    (!args.native &&
      (id === "FA01311" ||
        id === "FA01321" ||
        id === "FA01331" ||
        id === "FA01341" ||
        id === "FA01351" ||
        id === "FA01361" ||
        id === "FA01371" ||
        id === "FA01381" ||
        id === "FA01391" ||
        id === "FA013A1" ||
        id === "FA013C1" ||
        id === "FA013D1"))
  );
}

function isC4(id: string): boolean {
  return (
    id === "GB10444" || //1・2クラス
    id === "GB10454" //3・4クラス
  );
}

function isC5(id: string): boolean {
  return (
    id === "GA15111" || //1・2クラス
    id === "GA15121" //3・4クラス
  );
}

function isC6(id: string): boolean {
  return id === "GB19061";
}

function isC7(id: string, args: CellFilterArgs): boolean {
  return (
    id === "GA18212" ||
    // 移行生はFHから始まるプロ入Aをcoinsのプロ入Aとして使える
    // TODO: C1と同じ懸念
    (!args.native && (id === "FH60474" || id === "FH60484" || id === "FH60494"))
  );
}

function isC8(id: string, args: CellFilterArgs): boolean {
  return (
    id === "GA18312" ||
    // 移行生はFHから始まるプロ入Bをcoinsのプロ入Bとして使える
    // TODO: C1と同じ懸念
    (!args.native && (id === "FH60574" || id === "FH60584" || id === "FH60594"))
  );
}

function isC9(id: string): boolean {
  return id === "GB11964";
}

function isC10(id: string): boolean {
  return id === "GB11931";
}

function isC11(id: string): boolean {
  return (
    id === "GB11956" || //1・2クラス
    id === "GB11966" //3・4クラス
  );
}

function isC12(id: string): boolean {
  return id === "GB10804";
}

function isC13(id: string): boolean {
  return id === "GB12017";
}

function isD1(id: string): boolean {
  return (
    id === "GB11601" || //確率論
    id === "GB11621" || //統計学
    id === "GB12301" || //数値計算法
    id === "GB12601" || //論理と形式化
    id === "GB12801" || //論理システム
    id === "GB12812" //論理システム演習
  );
}

function isD2(id: string): boolean {
  return (
    id === "GB13614" || // Computer Science in English A
    id === "GB13624" // Computer Science in English B
  );
}

function isD3(id: string): boolean {
  id = convertToGb(id);
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

function isE1(id: string): boolean {
  return (
    //学問への誘い
    id === "1227571" || //1クラス
    id === "1227581" || //2クラス
    id === "1227591" || //3クラス
    id === "1227601" || //4クラス
    //ファーストイヤーセミナー
    id === "1118102" || //1クラス
    id === "1118202" || //2クラス
    id === "1118302" || //3クラス
    id === "1118402" //4クラス
  );
}

function isE2(id: string): boolean {
  return (
    // TODO: 基礎体育の時に種目が違うか、応用の時に種目が同じかチェック
    id.startsWith("21") || // 基礎体育
    id.startsWith("22") // 応用体育
  );
}

function isE3(_id: string, args: CellFilterArgs): boolean {
  // TODO:
  // 編入とかで英語を認定された人は「英語」という名前の4単位の授業を与えられる
  let name = args.name;
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
  id = convertToGb(id);
  if (id.startsWith("__")) {
    return false;
  }
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
  id = convertToGb(id);
  return (
    id.startsWith("E") ||
    id.startsWith("F") ||
    id.startsWith("GC") ||
    id.startsWith("GE") ||
    id.startsWith("H")
  );
}

setup(
  2023,
  courses,
  2025,
  "coins",
  {
    a1: { filter: isA1, creditMin: 6, creditMax: 6 },
    a2: { filter: isA2, creditMin: 6, creditMax: 6 },
    a3: { filter: isA3, creditMin: 4, creditMax: 4 },

    b1: { filter: isB1, creditMin: 16, creditMax: undefined },
    b2: { filter: isB2, creditMin: 0, creditMax: 18 },

    c1: { filter: isC1, creditMin: 2, creditMax: 2 },
    c2: { filter: isC2, creditMin: 2, creditMax: 2 },
    c3: { filter: isC3, creditMin: 2, creditMax: 2 },
    c4: { filter: isC4, creditMin: 2, creditMax: 2 },
    c5: { filter: isC5, creditMin: 2, creditMax: 2 },
    c6: { filter: isC6, creditMin: 1, creditMax: 1 },
    c7: { filter: isC7, creditMin: 2, creditMax: 2 },
    c8: { filter: isC8, creditMin: 1, creditMax: 1 },
    c9: { filter: isC9, creditMin: 3, creditMax: 3 },
    c10: { filter: isC10, creditMin: 3, creditMax: 3 },
    c11: { filter: isC11, creditMin: 2, creditMax: 2 },
    c12: { filter: isC12, creditMin: 2, creditMax: 2 },
    c13: { filter: isC13, creditMin: 2, creditMax: 2 },

    d1: { filter: isD1, creditMin: 8, creditMax: undefined },
    d2: { filter: isD2, creditMin: 2, creditMax: undefined },
    d3: { filter: isD3, creditMin: 4, creditMax: undefined },
    d4: { filter: isD4, creditMin: 8, creditMax: undefined },

    e1: { filter: isE1, creditMin: 2, creditMax: 2 },
    e2: { filter: isE2, creditMin: 2, creditMax: 2 },
    e3: { filter: isE3, creditMin: 4, creditMax: 4 },
    e4: { filter: isE4, creditMin: 4, creditMax: 4 },

    f1: { filter: isF1, creditMin: 1, creditMax: undefined },
    f2: { filter: isF2, creditMin: 0, creditMax: 4 },

    h1: { filter: isH1, creditMin: 6, creditMax: undefined },
    h2: { filter: isH2, creditMin: 0, creditMax: 4 },
  },
  {
    a: { creditMin: 16, creditMax: 16 },
    b: { creditMin: 34, creditMax: 34 },
    c: { creditMin: 26, creditMax: 26 },
    d: { creditMin: 26, creditMax: 26 },
    e: { creditMin: 12, creditMax: 12 },
    f: { creditMin: 1, creditMax: 5 },
    h: { creditMin: 6, creditMax: 10 },
  },
  71,
);
