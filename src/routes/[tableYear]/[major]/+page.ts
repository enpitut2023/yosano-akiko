import { getMajorConfig } from "$lib/major-config";
import { instances, isMajor } from "$lib/constants";
import { assert, strictParseInt } from "$lib/util";
import type { EntryGenerator, PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  const tableYear = strictParseInt(params.tableYear);
  assert(tableYear !== undefined);
  assert(isMajor(params.major));
  const config = await getMajorConfig(tableYear, params.major, fetch);
  return { config };
};

export const entries: EntryGenerator = () => {
  return instances.map((i) => ({
    tableYear: i.tableYear.toString(),
    major: i.major,
  }));
};
