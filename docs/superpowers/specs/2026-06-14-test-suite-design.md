# Test Suite — Design

**Date:** 2026-06-14
**Status:** Approved (design); ready for implementation plan
**Scope:** Add a unit-test suite (Vitest + Testing Library) targeting ~80% line coverage (report-only), and extend the existing Playwright e2e suite to cover every interactive button, running hermetically against a local preview.

## Goals

1. **Unit tests** for the app's logic and UI, aiming at **~80% line coverage** of `src/`. Coverage is **reported, not gated** (no threshold that fails the run).
2. **E2E tests** exercising **every button/interactive control** in the app, run against a **local production preview** (hermetic), not the live deployment.

## Non-goals

- No CI pipeline changes (GitHub Actions) — out of scope.
- No changes to application source/behavior. Tests may require tiny, behavior-preserving seams only if unavoidable; none are currently anticipated.
- The deploy smoke tests (`deploy.spec.ts`) keep targeting live GitHub Pages.

## Current state

- No unit-test runner. Vite 5 + React 18 + TypeScript, `HashRouter` mounted in `src/main.tsx` (so `App` itself contains no Router).
- Playwright already present (`@playwright/test`), `tests/` dir, `testDir: 'tests'`, baseURL defaults to live Pages (override via `DEPLOY_URL`). Existing specs: `deploy.spec.ts` (deploy/PWA smoke, some tests need the live URL), `grade-nav.spec.ts` (prev/next belt nav).
- `__APP_VERSION__` / `__BUILD_DATE__` are injected by vite `define` (vite.config.ts). `virtual:pwa-register/react` is a virtual module from vite-plugin-pwa, imported by `src/useAppUpdate.ts`.
- `tsc -b` (via `npm run build`) compiles `src` through `tsconfig.app.json`.

## Part A — Unit tests (Vitest + Testing Library)

### Tooling (new devDependencies)
`vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`.

### Config & wiring
- **`vitest.config.ts`** (separate from vite.config.ts to avoid pulling in the PWA plugin):
  - `plugins: [react()]`
  - `test.environment = 'jsdom'`, `test.globals = true`, `test.setupFiles = ['./src/test/setup.ts']`
  - `test.include = ['src/**/*.test.{ts,tsx}']` (keeps Vitest away from Playwright's `tests/*.spec.ts`)
  - `define: { __APP_VERSION__: '"test"', __BUILD_DATE__: '"2026-01-01"' }` (otherwise `SettingsPage` throws on the undefined globals)
  - `resolve.alias`: map `'virtual:pwa-register/react'` → `./src/test/stubs/pwa-register.ts` so the virtual module resolves under Vitest
  - `test.coverage`: `provider: 'v8'`, `reporter: ['text', 'html']`, **no `thresholds`** (report-only), `include: ['src/**']`, `exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/test/**', '**/*.test.*', 'src/**/*.d.ts']`
- **`src/test/setup.ts`** — `import '@testing-library/jest-dom'`.
- **`src/test/stubs/pwa-register.ts`** — a controllable stub exporting `useRegisterSW` whose behavior tests can drive (see useAppUpdate tests). Default export shape matches what `useAppUpdate` destructures: `{ needRefresh: [boolean, setter], updateServiceWorker: fn, ... }` and invokes `onRegisteredSW`/`onRegisterError` callbacks as configured per test.
- **`tsconfig.app.json`** — add `exclude` for `src/**/*.test.ts`, `src/**/*.test.tsx`, `src/test/**` so the production build (`tsc -b`) does not compile test files or require test-only types.
- **`tsconfig.vitest.json`** — extends `tsconfig.app.json`, adds `types: ['vitest/globals', '@testing-library/jest-dom']` and includes the test files, so editors/`lint` see correct types. (Vitest itself runs via esbuild and does not typecheck.)
- **`package.json` scripts:** `"test": "vitest run"`, `"test:watch": "vitest"`, `"coverage": "vitest run --coverage"`.

### Test helper
- **`src/test/render.tsx`** — a `renderWithRouter(ui, { route })` wrapper using `MemoryRouter` (initialEntries) from react-router-dom, for components that use Links/routing hooks. Re-exports Testing Library where convenient.

### Unit test files (co-located as `*.test.ts(x)`)

1. **`src/belt.test.ts`** — `beltContrast`:
   - Returns dark ink `#1f2937` + `isLight:true` for bright belts (white `#f5f5f5`, yellow, orange `#f97316`, green `#16a34a`).
   - Returns white ink `#ffffff` + `isLight:false` for dark belts (blue `#2563eb`, brown `#92400e`, black `#1f2937`).
   - Handles hex with/without leading `#`.

2. **`src/kihon.test.ts`** — the parser is the densest logic; cover:
   - `groupSteps`: single group when no counts; new group at each step carrying a `count`; appends countless steps to current group.
   - `parseKihon`: basic stance+dir+text; default `5×` vs explicit counts; sub-group split on `", 2 × …"`; the `3× rechts` case is NOT split; parenthetical masking (separators inside `(...)` not split); notes extraction; `none` direction for `/` (ohne Schritt). Use representative real items from `grades.ts` plus crafted edge inputs.

3. **`src/data/grades.test.ts`**:
   - `getGrade` returns the grade for a valid id and `undefined` for an unknown id.
   - `getAdjacentGrades`: `9-kyu` has no prev; `8-dan` has no next; a middle grade (`5-kyu`) returns correct neighbors; unknown id returns `{}`.
   - `grades` length is 17; `kyuGrades` (9) + `danGrades` (8) partition it; ids are unique; every grade has `id/title/belt/beltColor/group`.

4. **`src/useTheme.test.ts`** (jsdom; mock `window.matchMedia`):
   - `initialMode` reads a stored `'light'|'dark'|'system'`, defaults to `'system'` for missing/garbage.
   - `setMode` persists to `localStorage` and sets `document.documentElement[data-theme]`.
   - `'system'` mode applies `dark`/`light` based on the media query and updates `theme-color` meta.

5. **`src/useAppUpdate.test.ts`** (drive the `pwa-register` stub):
   - `needRefresh` true ⇒ `status` becomes `'available'`.
   - `onRegisterError` ⇒ `'error'`.
   - `checkForUpdate` with no registration ⇒ `'error'`.
   - `checkForUpdate` with a registration that resolves to `reg.waiting` ⇒ `'available'`; without waiting ⇒ `'current'`.
   - `applyUpdate` calls `updateServiceWorker(true)`.

6. **`src/components/Belt.test.tsx`** — renders a swatch using the grade's `beltColor`; applies an outline class/style when `beltOutline` is set.

7. **`src/pages/HomePage.test.tsx`** (renderWithRouter):
   - Renders grade cards (e.g. `9. Kyu` present).
   - Typing a query filters grades; a query matching a glossary term surfaces it; a no-match query shows the empty state.

8. **`src/pages/GlossaryPage.test.tsx`** — renders category sections; search filters by term/meaning; no-match shows `Keine Treffer`.

9. **`src/pages/SettingsPage.test.tsx`** — pass a controlled `update` prop:
   - Three theme buttons render; clicking one sets `aria-pressed` and persists the mode.
   - Update area reflects each status: `idle` → "Nach Updates suchen"; `checking` → disabled "Suche …"; `available` → "Update installieren" (click calls `applyUpdate`); `current` → "✓ Auf dem neuesten Stand"; `error` → "Prüfung nicht möglich.". Clicking "Nach Updates suchen" calls `checkForUpdate`.
   - Version line shows `Version test`.

10. **`src/pages/GradeDetailPage.test.tsx`** (renderWithRouter at `/grade/:id`) — the highest-value renderer coverage:
    - **Thread layout** (e.g. `6-kyu` Kihon-Ippon): renders `.kumite-thread`, numbered `Tori · Angriff 1`, Uke bubbles.
    - **Free-defense layout** (e.g. `2-kyu` Jiyu): renders `.kumite-free`, a Tori attack `<ol>`, the Uke "frei" box.
    - **Pure layout** (e.g. `1-dan`): chips only, no `.kumite-thread`/`.kumite-free`/setup strip.
    - Setup strip appears for forms with Ausgangsstellung/Bewegung; Kihon table, Kata chips, Bunkai text render where present.
    - Unknown id renders the "Grad nicht gefunden" fallback with a back link.

11. **`src/App.test.tsx`** (wrap `App` in `MemoryRouter`):
    - Default route shows the home title; `/glossar` and `/info` set the app-bar title/subtitle; a `/grade/:id` route shows the belt-tinted header and a back button; an unknown path renders Home.

### Coverage expectation
Importing the data modules covers their (mostly literal) lines; the page/component RTL tests cover the bulk of the JSX; the logic/hook tests cover branches. Together this comfortably exceeds 80% lines. After the suite is written, run `npm run coverage`; if any file drags the total under ~80%, add targeted cases (this is an explicit plan step). Report-only — the run never fails on coverage.

## Part B — E2E (Playwright, hermetic local preview)

### Config split
- **`playwright.config.ts`** (interaction tests, hermetic):
  - `testDir: 'tests'`, `testIgnore: ['**/deploy.spec.ts']`.
  - `use.baseURL = 'http://localhost:4173/'`.
  - `webServer: { command: 'npm run build && npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173/', reuseExistingServer: !process.env.CI, timeout: 120_000 }`.
  - Keep `chromium` project, `retries: 2`, `reporter: 'list'`.
- **`playwright.deploy.config.ts`** (new): `testDir: 'tests'`, `testMatch: ['**/deploy.spec.ts']`, `use.baseURL = process.env.DEPLOY_URL ?? 'https://tbudich.github.io/dkv-shotokan-pruefung/'`, no webServer. This preserves the existing live deploy verification.
- **Scripts:** `"test:e2e": "playwright test"` (hermetic), `"verify:deploy": "playwright test -c playwright.deploy.config.ts"` (live; replaces the old meaning).
- `grade-nav.spec.ts` now runs under the hermetic config (an improvement — no deploy dependency). Its assertions are unchanged.

### New e2e specs (in `tests/`, `*.spec.ts`)

- **`navigation.spec.ts`** — tab bar: clicking **Gürtel**, **Glossar**, **Einstellung** routes to `/`, `/glossar`, `/info` and updates the app-bar title; the **back ‹** button on a grade detail returns to the overview; active-tab indication (`aria-current`/active class) is correct.
- **`home.spec.ts`** — every one of the **17 grade cards** (parametrized over the known id list) navigates to its `/grade/:id` detail with the right title; the **search input** filters the visible cards and shows the empty state for a no-match query.
- **`glossary.spec.ts`** — the **search input** filters entries and shows `Keine Treffer` for a no-match query.
- **`settings.spec.ts`** — the **three theme buttons** (Hell/Dunkel/System) each set `data-theme` on `<html>` (and persist across reload via localStorage); the **update buttons** best-effort: click **"Nach Updates suchen"** and assert it leaves the `checking` state for a terminal label (`Auf dem neuesten Stand` / `Update installieren` / `Prüfung nicht möglich`), tolerant of SW timing; if an update is offered, assert **"Update installieren"** is present. These are marked tolerant (no hard dependency on a specific SW outcome).

### Button coverage matrix (for review)
| Control | Covered by |
| --- | --- |
| Tab: Gürtel / Glossar / Einstellung | navigation.spec |
| App-bar back ‹ | navigation.spec |
| 17 grade cards | home.spec |
| Home search input | home.spec |
| Glossary search input | glossary.spec |
| Theme buttons (Hell/Dunkel/System) | settings.spec + SettingsPage.test |
| Nach Updates suchen / Update installieren | settings.spec (best-effort) + SettingsPage.test + useAppUpdate.test |
| Prev/next grade nav | grade-nav.spec (existing) |

## Verification
- `npm run test` (or `vitest run`) — unit suite green.
- `npm run coverage` — prints coverage; confirm ~80%+ lines (report-only).
- `npm run build` — production build still green (test files excluded from `tsc -b`).
- `npm run test:e2e` — hermetic Playwright suite green against the local preview.
- `npm run lint` (`tsc --noEmit`) stays green.

## Risks / notes
- The hermetic `webServer` does a full `build` per run (slower); acceptable, and `reuseExistingServer` avoids rebuilds during local iteration.
- The update-button e2e is inherently timing-dependent; kept tolerant and backed by deterministic unit tests so coverage of that logic does not rely on e2e.
- If `tsc -b` picks up test files despite excludes (project-reference quirk), the fallback is a dedicated `tsconfig` that the build references; the plan verifies `npm run build` stays green.
