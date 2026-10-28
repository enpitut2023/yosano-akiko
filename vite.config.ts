import { sveltekit } from "@sveltejs/kit/vite";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const e2e = process.env.AKIKO_E2E !== undefined;

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
  plugins: [e2e && useE2eCatalog(), sveltekit()],
  server: { port: 42263 },
  build: { chunkSizeWarningLimit: 1000 },
  // The default pattern would also pick up the Playwright specs in tests/e2e
  test: { include: ["src/**/*.test.ts"] },
});
