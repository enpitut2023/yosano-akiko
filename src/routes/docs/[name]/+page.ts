import { DOCS_PAGE_NAMES, isDocsPageName } from "$lib/constants";
import { error } from "@sveltejs/kit";
import type { EntryGenerator, PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  if (!isDocsPageName(params.name)) error(404);
  return { name: params.name };
};

export const entries: EntryGenerator = () => {
  return DOCS_PAGE_NAMES.map((name) => ({ name }));
};
