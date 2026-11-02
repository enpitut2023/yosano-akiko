import { knownCourses } from "./courses";

/** One row of a TWINS grades file. */
export type GradeRow = {
  /** Absent on credit-transfer (認) rows, which have no course ID. */
  id?: string;
  name: string;
  credit: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "P" | "F" | "履修中" | "認";
  year: number;
};

/** A grades row for a course in the fixture catalog. */
export function gradeRow(
  id: string,
  grade: GradeRow["grade"],
  year: number,
): GradeRow & { id: string } {
  const course = knownCourses.find((c) => c.id === id);
  if (course?.credit === undefined) {
    throw new Error(`Not in the fixture catalog with a credit: ${id}`);
  }
  return { id, name: course.name, credit: course.credit, grade, year };
}

const HEADER =
  "学籍番号,学生氏名,科目番号,科目名,単位数,春学期,秋学期,総合評価,科目区分,開講年度,開講区分";

/** A grades file laid out as TWINS exports it, for `setInputFiles`. */
export function gradesFile(rows: GradeRow[]): {
  name: string;
  mimeType: string;
  buffer: Buffer;
} {
  const lines = rows.map(
    (r) =>
      `,,${r.id ?? ""},${r.name}," ${r.credit.toFixed(1)}",-,-,${r.grade},A,${r.year},通常`,
  );
  return {
    name: "grades.csv",
    mimeType: "text/csv",
    buffer: Buffer.from([HEADER, ...lines, ""].join("\n")),
  };
}
