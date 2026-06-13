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
