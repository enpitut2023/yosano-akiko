import {
  dowCompare,
  occupiedSlotsOverlap,
  termCompare,
  type Dow,
  type MergedCourse,
  type OccupiedSlots,
  type Slot,
  type Term,
} from "$lib/akiko";

/** What the user narrows 当てはまる授業 down by. Undefined and empty mean any. */
export type WontTakeFilters = {
  courseIdOrName: string;
  credit: number | undefined;
  expects: number | undefined;
  term: Term | undefined;
  dows: Dow[];
  onlyUnoccupied: boolean;
};

export function wontTakeFiltersDefault(): WontTakeFilters {
  return {
    courseIdOrName: "",
    credit: undefined,
    expects: undefined,
    term: undefined,
    dows: [],
    onlyUnoccupied: false,
  };
}

/**
 * Whether the slots match the term and day filters. One slot has to match
 * both, and choosing a day leaves out courses without a fixed day and period
 * (集中, 応談, …).
 */
export function slotsMatchFilters(
  slots: Slot[],
  term: Term | undefined,
  dows: Dow[],
): boolean {
  if (term === undefined && dows.length === 0) return true;
  return slots.some((s) => {
    if (term !== undefined && s.term !== term) return false;
    if (dows.length === 0) return true;
    return s.when.kind === "regular" && dows.includes(s.when.dow);
  });
}

/** The search matches the course ID or name, ignoring case. */
export function courseMatchesFilters(
  course: MergedCourse,
  filters: WontTakeFilters,
  occupied: OccupiedSlots,
): boolean {
  const { courseIdOrName, credit, expects, term, dows, onlyUnoccupied } =
    filters;
  const query = courseIdOrName.toLowerCase();
  if (
    query !== "" &&
    !course.id.toLowerCase().includes(query) &&
    !course.name.toLowerCase().includes(query)
  )
    return false;
  if (credit !== undefined && course.credit !== credit) return false;
  if (expects !== undefined && !course.known?.expects.includes(expects))
    return false;
  const slots = course.known?.slots ?? [];
  if (!slotsMatchFilters(slots, term, dows)) return false;
  if (onlyUnoccupied && occupiedSlotsOverlap(occupied, slots)) return false;
  return true;
}

const TERM_GROUP_LABELS = ["モジュール", "学期", "その他"] as const;
export type TermGroupLabel = (typeof TERM_GROUP_LABELS)[number];

// Some terms are easy to mix up, like 春A and 春学期, so the options are grouped
const TERM_TO_GROUP: Record<Term, TermGroupLabel> = {
  "spring-a": "モジュール",
  "spring-b": "モジュール",
  "spring-c": "モジュール",
  "autumn-a": "モジュール",
  "autumn-b": "モジュール",
  "autumn-c": "モジュール",
  spring: "学期",
  autumn: "学期",
  "all-year": "学期",
  "spring-break": "その他",
  "summer-break": "その他",
};

/** The values on offer for each filter, sorted. */
export type FilterChoices = {
  credits: number[];
  expects: number[];
  dows: Dow[];
  terms: Term[];
  /** `terms` by group, leaving out empty groups. */
  termGroups: { label: TermGroupLabel; terms: Term[] }[];
};

/** Only values that some of the courses have, so no choice empties the list. */
export function filterChoicesOf(courses: MergedCourse[]): FilterChoices {
  const credits = new Set<number>();
  const expects = new Set<number>();
  const dows = new Set<Dow>();
  const terms = new Set<Term>();
  for (const c of courses) {
    if (c.credit !== undefined) credits.add(c.credit);
    for (const e of c.known?.expects ?? []) expects.add(e);
    for (const s of c.known?.slots ?? []) {
      terms.add(s.term);
      if (s.when.kind === "regular") dows.add(s.when.dow);
    }
  }
  const sortedTerms = Array.from(terms).sort(termCompare);
  return {
    credits: Array.from(credits).sort((a, b) => a - b),
    expects: Array.from(expects).sort((a, b) => a - b),
    dows: Array.from(dows).sort(dowCompare),
    terms: sortedTerms,
    termGroups: TERM_GROUP_LABELS.map((label) => ({
      label,
      terms: sortedTerms.filter((t) => TERM_TO_GROUP[t] === label),
    })).filter((g) => g.terms.length > 0),
  };
}

/**
 * The filters with each chosen value that's no longer on offer left out. The
 * chosen values themselves stay, so one comes back once its option does.
 */
export function filtersInEffect(
  filters: WontTakeFilters,
  choices: FilterChoices,
): WontTakeFilters {
  const offered = <T>(v: T | undefined, vs: T[]) =>
    v !== undefined && vs.includes(v) ? v : undefined;
  return {
    ...filters,
    credit: offered(filters.credit, choices.credits),
    expects: offered(filters.expects, choices.expects),
    term: offered(filters.term, choices.terms),
    dows: filters.dows.filter((d) => choices.dows.includes(d)),
  };
}

/** The number on the filter button. The search isn't counted. */
export function filtersActiveCount(filters: WontTakeFilters): number {
  return (
    [
      filters.credit !== undefined,
      filters.expects !== undefined,
      filters.term !== undefined,
      filters.onlyUnoccupied,
    ].filter(Boolean).length + filters.dows.length
  );
}
