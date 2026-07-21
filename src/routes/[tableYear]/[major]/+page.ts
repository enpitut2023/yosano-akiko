import { getMajorConfig } from "$lib/major-config";
import {
  instances,
  isMajor,
  majorIsClosed,
  MAJOR_TO_DOCS_PAGE_NAME,
  DOCS_PAGE_NAME_TO_JA,
} from "$lib/constants";
import { assert, strictParseInt } from "$lib/util";
import type { EntryGenerator, PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  const tableYear = strictParseInt(params.tableYear);
  assert(tableYear !== undefined);
  assert(isMajor(params.major));
  if (majorIsClosed(params.major)) {
    const ja = DOCS_PAGE_NAME_TO_JA[MAJOR_TO_DOCS_PAGE_NAME[params.major]];
    return { closed: true as const, majorJa: ja };
  }
  const config = await getMajorConfig(tableYear, params.major, fetch);
  return { closed: false as const, config };
};

export const entries: EntryGenerator = () => {
  return instances.map((i) => ({
    tableYear: i.tableYear.toString(),
    major: i.major,
  }));
};
