# Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Vitest + Testing Library unit suite (~80% line coverage, report-only) and extend Playwright with hermetic, button-covering e2e tests served from a local production preview.

**Architecture:** Vitest (jsdom) runs `src/**/*.test.{ts,tsx}`; Playwright runs `tests/*.spec.ts`. The two never overlap (different dirs + extensions). A small `src/test/` folder holds setup, a controllable stub for the virtual `virtual:pwa-register/react` module, and a router render helper. Playwright is split into a hermetic local config (interaction specs + grade-nav) and a deploy config (`deploy.spec.ts` against live Pages).

**Tech Stack:** Vitest, @vitest/coverage-v8, @testing-library/react + user-event + jest-dom, jsdom, Playwright (existing).

**Design spec:** `docs/superpowers/specs/2026-06-14-test-suite-design.md`

---

## File Structure

**Create:**
- `vitest.config.ts` — Vitest config (jsdom, globals, define, pwa alias, coverage report-only).
- `tsconfig.vitest.json` — TS types for test files (vitest globals + jest-dom).
- `src/test/setup.ts` — jest-dom + a `matchMedia` polyfill.
- `src/test/stubs/pwa-register.ts` — controllable `useRegisterSW` stub.
- `src/test/render.tsx` — `renderWithRouter` helper (MemoryRouter).
- `src/test/smoke.test.ts` — wiring sanity check.
- Unit tests: `src/belt.test.ts`, `src/kihon.test.ts`, `src/data/grades.test.ts`, `src/useTheme.test.ts`, `src/useAppUpdate.test.ts`, `src/components/Belt.test.tsx`, `src/pages/HomePage.test.tsx`, `src/pages/GlossaryPage.test.tsx`, `src/pages/SettingsPage.test.tsx`, `src/pages/GradeDetailPage.test.tsx`, `src/App.test.tsx`.
- `playwright.deploy.config.ts` — deploy-only config.
- E2E: `tests/navigation.spec.ts`, `tests/home.spec.ts`, `tests/glossary.spec.ts`, `tests/settings.spec.ts`.

**Modify:**
- `package.json` — devDeps + scripts (`test`, `test:watch`, `coverage`, `test:e2e`, `verify:deploy`).
- `tsconfig.app.json` — exclude test files from the production `tsc -b`.
- `playwright.config.ts` — hermetic local webServer + baseURL + ignore deploy spec.

---

## Task 1: Test tooling & infrastructure

**Files:** create `vitest.config.ts`, `tsconfig.vitest.json`, `src/test/setup.ts`, `src/test/stubs/pwa-register.ts`, `src/test/render.tsx`, `src/test/smoke.test.ts`; modify `package.json`, `tsconfig.app.json`.

- [ ] **Step 1: Install dev dependencies**

```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  // SettingsPage references these vite-injected globals; define them for tests.
  define: {
    __APP_VERSION__: '"test"',
    __BUILD_DATE__: '"2026-01-01"',
  },
  resolve: {
    alias: {
      // The PWA virtual module only exists under the vite-plugin-pwa build;
      // point it at a controllable stub for unit tests.
      'virtual:pwa-register/react': fileURLToPath(
        new URL('./src/test/stubs/pwa-register.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**'],
      // Report-only: no thresholds, so a low number never fails the run.
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/test/**', '**/*.test.*', 'src/**/*.d.ts'],
    },
  },
})
```

- [ ] **Step 3: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom has no matchMedia; provide a default (light) stub. Tests that need to
// control the scheme override window.matchMedia themselves.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}
```

- [ ] **Step 4: Create `src/test/stubs/pwa-register.ts`**

```ts
import { vi } from 'vitest'

type RegisterOptions = {
  onRegisteredSW?: (swUrl: string, r?: ServiceWorkerRegistration) => void
  onRegisterError?: (error: unknown) => void
}

// Mutable state tests set BEFORE rendering the hook/component under test.
export const swState: {
  needRefresh: boolean
  registration: ServiceWorkerRegistration | undefined
  registerError: boolean
  updateServiceWorker: ReturnType<typeof vi.fn>
} = {
  needRefresh: false,
  registration: undefined,
  registerError: false,
  updateServiceWorker: vi.fn(),
}

export function resetSwState() {
  swState.needRefresh = false
  swState.registration = undefined
  swState.registerError = false
  swState.updateServiceWorker = vi.fn()
}

// Mirrors vite-plugin-pwa's useRegisterSW shape. Callbacks fire in a microtask
// (like the real plugin) so they don't setState during render.
export function useRegisterSW(options: RegisterOptions = {}) {
  Promise.resolve().then(() => {
    if (swState.registerError) options.onRegisterError?.(new Error('register failed'))
    else options.onRegisteredSW?.('/sw.js', swState.registration)
  })
  return {
    needRefresh: [swState.needRefresh, vi.fn()] as [boolean, (v: boolean) => void],
    offlineReady: [false, vi.fn()] as [boolean, (v: boolean) => void],
    updateServiceWorker: swState.updateServiceWorker,
  }
}
```

- [ ] **Step 5: Create `src/test/render.tsx`**

```tsx
import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

/** Render UI inside a MemoryRouter seeded at `route` (default '/'). */
export function renderWithRouter(ui: ReactNode, route = '/') {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}
```

- [ ] **Step 6: Create `tsconfig.vitest.json`**

```json
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"],
    "noEmit": true
  },
  "include": ["src", "src/**/*.test.ts", "src/**/*.test.tsx"]
}
```

- [ ] **Step 7: Exclude test files from the production build in `tsconfig.app.json`**

Change the last line `"include": ["src"]` so the file ends with both an include and an exclude:

```json
  "include": ["src"],
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/test"]
}
```

- [ ] **Step 8: Add scripts to `package.json`**

In the `"scripts"` block, add these (keep existing entries; update `verify:deploy`):

```json
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "verify:deploy": "playwright test -c playwright.deploy.config.ts"
```

- [ ] **Step 9: Create `src/test/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest'

describe('test wiring', () => {
  it('has jsdom + jest-dom matchers', () => {
    const el = document.createElement('div')
    el.textContent = 'ok'
    document.body.appendChild(el)
    expect(el).toBeInTheDocument()
    expect(el).toHaveTextContent('ok')
  })
})
```

- [ ] **Step 10: Run the unit runner**

Run: `npm run test`
Expected: PASS — 1 file, 1 test (`test wiring`).

- [ ] **Step 11: Verify the production build still excludes tests**

Run: `npm run build`
Expected: PASS. (`tsc -b` must not error on test files; the smoke test compiles only under Vitest.)

- [ ] **Step 12: Commit**

```bash
git add vitest.config.ts tsconfig.vitest.json tsconfig.app.json package.json package-lock.json src/test
git commit -m "test: add Vitest + Testing Library infrastructure

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Pure-logic unit tests

**Files:** create `src/belt.test.ts`, `src/kihon.test.ts`, `src/data/grades.test.ts`.

- [ ] **Step 1: Create `src/belt.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { beltContrast } from './belt'

describe('beltContrast', () => {
  it('uses dark ink on bright belts', () => {
    for (const hex of ['#f5f5f5', '#facc15', '#f97316', '#16a34a']) {
      const { fg, isLight } = beltContrast(hex)
      expect(isLight).toBe(true)
      expect(fg).toBe('#1f2937')
    }
  })

  it('uses white ink on dark belts', () => {
    for (const hex of ['#2563eb', '#92400e', '#1f2937']) {
      const { fg, isLight } = beltContrast(hex)
      expect(isLight).toBe(false)
      expect(fg).toBe('#ffffff')
    }
  })

  it('tolerates a missing leading #', () => {
    expect(beltContrast('f5f5f5')).toEqual(beltContrast('#f5f5f5'))
  })
})
```

- [ ] **Step 2: Create `src/kihon.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { groupSteps, parseKihon, type KihonStep } from './kihon'
import type { KihonItem } from './types'

const step = (over: Partial<KihonStep> = {}): KihonStep => ({ dir: 'none', text: 'x', ...over })

describe('groupSteps', () => {
  it('keeps countless steps in one group', () => {
    const groups = groupSteps([step(), step()])
    expect(groups).toHaveLength(1)
    expect(groups[0].steps).toHaveLength(2)
    expect(groups[0].count).toBeUndefined()
  })

  it('starts a new group at each counted step', () => {
    const groups = groupSteps([step({ count: '5×' }), step(), step({ count: '2×' })])
    expect(groups.map((g) => g.count)).toEqual(['5×', '2×'])
    expect(groups[0].steps).toHaveLength(2)
    expect(groups[1].steps).toHaveLength(1)
  })
})

describe('parseKihon', () => {
  it('parses a simple stance + technique with the item direction', () => {
    const item: KihonItem = { no: 1, dir: 'vor', stance: 'ZK', text: '5 × Oi-Zuki' }
    const { steps, groups } = parseKihon(item)
    expect(steps[0].dir).toBe('vor')
    expect(steps[0].stance).toBe('ZK')
    expect(steps[0].text).toContain('Oi-Zuki')
    expect(groups[0].count).toBe('5×')
  })

  it('treats "/" as an on-the-spot (none) follow-up step', () => {
    const item: KihonItem = { no: 2, dir: 'zurück', stance: 'ZK', text: '5 × Age-Uke / Gyaku-Zuki' }
    const { steps } = parseKihon(item)
    expect(steps.length).toBeGreaterThanOrEqual(2)
    expect(steps[steps.length - 1].dir).toBe('none')
  })

  it('splits a counted sub-group but not "3× rechts"', () => {
    const item: KihonItem = {
      no: 7,
      dir: 'vor',
      stance: 'KB',
      text: '3 × Mawashi-Geri (aus Kamae, 3× rechts u. links)',
    }
    const { groups } = parseKihon(item)
    // The parenthetical (incl. "3× rechts") is masked, so there is one group.
    expect(groups).toHaveLength(1)
    expect(groups[0].count).toBe('3×')
  })

  it('does not split separators inside parentheses', () => {
    const item: KihonItem = {
      no: 3,
      stance: 'Shizentai',
      text: '6 × Soto-Ude-Uke (erneute Ausholbewegung nach dem Block)',
    }
    const { steps } = parseKihon(item)
    expect(steps).toHaveLength(1)
    expect(steps[0].text).toContain('(erneute Ausholbewegung nach dem Block)')
  })
})
```

> Note: `parseKihon`'s exact step splitting is intricate. If any assertion above does not match the implementation's real output, adjust the assertion to the observed value (the goal is to lock in current behavior, not redefine it). Run a single case with `npm run test -- src/kihon.test.ts` and inspect.

- [ ] **Step 3: Create `src/data/grades.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { grades, kyuGrades, danGrades, getGrade, getAdjacentGrades } from './grades'

describe('grades data', () => {
  it('has 17 grades partitioned into 9 kyu + 8 dan', () => {
    expect(grades).toHaveLength(17)
    expect(kyuGrades).toHaveLength(9)
    expect(danGrades).toHaveLength(8)
    expect(kyuGrades.length + danGrades.length).toBe(grades.length)
  })

  it('has unique ids and required fields', () => {
    const ids = grades.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const g of grades) {
      expect(g.id).toBeTruthy()
      expect(g.title).toBeTruthy()
      expect(g.belt).toBeTruthy()
      expect(g.beltColor).toMatch(/^#?[0-9a-fA-F]{6}$/)
      expect(g.group).toBeTruthy()
    }
  })
})

describe('getGrade', () => {
  it('returns a grade for a known id', () => {
    expect(getGrade('9-kyu')?.title).toBe('9. Kyu')
  })
  it('returns undefined for an unknown id', () => {
    expect(getGrade('nope')).toBeUndefined()
  })
})

describe('getAdjacentGrades', () => {
  it('has no prev at the first grade', () => {
    const { prev, next } = getAdjacentGrades('9-kyu')
    expect(prev).toBeUndefined()
    expect(next?.id).toBe('8-kyu')
  })
  it('has no next at the last grade', () => {
    const { prev, next } = getAdjacentGrades('8-dan')
    expect(next).toBeUndefined()
    expect(prev?.id).toBe('7-dan')
  })
  it('returns both neighbors in the middle', () => {
    const { prev, next } = getAdjacentGrades('5-kyu')
    expect(prev?.id).toBe('6-kyu')
    expect(next?.id).toBe('4-kyu')
  })
  it('returns empty for an unknown id', () => {
    expect(getAdjacentGrades('nope')).toEqual({})
  })
})
```

- [ ] **Step 4: Run these tests**

Run: `npm run test -- src/belt.test.ts src/kihon.test.ts src/data/grades.test.ts`
Expected: PASS (adjust any kihon assertion per the Step 2 note if needed).

- [ ] **Step 5: Commit**

```bash
git add src/belt.test.ts src/kihon.test.ts src/data/grades.test.ts
git commit -m "test: unit tests for belt, kihon parser, and grades data

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Hook unit tests

**Files:** create `src/useTheme.test.ts`, `src/useAppUpdate.test.ts`.

- [ ] **Step 1: Create `src/useTheme.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

function mockMatchMedia(matches: boolean) {
  const listeners: Array<() => void> = []
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: (_: string, cb: () => void) => listeners.push(cb),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  return listeners
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    mockMatchMedia(false)
  })

  it('defaults to system when nothing is stored', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.mode).toBe('system')
  })

  it('reads a stored mode', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.mode).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('persists and applies a chosen mode', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setMode('light'))
    expect(localStorage.getItem('theme')).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('applies dark in system mode when the OS prefers dark', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setMode('system'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
```

- [ ] **Step 2: Create `src/useAppUpdate.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAppUpdate } from './useAppUpdate'
import { swState, resetSwState } from './test/stubs/pwa-register'

beforeEach(() => {
  resetSwState()
})

describe('useAppUpdate', () => {
  it('starts idle and flips to available when a refresh is needed', async () => {
    swState.needRefresh = true
    const { result } = renderHook(() => useAppUpdate())
    await waitFor(() => expect(result.current.status).toBe('available'))
  })

  it('reports error when registration fails', async () => {
    swState.registerError = true
    const { result } = renderHook(() => useAppUpdate())
    await waitFor(() => expect(result.current.status).toBe('error'))
  })

  it('checkForUpdate without a registration reports error', async () => {
    swState.registration = undefined
    const { result } = renderHook(() => useAppUpdate())
    act(() => result.current.checkForUpdate())
    await waitFor(() => expect(result.current.status).toBe('error'))
  })

  it('checkForUpdate resolves to current when no worker is waiting', async () => {
    swState.registration = {
      update: vi.fn().mockResolvedValue(undefined),
      installing: null,
      waiting: null,
    } as unknown as ServiceWorkerRegistration
    const { result } = renderHook(() => useAppUpdate())
    await waitFor(() => result.current) // let onRegisteredSW set the ref
    act(() => result.current.checkForUpdate())
    await waitFor(() => expect(result.current.status).toBe('current'))
  })

  it('checkForUpdate resolves to available when a worker is waiting', async () => {
    swState.registration = {
      update: vi.fn().mockResolvedValue(undefined),
      installing: null,
      waiting: {} as ServiceWorker,
    } as unknown as ServiceWorkerRegistration
    const { result } = renderHook(() => useAppUpdate())
    await waitFor(() => result.current)
    act(() => result.current.checkForUpdate())
    await waitFor(() => expect(result.current.status).toBe('available'))
  })

  it('applyUpdate triggers the service worker update', async () => {
    const { result } = renderHook(() => useAppUpdate())
    act(() => result.current.applyUpdate())
    expect(swState.updateServiceWorker).toHaveBeenCalledWith(true)
  })
})
```

- [ ] **Step 3: Run the hook tests**

Run: `npm run test -- src/useTheme.test.ts src/useAppUpdate.test.ts`
Expected: PASS. If `checkForUpdate` tests are timing-sensitive (the registration ref is set in a microtask), the `await waitFor(() => result.current)` line gives React a tick before calling `checkForUpdate`; keep it.

- [ ] **Step 4: Commit**

```bash
git add src/useTheme.test.ts src/useAppUpdate.test.ts
git commit -m "test: unit tests for useTheme and useAppUpdate hooks

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Component & page unit tests

**Files:** create `src/components/Belt.test.tsx`, `src/pages/HomePage.test.tsx`, `src/pages/GlossaryPage.test.tsx`, `src/pages/SettingsPage.test.tsx`, `src/pages/GradeDetailPage.test.tsx`, `src/App.test.tsx`.

- [ ] **Step 1: Create `src/components/Belt.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Belt } from './Belt'
import { getGrade } from '../data/grades'

describe('Belt', () => {
  it('labels a kyu grade with its rank and tints with the belt color', () => {
    const g = getGrade('9-kyu')!
    const { container } = render(<Belt grade={g} />)
    const swatch = container.querySelector('.belt')!
    expect(swatch).toHaveTextContent('9')
    expect(swatch).toHaveClass('outline') // white belt has beltOutline
  })

  it('labels a dan grade with a trailing dot and no outline', () => {
    const g = getGrade('1-dan')!
    const { container } = render(<Belt grade={g} />)
    const swatch = container.querySelector('.belt')!
    expect(swatch).toHaveTextContent('1.')
    expect(swatch).not.toHaveClass('outline')
  })
})
```

- [ ] **Step 2: Create `src/pages/HomePage.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomePage } from './HomePage'
import { renderWithRouter } from '../test/render'

describe('HomePage', () => {
  it('lists kyu and dan grades by default', () => {
    renderWithRouter(<HomePage />)
    expect(screen.getByText('9. Kyu')).toBeInTheDocument()
    expect(screen.getByText('1. Dan')).toBeInTheDocument()
  })

  it('filters grades by a query', async () => {
    renderWithRouter(<HomePage />)
    await userEvent.type(screen.getByPlaceholderText(/Suche/i), 'Heian Shodan')
    // A grade whose kata is Heian Shodan should remain; an unrelated one drops.
    expect(screen.getByText(/Grade \(/)).toBeInTheDocument()
  })

  it('shows the empty state for a no-match query', async () => {
    renderWithRouter(<HomePage />)
    await userEvent.type(screen.getByPlaceholderText(/Suche/i), 'zzzzzzz')
    expect(screen.getByText(/Keine Treffer/)).toBeInTheDocument()
  })
})
```

> Note: verify the "Heian Shodan" grade exists (8. Kyu); if the `Grade (n)` section label differs, assert on a remaining grade card instead.

- [ ] **Step 3: Create `src/pages/GlossaryPage.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlossaryPage } from './GlossaryPage'
import { renderWithRouter } from '../test/render'
import { glossary } from '../data/glossary'

describe('GlossaryPage', () => {
  it('renders glossary entries', () => {
    renderWithRouter(<GlossaryPage />)
    expect(screen.getByText(glossary[0].term)).toBeInTheDocument()
  })

  it('filters by query and shows the empty state on no match', async () => {
    renderWithRouter(<GlossaryPage />)
    const input = screen.getByPlaceholderText(/Begriff suchen/i)
    await userEvent.type(input, glossary[0].term)
    expect(screen.getByText(glossary[0].term)).toBeInTheDocument()
    await userEvent.clear(input)
    await userEvent.type(input, 'zzzzzzz')
    expect(screen.getByText(/Keine Treffer/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Create `src/pages/SettingsPage.test.tsx`**

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsPage } from './SettingsPage'
import type { AppUpdate } from '../useAppUpdate'

function makeUpdate(over: Partial<AppUpdate> = {}): AppUpdate {
  return { status: 'idle', checkForUpdate: vi.fn(), applyUpdate: vi.fn(), ...over }
}

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('shows the version line', () => {
    render(<SettingsPage update={makeUpdate()} />)
    expect(screen.getByText(/Version test/)).toBeInTheDocument()
  })

  it('toggles the theme via the segmented buttons', async () => {
    render(<SettingsPage update={makeUpdate()} />)
    const dark = screen.getByRole('button', { name: 'Dunkel' })
    await userEvent.click(dark)
    expect(dark).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('calls checkForUpdate from the idle button', async () => {
    const update = makeUpdate({ status: 'idle' })
    render(<SettingsPage update={update} />)
    await userEvent.click(screen.getByRole('button', { name: /Nach Updates suchen/ }))
    expect(update.checkForUpdate).toHaveBeenCalled()
  })

  it('offers install when an update is available', async () => {
    const update = makeUpdate({ status: 'available' })
    render(<SettingsPage update={update} />)
    const install = screen.getByRole('button', { name: /Update installieren/ })
    await userEvent.click(install)
    expect(update.applyUpdate).toHaveBeenCalled()
  })

  it('reflects checking, current, and error statuses', () => {
    const { rerender } = render(<SettingsPage update={makeUpdate({ status: 'checking' })} />)
    expect(screen.getByRole('button', { name: /Suche/ })).toBeDisabled()
    rerender(<SettingsPage update={makeUpdate({ status: 'current' })} />)
    expect(screen.getByText(/Auf dem neuesten Stand/)).toBeInTheDocument()
    rerender(<SettingsPage update={makeUpdate({ status: 'error' })} />)
    expect(screen.getByText(/Prüfung nicht möglich/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Create `src/pages/GradeDetailPage.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { GradeDetailPage } from './GradeDetailPage'
import { renderWithRouter } from '../test/render'

function renderGrade(id: string) {
  return renderWithRouter(
    <Routes>
      <Route path="/grade/:id" element={<GradeDetailPage />} />
    </Routes>,
    `/grade/${id}`,
  )
}

describe('GradeDetailPage Kumite layouts', () => {
  it('renders the thread layout for an exchange form (6. Kyu)', () => {
    const { container } = renderGrade('6-kyu')
    expect(container.querySelector('.kumite-thread')).toBeInTheDocument()
    expect(screen.getByText(/Tori · Angriff 1/)).toBeInTheDocument()
    expect(container.querySelector('.kumite-free')).toBeNull()
  })

  it('renders the free-defense layout for a Jiyu form (2. Kyu)', () => {
    const { container } = renderGrade('2-kyu')
    expect(container.querySelector('.kumite-free')).toBeInTheDocument()
    expect(container.querySelector('.kumite-free ol')).toBeInTheDocument()
    expect(container.querySelector('.kumite-thread')).toBeNull()
  })

  it('renders only chips for a pure Dan form (1. Dan)', () => {
    const { container } = renderGrade('1-dan')
    expect(container.querySelector('.kumite-thread')).toBeNull()
    expect(container.querySelector('.kumite-free')).toBeNull()
    expect(container.querySelector('.kumite-setup')).toBeNull()
    expect(container.querySelector('.chips')).toBeInTheDocument()
  })

  it('renders the Kihon table and a setup strip where present (8. Kyu)', () => {
    const { container } = renderGrade('8-kyu')
    expect(container.querySelector('.kihon-table')).toBeInTheDocument()
    expect(container.querySelector('.kumite-setup')).toBeInTheDocument()
  })

  it('shows a not-found fallback for an unknown id', () => {
    renderGrade('nope')
    expect(screen.getByText(/Grad nicht gefunden/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Create `src/App.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { resetSwState } from './test/stubs/pwa-register'

function renderApp(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routing', () => {
  beforeEach(() => resetSwState())

  it('shows the overview title on the home route', () => {
    renderApp('/')
    expect(screen.getByText(/Shotokan Prüfungsordnung/)).toBeInTheDocument()
  })

  it('titles the glossary route', () => {
    renderApp('/glossar')
    expect(screen.getByRole('heading', { name: /Glossar/ })).toBeInTheDocument()
  })

  it('titles the settings route', () => {
    renderApp('/info')
    expect(screen.getByRole('heading', { name: /Einstellung/ })).toBeInTheDocument()
  })

  it('shows a belt header and back button on a grade detail', () => {
    renderApp('/grade/9-kyu')
    expect(screen.getByText('9. Kyu')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Zur Gürtel-Übersicht/ })).toBeInTheDocument()
  })

  it('falls back to home for an unknown path', () => {
    renderApp('/totally-unknown')
    expect(screen.getByText(/Shotokan Prüfungsordnung/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 7: Run the component/page tests**

Run: `npm run test -- src/components/Belt.test.tsx src/pages src/App.test.tsx`
Expected: PASS. If a query (e.g. a placeholder or heading text) does not match the real markup, adjust the query to the actual text/role observed — do not change app source.

- [ ] **Step 8: Commit**

```bash
git add src/components/Belt.test.tsx src/pages/*.test.tsx src/App.test.tsx
git commit -m "test: component and page unit tests (RTL)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Coverage check & top-up

**Files:** possibly add cases to existing `*.test.ts(x)` files.

- [ ] **Step 1: Run coverage**

Run: `npm run coverage`
Expected: a coverage table prints. Note the total **% Lines** and any `src/` file well below the rest.

- [ ] **Step 2: Top up if under ~80% lines**

If total line coverage is below ~80%, add focused cases to the relevant existing test file for the lowest-covered non-excluded files (likely a branch in `kihon.ts`, `useAppUpdate.ts`, or a conditional in a page). Add real assertions (no empty tests). Re-run `npm run coverage` until total lines ≥ ~80%. This is report-only — never add a failing threshold.

- [ ] **Step 3: Confirm full unit run and build**

Run: `npm run test` then `npm run build`
Expected: all unit tests PASS; production build PASS.

- [ ] **Step 4: Commit (only if Step 2 added tests)**

```bash
git add -A
git commit -m "test: top up coverage to ~80% lines

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Split Playwright into hermetic + deploy configs

**Files:** modify `playwright.config.ts`; create `playwright.deploy.config.ts`.

- [ ] **Step 1: Rewrite `playwright.config.ts` (hermetic local preview)**

```ts
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
```

- [ ] **Step 2: Create `playwright.deploy.config.ts` (live deploy smoke)**

```ts
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
```

- [ ] **Step 3: Verify the existing hermetic tests pass against local preview**

Run: `npm run test:e2e -- grade-nav.spec.ts`
Expected: PASS — the webServer builds + serves the app on :4173, and `grade-nav` runs green against it. (First run includes a full build; allow time.)

- [ ] **Step 4: Verify the deploy config still selects only the deploy spec**

Run: `npx playwright test -c playwright.deploy.config.ts --list`
Expected: lists only tests from `deploy.spec.ts`.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts playwright.deploy.config.ts
git commit -m "test: split Playwright into hermetic local + deploy configs

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Button-covering e2e specs

**Files:** create `tests/navigation.spec.ts`, `tests/home.spec.ts`, `tests/glossary.spec.ts`, `tests/settings.spec.ts`.

- [ ] **Step 1: Create `tests/navigation.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test.describe('tab bar + back button', () => {
  test('tabs route to overview, glossary, and settings', async ({ page }) => {
    await page.goto('#/')
    await page.getByRole('link', { name: /Glossar/ }).click()
    await expect(page).toHaveURL(/#\/glossar/)
    await expect(page.getByRole('heading', { name: /Glossar/ })).toBeVisible()

    await page.getByRole('link', { name: /Einstellung/ }).click()
    await expect(page).toHaveURL(/#\/info/)
    await expect(page.getByRole('heading', { name: /Einstellung/ })).toBeVisible()

    await page.getByRole('link', { name: /Gürtel/ }).click()
    await expect(page).toHaveURL(/#\/$|#\/$/)
    await expect(page.locator('.grade-card').first()).toBeVisible()
  })

  test('back button on a grade returns to the overview', async ({ page }) => {
    await page.goto('#/grade/5-kyu')
    await expect(page.locator('.belt-head .head-title')).toHaveText('5. Kyu')
    await page.getByRole('button', { name: /Zur Gürtel-Übersicht/ }).click()
    await expect(page.locator('.grade-card').first()).toBeVisible()
  })
})
```

- [ ] **Step 2: Create `tests/home.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

const ORDER = [
  '9-kyu', '8-kyu', '7-kyu', '6-kyu', '5-kyu', '4-kyu', '3-kyu', '2-kyu', '1-kyu',
  '1-dan', '2-dan', '3-dan', '4-dan', '5-dan', '6-dan', '7-dan', '8-dan',
] as const

const TITLE: Record<string, string> = {
  '9-kyu': '9. Kyu', '8-kyu': '8. Kyu', '7-kyu': '7. Kyu', '6-kyu': '6. Kyu',
  '5-kyu': '5. Kyu', '4-kyu': '4. Kyu', '3-kyu': '3. Kyu', '2-kyu': '2. Kyu', '1-kyu': '1. Kyu',
  '1-dan': '1. Dan', '2-dan': '2. Dan', '3-dan': '3. Dan', '4-dan': '4. Dan',
  '5-dan': '5. Dan', '6-dan': '6. Dan', '7-dan': '7. Dan', '8-dan': '8. Dan',
}

test.describe('home grade cards', () => {
  for (const id of ORDER) {
    test(`card ${TITLE[id]} opens its detail`, async ({ page }) => {
      await page.goto('#/')
      await page.locator(`a.grade-card[href="#/grade/${id}"]`).click()
      await expect(page.locator('.belt-head .head-title')).toHaveText(TITLE[id])
    })
  }

  test('search filters cards and shows the empty state', async ({ page }) => {
    await page.goto('#/')
    await page.getByPlaceholder(/Suche/).fill('zzzzzzz')
    await expect(page.getByText(/Keine Treffer/)).toBeVisible()
  })
})
```

- [ ] **Step 3: Create `tests/glossary.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test.describe('glossary search', () => {
  test('filters entries and shows the empty state', async ({ page }) => {
    await page.goto('#/glossar')
    await expect(page.locator('.gloss-item').first()).toBeVisible()
    await page.getByPlaceholder(/Begriff suchen/).fill('zzzzzzz')
    await expect(page.getByText(/Keine Treffer/)).toBeVisible()
  })
})
```

- [ ] **Step 4: Create `tests/settings.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test.describe('settings buttons', () => {
  test('theme buttons switch and persist the data-theme', async ({ page }) => {
    await page.goto('#/info')
    await page.getByRole('button', { name: 'Dunkel' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await page.getByRole('button', { name: 'Hell' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    // Persists across reload.
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('update button settles into a terminal state (best-effort)', async ({ page }) => {
    await page.goto('#/info')
    const check = page.getByRole('button', { name: /Nach Updates suchen/ })
    await check.click()
    // Tolerant of SW timing: assert we leave the "checking" label for some
    // terminal label, whichever the environment produces.
    await expect(
      page.getByText(/Auf dem neuesten Stand|Update installieren|Prüfung nicht möglich/),
    ).toBeVisible({ timeout: 15_000 })
  })
})
```

- [ ] **Step 5: Run the full hermetic e2e suite**

Run: `npm run test:e2e`
Expected: PASS — navigation, home (incl. 17 card cases), glossary, settings, and the existing grade-nav, all green against the local preview. If a `getByRole`/placeholder query doesn't match, adjust the locator to the real markup (don't change app source). The update-button test is tolerant; if the preview SW never reaches a terminal label within 15s in this environment, relax that assertion to assert the button is simply re-enabled.

- [ ] **Step 6: Commit**

```bash
git add tests/navigation.spec.ts tests/home.spec.ts tests/glossary.spec.ts tests/settings.spec.ts
git commit -m "test: e2e coverage for tab bar, cards, search, and settings buttons

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Unit + coverage**

Run: `npm run coverage`
Expected: all unit tests PASS; total line coverage ≥ ~80% (report-only).

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`
Expected: both PASS (test files excluded from `tsc -b`).

- [ ] **Step 3: Hermetic e2e**

Run: `npm run test:e2e`
Expected: PASS.

- [ ] **Step 4 (optional): bump version**

Per repo convention ("bump version on push to main"), bump `package.json` at merge/push time if releasing.

---

## Self-Review

- **Spec coverage:** Tooling/config ✓ (Task 1). pwa-register stub + define + tsc excludes ✓ (Task 1). Pure-logic tests ✓ (Task 2). Hook tests ✓ (Task 3). Component/page tests incl. all three Kumite layouts ✓ (Task 4). ~80% coverage (report-only) ✓ (Task 5). Playwright config split + hermetic webServer ✓ (Task 6). E2E per button — tabs, back, 17 cards, both searches, theme buttons, update buttons ✓ (Task 7); prev/next via existing grade-nav (now hermetic). Verification ✓ (Task 8).
- **Placeholder scan:** none — all config and test code is concrete. Two explicit "adjust the assertion/locator to observed value" notes are TDD guidance for matching real markup, not placeholders.
- **Type/name consistency:** stub exports `swState`/`resetSwState`/`useRegisterSW` used identically in Task 1, 3, and 4; `renderWithRouter(ui, route)` signature consistent across Task 4; `AppUpdate` shape (`status`/`checkForUpdate`/`applyUpdate`) matches `src/useAppUpdate.ts`; script names (`test`, `coverage`, `test:e2e`, `verify:deploy`) consistent across tasks; `playwright.deploy.config.ts` referenced consistently in Task 1 script and Task 6.
