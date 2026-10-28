import { defineConfig, devices } from "@playwright/test";

// Not the regular dev server's port: this server serves the fixture catalog
const PORT = 42264;
const ci = process.env.CI !== undefined;

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: ci ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}/yosano-akiko/`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
  webServer: {
    command: `npx vite dev --port ${PORT} --strictPort`,
    env: { AKIKO_E2E: "1" },
    url: `http://localhost:${PORT}/yosano-akiko/`,
    reuseExistingServer: !ci,
  },
});
