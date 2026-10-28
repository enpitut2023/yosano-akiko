import type { BaseCreditStats, CreditStats } from "$lib/akiko";

/**
 * Logs credit stats in the shape the tests expect, for writing a test from a
 * grades file.
 */
export function debugPrintCreditStats(stats: CreditStats): void {
  function fmt(s: BaseCreditStats): Record<string, number> {
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
  const cells: Record<string, object> = {};
  for (const [cellId, stat] of stats.cells) {
    const cell = fmt(stat);
    if (Object.keys(cell).length > 0) cells[cellId] = cell;
  }
  const columns: Record<string, object> = {};
  for (const [colId, stat] of stats.columns) {
    const col = fmt(stat);
    if (Object.keys(col).length > 0) columns[colId] = col;
  }
  const compulsory = fmt(stats.compulsory);
  const elective = fmt(stats.elective);
  console.log(JSON.stringify({ cells, columns, compulsory, elective }));
}
