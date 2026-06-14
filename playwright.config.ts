import { defineConfig, devices } from '@playwright/test'

// Hermetic interaction tests: build the app and serve the production preview
// locally, then drive it. Deploy smoke tests live in playwright.deploy.config.ts.
export default defineConfig({
  testDir: 'tests',
  testIgnore: ['**/deploy.spec.ts'],
  retries: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173/',
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
