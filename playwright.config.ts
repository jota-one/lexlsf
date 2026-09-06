import { defineConfig, devices } from '@playwright/test'

// tests/e2e/.env is sourced by tests/e2e/run.sh before this config loads.
const BASE_URL = process.env.BASE_URL || 'http://localhost:4330'

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
  // Astro is started on a dedicated port (4330) so it never clashes with a dev
  // server already running on 4321. PocketBase must be started separately
  // (pnpm db) — the tests talk to it at PB_URL.
  webServer: {
    command: 'pnpm dev --port 4330',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
