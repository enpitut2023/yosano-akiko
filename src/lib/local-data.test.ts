import { expect, test } from "vitest";
import { localDataFromJson } from "$lib/local-data";

const WIP = "GB10000";
const PLANNED = "GB40000";

// v2 saved 履修中 courses in mightTakeCourseIds too. Kept as overrides, they
// would stay in 取る授業 as if moved by hand once newer grades no longer have
// them.
test("v2 migrates, without the 履修中 courses as overrides", () => {
  const migrated = localDataFromJson(
    JSON.stringify({
      version: 2,
      mightTakeCourseIds: [WIP, PLANNED],
      native: true,
      realCourses: [
        { id: WIP, name: WIP, credit: 1, takenYear: 2024, grade: "wip" },
      ],
      fakeCourses: [],
    }),
  );
  expect(migrated).toMatchObject({
    version: 3,
    listKindOverrides: new Map([[PLANNED, "might-take"]]),
    native: true,
  });
  expect(migrated?.realCourses).toHaveLength(1);
});

test("v3 loads as is", () => {
  const parsed = localDataFromJson(
    JSON.stringify({
      version: 3,
      listKindOverrides: { [PLANNED]: "might-take", [WIP]: "wont-take" },
      native: false,
      realCourses: [],
      fakeCourses: [],
    }),
  );
  expect(parsed).toEqual({
    version: 3,
    listKindOverrides: new Map([
      [PLANNED, "might-take"],
      [WIP, "wont-take"],
    ]),
    native: false,
    realCourses: [],
    fakeCourses: [],
  });
});
