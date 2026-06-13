# Deployment Verification Suite — Design

Date: 2026-06-14

## Goal

Provide an automated way to confirm the live GitHub Pages deployment is healthy and
serves the expected (current) build — catching genuine stale or broken deploys
(distinct from a client-side service-worker cache showing an old version).

## Decisions (from brainstorming)

- **Tooling:** Playwright E2E (`@playwright/test`, chromium only).
- **Freshness:** exact git-commit match via a build-emitted `version.json`.
- **CI:** a post-deploy gate job that fails the workflow if the live site is not the
  just-deployed commit (or assets are missing).

## Feature 1 — Build emits `version.json`

- New `scripts/gen-version.mjs` (plain Node ESM, not typechecked by `tsc`).
  - Resolves the commit: `process.env.GITHUB_SHA` if set (CI), else
    `execSync('git rev-parse HEAD')` trimmed.
  - Writes `public/version.json`:
    ```json
    { "version": "<package.json version>", "commit": "<sha>", "buildDate": "<YYYY-MM-DD>" }
    ```
  - Reads the version from `package.json`; `buildDate` is `new Date().toISOString().slice(0,10)`.
- Vite copies `public/` into `dist/`, so the deployed site serves `/version.json`.
- `package.json` `build` script becomes:
  `node scripts/gen-version.mjs && tsc -b && vite build`.
- `.gitignore` adds `public/version.json` (generated, never committed).

## Feature 2 — Playwright suite

- Add `@playwright/test` as a devDependency.
- `playwright.config.ts`:
  - Single `chromium` project.
  - `use.baseURL = process.env.DEPLOY_URL ?? 'https://tbudich.github.io/dkv-shotokan-pruefung/'`.
  - `testDir: 'tests'`. No webServer (tests hit a remote/preview URL).
  - `retries: 2` to absorb transient network flakiness.
- `tests/deploy.spec.ts` — assertions:
  1. **Freshness:** GET `version.json` (via Playwright `request`). Parse JSON.
     - If `process.env.EXPECTED_COMMIT` is set: `expect.poll(fetch commit, { timeout: 90_000, intervals: [...] })` until `json.commit === EXPECTED_COMMIT` — rides out Pages/CDN propagation.
     - Else: assert `json.commit` matches `/^[0-9a-f]{40}$/` and `json.version` is a non-empty string.
  2. **App health:** navigate `/#/`; assert at least one `.grade-card` is visible and the text `9. Kyu` appears.
  3. **Feature presence / version surfaced:** navigate `/#/info`; assert `.app-version` is visible, contains `Version`, and contains the `version` from `version.json`.
  4. **PWA assets:** GET `manifest.webmanifest` → status 200, JSON parses, `name` contains `Shotokan`. GET `sw.js` → status 200.
- New script: `"verify:deploy": "playwright test"`.

The suite is parameterized by env, so it runs against the live site by default, or a
local `npm run preview` by setting `DEPLOY_URL=http://localhost:4173/`.

## Feature 3 — CI post-deploy gate

In `.github/workflows/deploy.yml`:
- The `deploy` job exposes the Pages URL as a job output:
  `outputs: page_url: ${{ steps.deployment.outputs.page_url }}`.
- New `verify` job:
  - `needs: deploy`.
  - `runs-on: ubuntu-latest`.
  - Steps: checkout; `setup-node@v4` (node 22, npm cache); `npm ci`;
    `npx playwright install --with-deps chromium`; run
    `npm run verify:deploy` with env
    `DEPLOY_URL: ${{ needs.deploy.outputs.page_url }}` and
    `EXPECTED_COMMIT: ${{ github.sha }}`.
  - If verification fails, the job (and the workflow run) fails.

## Out of scope

- No change to how the Einstellung card sources its version (keeps compile-time
  `__APP_VERSION__`/`__BUILD_DATE__`). `version.json` is a separate machine-readable
  deploy manifest that additionally carries the commit.
- No unit tests for app components; this suite verifies the *deployment*, not internal logic.
- No visual-regression / screenshot testing.

## Constraints & notes

- `gen-version.mjs` must run before `vite build` so `public/version.json` exists when
  Vite copies the public dir. The combined `build` script guarantees ordering.
- The freshness poll timeout (90s) covers normal Pages propagation; if a deploy is
  genuinely stale/broken the job fails after the timeout with a clear diff
  (expected vs live commit).
- Playwright browser install in CI is chromium-only to keep the job fast.
- `.gitignore` also ignores Playwright's `test-results/` and `playwright-report/`.

## Verification (of this suite itself)

- `node scripts/gen-version.mjs` writes a valid `public/version.json`; `npm run build`
  produces `dist/version.json` with the current commit.
- `npm run build && npm run preview`, then
  `DEPLOY_URL=http://localhost:4173/ npm run verify:deploy` → all checks pass locally.
- Pushing to `main` runs the deploy then the verify job; a deliberately wrong
  `EXPECTED_COMMIT` (sanity test) makes the freshness check fail as expected.
