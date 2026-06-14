import { defineConfig, devices } from '@playwright/test'

// Defaults to the live GitHub Pages URL; override with DEPLOY_URL for a local
// preview (e.g. http://localhost:4173/). The trailing slash matters: tests use
// relative paths so the Pages sub-path is preserved.
const DEPLOY_URL =
  process.env.DEPLOY_URL ?? 'https://tbudich.github.io/dkv-shotokan-pruefung/'

export default defineConfig({
  testDir: 'tests',
  retries: 2,
  reporter: 'list',
  use: {
    baseURL: DEPLOY_URL,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
