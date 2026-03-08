import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: "404.html",
      strict: true,
    }),
    alias: {
      "@": "src/lib",
    },
  },
  compilerOptions: {
    warningFilter: (warning) => !warning.code.startsWith("a11y_"),
    css: "injected",
  },
};

export default config;
