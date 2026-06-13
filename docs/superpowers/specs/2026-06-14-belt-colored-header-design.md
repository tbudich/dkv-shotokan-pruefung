# Belt-Colored Merged Header & Nav Buttons — Design

Date: 2026-06-14

## Goal

On a grade ("Gürtel") detail page, replace the two stacked headers (the global red
app bar + the in-content `.detail-head`) with a single header tinted in the grade's
belt color. The back/forward (Gürtel) navigation buttons are tinted in the belt color
of the grade they lead to. No exam content (`src/data/*`) changes.

## Decisions (from brainstorming)

- **Header layout:** Option A — the top app bar itself becomes the belt color (full
  merge); the separate in-content header is removed. Tinting applies to
  `/grade/:id` routes only; Home, Glossar, and Einstellung keep the red accent.
- **Auto-contrast:** foreground (text + icons) flips by belt luminance — dark on light
  belts (white, yellow), light on the rest. Light belts get a hairline bottom border.
- **Nav buttons:** each is filled with the **destination** grade's belt color (prev =
  previous grade, next = next grade), auto-contrasted. Disabled ends stay greyed.

## Feature 1 — Contrast helper

New file `src/belt.ts`:

```ts
/** Returns the ink color to use on top of a belt color, and whether the belt is light. */
export function beltContrast(hex: string): { fg: string; isLight: boolean }
```

- Parse `#rrggbb` → r,g,b. Compute YIQ brightness `(r*299 + g*587 + b*114) / 1000`.
- `isLight = brightness > 150`.
- `fg = isLight ? '#1f2937' : '#ffffff'`.
- Used by both the header (`AppBar`) and the nav buttons (`GradeNav`).

For the belt palette this yields: white & yellow → dark ink (`isLight`); orange, green,
blue, brown, black → white ink.

## Feature 2 — Merged belt-colored header (`AppBar` in `src/App.tsx`)

When the route is a grade detail (`isDetail`) and the grade resolves:

- The `<header className="appbar">` gets `className="appbar belt-head"` plus inline
  `style={{ background: grade.beltColor, color: fg }}` where
  `fg = beltContrast(grade.beltColor).fg`. When `isLight`, also add a modifier (e.g.
  `belt-head--light`) that applies a hairline bottom border for definition.
- Header contents for the detail branch:
  - Back button (‹) → `navigate('/')`, `aria-label="Zur Gürtel-Übersicht"` (unchanged
    behavior). Its circular background overlay is `rgba(0,0,0,.10)` on light belts,
    `rgba(255,255,255,.18)` on dark belts (driven by the `--light` modifier).
  - The belt swatch — reuse the `Belt` component (small size via existing
    `.appbar .belt` or a size override).
  - A stacked title block: grade title (e.g. "5. Kyu") on top, subtitle
    "*{grade.belt} · {grade.group}*" below.
- Non-detail routes render the current bar unchanged (red accent, title + inline
  subtitle, no back button, no swatch).

The `.detail-head` block in `GradeDetailPage` (belt swatch + h2 + belt-name) is
**removed**, since its content now lives in the header.

## Feature 3 — Destination-colored nav buttons (`GradeNav` in `GradeDetailPage.tsx`)

For each active (non-end) nav control:

- Apply inline `style={{ background: <neighbour>.beltColor, color: beltContrast(<neighbour>.beltColor).fg }}`
  to the `<Link className="gradenav-btn ...">`.
- The arrow inherits the contrasted color (drop the current `--accent` arrow color for
  active buttons; the inline `color` covers it).
- Disabled placeholders (no prev / no next) are unchanged: greyed, non-interactive,
  with their existing `aria-label`s.

## Styling — `src/theme.css`

- `.appbar` currently hard-codes `background: var(--accent)` / `color:
  var(--accent-contrast)`. Keep that as the default; the detail header overrides via
  inline `style`, which wins. Add `.belt-head` / `.belt-head--light` rules only for
  what inline style can't express cleanly: the back-button overlay color and the
  light-belt bottom border. The detail header's swatch + stacked title layout gets its
  own rules (e.g. `.appbar.belt-head .belt`, `.appbar.belt-head .head-text`).
- `.gradenav-btn` keeps its base shape; active buttons receive inline `background`/
  `color`. `.gradenav-btn.disabled` must still visually override (greyed) — verify the
  disabled placeholders carry no inline color (they don't, since only active Links get
  inline styles).

## Out of scope

- The `meta[name="theme-color"]` (mobile status bar) stays driven by the light/dark
  theme; the belt color does not propagate to it.
- No changes to belt colors, grade data, or the bottom tab bar.
- No dark-mode-specific belt variants — belt colors are fixed hex and auto-contrast
  handles legibility in both themes.

## Verification

- `npm run build` (typecheck + build).
- `npm run preview`: open several grades across the belt range (9. Kyu white, 8. Kyu
  yellow, 5. Kyu blue, 1. Dan black). Confirm: one belt-colored header with readable
  text/icons; white belt has a visible bottom border; back button returns to the list;
  prev/next buttons show the neighbour belt colors with readable labels; ends greyed.
  Check both light and dark app themes.
