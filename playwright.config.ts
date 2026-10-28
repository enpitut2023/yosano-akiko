import { defineConfig, devices } from "@playwright/test";

// Not the dev server's port, so both can run at once
const PORT = 42264;
// Pinned so the deploy workflow's BASE_PATH doesn't move the test build
const BASE_PATH = "/yosano-akiko";
const url = `http://localhost:${PORT}${BASE_PATH}/`;
const ci = process.env.CI !== undefined;

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: ci ? "github" : "list",
  use: {
    baseURL: url,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
  webServer: {
    // Tests run against the production build, built fresh every run so a
    // leftover server can't serve stale code
    command: `npx vite build && npx vite preview --port ${PORT} --strictPort`,
    env: { AKIKO_E2E: "1", BASE_PATH },
    url,
    reuseExistingServer: false,
  },
});
