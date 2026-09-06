import { defineConfig, devices } from '@playwright/test'

// run.sh detects the project's dev server URL and exports BASE_URL before this
// config loads; the fallback is Astro's default dev port.
const BASE_URL = process.env.BASE_URL || 'http://localhost:4321'

export default defineConfig({
  testDir: './tests/e2e/specs',
  fullyParallel: false,
  // The e2e suite provisions and mutates shared records, so specs must not race.
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { outputFolder: 'tests/e2e/reports', open: 'never' }], ['list']],
  use: {
    baseURL: BASE_URL,
    locale: 'fr-CH',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  // The dev server (port 4330) and PocketBase are started by tests/e2e/run.sh,
  // not by Playwright: Astro 7 daemonizes `astro dev`, which Playwright's
  // webServer treats as an early exit. Always run the suite via `pnpm test:e2e`.
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
