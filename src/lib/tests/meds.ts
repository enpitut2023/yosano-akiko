import {
  classifyFakeCourses,
  classifyRealCourses,
  getCreditRequirements,
} from "@/requirements/meds-since-2023";
import { runTest } from "./util";

function test1(): void {
  runTest({
    csvPath: "grade-csvs/2024/meds-ims-1.csv",
    isNative: true,
    tableYear: 2024,
    major: "meds-ims",
    getCreditRequirements,
    classifyRealCourses,
    classifyFakeCourses,
    want: {
      cells: {
        a1: { mightTake: 1 },
        a2: { mightTake: 3 },
        a3: { taken: 1 },
        a5: { mightTake: 1 },
        a6: { mightTake: 2 },
        b1: { taken: 43, mightTake: 5 },
        c1: { taken: 1 },
        d1: { taken: 23, mightTake: 2 },
        e1: { taken: 2 },
        e2: { taken: 2 },
        e3: { taken: 4 },
        e4: { taken: 4 },
        f1: { rawTaken: 2, effectiveTaken: 1 },
        g1: { taken: 1 },
        g2: { taken: 1 },
        h1: { taken: 3 },
        h2: { rawTaken: 22, effectiveTaken: 3 },
      },
      columns: {
        a: { taken: 1, mightTake: 7 },
        b: { taken: 43, mightTake: 5 },
        c: { taken: 1 },
        d: { taken: 23, mightTake: 2 },
        e: { taken: 12 },
        f: { taken: 1 },
        g: { taken: 2 },
        h: { taken: 6 },
      },
      compulsory: { taken: 16, mightTake: 7 },
      elective: { taken: 73, mightTake: 7 },
    },
  });
}

test1();
console.log(import.meta.filename, "ok");
