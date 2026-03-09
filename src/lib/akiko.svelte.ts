import {
  type CellId,
  type CourseId,
  type RealCourse,
  type FakeCourse,
  type KnownCourse,
  type CreditRequirements,
  type BaseCreditStats,
  akikoGetCreditStats,
  akikoNew,
  akikoGetUnclassifiedRealCourses,
  akikoGetUnclassifiedFakeCourses,
  courseIdCompare,
  fakeCourseIdCompare,
} from "./akiko";
import {
  type SetupParams,
  createCreditRequirementsOrFail,
  classifyCoursesOrFail,
} from "./app-setup";
import { assert } from "./util";
import { type Major } from "./constants";
import { type LocalDataV2, localDataFromJson } from "./local-data";

export class AkikoApp {
  knownCourses: KnownCourse[];
  knownCourseYear: number;
  creditRequirements: CreditRequirements;
  major: Major;
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
        params.getCreditRequirements(
          params.requirementsTableYear,
          params.major,
        ),
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

        $effect(() => {
          this.save();
        });

        if (import.meta.env.DEV) {
          $effect(() => {
            const akiko = this.akiko;
            const rcs = akikoGetUnclassifiedRealCourses(akiko);
            const fcs = akikoGetUnclassifiedFakeCourses(akiko);
            rcs.sort((a, b) => courseIdCompare(a.id, b.id));
            fcs.sort((a, b) => fakeCourseIdCompare(a.id, b.id));
            let s = "マスに振り分けられなかった授業\n";
            for (const rc of rcs) {
              s += [rc.id, rc.name, rc.takenYear, rc.credit, rc.grade].join(
                " ",
              );
              s += "\n";
            }
            for (const fc of fcs) {
              s += [fc.id, fc.name, fc.takenYear, fc.credit, fc.grade].join(
                " ",
              );
              s += "\n";
            }
            console.log(s);

            function createWantBaseCreditStats(
              s: BaseCreditStats,
            ): Record<string, number> {
              const o: Record<string, number> = {};
              if (s.rawTaken > 0) {
                if (s.overflowTaken === 0) {
                  o.taken = s.rawTaken;
                } else {
                  o.rawTaken = s.rawTaken;
                  o.effectiveTaken = s.effectiveTaken;
                }
              }
              if (s.rawMightTake > 0) {
                if (s.overflowMightTake === 0) {
                  o.mightTake = s.rawMightTake;
                } else {
                  o.rawMightTake = s.rawMightTake;
                  o.effectiveMightTake = s.effectiveMightTake;
                }
              }
              return o;
            }

            const stats = this.stats;
            const cells: Record<string, object> = {};
            for (const [cellId, stat] of stats.cells) {
              const cell = createWantBaseCreditStats(stat);
              if (Object.keys(cell).length > 0) {
                cells[cellId] = cell;
              }
            }
            const columns: Record<string, object> = {};
            for (const [colId, stat] of stats.columns) {
              const col = createWantBaseCreditStats(stat);
              if (Object.keys(col).length > 0) {
                columns[colId] = col;
              }
            }
            const compulsory = createWantBaseCreditStats(stats.compulsory);
            const elective = createWantBaseCreditStats(stats.elective);
            console.log(
              JSON.stringify({ cells, columns, compulsory, elective }),
            );
          });
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
        this.requirementsTableYear,
        this.major,
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
        return localDataFromJson(json);
      } catch (e) {
        console.error("Failed to load local data", e);
      }
    }
    return undefined;
  }

  save() {
    if (typeof window === "undefined") return;
    const data: LocalDataV2 = {
      version: 2,
      mightTakeCourseIds: Array.from(this.mightTakeCourseIds),
      realCourses: Array.from(this.realCourses),
      fakeCourses: Array.from(this.fakeCourses),
      native: this.native,
    };
    localStorage.setItem(this.localDataKey, JSON.stringify(data));
  }

  // Actions
  toggleMightTake(id: CourseId) {
    if (this.mightTakeCourseIds.includes(id)) {
      this.mightTakeCourseIds = this.mightTakeCourseIds.filter((x) => x !== id);
    } else {
      this.mightTakeCourseIds = [...this.mightTakeCourseIds, id];
    }
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
  }
}
