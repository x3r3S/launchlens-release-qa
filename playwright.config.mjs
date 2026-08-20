import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "line",
  outputDir: ".artifacts/playwright",
  use: {
    baseURL: "http://127.0.0.1:4317",
    browserName: "chromium",
    colorScheme: "light",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: process.env.CAPTURE_PROOF ? "on" : "off"
  },
  projects: [
    { name: "chromium-wide", use: { viewport: { width: 1440, height: 900 } } },
    { name: "chromium-mobile-390", use: { viewport: { width: 390, height: 844 } } }
  ],
  webServer: {
    command: "node scripts/serve.mjs",
    port: 4317,
    env: { PORT: "4317" },
    reuseExistingServer: false,
    timeout: 15_000
  }
});
