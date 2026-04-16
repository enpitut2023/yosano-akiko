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
  type CoursePosition,
  type CourseIdLists,
  akikoGetCoursesInCell,
  akikoGetAllCourses,
} from "./akiko";
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

  getCoursesInCell(cellId: CellId): CourseIdLists {
    this.subscribe();
    return akikoGetCoursesInCell(this.akiko, cellId);
  }

  getAllCourses(): CourseIdLists {
    this.subscribe();
    return akikoGetAllCourses(this.akiko);
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

  getCoursePositions(): Map<CourseId, CoursePosition> {
    this.subscribe();
    return this.akiko.coursePositions;
  }

  getFakeCoursePositions(): Map<FakeCourseId, CellId> {
    this.subscribe();
    return this.akiko.fakeCoursePositions;
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
