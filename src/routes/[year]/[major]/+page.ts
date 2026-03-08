import { getConfig } from "$lib/config";
import { instances } from "$lib/constants";
import type { EntryGenerator, PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const config = await getConfig(params.year, params.major);
  return {
    year: params.year,
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
