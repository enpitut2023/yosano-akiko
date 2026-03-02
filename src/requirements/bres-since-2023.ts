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
    isCompulsoryPe3,
    isCompulsoryPe4,
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
    isNonCompulsoryEnglish,
    isSecondForeignLanguage,
} from "@/requirements/common";
import { unreachable } from "@/util";
import { is } from "zod/locales";

export type Specialty = "as" | "les";
type Mode = "known" | "real";

function isThesis(id: string): boolean {
    return (
        id === "EC51958" || // 卒業研究Ⅰ 春
        id === "EC51968" || // 卒業研究Ⅰ 秋
        id === "EC51978" || // 卒業研究Ⅱ春
        id === "EC51988"    // 卒業研究Ⅱ秋
    );
}
function isJapanExpertAgronomistInternship(id: string): boolean {
    return (
        id === "EC00103" || id === "EC00203" //Japan-Expert アグロノミストインターンシップ 
    );
}
function isA1(id: string, tableYear: number): boolean {
    switch (tableYear) {
        case 2023:
            return (
                //専門語学がクラスごとに分かれている
                id === "EC13112" || //1クラス，春
                id === "EC13122" || //1クラス，秋
                id === "EC13212" || //2クラス，春
                id === "EC13222" || //2クラス，秋
                id === "EC13312" || //3クラス，春
                id === "EC13322" || //3クラス，秋
                id === "EC13412" || //4クラス，春
                id === "EC13422" || //4クラス，秋
                id === "EC13512" || //5クラス，春
                id === "EC13522" || //5クラス，秋
                id === "EC13802" //生物資源学類長が特別に認めた者，通年
            );
            break;
        case 2024:
        case 2025:
            //専門語学(春，秋)
            return id === "EC13112" || id === "EC13122";
            break;
        default:
            return false;
    }
}

function isA2(id: string): boolean {
    return id === "EC14502" // 専門語学II
}



function classifyColumnA(
    id: string,
    specialty: Specialty,
    _mode: Mode,
    tableYear: number,
): string | undefined {
    switch (specialty) {
        case "as":
            if (isA1(id, tableYear)) return "a1";
            if (isA2(id)) return "a2";
            if (isThesis(id)) return "a3";
        case "les":
            if (isA1(id, tableYear)) return "a1";
            if (isA2(id)) return "a2";
            if (isJapanExpertAgronomistInternship(id)) return "a3";
            if (isThesis(id)) return "a4";
            break;
        default:
            return unreachable(specialty);
    }
}

// B列
function isB1(id: string, specialty: Specialty): boolean {
    // TODO:以下の条件の実装が必要か
    //  基幹科目8から16単位を習得すること
    //  実験・実習・演習科目を3単位以上取得すること
    return id.startsWith("EC2");
}
function isB2(id: string, specialty: Specialty): boolean {
    // TODO:以下の条件の実装が必要か
    // as : 実験・実習・演習科目を4単位以上取得すること
    // les : 実験・実習・演習科目を3単位以上取得すること
    return id.startsWith("EC3");
}
function isB3(id: string, specialty: Specialty): boolean {
    switch (specialty) {
        case "as":
            return (
                /^EC[234]/.test(id) ||
                id.startsWith("BB") ||
                /^E[BEG]/.test(id) ||
                /^F[FH]/.test(id));
        case "les":
            return (/^EC[234]/.test(id) ||
                id.startsWith("BB") ||
                /^E[BE]/.test(id) ||
                /^EG[56]/.test(id) ||
                /^F[FH]/.test(id));
    }
}

// C列
function isBiologicalResourcesPractice(id: string, tableYear: number): boolean {
    switch (tableYear) {
        // 2023,2024では，生物資源科学演習がクラスごとに分かれている
        case 2023:
        case 2024:
            return (
                id === "EC11212" || // 生物資源科学演習（1クラス)
                id === "EC11222" || // 生物資源科学演習（2クラス)
                id === "EC11232" || // 生物資源科学演習（3クラス)
                id === "EC11242" || // 生物資源科学演習（4クラス)
                id === "EC11252" || // 生物資源科学演習（5クラス)
                id === "EC11262"    // 生物資源科学演習（総合学域群→生物資源学類）
            );
            break;
        case 2025:
            // 2025では，生物資源科学演習がクラス分けされない
            return (
                id === "EC11212" ||
                id === "EC11262"    // 生物資源科学演習（総合学域群→生物資源学類）
            );
            break;
        default:
            return false;
    }
}

function isJapanExpertOverview(id: string): boolean {
    return id === "AE51K11"; // Japan-Expert総論
}

function classifyColumnC(
    id: string,
    specialty: Specialty,
    _mode: Mode,
    tableYear: number,
): string | undefined {
    switch (specialty) {
        case "as":
            if (isBiologicalResourcesPractice(id, tableYear)) return "c1";
            break;
        case "les":
            if (isJapanExpertOverview(id)) return "c1";
            if (isBiologicalResourcesPractice(id, tableYear)) return "c2";
            break;
        default:
            return unreachable(specialty);
    }
}

// D列
function isD1(id: string): boolean {
    return (
        id === "EC12301" || // 生物資源の開発・生産と持続利用
        id === "EC12501" || // 生物資源としての遺伝子とゲノム
        id === "EC12401" || // 生物資源と環境
        id === "EC12201"    // 生物資源学にみる食品科学・技術の最前線
    );
}
function isD2(id: string): boolean {
    //TODO: 数学リテラシー1・2・3，微積分，微分積分A，
    // 線形代数1・2・3，線形代数A，力学1・2・3，電磁気学1・2・3，工学システム概論について不明
    return (
        id === "EC12131" || // 化学
        id === "EC12171" || // 物理学
        id === "EC12173" || // 生物学実験
        id === "EC12163" || // 化学実験
        id === "EC12061" || // 資源生物学
        id === "EC12331" || // 基礎数学
        id === "EC12251" || // 経済学Ⅰ(令和７年度以降開講なし)
        id === "EC12261" || // 経済学Ⅱ
        id === "EC12371" || // 統計学入門
        id === "EC12153" || // 生物資源フィールド学実習
        id === "FCB1743" || // 物理学実験
        id === "EE11333" || // 地学実験
        id === "EC12162" || // 数理科学演習
        id === "EB00001" || // 生物学序説（秋AB　月1）
        id === "EB00011" || // 生物学序説(春C 火1,2)
        id === "EB00021" || // 生物学序説(春A　木5,6)
        id === "EB11131" || // 系統分類・進化学概論
        id === "EB11151" || // 系統分類・進化学概論（英語で授業）
        id === "EB11221" || // 分子細胞生物学概論(春B　火5,6)
        id === "EB11251" || // 分子細胞生物学概論(秋AB　火2)
        id === "EB11311" || // 遺伝学概論(春C　火5,6)
        id === "EB11351" || // 遺伝学概論(秋C　月1,2)
        id === "EB11611" || // 生態学概論(秋A　木3,4)
        id === "EB11651" || // 生態学概論(秋AB　水5)
        id === "EB11721" || // 動物生理学概論(秋B　火1,2)
        id === "EB11751" || // 動物生理学概論(春AB　水3)
        id === "EB11811" || // 植物生理学概論(秋B 木3,4)
        id === "EB11851" || // 植物生理学概論(春AB　木4)
        id === "EE11151" || // 地球環境学1
        id === "EE11161" || // 地球環境学2
        id === "EE11251" || // 地球進化学1
        id === "EE11261" || // 地球進化学2
        id === "BB05011" || // 社会学の最前線
        id === "BB05021" || // 法学の最前線
        id === "BB05031" || // 政治学の最前線
        id === "BB05041" || // 経済学の最前線
        id === "FE11161" || // 化学概論
        id === "EC12111" || // 化学I
        id === "EC12121" || // 化学II
        id === "FBA1451" || // 数学概論
        id === "FCB1401" || // 物理学概論
        id === "FF17011" || // 応用理工学概論
        id === "FH61111" || // 経済学の数理
        id === "FH61121" || // 経済学の実証
        id === "FH61131" || // 会計と経営
        id === "FH61141" || // 社会と最適化
        id === "FH61151" || // 都市計画入門
        id === "FH61161" || // 都市数理
        id === "HB21211" || // 医科生化学
        id === "HB21221" || // 医科分子生物学
        id === "AB50B11" || // 史学入門
        id === "AB50C11"    // 考古学・民俗学入門
    );
}

// E列
function isE1As(id: string, mode: "known" | "real"): boolean {
    return (
        id === "1110102" || // ファーストイヤーセミナー 1クラス
        id === "1110202" || // ファーストイヤーセミナー 2クラス
        id === "1110302" || // ファーストイヤーセミナー 3クラス
        id === "1110402" || // ファーストイヤーセミナー 4クラス
        id === "1110502" || // ファーストイヤーセミナー 5クラス
        id === "1227291" || // 学問への誘い 1クラス
        id === "1227301" || // 学問への誘い 2クラス
        id === "1227311" || // 学問への誘い 3クラス
        id === "1227321" || // 学問への誘い 4クラス
        id === "1227331" || // 学問への誘い 5クラス
        (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
    );
}
function isE1Les(id: string, mode: "known" | "real"): boolean {
    // les では// Japan-ExpertファーストイヤーセミナーもE1に含まれる
    return (
        id === "1110102" || // ファーストイヤーセミナー 1クラス
        id === "1110202" || // ファーストイヤーセミナー 2クラス
        id === "1110302" || // ファーストイヤーセミナー 3クラス
        id === "1110402" || // ファーストイヤーセミナー 4クラス
        id === "1110502" || // ファーストイヤーセミナー 5クラス
        id === "1227291" || // 学問への誘い 1クラス
        id === "1227301" || // 学問への誘い 2クラス
        id === "1227311" || // 学問への誘い 3クラス
        id === "1227321" || // 学問への誘い 4クラス
        id === "1227331" || // 学問への誘い 5クラス
        id === "1122502" || // Japan-Expertファーストイヤーセミナー
        (mode === "real" && (isFirstYearSeminar(id) || isIzanai(id)))
    );
}

function isInfo(id: string, mode: Mode): boolean {
    return (
        id === "6110101" || //情報リテラシー(講義)
        id === "6410102" || //情報リテラシー(演習) 1班
        id === "6410202" || //情報リテラシー(演習) 2班
        id === "6510102" || //データサイエンス 1班
        id === "6510202" || //データサイエンス 2班
        (mode === "real" &&
            (isInfoLiteracyLecture(id) ||
                isInfoLiteracyExercise(id) ||
                isDataScience(id)))
    );
}
function classifyColumnE(
    id: string,
    specialty: Specialty,
    mode: Mode,
    _tableYear: number,
): string | undefined {
    switch (specialty) {
        case "as":
            if (isE1As(id, mode)) return "e1";
            if (isCompulsoryPe1(id) || isCompulsoryPe2(id) || isCompulsoryPe3(id)) return "e2";
            if (isCompulsoryEnglishById(id)) return "e3";
            if (isInfo(id, mode)) return "e4";
            if (isJapanese(id)) return "e5";
            break;
        case "les":
            if (isE1Les(id, mode)) return "e1";
            if (isCompulsoryPe1(id) || isCompulsoryPe2(id) || isCompulsoryPe3(id)) return "e2";
            // TODO: 外国人向けの履修要件?となっており、第一外国語と第二外国語の扱いをどうするか要確認
            if (isCompulsoryEnglishById(id)) return "e3";
            if (isSecondForeignLanguage(id)) return "e4";
            if (isInfo(id, mode)) return "e5";
            break;
        default:
            return unreachable(specialty);
    }
}

function classifyColumnF(
    id: string,
    specialty: Specialty,
    _mode: Mode,
    tableYear: number,
): string | undefined {
    switch (specialty) {
        case "as":
            if (tableYear <= 2024) {
                if (isGakushikiban(id)) return "f1";
                if (isElectivePe(id)) return "f2";
                if (isArt(id)) return "f3";
                if (isNonCompulsoryEnglish(id)) return "f4";
            }
            else {
                if (isGakushikiban(id)) return "f1";
                if (isElectivePe(id) || isArt(id) || isCompulsoryEnglishById(id)) return "f2";
            }
            return;
        case "les":
            //lesでは第一外国語（日本語）が追加される．
            if (tableYear <= 2024) {
                if (isGakushikiban(id)) return "f1";
                if (isElectivePe(id)) return "f2";
                if ((!(id === "4004013" || // 芸術(日本画実習)
                    id === "4006012" || // 芸術(書A)
                    id === "4006022" || // 芸術(書B)
                    id === "4006032"))  // 芸術(書C)
                    && isArt(id)) return "f3";
                if (isNonCompulsoryEnglish(id)) return "f4";
                if (isJapanese(id)) return "f5";
            }
            else {
                if (isGakushikiban(id)) return "f1";
                if (isElectivePe(id) || ((!(id === "4004013" || // 芸術(日本画実習)
                    id === "4006012" || // 芸術(書A)
                    id === "4006022" || // 芸術(書B)
                    id === "4006032"))  // 芸術(書C)
                    && isArt(id)) || isJapanese(id)) return "f2";
            }
            return;
        default:
            return unreachable(specialty);
    }
}

// H列
function isH1As(id: string): boolean {
    return !/^(EC|EB|EE|EG|EZA|BB|FF|FH|[12346])/.test(id);
}

function isH1Les(id: string): boolean {
    //TODO: 言語の科学　科目番号不明
    return (
        id === "HC30071" || // 看護生命倫理
        id === "AE56A21" || // 共生のための日本語教育
        id === "AE56A11" || // 共生のための社会言語学
        id === "AE56A31" || // 共生のための人類学
        id === "AE56A41" || // 共生のための歴史学
        id === "4004013" || // 芸術(日本画実習)
        id === "4006012" || // 芸術(書A)
        id === "4006022" || // 芸術(書B)
        id === "4006032"    // 芸術(書C)
    );
}

function isH2Les(id: string): boolean {
    return !/^(EC|EB|EE|EG[56]|EZA|BB|FF|FH|[12346])/.test(id);
}

function classifyColumnH(
    id: string,
    specialty: Specialty,
    _mode: Mode,
    _tableYear: number,
): string | undefined {
    switch (specialty) {
        case "as":
            if (isH1As(id)) return "h1";
            break;
        case "les":
            if (isH1Les(id)) return "h1";
            if (isH2Les(id)) return "h2";
            break;
        default:
            return unreachable(specialty);
    }
}

function classifyColumns(
    id: string,
    specialty: Specialty,
    mode: Mode,
    tableYear: number,
): string | undefined {
    // 必修
    const a = classifyColumnA(id, specialty, mode, tableYear);
    if (a !== undefined) return a;
    const c = classifyColumnC(id, specialty, mode, tableYear);
    if (c !== undefined) return c;
    const e = classifyColumnE(id, specialty, mode, tableYear);
    if (e !== undefined) return e;
    // 選択
    if (isB1(id, specialty)) return "b1";
    if (isB2(id, specialty)) return "b2";
    if (isB3(id, specialty)) return "b3";
    if (isD1(id)) return "d1";
    if (isD2(id)) return "d2";
    const f = classifyColumnF(id, specialty, mode, tableYear);
    if (f !== undefined) return f;
    const h = classifyColumnH(id, specialty, mode, tableYear);
    if (h !== undefined) return h;
}


export function classifyKnownCourses(
    cs: KnownCourse[],
    _opts: ClassifyOptions,
    _tableYear: number,
    specialty: Specialty,
): Map<CourseId, string> {
    const courseIdToCellId = new Map<CourseId, string>();
    for (const c of cs) {
        const cellId = classifyColumns(c.id, specialty, "known", _tableYear);
        if (cellId !== undefined) {
            courseIdToCellId.set(c.id, cellId);
        }
    }
    return courseIdToCellId;
}

export function classifyRealCourses(
    cs: RealCourse[],
    _opts: ClassifyOptions,
    _tableYear: number,
    specialty: Specialty,
): Map<CourseId, string> {
    const courseIdToCellId = new Map<CourseId, string>();
    for (const c of cs) {
        const cellId = classifyColumns(c.id, specialty, "real", _tableYear);
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
    _specialty: Specialty,
): Map<FakeCourseId, string> {
    const fakeCourseIdToCellId = new Map<FakeCourseId, string>();
    for (const _c of cs) {
    }
    return fakeCourseIdToCellId;
}

export const creditRequirementsAsSince2023: SetupCreditRequirements = {
    cells: {
        a1: { min: 2, max: 2 },
        a2: { min: 2, max: 2 },
        a3: { min: 10, max: 10 },
        b1: { min: 19, max: 19 },
        b2: { min: 12, max: 12 },
        b3: { min: 22, max: 31 },
        c1: { min: 1, max: 1 },
        d1: { min: 3, max: 4 },
        d2: { min: 15, max: 21 },
        e1: { min: 2, max: 2 },
        e2: { min: 3, max: 3 },
        e3: { min: 4, max: 4 },
        e4: { min: 4, max: 4 },
        e5: { min: 1, max: 1 },
        f1: { min: 1, max: 3 },
        f2: { min: 0, max: 1 },
        f3: { min: 0, max: 1 },
        f4: { min: 0, max: 4 },
        h1: { min: 10, max: 26 },
    },
    columns: {
        a: { min: 14, max: 14 },
        b: { min: 53, max: 62 },
        c: { min: 1, max: 1 },
        d: { min: 18, max: 25 },
        e: { min: 14, max: 14 },
        f: { min: 1, max: 9 },
        h: { min: 10, max: 26 },
    },
    compulsory: 29,
    elective: 95,
};

export const creditRequirementsLesSince2023: SetupCreditRequirements = {
    cells: {
        a1: { min: 2, max: 2 },
        a2: { min: 2, max: 2 },
        a3: { min: 2, max: 2 },
        a4: { min: 10, max: 10 },
        b1: { min: 19, max: 19 },
        b2: { min: 12, max: 12 },
        b3: { min: 17, max: 28 },
        c1: { min: 1, max: 1 },
        c2: { min: 1, max: 1 },
        d1: { min: 3, max: 4 },
        d2: { min: 15, max: 21 },
        e1: { min: 3, max: 3 },
        e2: { min: 3, max: 3 },
        e3: { min: 15, max: 15 },
        e4: { min: 4, max: 4 },
        e5: { min: 4, max: 4 },
        f1: { min: 1, max: 3 },
        f2: { min: 0, max: 1 },
        f3: { min: 0, max: 1 },
        f4: { min: 0, max: 4 },
        f5: { min: 0, max: 4 },
        h1: { min: 1, max: 1 },
        h2: { min: 7, max: 21 },
    },
    columns: {
        a: { min: 16, max: 16 },
        b: { min: 48, max: 59 },
        c: { min: 2, max: 2 },
        d: { min: 18, max: 25 },
        e: { min: 29, max: 29 },
        f: { min: 1, max: 13 },
        h: { min: 8, max: 22 },
    },
    compulsory: 47,
    elective: 89,
};

export const creditRequirementsAsSince2025: SetupCreditRequirements = {
    cells: {
        a1: { min: 2, max: 2 },
        a2: { min: 2, max: 2 },
        a3: { min: 10, max: 10 },
        b1: { min: 19, max: 19 },
        b2: { min: 12, max: 12 },
        b3: { min: 22, max: 31 },
        c1: { min: 1, max: 1 },
        d1: { min: 3, max: 4 },
        d2: { min: 15, max: 21 },
        e1: { min: 2, max: 2 },
        e2: { min: 3, max: 3 },
        e3: { min: 4, max: 4 },
        e4: { min: 4, max: 4 },
        e5: { min: 1, max: 1 },
        f1: { min: 1, max: 3 },
        f2: { min: 0, max: 6 },
        h1: { min: 10, max: 26 },
    },
    columns: {
        a: { min: 14, max: 14 },
        b: { min: 53, max: 62 },
        c: { min: 1, max: 1 },
        d: { min: 18, max: 25 },
        e: { min: 14, max: 14 },
        f: { min: 1, max: 9 },
        h: { min: 10, max: 26 },
    },
    compulsory: 29,
    elective: 95,
};

export const creditRequirementsLesSince2025: SetupCreditRequirements = {
    cells: {
        a1: { min: 2, max: 2 },
        a2: { min: 2, max: 2 },
        a3: { min: 2, max: 2 },
        a4: { min: 10, max: 10 },
        b1: { min: 19, max: 19 },
        b2: { min: 12, max: 12 },
        b3: { min: 17, max: 28 },
        c1: { min: 1, max: 1 },
        c2: { min: 1, max: 1 },
        d1: { min: 3, max: 4 },
        d2: { min: 15, max: 21 },
        e1: { min: 3, max: 3 },
        e2: { min: 3, max: 3 },
        e3: { min: 15, max: 15 },
        e4: { min: 4, max: 4 },
        e5: { min: 4, max: 4 },
        f1: { min: 1, max: 3 },
        f2: { min: 0, max: 10 },
        h1: { min: 1, max: 1 },
        h2: { min: 7, max: 21 },
    },
    columns: {
        a: { min: 16, max: 16 },
        b: { min: 48, max: 59 },
        c: { min: 2, max: 2 },
        d: { min: 18, max: 25 },
        e: { min: 29, max: 29 },
        f: { min: 1, max: 13 },
        h: { min: 8, max: 22 },
    },
    compulsory: 47,
    elective: 89,
};
