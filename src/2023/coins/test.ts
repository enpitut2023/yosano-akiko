import { assertCreditStatsEqual, getCreditStats } from "../../test-util";
import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirements,
} from "./conditions";
import { readFileSync } from "node:fs";

function main(): void {
  const csv = readFileSync("grade-csvs/2023/coins-1.csv", { encoding: "utf8" });
  const isNative = true;
  const got = getCreditStats({
    csv,
    isNative,
    creditRequirements,
    classifyRealCourses,
    classifyFakeCourses,
  });
  assertCreditStatsEqual(got, {
    cells: {
      a1: { taken: 3, mightTake: 3 },
      b1: { taken: 11, mightTake: 6 },
      b2: { taken: 8, mightTake: 8 },
      c1: { taken: 2 },
      c3: { taken: 2 },
      c4: { taken: 2 },
      c5: { taken: 2 },
      c6: { taken: 1 },
      c7: { taken: 2 },
      c8: { taken: 1 },
      c9: { taken: 3 },
      c10: { taken: 3 },
      c11: { taken: 2 },
      c12: { taken: 2 },
      c13: { taken: 2 },
      d1: { taken: 8 },
      d2: { mightTake: 2 },
      d3: { taken: 2, mightTake: 2 },
      d4: { taken: 8, mightTake: 2 },
      e1: { taken: 2 },
      e2: { taken: 2 },
      e3: { taken: 4 },
      e4: { taken: 4 },
      f1: { taken: 3 },
      h1: { taken: 3, mightTake: 3 },
      h2: { taken: 2 },
    },
    columns: {
      a: { taken: 3, mightTake: 3 },
      b: { taken: 19, mightTake: 14 },
      c: { taken: 24 },
      d: { taken: 18, mightTake: 6 },
      e: { taken: 12 },
      f: { taken: 3 },
      h: { taken: 5, mightTake: 3 },
    },
    compulsory: { taken: 39, mightTake: 3 },
    elective: { taken: 45, mightTake: 23 },
  });
}

main();
