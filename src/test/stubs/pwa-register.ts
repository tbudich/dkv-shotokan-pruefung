import { vi } from 'vitest'

type RegisterOptions = {
  onRegisteredSW?: (swUrl: string, r?: ServiceWorkerRegistration) => void
  onRegisterError?: (error: unknown) => void
}

export const swState: {
  needRefresh: boolean
  registration: ServiceWorkerRegistration | undefined
  registerError: boolean
  updateServiceWorker: ReturnType<typeof vi.fn>
} = {
  needRefresh: false,
  registration: undefined,
  registerError: false,
  updateServiceWorker: vi.fn(),
}

export function resetSwState() {
  swState.needRefresh = false
  swState.registration = undefined
  swState.registerError = false
  swState.updateServiceWorker = vi.fn()
}

export function useRegisterSW(options: RegisterOptions = {}) {
  Promise.resolve().then(() => {
    if (swState.registerError) options.onRegisterError?.(new Error('register failed'))
    else options.onRegisteredSW?.('/sw.js', swState.registration)
  })
  return {
    needRefresh: [swState.needRefresh, vi.fn()] as [boolean, (v: boolean) => void],
    offlineReady: [false, vi.fn()] as [boolean, (v: boolean) => void],
    updateServiceWorker: swState.updateServiceWorker,
  }
}
