import {
  classifyFakeCourses,
  classifyRealCourses,
  creditRequirementsSince2024,
} from "@/requirements/coens-since-2023";
import { runTest } from "./util";

function test1(): void {
  runTest({
    csvPath: "grade-csvs/2024/coens-ap-1.csv",
    isNative: true,
    tableYear: 2024,
    major: "coens-ap",
    creditRequirements: creditRequirementsSince2024,
    classifyRealCourses: (cs, opts) => classifyRealCourses(cs, opts),
    classifyFakeCourses: (cs, opts) => classifyFakeCourses(cs, opts),
    want: {
      cells: {
        a1: { taken: 1 },
        b2: { taken: 5, mightTake: 3 },
        c1: { taken: 1 },
        c2: { taken: 16, mightTake: 3 },
        d1: { taken: 8, mightTake: 1 },
        d2: { taken: 17 },
        e1: { taken: 2 },
        e2: { taken: 2 },
        e3: { taken: 4 },
        e4: { taken: 4 },
        f1: { rawTaken: 2, effectiveTaken: 1 },
        f2: { taken: 4 },
        h1: { taken: 10 },
        h2: { taken: 2 },
      },
      columns: {
        a: { taken: 1 },
        b: { taken: 5, mightTake: 3 },
        c: { taken: 17, mightTake: 3 },
        d: { taken: 25, mightTake: 1 },
        e: { taken: 12 },
        f: { taken: 5 },
        h: { taken: 12 },
      },
      compulsory: { taken: 30, mightTake: 3 },
      elective: { taken: 47, mightTake: 4 },
    },
  });
}

test1();
console.log(import.meta.filename, "ok");
