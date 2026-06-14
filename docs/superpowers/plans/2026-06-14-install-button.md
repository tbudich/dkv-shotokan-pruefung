# "Auf Homebildschirm installieren" Button — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an install affordance to the Einstellung screen that triggers a native (Chrome) install, steers Samsung Internet users to Chrome to avoid the Google Play Protect warning, and shows manual instructions on iOS.

**Architecture:** A new `useInstallPrompt` hook owns all browser detection and the `beforeinstallprompt` lifecycle, returning a discriminated state. `SettingsPage.tsx` renders a thin "App installieren" card off that state. No new dependencies.

**Tech Stack:** React 18 + TypeScript, Vite, vite-plugin-pwa. No unit-test suite in this repo — verification is `npm run build` (tsc typecheck) + `npm run preview`, per CLAUDE.md.

---

### Task 1: Install-state hook

**Files:**
- Create: `src/useInstallPrompt.ts`

**Design notes:**
- Samsung Internet *also* fires `beforeinstallprompt`, but installing through it produces the distrusted WebAPK we are trying to avoid. So the `beforeinstallprompt` handler must **ignore** Samsung and keep steering to Chrome.
- `checking` is the initial state before the effect runs; the page hides the section during it to avoid a flash.

- [ ] **Step 1: Create the hook**

```ts
import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallState =
  | 'checking'
  | 'available'
  | 'samsung'
  | 'ios'
  | 'installed'
  | 'unsupported'

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isSamsungInternet(): boolean {
  return /SamsungBrowser/i.test(navigator.userAgent)
}

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/** Reopen the current page in Chrome via an Android intent URL. */
export function chromeIntentUrl(): string {
  const { host, pathname, search, hash } = window.location
  return `intent://${host}${pathname}${search}${hash}#Intent;scheme=https;package=com.android.chrome;end`
}

export function useInstallPrompt() {
  const [state, setState] = useState<InstallState>('checking')
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isStandalone()) {
      setState('installed')
      return
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      // Samsung's native install yields a Play-Protect-distrusted WebAPK;
      // keep steering those users to Chrome instead of upgrading to 'available'.
      if (isSamsungInternet()) return
      setPromptEvent(e as BeforeInstallPromptEvent)
      setState('available')
    }
    const onInstalled = () => {
      setState('installed')
      setPromptEvent(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)

    // Resolve non-prompt fallbacks. If beforeinstallprompt fires (Chromium,
    // non-Samsung), the handler above upgrades the state to 'available'.
    if (isSamsungInternet()) setState('samsung')
    else if (isIos()) setState('ios')
    else setState('unsupported')

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    setPromptEvent(null)
  }

  return { state, promptInstall }
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run lint`
Expected: PASS (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/useInstallPrompt.ts
git commit -m "feat: add useInstallPrompt hook for browser-aware install"
```

---

### Task 2: Render the install card in Einstellung

**Files:**
- Modify: `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Import the hook**

At the top of `src/pages/SettingsPage.tsx`, add below the existing imports:

```ts
import { useInstallPrompt, chromeIntentUrl } from '../useInstallPrompt'
```

- [ ] **Step 2: Call the hook in the component**

Inside `SettingsPage`, add after the existing `const { status, ... } = update` line:

```ts
  const { state: installState, promptInstall } = useInstallPrompt()
```

- [ ] **Step 3: Render the card**

Insert this section immediately after the closing `</section>` of the "Darstellung" card (before the "App-Version" card):

```tsx
      {installState !== 'installed' && installState !== 'checking' && (
        <section className="card">
          <h3>App installieren</h3>
          <div className="card-body">
            {installState === 'available' && (
              <button type="button" className="btn" onClick={promptInstall}>
                Auf Homebildschirm installieren
              </button>
            )}
            {installState === 'samsung' && (
              <>
                <p className="bodytext">
                  Tipp: in Chrome installieren – das erstellt eine verifizierte
                  App und vermeidet die Play-Protect-Warnung.
                </p>
                <a className="btn" href={chromeIntentUrl()}>
                  In Chrome öffnen
                </a>
              </>
            )}
            {installState === 'ios' && (
              <p className="bodytext">
                Zum Installieren in Safari: Teilen-Symbol antippen und „Zum
                Home-Bildschirm“ wählen.
              </p>
            )}
            {installState === 'unsupported' && (
              <p className="bodytext">
                Zum Installieren das Browser-Menü öffnen und „Zum
                Startbildschirm hinzufügen“ wählen. Für eine verifizierte
                Installation die Seite in Chrome öffnen.
              </p>
            )}
          </div>
        </section>
      )}
```

- [ ] **Step 4: Typecheck + build**

Run: `npm run build`
Expected: PASS (tsc typecheck + vite build, no errors).

- [ ] **Step 5: Preview-verify**

Run: `npm run preview`, open the Einstellung tab.
Expected:
- On Chrome desktop after the `beforeinstallprompt` fires: the **"Auf Homebildschirm installieren"** button appears and opens the native install dialog.
- The `.btn` styling renders correctly on the `<a>` "In Chrome öffnen" element (check by temporarily forcing `installState === 'samsung'` if needed). Adjust styling only if the anchor looks wrong.
- When the app is already installed/standalone, the card is absent.

- [ ] **Step 6: Commit**

```bash
git add src/pages/SettingsPage.tsx
git commit -m "feat: add install card to Einstellung (Chrome steering for Samsung)"
```

---

## Self-Review

- **Spec coverage:** hook with all 6 states ✓ (Task 1); Chrome native install ✓ (`available`); Samsung → Chrome intent ✓ (`samsung`); iOS manual text ✓ (`ios`); hidden when installed ✓ (Task 2 Step 3 guard); fallback ✓ (`unsupported`); no new deps ✓; build/preview verification ✓.
- **Placeholder scan:** none — all code is complete.
- **Type consistency:** `useInstallPrompt()` returns `{ state, promptInstall }`; page destructures `state` as `installState` and imports `chromeIntentUrl` separately. `InstallState` union matches every branch rendered. Consistent.
