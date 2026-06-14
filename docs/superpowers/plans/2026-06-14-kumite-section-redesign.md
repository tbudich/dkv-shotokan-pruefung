# Kumite Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-render the Kumite section so attack→defense sequences read as a flowing call & response thread (and free-defense Jiyu forms as a Tori-attacks box + Uke-frei box), instead of repeated identical aspect cards.

**Architecture:** Renderer-only change. `KumiteView` in `src/pages/GradeDetailPage.tsx` splits the existing `KumiteBlock.rows` into setup rows (`Ausgangsstellung`/`Bewegung`) and sequence rows, then picks one of three layouts derived purely from the data — no `types.ts` or `grades.ts` edits. New CSS lives in `src/theme.css`.

**Tech Stack:** React + TypeScript (Vite), plain CSS custom properties. No test runner in this repo — verification is `npm run build` (runs `tsc -b`) plus `npm run preview` for visual checks.

**Design spec:** `docs/superpowers/specs/2026-06-14-kumite-section-redesign-design.md`

---

## File Structure

- **Modify** `src/pages/GradeDetailPage.tsx` — replace the `KumiteView` function (currently lines 71–106) and add small pure helpers + three sub-components above it. Add `KumiteRow` to the existing type import on line 5.
- **Modify** `src/theme.css` — replace the Kumite CSS region (currently lines ~497–572, from the `/* Kumite as stacked cards (mobile-first) */` comment through the `.formline` rule) with new styles for the setup strip, thread, free-defense boxes, shared role labels, and `.formline`.

No new files. No data changes.

---

## Task 1: Render logic — helpers, sub-components, and KumiteView rewrite

**Files:**
- Modify: `src/pages/GradeDetailPage.tsx:5` (type import)
- Modify: `src/pages/GradeDetailPage.tsx:71-106` (replace `KumiteView`, add helpers/sub-components before it)

- [ ] **Step 1: Add `KumiteRow` to the type import**

In `src/pages/GradeDetailPage.tsx`, change line 5 from:

```tsx
import type { KihonItem, KumiteBlock } from '../types'
```

to:

```tsx
import type { KihonItem, KumiteBlock, KumiteRow } from '../types'
```

- [ ] **Step 2: Replace the entire `KumiteView` function (lines 71–106)**

Delete the current `KumiteView` (the one rendering `.kumite-rows` / `.kumite-row` / `.pair` / `.cell`) and replace it with the helpers, three sub-components, and new `KumiteView` below. Place all of this where the old `KumiteView` was (between `KihonTable` and `GradeNav`):

```tsx
const SETUP_ASPECTS = new Set(['Ausgangsstellung', 'Bewegung'])

/** Split Kumite rows into setup context vs. the technique sequence. */
function splitRows(rows: KumiteRow[] = []) {
  const setup = rows.filter((r) => SETUP_ASPECTS.has(r.aspect))
  const sequence = rows.filter((r) => !SETUP_ASPECTS.has(r.aspect))
  return { setup, sequence }
}

/** Jiyu-style forms: every exchange leaves the defense free ("frei"). */
function isFreeDefense(sequence: KumiteRow[]) {
  return sequence.length > 0 && sequence.every((r) => r.uke.trim().toLowerCase() === 'frei')
}

/** Exchange forms sometimes pack a counter into the Uke cell (e.g. "Age-Uke / Gyaku-Zuki"). */
function ukeThreadLabel(uke: string) {
  return uke.includes('/') ? 'Uke · Abwehr / Konter' : 'Uke · Abwehr'
}

function KumiteSetup({ rows }: { rows: KumiteRow[] }) {
  if (rows.length === 0) return null
  return (
    <div className="kumite-setup">
      {rows.map((r, i) => (
        <div className="su-row" key={i}>
          <span className="su-k">{r.aspect}</span>
          <span className="su-v">
            <span className="txt-tori">{r.tori}</span>
            <span className="su-sep" aria-hidden="true">·</span>
            <span className="txt-uke">{r.uke}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function KumiteThread({ rows }: { rows: KumiteRow[] }) {
  return (
    <div className="kumite-thread">
      {rows.map((r, i) => (
        <div className="kt-ex" key={i}>
          <div className="kt-bub kt-tori">
            <span className="role tori">Tori · Angriff {i + 1}</span>
            {r.tori}
          </div>
          <div className="kt-bub kt-uke">
            <span className="role uke">{ukeThreadLabel(r.uke)}</span>
            {r.uke}
          </div>
        </div>
      ))}
    </div>
  )
}

function KumiteFreeDefense({ rows }: { rows: KumiteRow[] }) {
  return (
    <div className="kumite-free">
      <div className="kf-box kf-tori">
        <span className="role tori">Tori · Angriffe (nacheinander)</span>
        <ol>
          {rows.map((r, i) => (
            <li key={i}>{r.tori}</li>
          ))}
        </ol>
      </div>
      <div className="kf-box kf-uke">
        <span className="role uke">Uke · Abwehr &amp; Gegenangriff</span>
        <strong>{rows[0].uke}</strong>
      </div>
    </div>
  )
}

function KumiteView({ k }: { k: KumiteBlock }) {
  const { setup, sequence } = splitRows(k.rows)
  const free = isFreeDefense(sequence)
  return (
    <div className="card-body">
      {k.form && <div className="formline">{k.form}</div>}
      <KumiteSetup rows={setup} />
      {sequence.length > 0 &&
        (free ? <KumiteFreeDefense rows={sequence} /> : <KumiteThread rows={sequence} />)}
      {k.note && <p className="note inset">{k.note}</p>}
      {k.extra && k.extra.length > 0 && (
        <div className="chips">
          {k.extra.map((e) => (
            <span className="chip" key={e}>
              {e}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run build`
Expected: PASS (no TypeScript errors). The build also emits `dist/`. If `tsc` complains about an unused import or symbol, you missed wiring one of the sub-components into `KumiteView` — recheck Step 2.

- [ ] **Step 4: Commit**

```bash
git add src/pages/GradeDetailPage.tsx
git commit -m "feat: render Kumite as sequence thread + free-defense boxes

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

> Note: the section will look unstyled until Task 2 adds CSS — that's expected. The old `.kumite-*` rules no longer match anything but are harmless until removed in Task 2.

---

## Task 2: Styling — replace the Kumite CSS region

**Files:**
- Modify: `src/theme.css` (replace lines ~497–572: the `/* Kumite as stacked cards (mobile-first) */` block through the `.formline` rule)

- [ ] **Step 1: Locate the region to replace**

Run: `grep -n "Kumite as stacked cards" src/theme.css` and `grep -n "^.formline" src/theme.css`
Expected: the first is around line 497; `.formline` is around line 569. You will replace from the `/* Kumite as stacked cards (mobile-first) */` comment line through the closing `}` of the `.formline { ... }` rule (inclusive). Everything after `.formline` (the `/* ---------- Glossary ---------- */` section) stays.

- [ ] **Step 2: Replace that region with the new CSS**

```css
/* ---------- Kumite ---------- */

/* Shared role label (Tori / Uke) and inline role-colored text */
.role {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 3px;
}
.role.tori,
.txt-tori {
  color: var(--accent);
}
.role.uke,
.txt-uke {
  color: #2563eb;
}
[data-theme='dark'] .role.uke,
[data-theme='dark'] .txt-uke {
  color: #60a5fa;
}

.formline {
  font-weight: 700;
  padding-top: 6px;
}

/* Setup strip: quiet context (Ausgangsstellung / Bewegung) */
.kumite-setup {
  background: var(--bg-sunken);
  border-radius: 10px;
  padding: 8px 12px;
  margin: 10px 0 12px;
  font-size: 0.84rem;
}
.kumite-setup .su-row {
  display: flex;
  gap: 8px;
  padding: 2px 0;
}
.kumite-setup .su-k {
  flex: 0 0 7.5rem;
  color: var(--fg-muted);
  font-weight: 600;
}
.kumite-setup .su-sep {
  color: var(--fg-muted);
  margin: 0 4px;
}

/* Thread: call & response exchanges */
.kumite-thread {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 2px;
}
.kumite-thread .kt-ex {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.kumite-thread .kt-bub {
  max-width: 88%;
  border-radius: 12px;
  padding: 8px 11px;
  font-size: 0.92rem;
}
.kumite-thread .kt-tori {
  align-self: flex-start;
  background: color-mix(in srgb, var(--accent) 12%, var(--bg-elev));
  border: 1px solid color-mix(in srgb, var(--accent) 32%, transparent);
}
.kumite-thread .kt-uke {
  align-self: flex-end;
  text-align: right;
  background: color-mix(in srgb, #2563eb 11%, var(--bg-elev));
  border: 1px solid color-mix(in srgb, #2563eb 30%, transparent);
}
[data-theme='dark'] .kumite-thread .kt-uke {
  background: color-mix(in srgb, #60a5fa 16%, var(--bg-elev));
  border-color: color-mix(in srgb, #60a5fa 34%, transparent);
}

/* Free-defense: Tori attack list box + Uke "frei" box */
.kumite-free {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 2px;
}
.kumite-free .kf-box {
  border-radius: 11px;
  padding: 9px 12px;
  font-size: 0.92rem;
}
.kumite-free .kf-tori {
  background: color-mix(in srgb, var(--accent) 12%, var(--bg-elev));
  border: 1px solid color-mix(in srgb, var(--accent) 32%, transparent);
}
.kumite-free .kf-uke {
  background: color-mix(in srgb, #2563eb 11%, var(--bg-elev));
  border: 1px solid color-mix(in srgb, #2563eb 30%, transparent);
}
[data-theme='dark'] .kumite-free .kf-uke {
  background: color-mix(in srgb, #60a5fa 16%, var(--bg-elev));
  border-color: color-mix(in srgb, #60a5fa 34%, transparent);
}
.kumite-free .kf-box ol {
  margin: 0;
  padding-left: 20px;
  line-height: 1.55;
}
.kumite-free .kf-box ol li {
  padding: 1px 0;
}
```

- [ ] **Step 3: Typecheck / build**

Run: `npm run build`
Expected: PASS. CSS errors do not fail `tsc`, but this confirms nothing else broke.

- [ ] **Step 4: Visual check**

Run: `npm run preview`
Open the served URL and check three grades in the browser at a mobile width (DevTools device toolbar, ~360px):
- **Exchange form** — `/#/grade/6-kyu` (Kihon-Ippon): setup strip on top, Tori bubbles left / Uke bubbles right, numbered "Angriff 1…4", note below.
- **Free-defense form** — `/#/grade/2-kyu` (Jiyu): setup strip, red Tori box with a numbered attack list, blue Uke box reading "frei", then the "+ Jiyu-Ippon-Kumite" chip.
- **Pure Dan grade** — `/#/grade/1-dan`: just the form line + chips, no setup/thread.

Toggle the theme (Settings tab) and confirm the bubbles/boxes are legible in dark mode too.

- [ ] **Step 5: Commit**

```bash
git add src/theme.css
git commit -m "style: thread + free-defense Kumite layouts

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Full-program sweep

**Files:** none (verification only)

- [ ] **Step 1: Sweep every grade with a Kumite block**

Run: `npm run preview` (if not already running) and walk the prev/next footer through all 17 grades, or visit each id directly. Confirm no grade renders an empty/broken Kumite section and that each lands on the expected layout:
- Thread: `8-kyu` (Gohon), `7-kyu` (Sanbon), `6-kyu` (Kihon-Ippon), `5-kyu` & `4-kyu` (Kaeshi).
- Free-defense: `3-kyu` (Jiyu-Ippon), `2-kyu` & `1-kyu` (Jiyu).
- Pure chips: `1-dan` through `8-dan`.

Expected: every grade matches its bucket above; setup strip appears only when `Ausgangsstellung`/`Bewegung` rows exist; `note` and `extra` chips still render where present.

- [ ] **Step 2: Final build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3 (optional): bump version**

Per repo convention (memory: "bump version on push to main"), if this branch is about to be pushed/released, bump the version. Otherwise skip — handled at merge time.

---

## Self-Review

- **Spec coverage:** Setup strip ✓ (Task 1 `KumiteSetup`, Task 2 CSS). Thread layout ✓ (Task 1 `KumiteThread`). Free-defense Tori-then-Uke boxes ✓ (Task 1 `KumiteFreeDefense`). Pure chip layout unchanged ✓ (KumiteView keeps `extra` chips, no rows ⇒ no setup/sequence). Layout selection via "all sequence ukes are `frei`" ✓ (`isFreeDefense`). Note + extra preserved ✓. Dark-mode tints ✓ (Task 2 overrides). No data/type changes ✓.
- **Placeholder scan:** none — every code/CSS step is complete.
- **Type consistency:** helper/component names (`splitRows`, `isFreeDefense`, `ukeThreadLabel`, `KumiteSetup`, `KumiteThread`, `KumiteFreeDefense`) and CSS class names (`kumite-setup`/`su-*`, `kumite-thread`/`kt-*`, `kumite-free`/`kf-*`, `role`/`txt-tori`/`txt-uke`) are consistent between Task 1 and Task 2.
