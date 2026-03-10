import { getConfig } from "$lib/config";
import { instances, isMajor } from "$lib/constants";
import { assert, strictParseInt } from "$lib/util";
import type { EntryGenerator, PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const tableYear = strictParseInt(params.year);
  assert(tableYear !== undefined);
  assert(isMajor(params.major));
  const config = await getConfig(tableYear, params.major);
  return {
    year: tableYear,
    major: params.major,
    config,
  };
};

export const entries: EntryGenerator = () => {
  return instances.map((i) => ({
    year: i.year.toString(),
    major: i.major,
  }));
};
