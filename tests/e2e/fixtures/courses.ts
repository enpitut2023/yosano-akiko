// Stands in for src/lib/current-courses.ts in the e2e tests, so they don't
// break when the real catalog is regenerated. The tests target 2023 coins, so
// each course is chosen to land in a known cell under
// src/lib/requirements/coins-since-2021.ts.
import { isCourseId, type KnownCourse } from "$lib/akiko";
import { assert } from "$lib/util";

function course(c: Omit<KnownCourse, "id"> & { id: string }): KnownCourse {
  const { id } = c;
  assert(isCourseId(id), `Bad course ID: ${id}`);
  return { ...c, id };
}

export const knownCourseYear = 2026;

export const knownCourses: KnownCourse[] = [
  course({
    // a1, by ID
    id: "GB26403",
    name: "ソフトウェアサイエンス実験A",
    credit: 3,
    expects: [3],
    expectsString: "3",
    slots: [
      { term: "spring-a", when: { kind: "regular", dow: "wed", period: 3 } },
      { term: "spring-a", when: { kind: "regular", dow: "wed", period: 4 } },
      { term: "spring-b", when: { kind: "regular", dow: "wed", period: 3 } },
      { term: "spring-b", when: { kind: "regular", dow: "wed", period: 4 } },
      { term: "spring-c", when: { kind: "regular", dow: "wed", period: 3 } },
      { term: "spring-c", when: { kind: "regular", dow: "wed", period: 4 } },
    ],
    slotsString: "春ABC水3,4",
    availability: "available",
    remark: "",
  }),
  course({
    // c1, by ID
    id: "GA15211",
    name: "線形代数A",
    credit: 2,
    expects: [1],
    expectsString: "1",
    slots: [
      { term: "spring-a", when: { kind: "regular", dow: "tue", period: 2 } },
      { term: "spring-b", when: { kind: "regular", dow: "tue", period: 2 } },
      { term: "spring-c", when: { kind: "regular", dow: "tue", period: 2 } },
    ],
    slotsString: "春ABC火2",
    availability: "available",
    remark: "",
  }),
  course({
    // b1 (GB20…), overlaps GB31801 (b2)
    id: "GB20401",
    name: "オートマトンと形式言語",
    credit: 2,
    expects: [2, 3],
    expectsString: "2,3",
    slots: [
      { term: "spring-a", when: { kind: "regular", dow: "mon", period: 1 } },
      { term: "spring-b", when: { kind: "regular", dow: "mon", period: 1 } },
    ],
    slotsString: "春AB月1",
    availability: "available",
    remark: "",
  }),
  course({
    // b2 (GB3… but not GB30…), overlaps GB20401
    id: "GB31801",
    name: "データベース概論",
    credit: 2,
    expects: [3, 4],
    expectsString: "3,4",
    slots: [
      { term: "spring-a", when: { kind: "regular", dow: "mon", period: 1 } },
      { term: "spring-b", when: { kind: "regular", dow: "mon", period: 1 } },
    ],
    slotsString: "春AB月1",
    availability: "available",
    remark: "",
  }),
  course({
    // b1 (GB40…), 事前登録
    id: "GB40111",
    name: "情報セキュリティ",
    credit: 2,
    expects: [3, 4],
    expectsString: "3,4",
    slots: [
      { term: "autumn-a", when: { kind: "regular", dow: "tue", period: 3 } },
      { term: "autumn-b", when: { kind: "regular", dow: "tue", period: 3 } },
    ],
    slotsString: "秋AB火3",
    availability: "available",
    remark: "事前登録対象\n対面",
  }),
  course({
    // b1 (GB40…), not offered this year
    id: "GB41001",
    name: "量子計算",
    credit: 2,
    expects: [3, 4],
    expectsString: "3,4",
    slots: [],
    slotsString: "",
    availability: "unavailable",
    remark: "",
  }),
  course({
    // b2 (GB2… but not GB20…)
    id: "GB27001",
    name: "ソフトウェア工学演習",
    credit: 1,
    expects: [2],
    expectsString: "2",
    slots: [
      { term: "autumn-c", when: { kind: "regular", dow: "fri", period: 5 } },
    ],
    slotsString: "秋C金5",
    availability: "available",
    remark: "",
  }),
  course({
    // b2, by ID; no fixed time slot
    id: "GB13322",
    name: "情報特別演習II",
    credit: 2,
    expects: [1, 2, 3, 4],
    expectsString: "1 - 4",
    slots: [
      { term: "spring-a", when: { kind: "zuiji" } },
      { term: "spring-b", when: { kind: "zuiji" } },
      { term: "spring-c", when: { kind: "zuiji" } },
    ],
    slotsString: "春ABC随時",
    availability: "available",
    remark: "",
  }),
];
