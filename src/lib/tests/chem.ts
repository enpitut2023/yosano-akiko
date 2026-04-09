import {
  classifyFakeCourses,
  classifyRealCourses,
  getCreditRequirements,
} from "$lib/requirements/chem-since-2023";
import { runTest } from "./util";

function test1(): void {
  runTest({
    csvPath: "grade-csvs/2023/chem-1.csv",
    isNative: true,
    tableYear: 2023,
    major: "chem",
    getCreditRequirements,
    classifyRealCourses,
    classifyFakeCourses,
    want: {
      cells: {
        a1: { taken: 4 },
        a2: { taken: 4 },
        a3: { mightTake: 4 },
        b1: { taken: 4, mightTake: 2 },
        b2: { taken: 6, rawMightTake: 3, effectiveMightTake: 0 },
        b3: { taken: 6, rawMightTake: 3, effectiveMightTake: 0 },
        b4: { taken: 14, mightTake: 4 },
        c1: { taken: 3 },
        d1: { taken: 12 },
        d2: { taken: 17 },
        e1: { taken: 2 },
        e2: { taken: 2 },
        e3: { taken: 4 },
        e4: { taken: 4 },
        h1: { taken: 2 },
        h2: { rawTaken: 10, effectiveTaken: 9 },
      },
      columns: {
        a: { taken: 8, mightTake: 4 },
        b: { taken: 30, mightTake: 6 },
        c: { taken: 3 },
        d: { taken: 29 },
        e: { taken: 12 },
        h: { taken: 11 },
      },
      compulsory: { taken: 23, mightTake: 4 },
      elective: { taken: 70, mightTake: 6 },
    },
  });
}

test1();
console.log(import.meta.filename, "ok");
