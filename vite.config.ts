import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: { port: 42263 },
  build: { chunkSizeWarningLimit: 1000 },
});
