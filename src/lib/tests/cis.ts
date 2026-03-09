import {
  classifyFakeCourses,
  classifyRealCourses,
  getCreditRequirements,
} from "@/requirements/cis-since-2023";
import { runTest } from "./util";

function test1(): void {
  runTest({
    csvPath: "grade-csvs/2024/cis-ir-1.csv",
    isNative: true,
    tableYear: 2024,
    major: "cis-ir",
    getCreditRequirements,
    classifyRealCourses,
    classifyFakeCourses,
    want: {
      cells: {
        b1: { taken: 14, mightTake: 5 },
        c1: { taken: 1 },
        c2: { taken: 1 },
        c3: { taken: 1 },
        c4: { taken: 1 },
        d1: { taken: 6 },
        d2: { taken: 4 },
        d3: { taken: 6 },
        e1: { taken: 2 },
        e2: { taken: 2 },
        e3: { taken: 4 },
        e4: { rawTaken: 5, effectiveTaken: 4 },
        e5: { taken: 4 },
        f1: { taken: 1 },
        f4: { taken: 1 },
        h2: { taken: 18 },
        h3: { taken: 8 },
        h4: {
          rawTaken: 16,
          effectiveTaken: 12,
          rawMightTake: 1,
          effectiveMightTake: 0,
        },
      },
      columns: {
        b: { taken: 14, mightTake: 5 },
        c: { taken: 4 },
        d: { taken: 16 },
        e: { taken: 16 },
        f: { taken: 2 },
        h: { rawTaken: 38, effectiveTaken: 35 },
      },
      compulsory: { taken: 20 },
      elective: { taken: 67, mightTake: 5 },
    },
  });
}

test1();
console.log(import.meta.filename, "ok");
