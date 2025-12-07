export function assert(b: boolean, message = "Assertion failed"): asserts b {
  if (!b) {
    throw new Error(message);
  }
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
