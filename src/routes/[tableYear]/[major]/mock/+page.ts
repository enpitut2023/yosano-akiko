import { isMajor } from "#lib/constants.ts";
import { getMajorConfig } from "#lib/major-config.ts";
import { assert, parseIntStrict } from "#lib/util.ts";
import type { EntryGenerator, PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  const tableYear = parseIntStrict(params.tableYear);
  assert(tableYear !== undefined);
  assert(isMajor(params.major));
  return { config: await getMajorConfig(tableYear, params.major, fetch) };
};

// No page links here, so prerendering has to be told which ones to build.
// The sample grades are a coins student's.
export const entries: EntryGenerator = () => [
  { tableYear: "2023", major: "coins" },
];
