import {
  classifyFakeCourses,
  classifyRealCourses,
  getCreditRequirements,
} from "@/requirements/pe-since-2023";
import { runTest } from "./util";

function test1(): void {
  runTest({
    csvPath: "grade-csvs/2023/pe-1.csv",
    isNative: true,
    tableYear: 2023,
    major: "pe",
    getCreditRequirements,
    classifyRealCourses,
    classifyFakeCourses,
    want: {
      cells: {
        a3: { taken: 1 },
        a4: { taken: 1, mightTake: 2 },
        a5: { taken: 2 },
        b1: { taken: 6 },
        b2: { mightTake: 3 },
        b3: { taken: 2, mightTake: 2 },
        c2: { taken: 1 },
        c3: { taken: 1 },
        c4: { taken: 1 },
        c5: { taken: 1 },
        c6: { taken: 1 },
        d1: { taken: 9 },
        d2: { taken: 4 },
        d3: { rawTaken: 12, effectiveTaken: 10 },
        d4: { taken: 6 },
        d5: { taken: 1 },
        e1: { taken: 1 },
        e2: { taken: 1 },
        e3: { taken: 3 },
        e4: { taken: 4 },
        e5: { taken: 2 },
        h1: {
          rawTaken: 22,
          effectiveTaken: 20,
          rawMightTake: 4,
          effectiveMightTake: 0,
        },
      },
      columns: {
        a: { taken: 4, mightTake: 2 },
        b: { taken: 8, mightTake: 5 },
        c: { taken: 5 },
        d: { taken: 30 },
        e: { taken: 11 },
        h: { taken: 20 },
      },
      compulsory: { taken: 20, mightTake: 2 },
      elective: { taken: 58, mightTake: 5 },
    },
  });
}

test1();
console.log(import.meta.filename, "ok");
