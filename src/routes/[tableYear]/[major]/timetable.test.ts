import { describe, expect, test } from "vitest";
import type { Slot, Term } from "$lib/akiko";
import { timetableTabAfterPlanning } from "./timetable";

function regular(term: Term): Slot {
  return { term, when: { kind: "regular", dow: "mon", period: 1 } };
}

describe("timetableTabAfterPlanning", () => {
  test("a course without a fixed day and period goes to その他", () => {
    const intensive: Slot = {
      term: "summer-break",
      when: { kind: "intensive" },
    };
    expect(timetableTabAfterPlanning([intensive], "spring-a")).toBe("other");
    expect(timetableTabAfterPlanning([], "spring-a")).toBe("other");
  });

  test("stays on the current term if the course is on it", () => {
    const slots = [regular("spring-a"), regular("spring-b")];
    expect(timetableTabAfterPlanning(slots, "spring-b")).toBe("spring-b");
  });

  test("else goes to the course's first term", () => {
    const slots = [regular("spring-b"), regular("spring-c")];
    expect(timetableTabAfterPlanning(slots, "autumn-a")).toBe("spring-b");
    expect(timetableTabAfterPlanning(slots, "other")).toBe("spring-b");
  });

  test("only terms with a fixed day and period count", () => {
    const slots: Slot[] = [
      { term: "spring-a", when: { kind: "intensive" } },
      regular("spring-b"),
    ];
    expect(timetableTabAfterPlanning(slots, "spring-a")).toBe("spring-b");
  });
});
