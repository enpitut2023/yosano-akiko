import { DOCS_PAGE_NAMES } from "$lib/constants";
import type { EntryGenerator, PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  return { name: params.name };
};

export const entries: EntryGenerator = () => {
  return DOCS_PAGE_NAMES.map((name) => ({ name }));
};
