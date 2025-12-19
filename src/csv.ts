import {
  RealCourse,
  FakeCourse,
  Grade,
  ImportedCourse,
  isCourseId,
  fakeCourseIdNewUnique,
} from "./akiko";
import { tryParseFloat, tryParseInt } from "./util";
import { parse as parseCsv, ParseResult } from "papaparse";

function parseImportedCourseGrade(s: string): Grade | "free" | undefined {
  switch (s) {
    case "履修中":
      return "wip";
    case "A+":
      return "a+";
    case "A":
      return "a";
    case "B":
      return "b";
    case "C":
      return "c";
    case "D":
      return "d";
    case "P":
      return "pass";
    case "F":
      return "fail";
    case "認":
      return "free";
  }
}

function parseImportedCourse(row: unknown): ImportedCourse | undefined {
  // 学籍番号, 学生氏名, 科目番号, 科目名, 単位数, 春学期, 秋学期, 総合評価, 科目区分, 開講年度, 開講区分
  if (typeof row !== "object" || row === null) {
    return undefined;
  }

  const trimmed = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k.trim(), v]),
  );
  if (
    !(
      "科目番号" in trimmed &&
      typeof trimmed["科目番号"] === "string" &&
      "科目名" in trimmed &&
      typeof trimmed["科目名"] === "string" &&
      "単位数" in trimmed &&
      typeof trimmed["単位数"] === "string" &&
      "総合評価" in trimmed &&
      typeof trimmed["総合評価"] === "string" &&
      "開講年度" in trimmed &&
      typeof trimmed["開講年度"] === "string"
    )
  ) {
    return undefined;
  }

  const id = trimmed["科目番号"].trim();
  const name = trimmed["科目名"].trim();
  const rawCredit = trimmed["単位数"].trim();
  const rawGrade = trimmed["総合評価"].trim();
  const rawYearTaken = trimmed["開講年度"].trim();

  const grade = parseImportedCourseGrade(rawGrade);
  const credit = tryParseFloat(rawCredit);
  const takenYear = tryParseInt(rawYearTaken);
  if (!(grade !== undefined && takenYear !== undefined)) {
    return undefined;
  }
  if (isCourseId(id) && grade !== "free") {
    return { id, name, credit, takenYear, grade };
  } else if (id === "" && grade === "free") {
    return { id: fakeCourseIdNewUnique(), name, credit, takenYear, grade };
  }
}

type ParseImportedCsvResult =
  | { kind: "ok"; realCourses: RealCourse[]; fakeCourses: FakeCourse[] }
  | { kind: "failed-to-parse-as-csv" }
  | { kind: "unexpected-csv-content" };

export function parseImportedCsv(csv: string): ParseImportedCsvResult {
  csv = csv.replaceAll("\r\n", "\n");
  csv = csv.trim();

  let parseResult: ParseResult<unknown>;
  try {
    parseResult = parseCsv(csv, { header: true });
  } catch {
    return { kind: "failed-to-parse-as-csv" };
  }
  if (parseResult.errors.length > 0) {
    // TODO: more detailed errors
    return { kind: "failed-to-parse-as-csv" };
  }

  const realCourses: RealCourse[] = [];
  const fakeCourses: FakeCourse[] = [];

  for (const row of parseResult.data) {
    const ic = parseImportedCourse(row);
    if (ic === undefined) {
      return { kind: "unexpected-csv-content" };
    } else if (ic.grade === "free") {
      fakeCourses.push(ic);
    } else {
      realCourses.push(ic);
    }
  }

  return { kind: "ok", realCourses, fakeCourses };
}
