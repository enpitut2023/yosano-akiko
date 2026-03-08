import z from "zod";
import {
  type CourseId,
  type RealCourse,
  type FakeCourse,
  isCourseId,
  isFakeCourseId,
  isGrade,
} from "./akiko";

export type LocalDataV1ImportedCourse = {
  id: string;
  name: string;
  grade: "wip" | "a+" | "a" | "b" | "c" | "d" | "pass" | "fail" | "free";
  credit: number;
  takenYear: number;
};

export type LocalDataV1 = {
  version: 1;
  courseYearToMightTakeCourseIds: Record<string, string[]>;
  importedCourses: LocalDataV1ImportedCourse[];
  native: boolean;
};

export type LocalDataV2 = {
  version: 2;
  mightTakeCourseIds: CourseId[];
  realCourses: RealCourse[];
  fakeCourses: FakeCourse[];
  native: boolean;
};

function localDataV1ToV2(v1: LocalDataV1): LocalDataV2 {
  function tryAsFake(ic: LocalDataV1ImportedCourse): FakeCourse | undefined {
    const match = /^__free(\d+)$/.exec(ic.id);
    if (match === null) {
      return undefined;
    }
    const id = parseInt(match[1]);
    if (!isFakeCourseId(id)) {
      return undefined;
    }
    return {
      id,
      name: ic.name,
      credit: ic.credit,
      takenYear: ic.takenYear,
      grade: "free",
    };
  }

  function tryAsReal(ic: LocalDataV1ImportedCourse): RealCourse | undefined {
    if (!isCourseId(ic.id) || ic.grade === "free") {
      return undefined;
    }
    return {
      id: ic.id,
      name: ic.name,
      credit: ic.credit,
      takenYear: ic.takenYear,
      grade: ic.grade,
    };
  }

  const mightTakeCourseIds: CourseId[] = [];
  for (const ids of Object.values(v1.courseYearToMightTakeCourseIds)) {
    for (const id of ids) {
      if (isCourseId(id)) {
        mightTakeCourseIds.push(id);
      }
    }
  }

  const realCourses: RealCourse[] = [];
  const fakeCourses: FakeCourse[] = [];
  for (const ic of v1.importedCourses) {
    const fake = tryAsFake(ic);
    if (fake !== undefined) {
      fakeCourses.push(fake);
      continue;
    }
    const real = tryAsReal(ic);
    if (real !== undefined) {
      realCourses.push(real);
      continue;
    }
    console.warn("Bad v1 imported course:", ic);
  }

  return {
    version: 2,
    mightTakeCourseIds,
    realCourses,
    fakeCourses,
    native: v1.native,
  };
}

const localDataV1Parser = z.object({
  version: z.literal(1),
  courseYearToMightTakeCourseIds: z.record(z.string(), z.array(z.string())),
  importedCourses: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      grade: z.union([
        z.literal("wip"),
        z.literal("a+"),
        z.literal("a"),
        z.literal("b"),
        z.literal("c"),
        z.literal("d"),
        z.literal("pass"),
        z.literal("fail"),
        z.literal("free"),
      ]),
      credit: z.number(),
      takenYear: z.number(),
    }),
  ),
  native: z.boolean(),
});

const localDataV2Parser = z.object({
  version: z.literal(2),
  mightTakeCourseIds: z.array(z.string()),
  native: z.boolean(),
  realCourses: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      credit: z.number().optional(),
      takenYear: z.number(),
      grade: z.string(),
    }),
  ),
  fakeCourses: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      credit: z.number().optional(),
      takenYear: z.number(),
      grade: z.literal("free"),
    }),
  ),
});

function localDataV2Parse(x: unknown): LocalDataV2 | undefined {
  const result = localDataV2Parser.safeParse(x);
  if (!result.success) {
    return undefined;
  }

  const mightTakeCourseIds: CourseId[] = [];
  for (const id of result.data.mightTakeCourseIds) {
    if (!isCourseId(id)) {
      return undefined;
    }
    mightTakeCourseIds.push(id);
  }

  const realCourses: RealCourse[] = [];
  for (const c of result.data.realCourses) {
    if (!isCourseId(c.id) || !isGrade(c.grade)) {
      return undefined;
    }
    realCourses.push({
      id: c.id,
      name: c.name,
      credit: c.credit,
      takenYear: c.takenYear,
      grade: c.grade,
    });
  }

  const fakeCourses: FakeCourse[] = [];
  for (const c of result.data.fakeCourses) {
    if (!isFakeCourseId(c.id)) {
      return undefined;
    }
    fakeCourses.push({
      id: c.id,
      name: c.name,
      credit: c.credit,
      takenYear: c.takenYear,
      grade: c.grade,
    });
  }

  return {
    version: result.data.version,
    mightTakeCourseIds,
    native: result.data.native,
    realCourses,
    fakeCourses,
  };
}

export function localDataFromJson(json: string): LocalDataV2 | undefined {
  const x: unknown = JSON.parse(json);
  const v1 = localDataV1Parser.safeParse(x);
  if (v1.success) {
    return localDataV1ToV2(v1.data as LocalDataV1);
  }
  return localDataV2Parse(x);
}
