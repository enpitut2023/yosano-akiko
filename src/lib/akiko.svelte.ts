import {
  type CellId,
  type CourseId,
  akikoGetCreditStats,
  type Akiko,
  type FakeCourse,
  type FakeCourseId,
  type CreditStats,
  akikoGetMightTakeCourseIds,
  akikoGetTakenCourseIds,
  akikoGetUnclassifiedRealCourses,
  akikoGetUnclassifiedFakeCourses,
  type AkikoMoveCourseDst,
  type AkikoMoveCourseResult,
  akikoMoveCourse,
  type RealCourse,
  type AkikoExportForTwinsResult,
  akikoExportForTwins,
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

  getCellId(courseId: CourseId): CellId | undefined {
    this.subscribe();
    return this.akiko.coursePositions.get(courseId)?.cellId;
  }

  getMightTakeCourseIds(): CourseId[] {
    this.subscribe();
    return akikoGetMightTakeCourseIds(this.akiko);
  }

  getTakenCourseIds(): CourseId[] {
    this.subscribe();
    return akikoGetTakenCourseIds(this.akiko);
  }

  getCreditStats(): CreditStats {
    this.subscribe();
    return akikoGetCreditStats(this.akiko);
  }

  getUnclassifiedCourses(): { real: RealCourse[]; fake: FakeCourse[] } {
    this.subscribe();
    return {
      real: akikoGetUnclassifiedRealCourses(this.akiko),
      fake: akikoGetUnclassifiedFakeCourses(this.akiko),
    };
  }

  getRealCoursesMap(): Map<CourseId, RealCourse> {
    this.subscribe();
    return this.akiko.realCourses;
  }

  getFakeCoursesMap(): Map<FakeCourseId, FakeCourse> {
    this.subscribe();
    return this.akiko.fakeCourses;
  }

  exportForTwins(): AkikoExportForTwinsResult {
    this.subscribe();
    return akikoExportForTwins(this.akiko);
  }

  moveCourse(
    courseId: CourseId,
    dst: AkikoMoveCourseDst,
  ): AkikoMoveCourseResult {
    this.update?.();
    return akikoMoveCourse(this.akiko, courseId, dst);
  }
}
