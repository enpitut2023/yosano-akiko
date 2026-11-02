import { describe, expect, test } from "vitest";
import { isCourseId, type RealCourse } from "$lib/akiko";
import { assert } from "$lib/util";
import { findExactCombination } from "./common";

function course(id: string, credit: number): RealCourse {
  assert(isCourseId(id), `Bad course id: "${id}"`);
  return { id, name: id, credit, takenYear: 2025, grade: "a" };
}

function ids(cs: RealCourse[] | undefined): string[] | undefined {
  return cs?.map((c) => c.id).sort();
}

describe("findExactCombination", () => {
  test("finds an exact sum of fractional credits", () => {
    const cs = [
      course("COURSEX", 1),
      course("COURSEY", 1.5),
      course("COURSEZ", 0.5),
    ];
    expect(ids(findExactCombination(cs, 2))).toEqual(["COURSEY", "COURSEZ"]);
  });

  test("takes the smallest sum over the target when none is exact", () => {
    const cs = [
      course("COURSEX", 3),
      course("COURSEY", 2),
      course("COURSEZ", 1.5),
    ];
    expect(ids(findExactCombination(cs, 4))).toEqual(["COURSEX", "COURSEZ"]);
  });

  test("returns undefined when everything together is short", () => {
    expect(findExactCombination([course("COURSEX", 1.5)], 2)).toBeUndefined();
  });
});
