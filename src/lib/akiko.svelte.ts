import {
  type CellId,
  type CourseId,
  type RealCourse,
  type FakeCourse,
  type KnownCourse,
  type CreditRequirements,
  akikoGetCreditStats,
  akikoNew,
} from "./akiko";
import {
  type SetupParams,
  createCreditRequirementsOrFail,
  classifyCoursesOrFail,
} from "./app-setup";
import { assert } from "./util";

export class AkikoApp {
  knownCourses: KnownCourse[];
  knownCourseYear: number;
  creditRequirements: CreditRequirements;
  major: string;
  requirementsTableYear: number;

  // Reactive State
  realCourses = $state<RealCourse[]>([]);
  fakeCourses = $state<FakeCourse[]>([]);
  mightTakeCourseIds = $state<CourseId[]>([]);
  selectedCellId = $state<CellId | undefined>(undefined);
  native = $state(true);
  filterString = $state("");

  params: SetupParams;
  localDataKey: string;

  constructor(params: SetupParams) {
    try {
      this.params = params;
      this.knownCourses = params.knownCourses;
      this.knownCourseYear = params.knownCourseYear;
      this.creditRequirements = createCreditRequirementsOrFail(
        params.creditRequirements,
      );
      this.major = params.major;
      this.requirementsTableYear = params.requirementsTableYear;
      this.localDataKey = `${params.major}_${params.requirementsTableYear}`;

      // Load initial data from localStorage if available
      if (typeof window !== "undefined") {
        const saved = this.localDataLoad();
        if (saved) {
          this.realCourses = saved.realCourses;
          this.fakeCourses = saved.fakeCourses;
          this.mightTakeCourseIds = saved.mightTakeCourseIds;
          this.native = saved.native;
        }
      }
    } catch (e) {
      console.error(`Failed to initialize AkikoApp for ${params.major}`, e);
      throw e;
    }
  }

  // Derived state replaces manual updates
  akiko = $derived.by(() => {
    const { courseIdToCellId, realCoursePositions, fakeCoursePositions } =
      classifyCoursesOrFail(
        this.knownCourses,
        this.realCourses,
        this.fakeCourses,
        this.native,
        this.params.classifyKnownCourses,
        this.params.classifyRealCourses,
        this.params.classifyFakeCourses,
      );
    const a = akikoNew(
      this.knownCourses,
      this.realCourses,
      this.fakeCourses,
      this.mightTakeCourseIds,
      courseIdToCellId,
      realCoursePositions,
      fakeCoursePositions,
      this.creditRequirements,
    );
    assert(a !== undefined);
    return a;
  });

  stats = $derived.by(() => akikoGetCreditStats(this.akiko));

  // Persistence
  localDataLoad() {
    const json = localStorage.getItem(this.localDataKey);
    if (json) {
      try {
        const data = JSON.parse(json);
        // Basic validation/migration (simplified for now)
        if (data.version === 2) {
          return data;
        }
      } catch (e) {
        console.error("Failed to load local data", e);
      }
    }
    return undefined;
  }

  save() {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      this.localDataKey,
      JSON.stringify({
        version: 2,
        mightTakeCourseIds: Array.from(this.mightTakeCourseIds),
        realCourses: Array.from(this.realCourses),
        fakeCourses: Array.from(this.fakeCourses),
        native: this.native,
      }),
    );
  }

  // Actions
  toggleMightTake(id: CourseId) {
    if (this.mightTakeCourseIds.includes(id)) {
      this.mightTakeCourseIds = this.mightTakeCourseIds.filter((x) => x !== id);
    } else {
      this.mightTakeCourseIds = [...this.mightTakeCourseIds, id];
    }
    this.save();
  }

  reset() {
    if (
      window.confirm(
        "インポートした成績データや「取る授業」に移動した授業などが全てリセットされます。本当にリセットしますか？",
      )
    ) {
      localStorage.removeItem(this.localDataKey);
      window.location.reload();
    }
  }

  importCSV(real: RealCourse[], fake: FakeCourse[]) {
    this.realCourses = real;
    this.fakeCourses = fake;
    this.save();
  }
}
