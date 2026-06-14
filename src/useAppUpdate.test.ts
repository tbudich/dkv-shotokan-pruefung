import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAppUpdate } from './useAppUpdate'
import { swState, resetSwState } from './test/stubs/pwa-register'

beforeEach(() => {
  resetSwState()
})

describe('useAppUpdate', () => {
  it('flips to available when a refresh is needed', async () => {
    swState.needRefresh = true
    const { result } = renderHook(() => useAppUpdate())
    await waitFor(() => expect(result.current.status).toBe('available'))
  })

  it('reports error when registration fails', async () => {
    swState.registerError = true
    const { result } = renderHook(() => useAppUpdate())
    await waitFor(() => expect(result.current.status).toBe('error'))
  })

  it('checkForUpdate without a registration reports error', async () => {
    swState.registration = undefined
    const { result } = renderHook(() => useAppUpdate())
    act(() => result.current.checkForUpdate())
    await waitFor(() => expect(result.current.status).toBe('error'))
  })

  it('checkForUpdate resolves to current when no worker is waiting', async () => {
    swState.registration = {
      update: vi.fn().mockResolvedValue(undefined),
      installing: null,
      waiting: null,
    } as unknown as ServiceWorkerRegistration
    const { result } = renderHook(() => useAppUpdate())
    await waitFor(() => expect(result.current).toBeTruthy())
    act(() => result.current.checkForUpdate())
    await waitFor(() => expect(result.current.status).toBe('current'))
  })

  it('checkForUpdate resolves to available when a worker is waiting', async () => {
    swState.registration = {
      update: vi.fn().mockResolvedValue(undefined),
      installing: null,
      waiting: {} as ServiceWorker,
    } as unknown as ServiceWorkerRegistration
    const { result } = renderHook(() => useAppUpdate())
    await waitFor(() => expect(result.current).toBeTruthy())
    act(() => result.current.checkForUpdate())
    await waitFor(() => expect(result.current.status).toBe('available'))
  })

  it('applyUpdate triggers the service worker update', () => {
    const { result } = renderHook(() => useAppUpdate())
    act(() => result.current.applyUpdate())
    expect(swState.updateServiceWorker).toHaveBeenCalledWith(true)
  })
})
