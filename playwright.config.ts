import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT || 3100);
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${PORT}`;

/**
 * E2E against a local Next server only.
 * Never point PLAYWRIGHT_BASE_URL at production with destructive seeds.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "qa-reports/playwright-html" }],
    ["json", { outputFile: "qa-reports/playwright-results.json" }],
  ],
  outputDir: "qa-reports/test-results",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "en-US",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `npm run start -- -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
  projects: [
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "iphone-viewport",
      use: {
        ...devices["iPhone 13"],
        // True WebKit needs host deps; Chromium + iPhone viewport covers layout/touch sizing.
        browserName: "chromium",
      },
    },
    {
      name: "tablet-viewport",
      use: { ...devices["iPad Pro 11"] },
    },
  ],
});
