# Update Button & Version Info Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a manual "check for updates" + "install update" control and a current-version line to the Einstellung page of the PWA.

**Architecture:** Switch the service worker to `prompt` mode and let a React hook own registration. A `useAppUpdate` hook wraps `virtual:pwa-register/react`'s `useRegisterSW`, exposing a small status machine (`idle | checking | available | current | error`) plus `checkForUpdate`/`applyUpdate`. `SettingsPage` renders an "App-Version" card from that status. Build-time `define` injects the version (from `package.json`) and build date.

**Tech Stack:** React 18, TypeScript, Vite, vite-plugin-pwa (Workbox), CSS custom properties. No test framework — `npm run build` (tsc -b + vite build) is the verification gate, per CLAUDE.md.

---

## File Structure

- `vite.config.ts` — `registerType: 'prompt'`, `injectRegister: false`, `define` for version/date, import version from `package.json`.
- `tsconfig.node.json` — enable `resolveJsonModule` so the config can import `package.json`.
- `src/vite-env.d.ts` — add `vite-plugin-pwa/react` type ref + declare the injected globals.
- `src/useAppUpdate.ts` — new hook; single owner of update logic.
- `src/pages/SettingsPage.tsx` — new "App-Version" card.
- `src/theme.css` — `.btn`, `.app-version`, `.update-status` rules.

---

## Task 1: Build config & types

**Files:**
- Modify: `vite.config.ts`
- Modify: `tsconfig.node.json`
- Modify: `src/vite-env.d.ts`

- [ ] **Step 1: Enable JSON import in the node tsconfig**

In `tsconfig.node.json`, add `"resolveJsonModule": true,` inside `compilerOptions` (e.g. right after the `"strict": true,` line). The block becomes:

```json
    "strict": true,
    "resolveJsonModule": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
```

- [ ] **Step 2: Update `vite.config.ts`**

Replace the entire file with (manifest/workbox unchanged from current; only `define`, the `pkg` import, `registerType`, and `injectRegister` are new):

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json'

// Relative base so the app works on GitHub Pages project pages, Netlify,
// or any sub-path host. Routing uses HashRouter, so deep links work too.
export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'DKV Shotokan Prüfungsordnung',
        short_name: 'Shotokan PO',
        description:
          'Mobile Prüfungsordnung Shotokan im Deutschen Karate Verband – 9. Kyu bis 8. Dan.',
        lang: 'de',
        theme_color: '#b91c1c',
        background_color: '#0f1115',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
})
```

- [ ] **Step 3: Update `src/vite-env.d.ts`**

Replace the file with:

```ts
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/react" />

declare const __APP_VERSION__: string
declare const __BUILD_DATE__: string
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: PASS. (Confirm `dist/sw.js` is still generated. Note: with `injectRegister: false` and no hook yet, the SW won't be registered at runtime until Task 2 — that's expected for this intermediate step; the build is green.)

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts tsconfig.node.json src/vite-env.d.ts
git commit -m "build: switch PWA to prompt mode, inject version/build date"
```

---

## Task 2: `useAppUpdate` hook

**Files:**
- Create: `src/useAppUpdate.ts`

- [ ] **Step 1: Create the hook**

Create `src/useAppUpdate.ts` with:

```ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'current' | 'error'

/**
 * Owns the PWA update flow for the settings UI. `checkForUpdate` actively asks
 * the service worker to look for a new version; `applyUpdate` activates a waiting
 * worker and reloads. `status` drives the button/label states.
 */
export function useAppUpdate(): {
  status: UpdateStatus
  checkForUpdate: () => void
  applyUpdate: () => void
} {
  const [status, setStatus] = useState<UpdateStatus>('idle')
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      registrationRef.current = r
      // Periodic background check: surfaces an update without a manual tap.
      if (r) {
        setInterval(() => {
          void r.update()
        }, 60 * 60 * 1000)
      }
    },
    onRegisterError() {
      setStatus('error')
    },
  })

  // A waiting worker (found actively or by the periodic check) means an update is ready.
  useEffect(() => {
    if (needRefresh) setStatus('available')
  }, [needRefresh])

  const checkForUpdate = useCallback(() => {
    const reg = registrationRef.current
    if (!reg) {
      setStatus('error')
      return
    }
    setStatus('checking')
    reg
      .update()
      .then(() => {
        const sw = reg.installing
        if (sw) {
          // A new worker is downloading; resolve once it finishes installing.
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed') {
              setStatus(navigator.serviceWorker.controller ? 'available' : 'current')
            }
          })
          return
        }
        setStatus(reg.waiting ? 'available' : 'current')
      })
      .catch(() => setStatus('error'))
  }, [])

  const applyUpdate = useCallback(() => {
    void updateServiceWorker(true)
  }, [updateServiceWorker])

  return { status, checkForUpdate, applyUpdate }
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: PASS (the `virtual:pwa-register/react` types resolve via the reference directive added in Task 1).

- [ ] **Step 3: Commit**

```bash
git add src/useAppUpdate.ts
git commit -m "feat: add useAppUpdate hook for manual PWA update flow"
```

---

## Task 3: Einstellung "App-Version" card + styles

**Files:**
- Modify: `src/pages/SettingsPage.tsx`
- Modify: `src/theme.css`

- [ ] **Step 1: Replace `src/pages/SettingsPage.tsx`**

Replace the entire file with (adds the `useAppUpdate` import, a `formatBuildDate` helper, and the App-Version card after Darstellung; Darstellung and info sections unchanged):

```tsx
import { infoSections } from '../data/info'
import { useTheme, type ThemeMode } from '../useTheme'
import { useAppUpdate } from '../useAppUpdate'

const MODES: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
  { value: 'system', label: 'System' },
]

function formatBuildDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export function SettingsPage() {
  const { mode, setMode } = useTheme()
  const { status, checkForUpdate, applyUpdate } = useAppUpdate()

  return (
    <div className="info">
      <section className="card">
        <h3>Darstellung</h3>
        <div className="card-body">
          <div className="segmented" role="group" aria-label="Farbschema">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`seg${mode === m.value ? ' active' : ''}`}
                aria-pressed={mode === m.value}
                onClick={() => setMode(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <h3>App-Version</h3>
        <div className="card-body">
          <p className="app-version">
            Version {__APP_VERSION__} · Stand {formatBuildDate(__BUILD_DATE__)}
          </p>
          {status === 'available' ? (
            <>
              <p className="bodytext">Neue Version verfügbar.</p>
              <button type="button" className="btn" onClick={applyUpdate}>
                Update installieren
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn"
              onClick={checkForUpdate}
              disabled={status === 'checking'}
            >
              {status === 'checking' ? 'Suche …' : 'Nach Updates suchen'}
            </button>
          )}
          {status === 'current' && (
            <p className="update-status">✓ Auf dem neuesten Stand</p>
          )}
          {status === 'error' && (
            <p className="update-status">Prüfung nicht möglich.</p>
          )}
        </div>
      </section>

      {infoSections.map((s) => (
        <section className="card" key={s.id}>
          <h3>{s.title}</h3>
          <div className="card-body">
            {s.body?.map((p, i) => (
              <p className="bodytext" key={i}>
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul>
                {s.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
            {s.legend?.map(([k, v]) => (
              <div className="kv" key={k}>
                <div className="k">{k}</div>
                {v}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Append styles to `src/theme.css`**

Append to the END of `src/theme.css`:

```css
/* ---------- Settings button + update status ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: var(--accent-contrast);
  font-size: 0.9rem;
  font-weight: 600;
}

.btn:disabled {
  opacity: 0.55;
}

.app-version {
  font-size: 0.85rem;
  color: var(--fg-muted);
  margin: 0 0 10px;
}

.update-status {
  margin: 8px 0 0;
  font-size: 0.85rem;
  color: var(--fg-muted);
}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/pages/SettingsPage.tsx src/theme.css
git commit -m "feat: App-Version card with update button in Einstellung"
```

---

## Task 4: Manual verification

**Files:** none.

- [ ] **Step 1: Build + preview**

Run: `npm run build && npm run preview`

- [ ] **Step 2: Verify version line + up-to-date path**

Open the preview URL, go to Einstellung. Confirm:
- The "App-Version" card shows `Version 1.0.0 · Stand <today as DD.MM.YYYY>`.
- Tap "Nach Updates suchen": it briefly shows "Suche …" (disabled), then — since the preview is the current build — shows "✓ Auf dem neuesten Stand". No console errors.
- The Darstellung control and info sections still render and work.

- [ ] **Step 3: Verify the service worker registers**

In the browser devtools (Application → Service Workers) for the preview origin, confirm a service worker is active (registration now comes from the hook, not the removed auto-inject). Reload and confirm offline still works (DevTools → Network → Offline, reload — the app still loads).

- [ ] **Step 4: (Optional) Verify the update-available path**

This path is best confirmed against the deployed site: after this is live, make any visible change, push to `main`, wait for the Pages deploy, then in the installed/preview app tap "Nach Updates suchen" → it should show "Neue Version verfügbar" → "Update installieren" reloads into the new build. (Locally it can be simulated by rebuilding `dist` while `npm run preview` keeps running and tapping the button, but the deployed flow is the reliable check.)

- [ ] **Step 5: Final confirmation**

Confirm `npm run build` is clean. No commit needed (verification only).

---

## Self-Review Notes

- **Spec coverage:** prompt mode + injectRegister false + define version/date + type refs (T1); `useAppUpdate` status machine with check/apply + periodic check + onNeedRefresh→available (T2); App-Version card with version line, two-step button, current/error status, placed after Darstellung (T3); build/preview/SW/offline + update-available verification (T4). All spec sections mapped.
- **Type consistency:** `useAppUpdate()` returns `{ status, checkForUpdate, applyUpdate }` with `UpdateStatus = 'idle'|'checking'|'available'|'current'|'error'` — consumed exactly in SettingsPage. Injected globals `__APP_VERSION__`/`__BUILD_DATE__` declared in T1, used in T3. `resolveJsonModule` (T1) enables the `package.json` import in the same task's config.
- **No placeholders:** every code step is complete; the one delete-and-replace (vite.config.ts) keeps the manifest verbatim.
- **YAGNI/scope:** no global update banner, no changelog; periodic check is a lightweight 60-min interval to satisfy the "passively surfaces" requirement.
```
