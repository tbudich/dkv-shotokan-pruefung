# Grade-Navigation & Einstellung — Design

Date: 2026-06-13

## Goal

Improve navigation in the DKV Shotokan Prüfungsordnung PWA:

1. Allow direct prev/next navigation between grades ("Gürtel") from the grade
   detail page.
2. Fold theme switching (Hell/Dunkel/System) into the Info tab, renaming it
   "Einstellung", and remove the standalone theme toggle from the top app bar.

No exam content (`src/data/*`) changes.

## Feature 1 — Prev/Next Gürtel navigation

### Data helper

Add to `src/data/grades.ts`:

```ts
export function getAdjacentGrades(id: string): { prev?: Grade; next?: Grade }
```

- Looks up the index of `id` in the ordered `grades` array (9. Kyu → 8. Dan).
- Returns `prev`/`next` neighbours; either side is `undefined` at the ends.
- Unknown `id` returns `{}`.

### UI

- New `GradeNav` component (defined in `GradeDetailPage.tsx`), rendered as the
  last element inside the detail page's root element.
- Sticky footer bar: `position: sticky; bottom: calc(var(--tab-h) +
  env(safe-area-inset-bottom))` so it pins just above the fixed bottom tab bar
  while scrolling and rests at the end of the content.
- Left control: `‹ {prev.title}` → React Router `Link` to `/grade/{prev.id}`.
- Right control: `{next.title} ›` → `Link` to `/grade/{next.id}`.
- At an end, the missing side renders as a disabled, non-interactive
  placeholder (same footprint) so the bar stays balanced. Stops at the ends —
  no wrap-around.
- The existing app-bar "Zurück" (`navigate(-1)`) button is kept unchanged.

### Styling

Add `.gradenav` rules to `src/theme.css` (sticky bar, two buttons, disabled
state). Uses existing theme custom properties.

## Feature 2 — Einstellung tab + theme modes

### Theme hook — `src/useTheme.ts`

Change from a binary toggle to three modes:

```ts
type ThemeMode = 'light' | 'dark' | 'system'
export function useTheme(): { mode: ThemeMode; setMode: (m: ThemeMode) => void }
```

- localStorage key `theme` stores the **mode** (`light` | `dark` | `system`).
  - Migration: legacy stored values `light`/`dark` are already valid modes, so
    no special handling needed. Absent/invalid → default `system`.
- Effective theme:
  - `light` / `dark` → that theme.
  - `system` → resolved from `matchMedia('(prefers-color-scheme: dark)')`, and a
    `change` listener updates the effective theme live while in `system` mode.
- Effect sets `document.documentElement[data-theme]` to the effective theme and
  updates the `theme-color` meta (`#0f1115` dark / `#b91c1c` light), as today.
- The old `toggle` is removed.

### App shell — `src/App.tsx`

- Remove the `.theme-toggle` button from `AppBar`; `AppBar` no longer calls
  `useTheme`.
- Bottom tab: label `Info` → `Einstellung`, icon `ℹ️` → `⚙️`.
- App-bar title mapping for the `/info` route: title `Einstellung`, subtitle
  `Darstellung & Grundsätze` (was `Information` / `Grundsätze & Legende`).
- **Route path stays `/info`** — stable URL, minimal churn. The route element
  becomes `<SettingsPage />`.

### Settings page — rename `InfoPage.tsx` → `SettingsPage.tsx`

- New **Darstellung** card rendered first: a segmented control with three
  buttons — `Hell` / `Dunkel` / `System` — bound to `useTheme`; the active mode
  is visually highlighted (`aria-pressed`).
- Below it, the existing info sections render exactly as before.
- Update the import in `App.tsx`.

### Styling

Add `.segmented` rules to `src/theme.css` (button group, active state).

## Out of scope

- No changes to grade/glossary/info data.
- No wrap-around at grade list ends.
- No new routes; `/info` path retained.

## Verification

- `npm run build` (typechecks + builds).
- `npm run preview`: navigate grades with the footer bar incl. both ends;
  toggle Hell/Dunkel/System and confirm `system` follows the OS scheme live and
  persists across reload.
