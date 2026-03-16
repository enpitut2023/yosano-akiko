import {
  type CellId,
  type CourseId,
  akikoGetCreditStats,
  type Akiko,
  type FakeCourseId,
  type CreditStats,
  akikoGetMightTakeCourseIds,
} from "./akiko";
import { unreachable } from "./util";
import { createSubscriber } from "svelte/reactivity";

export class SvelteAkiko {
  private update: (() => void) | undefined;
  private subscribe = createSubscriber((update) => {
    this.update = update;
    return () => (this.update = undefined);
  });

  private akiko: Akiko;

  constructor(akiko: Akiko) {
    this.akiko = akiko;
  }

  // TODO: should return undefined for unknown cell ids
  getCoursesInCell(cellId: CellId): {
    wontTake: CourseId[];
    mightTake: CourseId[];
    taken: CourseId[];
    fake: FakeCourseId[];
  } {
    this.subscribe();
    const wontTake: CourseId[] = [];
    const mightTake: CourseId[] = [];
    const taken: CourseId[] = [];
    const fake: FakeCourseId[] = [];
    for (const [courseId, pos] of this.akiko.coursePositions) {
      if (pos.cellId !== cellId) continue;
      switch (pos.listKind) {
        case "wont-take":
          wontTake.push(courseId);
          break;
        case "might-take":
          mightTake.push(courseId);
          break;
        case "taken":
          taken.push(courseId);
          break;
        default:
          unreachable(pos.listKind);
      }
    }
    for (const [fakeCourseId, id] of this.akiko.fakeCoursePositions) {
      if (cellId === id) fake.push(fakeCourseId);
    }
    return { wontTake, mightTake, taken, fake };
  }

  getMightTakeCourseIds(): CourseId[] {
    this.subscribe();
    return akikoGetMightTakeCourseIds(this.akiko);
  }

  getCreditStats(): CreditStats {
    this.subscribe();
    return akikoGetCreditStats(this.akiko);
  }

  // TODO: should return something when no course is found or the course is
  // already at the destination
  moveCourse(courseId: CourseId, dst: "wont-take" | "might-take"): void {
    this.update?.();
    const pos = this.akiko.coursePositions.get(courseId);
    if (pos === undefined) return;
    pos.listKind = dst;
  }
}
