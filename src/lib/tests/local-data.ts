import {
  type CourseId,
  type ListKindOverrides,
  type RealCourse,
  akikoGetListKind,
  akikoGetListKindOverrides,
  akikoMoveCourse,
  akikoNew,
  isCourseId,
} from "$lib/akiko";
import { createCreditRequirementsOrFail } from "$lib/app-setup";
import { localDataFromJson } from "$lib/local-data";
import { assert } from "$lib/util";

function courseId(s: string): CourseId {
  assert(isCourseId(s), `Bad course id: "${s}"`);
  return s;
}

const WIP = courseId("GB10000");
const FAILED = courseId("GB20000");
const PASSED = courseId("GB30000");
const PLANNED = courseId("GB40000");

function realCourse(id: CourseId, grade: RealCourse["grade"]): RealCourse {
  return { id, name: id, credit: 1, takenYear: 2024, grade };
}

const realCourses: RealCourse[] = [
  realCourse(WIP, "wip"),
  realCourse(FAILED, "d"),
  realCourse(PASSED, "a"),
];

function akikoForTest(listKindOverrides: ListKindOverrides) {
  const akiko = akikoNew(
    [],
    realCourses,
    [],
    listKindOverrides,
    new Map(),
    new Map(),
    new Map(),
    createCreditRequirementsOrFail({
      cells: {},
      columns: {},
      compulsory: 0,
      elective: 0,
    }),
  );
  assert(akiko !== undefined);
  return akiko;
}

/** 上書きがなければ、配置は成績だけで決まる。 */
function testListKindFromGrades(): void {
  const akiko = akikoForTest(new Map());
  assert(akikoGetListKind(akiko, WIP) === "might-take");
  assert(akikoGetListKind(akiko, FAILED) === "wont-take");
  assert(akikoGetListKind(akiko, PASSED) === "taken");
  assert(akikoGetListKind(akiko, PLANNED) === "wont-take");
}

/** ユーザーの意図は成績より優先される。ただし単位取得済みの授業は動かせない。 */
function testOverridesBeatGrades(): void {
  const akiko = akikoForTest(
    new Map([
      [PLANNED, "might-take"],
      // 再履修の予定
      [FAILED, "might-take"],
      // 履修中だが「取る授業」から出した
      [WIP, "wont-take"],
      [PASSED, "might-take"],
    ] as const),
  );
  assert(akikoGetListKind(akiko, PLANNED) === "might-take");
  assert(akikoGetListKind(akiko, FAILED) === "might-take");
  assert(akikoGetListKind(akiko, WIP) === "wont-take");
  assert(akikoGetListKind(akiko, PASSED) === "taken");

  // 成績が勝った上書きは記録から消える
  assert(!akikoGetListKindOverrides(akiko).has(PASSED));
}

/** 成績どおりの配置を指す上書きは、意味がないので捨てられる。 */
function testRedundantOverridesDropped(): void {
  const akiko = akikoForTest(
    new Map([
      [WIP, "might-take"],
      [FAILED, "wont-take"],
    ] as const),
  );
  assert(akikoGetListKindOverrides(akiko).size === 0);
}

/** 授業を動かすと上書きが記録され、成績どおりの配置に戻すと消える。 */
function testMoveRecordsOverride(): void {
  const akiko = akikoForTest(new Map());

  assert(akikoMoveCourse(akiko, WIP, "wont-take") === undefined);
  assert(akikoGetListKindOverrides(akiko).get(WIP) === "wont-take");

  assert(akikoMoveCourse(akiko, WIP, "might-take") === undefined);
  assert(!akikoGetListKindOverrides(akiko).has(WIP));

  assert(akikoMoveCourse(akiko, PASSED, "might-take") === "course-taken");
  assert(!akikoGetListKindOverrides(akiko).has(PASSED));
}

/**
 * v2 の mightTakeCourseIds には履修中の授業が紛れ込んでいたので、移行時に落とす。
 * 落とさないと、次に読み込む成績データにその授業が含まれていなかったときに、
 * ユーザーが自分で「取る授業」に入れたかのように残ってしまう。
 */
function testV2Migration(): void {
  const v2 = JSON.stringify({
    version: 2,
    mightTakeCourseIds: [WIP, PLANNED],
    native: true,
    realCourses: [
      { id: WIP, name: WIP, credit: 1, takenYear: 2024, grade: "wip" },
    ],
    fakeCourses: [],
  });

  const migrated = localDataFromJson(v2);
  assert(migrated !== undefined);
  assert(migrated.version === 3);
  assert(migrated.listKindOverrides.get(PLANNED) === "might-take");
  assert(!migrated.listKindOverrides.has(WIP));
  assert(migrated.realCourses.length === 1);
  assert(migrated.native);
}

/** v3 はそのまま読める。保存した形に戻せる。 */
function testV3RoundTrip(): void {
  const v3 = JSON.stringify({
    version: 3,
    listKindOverrides: { [PLANNED]: "might-take", [WIP]: "wont-take" },
    native: false,
    realCourses: [],
    fakeCourses: [],
  });

  const parsed = localDataFromJson(v3);
  assert(parsed !== undefined);
  assert(parsed.listKindOverrides.get(PLANNED) === "might-take");
  assert(parsed.listKindOverrides.get(WIP) === "wont-take");
  assert(!parsed.native);
}

testListKindFromGrades();
testOverridesBeatGrades();
testRedundantOverridesDropped();
testMoveRecordsOverride();
testV2Migration();
testV3RoundTrip();
console.log(import.meta.filename, "ok");
