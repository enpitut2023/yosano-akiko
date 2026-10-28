export const SUPPORT_URL = "https://buymeacoffee.com/akiko.tsukuba";

/** The KdB syllabus page of a course in the given year. */
export function syllabusUrl(courseId: string, year: number): string {
  return `https://kdb.tsukuba.ac.jp/syllabi/${year}/${courseId}/jpn`;
}
