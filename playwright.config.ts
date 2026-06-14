import { defineConfig, devices } from '@playwright/test'

// Hermetic interaction tests: serve the production preview of an existing build
// and drive it. The webServer only previews (it does NOT build) — the build is a
// prerequisite, produced by `pretest:e2e` locally or an explicit build step in
// CI, so the same dist is built once and reused. Deploy smoke tests live in
// playwright.deploy.config.ts.
export default defineConfig({
  testDir: 'tests',
  testIgnore: ['**/deploy.spec.ts'],
  retries: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173/',
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
