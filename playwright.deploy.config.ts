import { defineConfig, devices } from '@playwright/test'

// Deploy verification against the live (or DEPLOY_URL-overridden) site.
const DEPLOY_URL =
  process.env.DEPLOY_URL ?? 'https://tbudich.github.io/dkv-shotokan-pruefung/'

export default defineConfig({
  testDir: 'tests',
  testMatch: ['**/deploy.spec.ts'],
  retries: 2,
  reporter: 'list',
  use: {
    baseURL: DEPLOY_URL,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
