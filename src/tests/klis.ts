import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirements,
} from "@/requirements/klis-since-2023";
import { assertCreditStatsEqual, getCreditStats } from "@/test-util";
import { readFileSync } from "node:fs";

function test1(): void {
  const csv = readFileSync("grade-csvs/2023/klis-rm-1.csv", {
    encoding: "utf8",
  });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements,
    classifyRealCourses: (cs, opts) =>
      classifyRealCourses(cs, opts, 2023, "rm"),
    classifyFakeCourses: (cs, opts) =>
      classifyFakeCourses(cs, opts, 2023, "rm"),
  });
  assertCreditStatsEqual(got, {
    cells: {
      a3: { taken: 1 },
      a4: { mightTake: 1 },
      a5: { taken: 1 },
      a6: { mightTake: 1 },
      b1: { taken: 6, mightTake: 10 },
      b2: { taken: 10, mightTake: 6 },
      c1: { taken: 1 },
      c2: { taken: 1 },
      c3: { taken: 2 },
      c4: { taken: 1 },
      c5: { taken: 2 },
      c6: { taken: 2 },
      c7: { taken: 2 },
      c8: { taken: 1 },
      c9: { taken: 1 },
      c10: { taken: 2 },
      c11: { taken: 2 },
      c12: { taken: 2 },
      d1: { taken: 38 },
      e1: { taken: 2 },
      e2: { taken: 4 },
      e3: { taken: 2 },
      e4: { taken: 4 },
      f1: { taken: 2 },
      f2: { taken: 1 },
      h1: { taken: 14 },
    },
    columns: {
      a: { taken: 2, mightTake: 2 },
      b: { taken: 16, mightTake: 16 },
      c: { taken: 19 },
      d: { taken: 38 },
      e: { taken: 12 },
      f: { taken: 3 },
      h: { taken: 14 },
    },
    compulsory: { taken: 33, mightTake: 2 },
    elective: { taken: 71, rawMightTake: 16, effectiveMightTake: 12 },
  });
}

test1();
console.log(__filename, "ok");
