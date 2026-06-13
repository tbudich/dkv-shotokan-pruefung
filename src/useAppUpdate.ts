import { useCallback, useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'current' | 'error'

export interface AppUpdate {
  status: UpdateStatus
  checkForUpdate: () => void
  applyUpdate: () => void
}

// The periodic update check is app-global; guard so it is started only once.
let periodicCheckStarted = false

/**
 * Owns the PWA update flow. Call this once at the app root so the service worker
 * registers on every load (not only when the settings page is open), then pass
 * the result to the settings UI. `checkForUpdate` actively asks the service
 * worker to look for a new version; `applyUpdate` activates a waiting worker and
 * reloads. `status` drives the button/label states.
 */
export function useAppUpdate(): AppUpdate {
  const [status, setStatus] = useState<UpdateStatus>('idle')
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      registrationRef.current = r
      // Periodic background check: surfaces an update without a manual tap.
      if (r && !periodicCheckStarted) {
        periodicCheckStarted = true
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
          // A new worker is downloading; resolve once it reaches a terminal
          // state. `reg.waiting` (not the page's current controller) is what
          // tells us a new version is staged and ready to apply.
          const onStateChange = () => {
            if (sw.state === 'installed') {
              setStatus(reg.waiting ? 'available' : 'current')
              sw.removeEventListener('statechange', onStateChange)
            } else if (sw.state === 'redundant') {
              setStatus('error')
              sw.removeEventListener('statechange', onStateChange)
            }
          }
          sw.addEventListener('statechange', onStateChange)
          // Guard against the worker having already settled before we attached.
          if (sw.state === 'installed' || sw.state === 'redundant') onStateChange()
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
