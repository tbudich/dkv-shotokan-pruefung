# Belt-Colored Merged Header & Nav Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On grade detail pages, merge the two stacked headers into one app bar tinted with the grade's belt color, and tint the prev/next Gürtel buttons with the belt color of the grade each one leads to.

**Architecture:** A small pure helper picks readable ink (dark/light) for any belt color by luminance. `AppBar` (in `App.tsx`) renders a belt-tinted header for `/grade/:id` routes via inline `background`/`color`; the old in-content `.detail-head` is removed. `GradeNav` applies each neighbour's belt color inline to its button.

**Tech Stack:** React 18, TypeScript, React Router 6 (HashRouter), Vite, CSS custom properties. No test framework — `npm run build` (`tsc -b` typecheck + Vite build) is the verification gate, per CLAUDE.md.

---

## File Structure

- `src/belt.ts` — new. `beltContrast(hex)` → `{ fg, isLight }`. One responsibility: contrast decision. Imported by `App.tsx` and `GradeDetailPage.tsx`.
- `src/App.tsx` — `AppBar` renders the belt-tinted merged header on detail routes.
- `src/pages/GradeDetailPage.tsx` — remove `.detail-head`; `GradeNav` tints each active button with the neighbour's belt color.
- `src/theme.css` — belt-head header rules + light-belt border + back-button overlay; remove dead `.detail-head` rules; make nav arrow inherit color.

---

## Task 1: `beltContrast` helper

**Files:**
- Create: `src/belt.ts`

- [ ] **Step 1: Create the helper**

Create `src/belt.ts` with exactly:

```ts
/**
 * Picks a readable ink color for text/icons drawn on top of a belt color.
 * Uses YIQ brightness; belts brighter than the threshold (white, yellow) get
 * dark ink, the rest get white ink.
 */
export function beltContrast(hex: string): { fg: string; isLight: boolean } {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  const isLight = brightness > 150
  return { fg: isLight ? '#1f2937' : '#ffffff', isLight }
}
```

This yields dark ink for `#f5f5f5` (white, ~245) and `#facc15` (yellow, ~197), white ink for orange/green/blue/brown/black.

- [ ] **Step 2: Typecheck**

Run: `npm run lint`
Expected: PASS (no type errors).

- [ ] **Step 3: Commit**

```bash
git add src/belt.ts
git commit -m "feat: add beltContrast helper for readable ink on belt colors"
```

---

## Task 2: Belt-colored merged header

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/GradeDetailPage.tsx` (remove `.detail-head` block)
- Modify: `src/theme.css`

- [ ] **Step 1: Rewrite `AppBar` in `src/App.tsx`**

Replace the imports block and the entire `AppBar` function. First, update the top imports to add `Belt` and `beltContrast` (keep the existing ones):

```ts
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Belt } from './components/Belt'
import { beltContrast } from './belt'
import { HomePage } from './pages/HomePage'
import { GradeDetailPage } from './pages/GradeDetailPage'
import { GlossaryPage } from './pages/GlossaryPage'
import { SettingsPage } from './pages/SettingsPage'
import { getGrade } from './data/grades'
```

Then replace the whole `AppBar` function with:

```tsx
function AppBar() {
  const location = useLocation()
  const navigate = useNavigate()

  const isDetail = location.pathname.startsWith('/grade/')
  const detailGrade = isDetail ? getGrade(location.pathname.split('/')[2]) : undefined

  // Belt-tinted merged header on a resolved grade detail page.
  if (detailGrade) {
    const { fg, isLight } = beltContrast(detailGrade.beltColor)
    return (
      <header
        className={`appbar belt-head${isLight ? ' belt-head--light' : ''}`}
        style={{ background: detailGrade.beltColor, color: fg }}
      >
        <button className="back" onClick={() => navigate('/')} aria-label="Zur Gürtel-Übersicht">
          ‹
        </button>
        <Belt grade={detailGrade} />
        <div className="head-text">
          <div className="head-title">{detailGrade.title}</div>
          <div className="head-sub">
            {detailGrade.belt} · {detailGrade.group}
          </div>
        </div>
      </header>
    )
  }

  let title = 'Shotokan Prüfungsordnung'
  let subtitle = '9. Kyu – 8. Dan'
  if (location.pathname.startsWith('/glossar')) {
    title = 'Glossar'
    subtitle = 'Japanische Begriffe'
  } else if (location.pathname.startsWith('/info')) {
    title = 'Einstellung'
    subtitle = 'Darstellung & Grundsätze'
  } else if (isDetail) {
    // Detail route but grade id not found.
    title = 'Grad'
    subtitle = ''
  }

  return (
    <header className="appbar">
      {isDetail && (
        <button className="back" onClick={() => navigate('/')} aria-label="Zur Gürtel-Übersicht">
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

(The not-found detail case keeps a working back button and a neutral red bar.)

- [ ] **Step 2: Remove the `.detail-head` block from `src/pages/GradeDetailPage.tsx`**

Delete these lines (currently lines 150–159, the block plus the blank line after it) so the returned `<div>` begins with the Kihon section:

```tsx
      <div className="detail-head">
        <Belt grade={grade} />
        <div>
          <h2>{grade.title}</h2>
          <div className="belt-name">
            {grade.belt} · {grade.group}
          </div>
        </div>
      </div>

```

After deletion the function reads:

```tsx
  return (
    <div>
      {/* Kihon */}
      {(grade.kihon.length > 0 || grade.kihonNote) && (
```

Note: `Belt` is still imported and used by other JSX? Check — after removing `.detail-head`, the only `Belt` usage in this file is gone. Leave the `import { Belt }` line ONLY if still referenced; it is not, so **remove `import { Belt } from '../components/Belt'`** from `GradeDetailPage.tsx` to avoid an unused-import `tsc` error. (`Belt` is now used in `App.tsx` instead.)

- [ ] **Step 3: Add header CSS and remove dead `.detail-head` rules in `src/theme.css`**

First, DELETE the now-dead detail-head rules (currently lines 273–294):

```css
/* ---------- Detail ---------- */
.detail-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 6px;
}

.detail-head .belt {
  width: 54px;
  height: 54px;
}

.detail-head h2 {
  margin: 0;
  font-size: 1.4rem;
}

.detail-head .belt-name {
  color: var(--fg-muted);
  font-size: 0.9rem;
}
```

Then, append the belt-head rules to the END of `src/theme.css`:

```css
/* ---------- Belt-colored detail header ---------- */
/* Background + text color are set inline (belt color + contrast ink). */
.appbar.belt-head .back {
  background: rgba(255, 255, 255, 0.18);
}

.appbar.belt-head--light {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.appbar.belt-head--light .back {
  background: rgba(0, 0, 0, 0.1);
}

.appbar.belt-head .belt {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  font-size: 0.8rem;
}

.appbar .head-text {
  flex: 1;
  min-width: 0;
}

.appbar .head-title {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.15;
}

.appbar .head-sub {
  font-size: 0.72rem;
  font-weight: 500;
  opacity: 0.85;
}
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: PASS (typecheck + Vite build succeed).

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/pages/GradeDetailPage.tsx src/theme.css
git commit -m "feat: merge grade detail header into belt-colored app bar"
```

---

## Task 3: Destination-colored nav buttons

**Files:**
- Modify: `src/pages/GradeDetailPage.tsx` (`GradeNav` + import)
- Modify: `src/theme.css` (arrow color)

- [ ] **Step 1: Import the helper in `src/pages/GradeDetailPage.tsx`**

Add to the existing grades import line so it reads:

```ts
import { getAdjacentGrades, getGrade } from '../data/grades'
import { beltContrast } from '../belt'
```

(Place the `beltContrast` import after the grades import.)

- [ ] **Step 2: Tint the active nav buttons in `GradeNav`**

Replace the `GradeNav` function body's two active `<Link>` elements so each carries an inline belt color. The full function becomes:

```tsx
function GradeNav({ id }: { id: string }) {
  const { prev, next } = getAdjacentGrades(id)
  return (
    <nav className="gradenav" aria-label="Grad-Navigation">
      {prev ? (
        <Link
          className="gradenav-btn prev"
          to={`/grade/${prev.id}`}
          style={{ background: prev.beltColor, color: beltContrast(prev.beltColor).fg }}
        >
          <span className="arrow" aria-hidden="true">‹</span>
          <span className="lbl">{prev.title}</span>
        </Link>
      ) : (
        <span className="gradenav-btn prev disabled" aria-label="Kein vorheriger Grad">
          <span className="arrow" aria-hidden="true">‹</span>
        </span>
      )}
      {next ? (
        <Link
          className="gradenav-btn next"
          to={`/grade/${next.id}`}
          style={{ background: next.beltColor, color: beltContrast(next.beltColor).fg }}
        >
          <span className="lbl">{next.title}</span>
          <span className="arrow" aria-hidden="true">›</span>
        </Link>
      ) : (
        <span className="gradenav-btn next disabled" aria-label="Kein nächster Grad">
          <span className="arrow" aria-hidden="true">›</span>
        </span>
      )}
    </nav>
  )
}
```

- [ ] **Step 3: Make the arrow inherit the button's ink in `src/theme.css`**

The active buttons now set `color` inline. Change the arrow color from the fixed accent to inherit, so it matches the contrast ink. Find:

```css
.gradenav-btn .arrow {
  font-size: 1.3rem;
  line-height: 1;
  color: var(--accent);
  flex: none;
}
```

Change the `color` line to:

```css
.gradenav-btn .arrow {
  font-size: 1.3rem;
  line-height: 1;
  color: inherit;
  flex: none;
}
```

Leave `.gradenav-btn.disabled .arrow { color: var(--fg-muted); }` unchanged — disabled placeholders carry no inline color, so they stay greyed.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/GradeDetailPage.tsx src/theme.css
git commit -m "feat: tint Gürtel nav buttons with destination belt colors"
```

---

## Task 4: Manual verification

**Files:** none.

- [ ] **Step 1: Build + preview**

Run: `npm run build && npm run preview`

- [ ] **Step 2: Verify the merged header across the belt range**

In the browser, open each and confirm a single belt-colored header (no second in-content header), with readable title/subtitle/back-arrow:
- `#/grade/9-kyu` — white belt: near-white bar with **dark** ink and a visible bottom border; swatch has its outline.
- `#/grade/8-kyu` — yellow belt: dark ink.
- `#/grade/5-kyu` — blue belt: white ink.
- `#/grade/1-dan` — black belt: white ink.
Confirm Home/Glossar/Einstellung app bars are still the red accent (not tinted).

- [ ] **Step 3: Verify the back button and nav buttons**

- On any grade, the ‹ back button returns to the Gürtel list (`#/`).
- On `#/grade/5-kyu`: prev button is **green** (6. Kyu) and next is **blue** (4. Kyu), each with readable text; arrows match the ink.
- On `#/grade/9-kyu`: prev is a greyed disabled placeholder; next works.
- On `#/grade/8-dan`: next is greyed; prev works.

- [ ] **Step 4: Verify in both app themes**

Toggle Einstellung → Dunkel and Hell, revisit a couple of grades, and confirm the belt-colored header and nav buttons remain legible in both themes.

- [ ] **Step 5: Final confirmation**

Confirm `npm run build` is clean. No commit needed (verification only).

---

## Self-Review Notes

- **Spec coverage:** beltContrast helper (T1); Option-A tinted app bar with swatch + stacked title/subtitle, detail-only, others stay red (T2 Step 1); `.detail-head` removed (T2 Step 2); auto-contrast + light-belt border + back-overlay (T1 + T2 Step 3); destination-colored nav buttons with auto-contrast and greyed ends (T3); both-theme + belt-range verification (T4). All spec sections mapped.
- **Type consistency:** `beltContrast(hex)` returns `{ fg, isLight }` — `App.tsx` destructures both, `GradeNav` uses `.fg` only. `Belt` import moves from `GradeDetailPage.tsx` to `App.tsx`.
- **Out of scope honored:** `meta[name="theme-color"]` untouched; belt colors, grade data, and tab bar unchanged.
- **No-placeholder check:** every code step shows full code; no TBD/TODO; the only "delete" steps quote the exact lines to remove.
