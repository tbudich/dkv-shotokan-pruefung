# Kihon Repetition (Wdh.) Column — Design

**Date:** 2026-06-13
**Status:** Approved (design), pending implementation plan

## Context

The Kihon section of each grade detail page renders every combination as a vertical
step-by-step breakdown (step direction arrow + stance chip + technique text per line).
The repetition count currently appears as an inline badge before a step and — per the
DKV Grundsätze that 5× is the default — the default `5×` is hidden.

The user wants the repetition count promoted to its **own dedicated column** with a
`Wdh.` (Wiederholungen) header, so the count is always in a consistent, scannable place.
This was chosen from five mockups (option **D**, "real table with a Wdh. header") and
refined to keep the per-step breakdown intact and to show the default greyed rather than
blank.

## Goal

Render the Kihon section as a 3-column table — number, technique (with the existing
per-step breakdown), and a right-aligned repetition column — while preserving everything
the current layout already shows (directions, stance changes, notes).

## Layout

A table lives inside the existing Kihon `.card`:

| Column | Width | Content |
|---|---|---|
| `#` | narrow | Combination number (e.g. `3.`), shown once per combination |
| `Technik` | flexible | Vertical step breakdown: `StepArrow` + stance chip + text, one line per step; combo notes (Wendung, dash-clauses) below the steps |
| `Wdh.` | narrow, right-aligned | Repetition count for that row's counted group |

### Row model

- **One counted group = one table row.** A combination with multiple counted sub-groups
  (e.g. 1. Dan #2 `2× Age-Uke / Gyaku-Zuki, 2× Soto-Uke / Gyaku-Zuki`) splits into one
  row per group; the `#` cell is shown only on the first row of the combination.
- **Single-count combinations stay one row** with all their steps (e.g. 1. Kyu #3's
  SD/ZK alternation = one row, all steps, one `Wdh.` value).

### Repetition display

- **Default `5×` is greyed** (dimmed/muted), not hidden. This includes combinations that
  carry no explicit count in the PDF (e.g. 1. Kyu #3), which are implicitly 5×.
- **Deviations** (`6×`, `4×`, `3×`, `2×`) render in the normal accent badge style.
- The inline count badge used today is removed.

### Header

A table header row labels the columns. `Wdh.` is the short, idiomatic German label for
Wiederholungen and matches the source document's terseness.

## Data / parsing

`parseKihon(item)` (in `src/kihon.ts`) already yields `steps: KihonStep[]`, where the
first step of each counted (sub-)group carries a `count` (e.g. `"5×"`, `"2×"`). The change
introduces a grouping layer:

- Add a derived `groups: KihonGroup[]` where `KihonGroup = { count?: string; steps: KihonStep[] }`.
  A new group begins at the first step and at any step that carries a `count`.
- `count` of a group is that leading step's `count` (undefined → treated as `5×` for display).
- This grouping can live in `kihon.ts` (e.g. `parseKihon` returns `{ groups, notes }`, or a
  helper `groupKihon(steps)`), keeping `GradeDetailPage` a thin renderer.

The accurate technique text in `src/data/grades.ts` remains the single source of truth; no
data edits are required.

## Components / files

- `src/kihon.ts` — add `KihonGroup` and the grouping (fold `steps[]` → `groups[]`).
- `src/pages/GradeDetailPage.tsx` — replace the `<ol class="kihon">` step list with a
  `<table>`; reuse `StepArrow` and the stance chip inside the Technik cell; render the
  `Wdh.` cell per group with the greyed-default rule. Remove the inline-count rendering.
- `src/theme.css` — table styles (header, narrow `#`/`Wdh.` columns, right-aligned count,
  muted style for default `5×`, mobile-friendly cell padding/wrapping). Repurpose the
  existing `.count` style for the column cell.

## Non-goals (YAGNI)

- No changes to Kata, Kumite, Glossary, Info, search, or routing.
- Kyu and Dan use the same table layout (they differ only in data).
- No sorting, filtering, collapsing, or per-step counts beyond the existing group counts.

## Responsiveness

Mobile-first: `#` and `Wdh.` are narrow fixed-ish columns; the Technik cell takes the rest
and wraps. The table must remain readable at ~360px width (the step lines already wrap
today). No horizontal scrolling.

## Verification

- `npm run build` (typecheck + PWA build) passes clean.
- Visual check (Playwright screenshots at iPhone ~390px and iPad ~820px) of:
  - 9. Kyu (all `6×`, "ohne Schritt" dots),
  - 1. Kyu #3 (long SD/ZK alternation, single greyed `5×`),
  - 1. Dan #2/#3 (two `2×` rows each) and #10 (`4×`),
  - 2. Dan #8 (`4×`).
- Confirm: default `5×` greyed, deviations accented, `#` shown once per combination,
  notes still render, no console errors.
