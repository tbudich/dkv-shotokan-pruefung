# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mobile, installable PWA of the **DKV Shotokan Prüfungsordnung** (exam program, 9. Kyu → 8. Dan).
It renders the official PDF's content as searchable, mobile-first, offline-capable screens. UI and
content are in German.

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # tsc -b (typecheck) + vite build → dist/
npm run preview    # serve the production build
npm run lint       # tsc --noEmit
```

There is no test suite. After data/UI changes, verify with `npm run build` (it typechecks) and
`npm run preview`.

## Architecture

- **Content as data, not markup.** All exam content lives in typed data files under `src/data/`
  (`grades.ts`, `glossary.ts`, `info.ts`), shaped by the interfaces in `src/types.ts`. The React
  pages are thin renderers over this data. To correct/extend the program, edit the data files —
  rarely the components. The source PDF is in `pdfs/`; `Grade` objects mirror its per-grade
  structure (Kihon / Kata / Anwendung-Bunkai / Kumite).
- **Kyu vs Dan shape:** Kyu grades use `kata.list` (+ optional `kata.note`) and a Kumite table
  (`kumite.rows` of Tori/Uke); Dan grades use `kata.tokui`/`kata.shitei`, free-text `kihonNote`
  (instead of a `kihon` array for 3.–8. Dan), and `kumite.extra` for free-form forms. The detail
  page conditionally renders each section, so missing fields simply hide.
- **Routing:** `HashRouter` (chosen for static/sub-path hosting). Routes in `src/App.tsx`:
  `/`, `/grade/:id`, `/glossar`, `/info`. The app shell (top app bar with route-derived title +
  bottom tab bar) lives in `App.tsx`; `getGrade(id)` resolves the detail route and the app-bar title.
- **Search** is client-side over the bundled data (no index/back-end): `HomePage` builds a
  per-grade haystack and also matches glossary entries; `GlossaryPage` filters by category.
- **Theming:** CSS custom properties in `src/theme.css` with a `[data-theme]` attribute on
  `<html>`; `useTheme.ts` persists the choice in `localStorage`, defaults to `prefers-color-scheme`,
  and keeps the `theme-color` meta in sync.
- **PWA/offline:** configured in `vite.config.ts` via `vite-plugin-pwa` (`registerType:
  'autoUpdate'`, auto-injected registration). Because content is bundled, the whole app is offline
  after first load. `base: './'` keeps asset paths relative for any host.

## Conventions

- Keep `beltColor` values in the `BELT` map in `src/data/grades.ts`; grade `id`s (e.g. `9-kyu`,
  `1-dan`) are stable and used in URLs — don't rename casually.
- Icons in `public/` (`pwa-192.png`, `pwa-512.png`, `pwa-512-maskable.png`, `apple-touch-icon.png`,
  `favicon.svg`) were generated with a Pillow script; regenerate similarly if the mark changes.
