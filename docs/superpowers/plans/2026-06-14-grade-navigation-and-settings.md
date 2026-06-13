# Grade-Navigation & Einstellung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add prev/next ("Gürtel") navigation to the grade detail page and fold three-mode theme switching (Hell/Dunkel/System) into a renamed "Einstellung" tab.

**Architecture:** Pure client-side React + React Router (HashRouter). A new data helper exposes ordered neighbours of a grade; a sticky footer bar in the detail page links to them. The theme hook is widened from a binary toggle to a `light | dark | system` mode persisted in localStorage, with a segmented control on the settings page driving it.

**Tech Stack:** React 18, TypeScript, React Router 6, Vite, CSS custom properties. No test framework — verification is `npm run build` (runs `tsc -b` typecheck + Vite build) per the project convention in CLAUDE.md.

---

## File Structure

- `src/data/grades.ts` — add `getAdjacentGrades(id)` helper (modify).
- `src/useTheme.ts` — widen to three-mode hook returning `{ mode, setMode }` (modify).
- `src/pages/GradeDetailPage.tsx` — add `GradeNav` sticky footer component + render it (modify).
- `src/pages/SettingsPage.tsx` — renamed from `InfoPage.tsx`; adds a Darstellung segmented control above existing info sections (rename + modify).
- `src/pages/InfoPage.tsx` — deleted (replaced by SettingsPage).
- `src/App.tsx` — drop app-bar theme toggle, rename tab to Einstellung, update title mapping, swap import (modify).
- `src/theme.css` — add `.gradenav` and `.segmented` rules (modify).

---

## Task 1: `getAdjacentGrades` data helper

**Files:**
- Modify: `src/data/grades.ts` (append near the existing `getGrade` export, ~line 755)

- [ ] **Step 1: Add the helper**

Append after the existing `getGrade` function in `src/data/grades.ts`:

```ts
export function getAdjacentGrades(id: string): { prev?: Grade; next?: Grade } {
  const i = grades.findIndex((g) => g.id === id)
  if (i === -1) return {}
  return {
    prev: i > 0 ? grades[i - 1] : undefined,
    next: i < grades.length - 1 ? grades[i + 1] : undefined,
  }
}
```

Note: `Grade` is already imported/defined in this file (used by the existing `grades: Grade[]` declaration), so no new import is needed.

- [ ] **Step 2: Typecheck**

Run: `npm run lint`
Expected: PASS (no type errors).

- [ ] **Step 3: Commit**

```bash
git add src/data/grades.ts
git commit -m "feat: add getAdjacentGrades helper for prev/next navigation"
```

---

## Task 2: Three-mode theme hook

**Files:**
- Modify: `src/useTheme.ts` (full rewrite of the file)

- [ ] **Step 1: Rewrite the hook**

Replace the entire contents of `src/useTheme.ts` with:

```ts
import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
type Effective = 'light' | 'dark'

const MEDIA = '(prefers-color-scheme: dark)'

function initialMode(): ThemeMode {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function resolve(mode: ThemeMode): Effective {
  if (mode === 'system') {
    return window.matchMedia(MEDIA).matches ? 'dark' : 'light'
  }
  return mode
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(initialMode)
  const [effective, setEffective] = useState<Effective>(() => resolve(initialMode()))

  // Persist the mode and recompute the effective theme when the mode changes.
  useEffect(() => {
    localStorage.setItem('theme', mode)
    setEffective(resolve(mode))
  }, [mode])

  // While in system mode, follow OS scheme changes live.
  useEffect(() => {
    if (mode !== 'system') return
    const mql = window.matchMedia(MEDIA)
    const onChange = () => setEffective(mql.matches ? 'dark' : 'light')
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [mode])

  // Apply the effective theme to the document + theme-color meta.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effective)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', effective === 'dark' ? '#0f1115' : '#b91c1c')
  }, [effective])

  return { mode, setMode }
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run lint`
Expected: FAIL — `App.tsx` still references the removed `theme`/`toggle` from `useTheme`. This is expected; Task 4 fixes the consumer. (If you prefer a clean checkpoint, proceed to Task 4 before committing — but committing the hook alone is fine since the repo has no CI gate on intermediate commits.)

- [ ] **Step 3: Commit**

```bash
git add src/useTheme.ts
git commit -m "feat: widen useTheme to light/dark/system modes"
```

---

## Task 3: GradeNav sticky footer on the detail page

**Files:**
- Modify: `src/pages/GradeDetailPage.tsx`

- [ ] **Step 1: Update the imports**

In `src/pages/GradeDetailPage.tsx`, add `getAdjacentGrades` to the grades import:

```ts
import { getAdjacentGrades, getGrade } from '../data/grades'
```

Leave the other imports unchanged. `GradeNav` takes `id: string` and reads `.id`/`.title` off the returned objects without annotating them, so no `Grade` type import is needed (an unused import would fail `tsc`).

- [ ] **Step 2: Add the GradeNav component**

Add this component near the top of the file, after the imports and before `GradeDetailPage`:

```tsx
function GradeNav({ id }: { id: string }) {
  const { prev, next } = getAdjacentGrades(id)
  return (
    <nav className="gradenav" aria-label="Grad-Navigation">
      {prev ? (
        <Link className="gradenav-btn prev" to={`/grade/${prev.id}`}>
          <span className="arrow" aria-hidden="true">‹</span>
          <span className="lbl">{prev.title}</span>
        </Link>
      ) : (
        <span className="gradenav-btn prev disabled" aria-hidden="true">
          <span className="arrow">‹</span>
        </span>
      )}
      {next ? (
        <Link className="gradenav-btn next" to={`/grade/${next.id}`}>
          <span className="lbl">{next.title}</span>
          <span className="arrow" aria-hidden="true">›</span>
        </Link>
      ) : (
        <span className="gradenav-btn next disabled" aria-hidden="true">
          <span className="arrow">›</span>
        </span>
      )}
    </nav>
  )
}
```

- [ ] **Step 3: Render GradeNav at the end of the detail content**

In `GradeDetailPage`, the function uses `const grade = id ? getGrade(id) : undefined`. Since `grade` is truthy past the not-found guard, `grade.id` is available. Add `<GradeNav>` as the last child of the root `<div>`, immediately before its closing `</div>` (after the Kumite `</section>` block):

```tsx
      {/* Prev / next grade */}
      <GradeNav id={grade.id} />
    </div>
  )
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run lint`
Expected: PASS for this file (App.tsx may still error until Task 4).

- [ ] **Step 5: Commit**

```bash
git add src/pages/GradeDetailPage.tsx
git commit -m "feat: add prev/next Gürtel navigation to grade detail page"
```

---

## Task 4: Settings page (rename InfoPage) with Darstellung control

**Files:**
- Create: `src/pages/SettingsPage.tsx`
- Delete: `src/pages/InfoPage.tsx`

- [ ] **Step 1: Create SettingsPage.tsx**

Create `src/pages/SettingsPage.tsx` with:

```tsx
import { infoSections } from '../data/info'
import { useTheme, type ThemeMode } from '../useTheme'

const MODES: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
  { value: 'system', label: 'System' },
]

export function SettingsPage() {
  const { mode, setMode } = useTheme()

  return (
    <div className="info">
      <section className="card">
        <h3>Darstellung</h3>
        <div className="card-body">
          <div className="segmented" role="group" aria-label="Farbschema">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`seg${mode === m.value ? ' active' : ''}`}
                aria-pressed={mode === m.value}
                onClick={() => setMode(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {infoSections.map((s) => (
        <section className="card" key={s.id}>
          <h3>{s.title}</h3>
          <div className="card-body">
            {s.body?.map((p, i) => (
              <p className="bodytext" key={i}>
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul>
                {s.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
            {s.legend?.map(([k, v]) => (
              <div className="kv" key={k}>
                <div className="k">{k}</div>
                {v}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Delete the old InfoPage**

```bash
git rm src/pages/InfoPage.tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/SettingsPage.tsx
git commit -m "feat: replace InfoPage with SettingsPage incl. Darstellung control"
```

(App.tsx still imports InfoPage at this point — fixed in Task 5. Typecheck will fail until then; that is expected.)

---

## Task 5: Wire up App shell — tab, title, remove toggle

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Swap the import**

In `src/App.tsx`, replace the InfoPage import line:

```ts
import { SettingsPage } from './pages/SettingsPage'
```

(Remove the `import { InfoPage } ...` line. Also remove the now-unused `import { useTheme } from './useTheme'` line.)

- [ ] **Step 2: Remove theme usage + toggle button from AppBar**

In `AppBar`, delete the `const { theme, toggle } = useTheme()` line. Update the `/info` title branch and remove the `.theme-toggle` button. The `AppBar` becomes:

```tsx
function AppBar() {
  const location = useLocation()
  const navigate = useNavigate()

  const isDetail = location.pathname.startsWith('/grade/')
  let title = 'Shotokan Prüfungsordnung'
  let subtitle = '9. Kyu – 8. Dan'
  if (location.pathname.startsWith('/glossar')) {
    title = 'Glossar'
    subtitle = 'Japanische Begriffe'
  } else if (location.pathname.startsWith('/info')) {
    title = 'Einstellung'
    subtitle = 'Darstellung & Grundsätze'
  } else if (isDetail) {
    const id = location.pathname.split('/')[2]
    const g = getGrade(id)
    title = g ? g.title : 'Grad'
    subtitle = g ? g.belt : ''
  }

  return (
    <header className="appbar">
      {isDetail && (
        <button className="back" onClick={() => navigate(-1)} aria-label="Zurück">
          ‹
        </button>
      )}
      <h1>
        {title} <span className="subtitle">{subtitle}</span>
      </h1>
    </header>
  )
}
```

- [ ] **Step 3: Rename the tab and update the route element**

In `TabBar`, update the third `NavLink`:

```tsx
      <NavLink to="/info">
        <span className="ico">⚙️</span>
        Einstellung
      </NavLink>
```

In the `Routes`, change the `/info` route element:

```tsx
          <Route path="/info" element={<SettingsPage />} />
```

- [ ] **Step 4: Typecheck + build**

Run: `npm run build`
Expected: PASS (typecheck clean, Vite build succeeds). This is the first point where the whole tree typechecks.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: rename Info tab to Einstellung, drop app-bar theme toggle"
```

---

## Task 6: Styling — `.gradenav` and `.segmented`

**Files:**
- Modify: `src/theme.css` (append at end of file)

- [ ] **Step 1: Append the styles**

Add to the end of `src/theme.css`:

```css
/* ---------- Grade prev/next nav ---------- */
.gradenav {
  position: sticky;
  bottom: calc(var(--tab-h) + env(safe-area-inset-bottom));
  z-index: 15;
  display: flex;
  gap: 8px;
  margin: 20px -16px 0;
  padding: 8px 16px calc(8px + env(safe-area-inset-bottom));
  background: var(--bg-elev);
  border-top: 1px solid var(--border);
}

.gradenav-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--fg);
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
}

.gradenav-btn.next {
  justify-content: flex-end;
  text-align: right;
}

.gradenav-btn .arrow {
  font-size: 1.3rem;
  line-height: 1;
  color: var(--accent);
  flex: none;
}

.gradenav-btn .lbl {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gradenav-btn.disabled {
  opacity: 0.35;
  pointer-events: none;
}

.gradenav-btn.disabled .arrow {
  color: var(--fg-muted);
}

/* ---------- Segmented control (settings) ---------- */
.segmented {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.segmented .seg {
  flex: 1;
  min-height: 40px;
  padding: 8px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: var(--fg-muted);
  font-size: 0.85rem;
  font-weight: 600;
}

.segmented .seg.active {
  background: var(--accent);
  color: var(--accent-contrast);
}
```

Note: these rules use existing custom properties (`--bg`, `--bg-elev`, `--fg`, `--fg-muted`, `--border`, `--accent`, `--accent-contrast`, `--tab-h`). All are already defined in `theme.css` and resolve per `[data-theme]`.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/theme.css
git commit -m "style: gradenav sticky footer + segmented theme control"
```

---

## Task 7: Manual verification

**Files:** none.

- [ ] **Step 1: Build + preview**

Run: `npm run build && npm run preview`

- [ ] **Step 2: Verify navigation**

In the browser:
- Open a mid-range grade (e.g. `#/grade/5-kyu`). Confirm the sticky footer shows `‹ 6. Kyu` (prev) and `4. Kyu ›` (next), pinned above the bottom tab bar while scrolling.
- Click through to both neighbours; confirm the bar updates.
- Open `9. Kyu`: left side is a dimmed, non-clickable placeholder; right works.
- Open `8. Dan`: right side is dimmed/non-clickable; left works.

- [ ] **Step 3: Verify Einstellung**

- Bottom tab reads `Einstellung` with a ⚙️ icon; app bar shows `Einstellung — Darstellung & Grundsätze`; no ☀/☾ button in the app bar.
- Darstellung card shows Hell / Dunkel / System with the active one highlighted.
- Select Hell → light; Dunkel → dark; System → matches OS. Change the OS scheme while in System mode and confirm the app follows live.
- Reload; the chosen mode persists.

- [ ] **Step 4: Final confirmation**

Confirm `npm run build` is clean. No commit needed (verification only).

---

## Self-Review Notes

- **Spec coverage:** getAdjacentGrades (T1), three-mode hook w/ live system listener + persistence (T2), sticky footer w/ disabled ends, no wrap (T3), SettingsPage rename + Darstellung control (T4), tab rename/title/route-kept/toggle-removed (T5), `.gradenav`+`.segmented` styles (T6), verification incl. both ends + live system (T7). All spec sections mapped.
- **Type consistency:** `useTheme` returns `{ mode, setMode }` and exports `ThemeMode` — consumed identically in SettingsPage. `getAdjacentGrades` returns `{ prev?, next? }` — consumed in GradeNav via structural access (no `Grade` import needed).
- **Intermediate typecheck failures** (T2/T4) are called out explicitly; the tree is green again at T5/T6. The repo has no CI gate, matching the project's build-as-verification convention.
