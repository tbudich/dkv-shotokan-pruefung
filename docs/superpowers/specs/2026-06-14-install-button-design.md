# Design: "Auf Homebildschirm installieren" Button

Date: 2026-06-14
Status: Approved

## Problem

On Android, when the PWA is installed via **Samsung Internet**, Google Play
Protect shows "Unsichere App blockiert / für eine ältere Android-Version
entwickelt". Samsung Internet is the only browser that mints its own WebAPK,
and Play Protect distrusts those WebAPKs. The warning is not caused by anything
in our manifest or content, and no manifest change can make Samsung's WebAPK
trusted.

Chrome (and other Chromium browsers) mint WebAPKs via Google's trusted minting
server, which does **not** trigger the warning. The fix is therefore to steer
users toward installing through Chrome, and to give them a one-tap install
affordance.

## Goal

Add an install affordance to the Einstellung (Settings) screen that:

- In Chrome/Edge, triggers the native install prompt (→ trusted WebAPK).
- In Samsung Internet, reopens the page in Chrome so the user gets a trusted
  install instead of the distrusted Samsung WebAPK.
- On iOS, shows the manual "Teilen → Zum Home-Bildschirm" instructions.
- Hides itself once the app is already installed.

Non-goal: making Samsung Internet's own WebAPK pass Play Protect. That is
outside our control.

## Components

### `src/useInstallPrompt.ts` (new hook)

Encapsulates all browser detection and the `beforeinstallprompt` lifecycle so
the page component stays a thin renderer. Returns a discriminated state:

- `installed` — app runs standalone (`matchMedia('(display-mode: standalone)')`
  is true, or `navigator.standalone` on iOS). Section is hidden.
- `available` — a `beforeinstallprompt` event was captured. Exposes
  `promptInstall()` which calls the stored event's `prompt()`.
- `samsung` — UA contains `SamsungBrowser`. Offers the Chrome intent link.
- `ios` — iOS Safari (no prompt event available). Offers manual instructions.
- `unsupported` — no prompt captured (yet) and not one of the above. Offers
  fallback text (open in Chrome / use the browser menu).

The hook starts in `unsupported`/checking and flips to `available` if/when the
`beforeinstallprompt` event fires (the event is timing-dependent). It also
listens for the `appinstalled` event to switch to `installed`.

The Chrome intent URL is built from `window.location` at click time:

```
intent://<host><pathname><search><hash>#Intent;scheme=https;package=com.android.chrome;end
```

### `src/pages/SettingsPage.tsx` (edit)

A new section/card "App installieren" rendered based on the hook state:

| State | UI |
|---|---|
| `available` | Button **"Auf Homebildschirm installieren"** → `promptInstall()` |
| `samsung` | Button **"In Chrome öffnen"** → navigate to the intent URL; one line explaining Chrome installs a verified app and avoids the Play-Protect-Warnung |
| `ios` | Text: "Teilen → Zum Home-Bildschirm" |
| `installed` | Section hidden |
| `unsupported` | Fallback text: in Chrome öffnen / Browser-Menü "Zum Startbildschirm hinzufügen" |

## Constraints

- No new dependencies; pure DOM/React, matching the existing thin-renderer
  style and German UI copy.
- Styling consistent with existing SettingsPage cards / theme variables.

## Verification

- `npm run build` (typecheck + build).
- `npm run preview`, confirm the section renders and the button states behave
  (native prompt in Chrome desktop; intent link string correct).
- Manual Android check: install via Chrome produces no Play Protect warning.
```
