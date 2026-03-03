import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirementsSince2023,
} from "@/requirements/bres-since-2023";
import { runTest } from "./util";

function test1(): void {
  runTest({
    csvPath: "grade-csvs/2024/bres-1.csv",
    isNative: true,
    creditRequirements: creditRequirementsSince2023,
    classifyRealCourses: (cs, opts) =>
      classifyRealCourses(cs, opts, 2023, "none"),
    classifyFakeCourses: (cs, opts) =>
      classifyFakeCourses(cs, opts, 2023, "none"),
    want: {
      cells: {
        a1: { taken: 2 },
        b1: {
          rawTaken: 33,
          effectiveTaken: 19,
          rawMightTake: 1,
          effectiveMightTake: 0,
        },
        b2: { taken: 1 },
        b3: { taken: 3, mightTake: 2 },
        c1: { taken: 1 },
        d1: { taken: 4 },
        d2: { taken: 15 },
        e1: { taken: 2 },
        e2: { taken: 2 },
        e3: { taken: 4 },
        e4: { taken: 4 },
        e5: { taken: 1 },
        f1: { taken: 1 },
        f4: { taken: 2 },
        h1: { taken: 9 },
      },
      columns: {
        a: { taken: 2 },
        b: { taken: 23, mightTake: 2 },
        c: { taken: 1 },
        d: { taken: 19 },
        e: { taken: 13 },
        f: { taken: 3 },
        h: { taken: 9 },
      },
      compulsory: { taken: 16 },
      elective: { taken: 54, mightTake: 2 },
    },
  });
}

test1();
console.log(__filename, "ok");
