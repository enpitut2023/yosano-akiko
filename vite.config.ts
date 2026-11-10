import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

// The e2e tests build the site with a fixture course catalog. Their output goes
// elsewhere so it never replaces the real build or what `npm run preview`
// serves.
const e2e = process.env.AKIKO_E2E !== undefined;
const out = e2e ? "build-e2e" : "build";

const catalog = fileURLToPath(
  new URL("src/lib/current-courses.ts", import.meta.url),
);
const e2eCatalog = fileURLToPath(
  new URL("tests/e2e/fixtures/courses.ts", import.meta.url),
);

/** Serves the e2e fixture wherever the real course catalog is imported. */
function useE2eCatalog(): Plugin {
  return {
    name: "akiko-e2e-catalog",
    enforce: "pre",
    resolveId: {
      // Skips calling the hook for every other import, which would otherwise
      // make up a large share of the build's plugin time
      filter: { id: /current-courses/ },
      async handler(source, importer, options) {
        const resolved = await this.resolve(source, importer, {
          ...options,
          skipSelf: true,
        });
        return resolved?.id === catalog ? e2eCatalog : null;
      },
    },
  };
}

export default defineConfig({
  plugins: [
    e2e && useE2eCatalog(),
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter({
        pages: out,
        assets: out,
        fallback: "404.html",
        strict: true,
      }),
      outDir: e2e ? ".svelte-kit-e2e" : ".svelte-kit",
      paths: {
        base: (process.env.BASE_PATH ?? "/yosano-akiko") as `/${string}`,
        relative: false,
      },
      // Nothing reads `updated`, so fetching version.json every hour is waste
      version: { pollInterval: 0 },
      compilerOptions: {
        // Libraries may still use legacy syntax, so they're left to decide
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
        warningFilter: (warning) => !warning.code.startsWith("a11y_"),
      },
    }),
  ],
  // `tailscale serve` (npm run dev:tailnet) forwards requests for *.ts.net
  server: { port: 42263, allowedHosts: [".ts.net"] },
  build: { chunkSizeWarningLimit: 1000 },
  // The default pattern would also pick up the Playwright specs in tests/e2e
  test: { include: ["src/**/*.test.ts"] },
});
