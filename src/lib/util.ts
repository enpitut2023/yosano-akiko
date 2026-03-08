export function assert(b: boolean, message = "Assertion failed"): asserts b {
  if (!b) {
    throw new Error(message);
  }
}

export function defined<T>(t: T | undefined): T {
  assert(t !== undefined, "Must not be undefined");
  return t;
}

export function unreachable(_: never): never {
  throw new Error("Should be unreachable");
}

export function tryParseInt(s: string): number | undefined {
  const n = parseInt(s);
  if (!isNaN(n)) {
    return n;
  }
}

export function tryParseFloat(s: string): number | undefined {
  const n = parseFloat(s);
  if (!isNaN(n)) {
    return n;
  }
}

export function stringCompare(a: string, b: string): number {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
}

export function arrayRemove<T>(ts: T[], t: T): boolean {
  const i = ts.indexOf(t);
  if (i < 0) {
    return false;
  }
  ts.splice(i, 1);
  return true;
}

export function arrayRetain<T>(ts: T[], predicate: (t: T) => boolean): void {
  const newTs: T[] = [];
  for (const t of ts) {
    if (predicate(t)) {
      newTs.push(t);
    }
  }
  ts.splice(0);
  for (const t of newTs) {
    ts.push(t);
  }
}
