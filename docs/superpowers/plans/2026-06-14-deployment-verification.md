# Deployment Verification Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Playwright suite (plus a build-emitted `version.json`) that verifies the live GitHub Pages deployment is healthy and serves the exact current commit, run automatically as a post-deploy CI gate.

**Architecture:** The build writes `public/version.json` = `{ version, commit, buildDate }` (Vite copies it into `dist/`). A Playwright test suite, parameterized by `DEPLOY_URL`/`EXPECTED_COMMIT` env vars, hits the live (or preview) site and asserts freshness (commit match), app health, version surfacing, and PWA assets. A new CI `verify` job runs it after deploy.

**Tech Stack:** Node ESM script, `@playwright/test` (chromium), GitHub Actions, Vite + vite-plugin-pwa. The app's own build uses `tsc -b`; the Playwright config/tests live outside the tsconfig includes and are transpiled by Playwright, so they don't affect `npm run build`.

---

## File Structure

- `scripts/gen-version.mjs` — new. Writes `public/version.json` before the Vite build.
- `public/version.json` — generated, gitignored.
- `playwright.config.ts` — new. Remote-target config (no webServer), baseURL from env.
- `tests/deploy.spec.ts` — new. The deployment assertions.
- `package.json` — `build` script prepends gen-version; add `verify:deploy`; add `@playwright/test` devDep.
- `.gitignore` — ignore `public/version.json`, `test-results/`, `playwright-report/`.
- `.github/workflows/deploy.yml` — `deploy` job outputs `page_url`; new `verify` job.

**Important URL note:** GitHub Pages serves this project under the sub-path `/dkv-shotokan-pruefung/`, and `page_url` ends with a trailing slash. All test navigations/requests therefore use **relative** paths with **no leading slash** (e.g. `'version.json'`, `'#/'`), so `new URL(path, baseURL)` keeps the sub-path. A leading slash would drop it.

---

## Task 1: Emit `version.json` at build time

**Files:**
- Create: `scripts/gen-version.mjs`
- Modify: `package.json` (build script)
- Modify: `.gitignore`

- [ ] **Step 1: Create `scripts/gen-version.mjs`**

```js
import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

function commit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA
  try {
    return execSync('git rev-parse HEAD', { cwd: root }).toString().trim()
  } catch {
    return 'unknown'
  }
}

const data = {
  version: pkg.version,
  commit: commit(),
  buildDate: new Date().toISOString().slice(0, 10),
}

mkdirSync(join(root, 'public'), { recursive: true })
writeFileSync(join(root, 'public', 'version.json'), JSON.stringify(data, null, 2) + '\n')
console.log('Wrote public/version.json', data)
```

- [ ] **Step 2: Prepend gen-version to the `build` script in `package.json`**

Change the `"build"` script from:

```json
    "build": "tsc -b && vite build",
```

to:

```json
    "build": "node scripts/gen-version.mjs && tsc -b && vite build",
```

- [ ] **Step 3: Gitignore the generated file**

Append to `.gitignore` (after the `.vite` / `*.tsbuildinfo` lines, before the logs section is fine):

```
# generated deploy manifest + e2e artifacts
public/version.json
test-results/
playwright-report/
```

- [ ] **Step 4: Generate it and verify the contents**

Run: `node scripts/gen-version.mjs && cat public/version.json`
Expected: a JSON object with `version` (e.g. `1.0.0`), a 40-hex `commit`, and today's `buildDate`.

- [ ] **Step 5: Build and confirm it lands in dist**

Run: `npm run build && cat dist/version.json`
Expected: build passes; `dist/version.json` exists with the same shape (Vite copied it from `public/`).

- [ ] **Step 6: Commit**

```bash
git add scripts/gen-version.mjs package.json .gitignore
git commit -m "build: emit public/version.json (version, commit, buildDate)"
```

---

## Task 2: Playwright setup

**Files:**
- Modify: `package.json` (devDep + `verify:deploy` script)
- Create: `playwright.config.ts`

- [ ] **Step 1: Install Playwright + the chromium browser**

Run:
```bash
npm install -D @playwright/test
npx playwright install chromium
```
Expected: `@playwright/test` added to `devDependencies`; chromium downloaded.

- [ ] **Step 2: Add the `verify:deploy` script to `package.json`**

In `"scripts"`, add:

```json
    "verify:deploy": "playwright test",
```

(Place it after `"preview"`; keep the others unchanged.)

- [ ] **Step 3: Create `playwright.config.ts`**

```ts
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
```

- [ ] **Step 4: Sanity-check the config loads**

Run: `npx playwright test --list`
Expected: it prints "No tests found" (the `tests/` dir is empty until Task 3) without a config error. (If it errors that no tests exist, that's still fine — the point is the config parsed.)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json playwright.config.ts
git commit -m "test: add Playwright (chromium) + verify:deploy script"
```

---

## Task 3: Deployment test spec

**Files:**
- Create: `tests/deploy.spec.ts`

- [ ] **Step 1: Create `tests/deploy.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

const EXPECTED_COMMIT = process.env.EXPECTED_COMMIT

test.describe('deployment', () => {
  test('serves version.json for the expected build', async ({ request }) => {
    if (EXPECTED_COMMIT) {
      // Ride out Pages/CDN propagation: poll until the live commit matches.
      await expect
        .poll(
          async () => {
            const res = await request.get('version.json')
            if (!res.ok()) return null
            return (await res.json()).commit
          },
          { timeout: 90_000, intervals: [2_000, 5_000, 10_000] },
        )
        .toBe(EXPECTED_COMMIT)
    } else {
      const res = await request.get('version.json')
      expect(res.ok()).toBeTruthy()
      const json = await res.json()
      expect(json.commit).toMatch(/^[0-9a-f]{40}$/)
      expect(typeof json.version).toBe('string')
      expect(json.version.length).toBeGreaterThan(0)
    }
  })

  test('home page renders grades', async ({ page }) => {
    await page.goto('#/')
    await expect(page.locator('.grade-card').first()).toBeVisible()
    await expect(page.getByText('9. Kyu').first()).toBeVisible()
  })

  test('Einstellung surfaces the app version', async ({ page, request }) => {
    const json = await (await request.get('version.json')).json()
    await page.goto('#/info')
    const versionLine = page.locator('.app-version')
    await expect(versionLine).toBeVisible()
    await expect(versionLine).toContainText('Version')
    await expect(versionLine).toContainText(String(json.version))
  })

  test('PWA assets are served', async ({ request }) => {
    const manifest = await request.get('manifest.webmanifest')
    expect(manifest.status()).toBe(200)
    const m = await manifest.json()
    expect(String(m.name)).toContain('Shotokan')

    const sw = await request.get('sw.js')
    expect(sw.status()).toBe(200)
  })
})
```

- [ ] **Step 2: Build + preview, then run the suite against localhost**

Run (in one shell):
```bash
npm run build
npm run preview &
sleep 2
DEPLOY_URL=http://localhost:4173/ npm run verify:deploy
kill %1
```
Expected: all 4 tests pass (the `version.json` test takes the non-`EXPECTED_COMMIT` branch and validates a 40-hex commit; home renders `.grade-card` + "9. Kyu"; Einstellung shows the version; manifest + sw.js are 200).

- [ ] **Step 3: Commit**

```bash
git add tests/deploy.spec.ts
git commit -m "test: deployment verification suite (freshness, app health, PWA assets)"
```

---

## Task 4: CI post-deploy gate

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Expose `page_url` as a `deploy` job output**

In `.github/workflows/deploy.yml`, change the `deploy` job header so it declares an output. Replace:

```yaml
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

with:

```yaml
  deploy:
    needs: build
    runs-on: ubuntu-latest
    outputs:
      page_url: ${{ steps.deployment.outputs.page_url }}
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Add the `verify` job**

Append this job at the end of the `jobs:` map in `.github/workflows/deploy.yml` (same indentation as `build` and `deploy`):

```yaml
  verify:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run verify:deploy
        env:
          DEPLOY_URL: ${{ needs.deploy.outputs.page_url }}
          EXPECTED_COMMIT: ${{ github.sha }}
```

- [ ] **Step 3: Validate the workflow YAML**

Run: `node -e "const fs=require('node:fs');const s=fs.readFileSync('.github/workflows/deploy.yml','utf8');if(!/^\s{2}verify:/m.test(s)||!/page_url:/.test(s)){throw new Error('verify job or page_url output missing')}console.log('workflow has verify job + page_url output')"`
Expected: prints the success line. (Confirms structure; full execution is verified by the next push.)

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: verify the live deployment matches the pushed commit"
```

---

## Task 5: Manual verification

**Files:** none.

- [ ] **Step 1: Clean local run end-to-end**

Run:
```bash
npm run build
npm run preview &
sleep 2
DEPLOY_URL=http://localhost:4173/ npm run verify:deploy
kill %1
```
Expected: 4 passed.

- [ ] **Step 2: Negative freshness check (optional, ~90s)**

Run:
```bash
npm run preview &
sleep 2
DEPLOY_URL=http://localhost:4173/ EXPECTED_COMMIT=0000000000000000000000000000000000000000 npm run verify:deploy
kill %1
```
Expected: the `version.json` freshness test FAILS after the poll timeout (proving the commit gate works); the other three tests pass.

- [ ] **Step 3: Confirm git status is clean of generated files**

Run: `git status --porcelain`
Expected: no `public/version.json`, `test-results/`, or `playwright-report/` show up (they are gitignored).

- [ ] **Step 4: Post-merge live check**

After this lands on `main` and the workflow runs: confirm the `verify` job passes in the Actions run for that commit (it polls the live `version.json` until it equals the pushed `github.sha`).

---

## Self-Review Notes

- **Spec coverage:** version.json emission + build wiring + gitignore (T1); Playwright dep/config + verify:deploy script (T2); the four assertion groups — freshness (commit match w/ poll + local fallback), app health, version surfacing, PWA assets (T3); deploy `page_url` output + verify job with `DEPLOY_URL`/`EXPECTED_COMMIT` (T4); local + negative + post-merge verification (T5). All spec sections mapped.
- **Consistency:** `version.json` keys `{ version, commit, buildDate }` written in T1 are exactly the keys read in T3. `DEPLOY_URL`/`EXPECTED_COMMIT` env names match between the config (T2), tests (T3), and CI (T4). CI `EXPECTED_COMMIT: github.sha` matches the `GITHUB_SHA` baked into `version.json` by gen-version during the build job.
- **Sub-path safety:** all test paths are relative (no leading slash), preserving the `/dkv-shotokan-pruefung/` Pages sub-path; called out in File Structure and the config comment.
- **No placeholders:** every code/command step is complete; the YAML edits quote exact before/after blocks.
```
