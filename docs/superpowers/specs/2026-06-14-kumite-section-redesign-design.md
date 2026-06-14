# Kumite Section Redesign — Design

**Date:** 2026-06-14
**Status:** Approved (design); ready for implementation plan
**Scope:** The Kumite section on the grade detail page (`GradeDetailPage` → `KumiteView`) and its CSS.

## Goal

The current Kumite section renders every `KumiteRow` as an independent bordered card with an
uppercase aspect header. For the `Ablauf` / `Angriff` rows — which are really a **sequence of
attack→defense exchanges** — this repeats the same header several times and makes the rows read as
disconnected items. The redesign makes the **sequence / back-and-forth flow** legible, while pushing
the setup rows (`Ausgangsstellung`, `Bewegung`) out of the way as quiet context.

This is a **renderer + CSS change only.** No changes to `src/types.ts` or `src/data/grades.ts` — the
new layouts are derived from the existing `KumiteBlock` data.

## Data recap (existing shape, unchanged)

`KumiteBlock` = `{ form?, rows?: KumiteRow[], note?, extra?: string[] }`,
`KumiteRow` = `{ aspect, tori, uke }`.

Observed `aspect` values across `src/data/grades.ts`:

- **Setup rows:** `Ausgangsstellung`, `Bewegung` — one each, describe the starting position/movement.
- **Sequence rows:** `Ablauf` (paired technique exchanges, real Uke content) **or** `Angriff`
  (Tori attacks, Uke is always `frei`).

Three real-world combinations exist:

1. **Exchange forms** — rows with `Ablauf` sequence rows and meaningful Uke content.
   Examples: Gohon (8. Kyu), Sanbon (7. Kyu), Kihon-Ippon (6. Kyu), Kaeshi (5./4. Kyu).
2. **Free-defense forms** — rows with `Angriff` sequence rows where every Uke is `frei`.
   Examples: Jiyu-Ippon (3. Kyu), Jiyu (2./1. Kyu). These also carry an `extra` chip.
3. **Pure forms** — no `rows`, only `extra` (and sometimes `form`).
   Examples: all Dan grades.

## Layout selection (derived, no schema change)

`KumiteView` splits `rows` into **setup rows** (`aspect ∈ {Ausgangsstellung, Bewegung}`) and
**sequence rows** (everything else), then chooses a layout:

- If there are sequence rows and **every** sequence row's `uke` is the literal `frei` (corroborated
  by `aspect === 'Angriff'`) → **Free-defense layout**.
- Else if there are sequence rows → **Thread layout**.
- If there are no `rows` → **Pure layout** (today's chip list, unchanged).

> Decision: detect via "all sequence ukes are `frei`" rather than aspect alone, so the layout stays
> correct even if an aspect label is edited. Aspect `Angriff` is used as a secondary signal only.

## The three layouts

All three share a common top:

- **Form line** — `form` rendered as today (`.formline`), if present.
- **Setup strip** — a quiet, sunken rounded block listing the setup rows as compact key/value lines.
  Each value shows Tori and Uke side by side, color-coded (Tori = accent/red, Uke = blue). Omitted
  entirely when there are no setup rows.

And a common bottom:

- **Note** — `note` rendered below the sequence, muted/italic, as today (`.note`).
- **Extra chips** — `extra` rendered as the existing `.chips`/`.chip` list, unchanged.

### 1. Thread layout (exchange forms) — chosen design "C"

The sequence rows render as a **call & response thread**:

- Each sequence row is one exchange.
- **Tori bubble** — left-aligned, accent-tinted, label `Tori · Angriff {n}`.
- **Uke bubble** — right-aligned, blue-tinted, right-aligned text, label `Uke · Abwehr` (or
  `Uke · Abwehr / Konter` — see open detail below).
- Exchanges stack top-to-bottom; the left/right alternation conveys the back-and-forth.

The attack index `{n}` is the 1-based position among sequence rows (not the raw row index).

### 2. Free-defense layout (Jiyu / Jiyu-Ippon)

When the defense is free, a per-row "frei" reply is repetitive. Instead:

- **Tori box first** — accent-tinted rounded box, label `Tori · Angriffe (nacheinander)`,
  containing the attacks as an ordered (`<ol>`) numbered list (one `<li>` per sequence row's
  `tori`).
- **Uke box second** — blue-tinted rounded box (matching the Tori box style), label
  `Uke · Abwehr & Gegenangriff`, body `frei` plus the descriptive text. When every Uke value is the
  bare string `frei`, the box shows just `frei`; the richer "Ausweichen, Faust- und Fußtechniken …"
  wording lives in the block's `note` and continues to render below.

Order is **Tori then Uke**, both in matching boxes (per review).

### 3. Pure layout (Dan grades)

Unchanged: `form` line (if any) + `extra` chip list. No rows means no setup strip, no sequence.

## Visual / styling notes

- Tori color = existing `--accent`; Uke color = the existing Uke role blue
  (`#2563eb`, dark-mode `#60a5fa`). Reuse these; do not introduce new brand colors.
- Bubble / box tints must be derived from those role colors and **must work in both light and dark
  themes** (the current `.kumite-row .role.uke` already has a dark override — follow that pattern,
  e.g. `color-mix` against `--bg`/`--bg-sunken` or explicit `[data-theme='dark']` overrides).
- Setup strip uses `--bg-sunken` like the existing `.kv` / `.setup` treatment.
- Keep it mobile-first; the thread and boxes are single-column and must read well at ~320px wide.
  (Unlike today's `.pair`, there is no 2-column desktop breakpoint requirement — the thread's
  left/right alternation is the layout.)
- Reuse existing class vocabulary where possible (`.formline`, `.note`, `.chips`, `.chip`).

## Components / structure

`KumiteView` (in `GradeDetailPage.tsx`) gains a small amount of derivation logic and splits into
focused sub-renders. Suggested internal structure (single file, no new modules needed):

- `splitRows(rows)` → `{ setup, sequence }`.
- `isFreeDefense(sequence)` → boolean.
- `KumiteSetup`, `KumiteThread`, `KumiteFreeDefense` sub-components, plus the shared note/chips/form.

The page-level conditional (`{grade.kumite && <section>…<KumiteView/></section>}`) is unchanged.

## Open details (to settle during implementation, low-risk)

- **Uke thread label:** some exchange forms put a counter in the Uke cell (e.g. Kihon-Ippon
  "Age-Uke / Gyaku-Zuki"). Use label `Uke · Abwehr / Konter` when the Uke text contains a counter
  separator (`/`), else `Uke · Abwehr`. Acceptable to always use `Uke · Abwehr` if simpler — cosmetic.
- **Setup value formatting:** render setup as `Tori · Uke` with color coding; exact separator
  (`·`) is cosmetic.

## Out of scope

- No changes to Kihon, Kata, or Bunkai sections.
- No data-file edits, no `types.ts` changes.
- No new Kumite forms or content corrections.

## Verification

Per `CLAUDE.md`: `npm run build` (typechecks) and `npm run preview`. Manually spot-check one grade
of each kind: an exchange form (e.g. 6. Kyu Kihon-Ippon), a free-defense form (e.g. 2. Kyu Jiyu),
and a pure Dan grade — in both light and dark themes, at mobile width.
