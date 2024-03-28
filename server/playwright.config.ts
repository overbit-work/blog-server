import { defineConfig, devices } from "@playwright/test";
import { randomUUID } from "crypto";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

process.env.TEST_RUN_ID = process.env.TEST_RUN_ID ?? randomUUID().split("-")[0];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/integration",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? "github" : "list",
  projects: [
    {
      name: "global setup",
      testMatch: /global\.setup\.ts/,
      teardown: "global cleanup",
    },
    {
      name: "global cleanup",
      testMatch: /global\.teardown\.ts/,
    },
    {
      name: "integration",
      testMatch: /integration/,
      dependencies: ["global setup"],
    },
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    // All requests we send go to this API endpoint.
    baseURL: process.env.INTEGRATION_TEST_BASE_URL ?? "http://localhost:3000",
    extraHTTPHeaders: {},
  },
});
