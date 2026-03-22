import {
  classifyFakeCourses,
  classifyRealCourses,
  getCreditRequirements,
} from "$lib/requirements/art-since-2023";
import { runTest } from "./util";

function test1(): void {
  runTest({
    csvPath: "grade-csvs/2023/art-1.csv",
    isNative: true,
    tableYear: 2023,
    major: "art",
    getCreditRequirements,
    classifyRealCourses,
    classifyFakeCourses,
    want: {
      cells: {
        a2: { taken: 1 },
        a3: { taken: 1 },
        a4: { taken: 1 },
        b1: { taken: 48 },
        b2: { taken: 1 },
        c1: { taken: 1 },
        c2: { taken: 1 },
        c3: { taken: 1 },
        c4: { taken: 1 },
        c5: { taken: 1 },
        d1: { taken: 2 },
        d2: { taken: 3 },
        d3: { taken: 3 },
        d4: { taken: 10 },
        e1: { taken: 2 },
        e2: { taken: 2 },
        e3: { taken: 4 },
        e4: { taken: 4 },
        f1: { taken: 1 },
        h1: {
          rawTaken: 26,
          effectiveTaken: 18,
          rawMightTake: 1,
          effectiveMightTake: 0,
        },
        h2: { taken: 4 },
        h3: { taken: 2 },
      },
      columns: {
        a: { taken: 3 },
        b: { taken: 49 },
        c: { taken: 5 },
        d: { taken: 18 },
        e: { taken: 12 },
        f: { taken: 1 },
        h: { taken: 24 },
      },
      compulsory: { taken: 20 },
      elective: { taken: 92 },
    },
  });
}

test1();
console.log(import.meta.filename, "ok");
