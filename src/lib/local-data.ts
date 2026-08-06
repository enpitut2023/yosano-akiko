import z from "zod";
import {
  type CourseId,
  type ListKindOverride,
  type ListKindOverrides,
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

export type LocalDataV3 = {
  version: 3;
  listKindOverrides: ListKindOverrides;
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

function localDataV2ToV3(v2: LocalDataV2): LocalDataV3 {
  // v2 の mightTakeCourseIds には、ユーザーが「取る授業」に入れた授業だけでなく、
  // 履修中の成績から自動的に「取る授業」になった授業も混ざって保存されていた。
  // 後者はユーザーの意図ではなく成績から復元できるので、上書きの記録には含めない。
  const wipCourseIds = new Set<CourseId>();
  for (const rc of v2.realCourses) {
    if (rc.grade === "wip") wipCourseIds.add(rc.id);
  }

  const listKindOverrides: ListKindOverrides = new Map();
  for (const id of v2.mightTakeCourseIds) {
    if (!wipCourseIds.has(id)) listKindOverrides.set(id, "might-take");
  }

  return {
    version: 3,
    listKindOverrides,
    realCourses: v2.realCourses,
    fakeCourses: v2.fakeCourses,
    native: v2.native,
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

const realCoursesParser = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    credit: z.number().optional(),
    takenYear: z.number(),
    grade: z.string(),
  }),
);

const fakeCoursesParser = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    credit: z.number().optional(),
    takenYear: z.number(),
    grade: z.literal("free"),
  }),
);

const localDataV2Parser = z.object({
  version: z.literal(2),
  mightTakeCourseIds: z.array(z.string()),
  native: z.boolean(),
  realCourses: realCoursesParser,
  fakeCourses: fakeCoursesParser,
});

const localDataV3Parser = z.object({
  version: z.literal(3),
  listKindOverrides: z.record(
    z.string(),
    z.union([z.literal("might-take"), z.literal("wont-take")]),
  ),
  native: z.boolean(),
  realCourses: realCoursesParser,
  fakeCourses: fakeCoursesParser,
});

function parseRealCourses(
  raw: z.infer<typeof realCoursesParser>,
): RealCourse[] | undefined {
  const realCourses: RealCourse[] = [];
  for (const c of raw) {
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
  return realCourses;
}

function parseFakeCourses(
  raw: z.infer<typeof fakeCoursesParser>,
): FakeCourse[] | undefined {
  const fakeCourses: FakeCourse[] = [];
  for (const c of raw) {
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
  return fakeCourses;
}

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

  const realCourses = parseRealCourses(result.data.realCourses);
  const fakeCourses = parseFakeCourses(result.data.fakeCourses);
  if (realCourses === undefined || fakeCourses === undefined) {
    return undefined;
  }

  return {
    version: result.data.version,
    mightTakeCourseIds,
    native: result.data.native,
    realCourses,
    fakeCourses,
  };
}

function localDataV3Parse(x: unknown): LocalDataV3 | undefined {
  const result = localDataV3Parser.safeParse(x);
  if (!result.success) {
    return undefined;
  }

  const listKindOverrides: ListKindOverrides = new Map();
  for (const [id, override] of Object.entries(result.data.listKindOverrides)) {
    if (!isCourseId(id)) {
      return undefined;
    }
    listKindOverrides.set(id, override);
  }

  const realCourses = parseRealCourses(result.data.realCourses);
  const fakeCourses = parseFakeCourses(result.data.fakeCourses);
  if (realCourses === undefined || fakeCourses === undefined) {
    return undefined;
  }

  return {
    version: result.data.version,
    listKindOverrides,
    native: result.data.native,
    realCourses,
    fakeCourses,
  };
}

export function localDataFromJson(json: string): LocalDataV3 | undefined {
  let x: unknown;
  try {
    x = JSON.parse(json);
  } catch {
    return undefined;
  }
  const v1 = localDataV1Parser.safeParse(x);
  if (v1.success) {
    return localDataV2ToV3(localDataV1ToV2(v1.data));
  }
  const v2 = localDataV2Parse(x);
  if (v2 !== undefined) {
    return localDataV2ToV3(v2);
  }
  return localDataV3Parse(x);
}

/** `Map` は `JSON.stringify` でそのまま扱えないので、この関数を通して保存する。 */
export function localDataToJson(d: LocalDataV3): string {
  const listKindOverrides: Record<string, ListKindOverride> =
    Object.fromEntries(d.listKindOverrides);
  return JSON.stringify({ ...d, listKindOverrides });
}

export function localDataDefault(): LocalDataV3 {
  return {
    version: 3,
    listKindOverrides: new Map(),
    realCourses: [],
    fakeCourses: [],
    native: true,
  };
}
