import { sveltekit } from "@sveltejs/kit/vite";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

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
    async resolveId(source, importer, options) {
      const resolved = await this.resolve(source, importer, {
        ...options,
        skipSelf: true,
      });
      return resolved?.id === catalog ? e2eCatalog : null;
    },
  };
}

export default defineConfig({
  plugins: [e2e && useE2eCatalog(), sveltekit()],
  // With the extra plugin the dependency cache would look stale to the regular
  // dev server, so the two would keep rebuilding each other's cache
  cacheDir: e2e ? "node_modules/.vite-e2e" : undefined,
  server: { port: 42263 },
  build: { chunkSizeWarningLimit: 1000 },
});
