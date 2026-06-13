# Update Button & Version Info in Einstellung — Design

Date: 2026-06-14

## Goal

Add a manual update control and a current-version indicator to the Einstellung
page so users can refresh the installed PWA on demand instead of relying on the
silent close/relaunch update path.

## Decisions (from brainstorming)

- **Two-step update:** "Nach Updates suchen" → if a new version is found, the card
  shows "Neue Version verfügbar" + "Update installieren" (which reloads); if not,
  "✓ Auf dem neuesten Stand".
- **Mode change:** switch the service worker from `registerType: 'autoUpdate'` to
  `'prompt'`. Updates no longer auto-apply on relaunch; the user installs them via
  the button, and a passively detected update surfaces the same "available" state.
- **Version info:** show `Version {version} · Stand {DD.MM.YYYY}`, injected at build
  time.

## Feature 1 — Build config & types

`vite.config.ts`:
- `registerType: 'prompt'` (was `'autoUpdate'`).
- `injectRegister: false` — the React hook (`useRegisterSW`) owns registration, so the
  auto-injected registration script must be disabled to avoid double registration.
- Import the version from `package.json` and add a `define` block:
  - `__APP_VERSION__`: `JSON.stringify(pkg.version)`
  - `__BUILD_DATE__`: `JSON.stringify(new Date().toISOString().slice(0, 10))` (UTC build
    date, `YYYY-MM-DD`).
- Keep all other VitePWA options (manifest, workbox, includeAssets) unchanged.

`src/vite-env.d.ts`:
- Add `/// <reference types="vite-plugin-pwa/react" />` and
  `/// <reference types="vite-plugin-pwa/client" />`.
- Declare the injected globals: `declare const __APP_VERSION__: string` and
  `declare const __BUILD_DATE__: string`.

## Feature 2 — `useAppUpdate` hook

New file `src/useAppUpdate.ts`, wrapping `useRegisterSW` from
`virtual:pwa-register/react`.

```ts
type UpdateStatus = 'idle' | 'checking' | 'available' | 'current' | 'error'
export function useAppUpdate(): {
  status: UpdateStatus
  checkForUpdate: () => void
  applyUpdate: () => void
}
```

Behavior:
- On `onRegisteredSW(_url, registration)`, store the `registration` in a ref.
- `onNeedRefresh` → set status `'available'` (a new SW is waiting). An effect also keeps
  status in sync if `needRefresh` flips while idle.
- `checkForUpdate()`:
  - If no registration is available → status `'error'`.
  - Else set `'checking'`, `await registration.update()`.
  - After it resolves: if status is already `'available'` (onNeedRefresh fired) → stay
    `'available'`; else if `registration.installing` exists → stay `'checking'` and listen
    to that worker's `statechange` (when `installed` with an existing controller →
    `'available'`); else → `'current'`.
  - On a thrown error → `'error'`.
- `applyUpdate()` → `updateServiceWorker(true)` (skip waiting + reload).

The hook is the single owner of update logic; `SettingsPage` only renders from
`status` and calls the two actions.

## Feature 3 — Einstellung UI

`src/pages/SettingsPage.tsx`: add an **"App-Version"** `<section className="card">`
immediately after the Darstellung card and before the info sections. Uses
`useAppUpdate()`.

Card body:
- A version line: `Version {__APP_VERSION__} · Stand {formatBuildDate(__BUILD_DATE__)}`
  where `formatBuildDate` turns `YYYY-MM-DD` into `DD.MM.YYYY`.
- Conditional control:
  - `status === 'available'`: a "Neue Version verfügbar" note + a **Update installieren**
    `.btn` calling `applyUpdate`.
  - otherwise: a **Nach Updates suchen** `.btn` calling `checkForUpdate`, disabled while
    `status === 'checking'`, label "Suche …" during checking.
- Status line: `current` → "✓ Auf dem neuesten Stand"; `error` → "Prüfung nicht möglich."

The existing Darstellung control and info sections are unchanged.

## Feature 4 — Styling

`src/theme.css`: add a reusable `.btn` rule — accent background, accent-contrast text,
full-width-friendly, rounded, with a `:disabled` (dimmed) state — used by both update
actions. Add a small `.update-status` rule for the status line (muted text).

## Out of scope

- No in-app-bar / global update banner; the control lives only in Einstellung (a
  passively detected update still flips the card to "available" when the page is open).
- No changelog/release notes.
- The version is the `package.json` version; no automated bump.

## Constraints & notes

- The update flow is only meaningful in the built app (`npm run preview` or the deployed
  PWA), not `npm run dev` — the service worker is not active in dev, so `checkForUpdate`
  reports `'error'` or no registration there.
- `injectRegister: false` is required precisely because the hook registers; leaving the
  default would register the SW twice.

## Verification

- `npm run build` (typecheck + build); confirm `dist/sw.js` is generated and the bundle
  defines the version/date.
- `npm run preview`: open Einstellung; confirm the version line shows
  `Version 1.0.0 · Stand <today>`. Tap "Nach Updates suchen" with no new deploy →
  "✓ Auf dem neuesten Stand". Then rebuild with a visible change, redeploy/re-preview,
  tap again → "Neue Version verfügbar" → "Update installieren" reloads into the new
  build. Confirm normal navigation/offline still work.
