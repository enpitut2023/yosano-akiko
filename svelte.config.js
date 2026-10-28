import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// The e2e tests build the site with a fixture course catalog (see
// vite.config.ts). Their output goes elsewhere so it never replaces the real
// build or what `npm run preview` serves.
const e2e = process.env.AKIKO_E2E !== undefined;
const out = e2e ? "build-e2e" : "build";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: out,
      assets: out,
      fallback: "404.html",
      strict: true,
    }),
    outDir: e2e ? ".svelte-kit-e2e" : ".svelte-kit",
    paths: { base: process.env.BASE_PATH ?? "/yosano-akiko", relative: false },
  },
  compilerOptions: {
    warningFilter: (warning) => !warning.code.startsWith("a11y_"),
  },
};

export default config;
