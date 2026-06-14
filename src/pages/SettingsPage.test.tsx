import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsPage } from './SettingsPage'
import type { AppUpdate } from '../useAppUpdate'

function makeUpdate(over: Partial<AppUpdate> = {}): AppUpdate {
  return { status: 'idle', checkForUpdate: vi.fn(), applyUpdate: vi.fn(), ...over }
}

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('shows the version line', () => {
    render(<SettingsPage update={makeUpdate()} />)
    // __APP_VERSION__ is "test", __BUILD_DATE__ is "2026-01-01" → "01.01.2026"
    expect(screen.getByText(/Version test/)).toBeInTheDocument()
  })

  it('toggles the theme via the segmented buttons', async () => {
    render(<SettingsPage update={makeUpdate()} />)
    const dark = screen.getByRole('button', { name: 'Dunkel' })
    await userEvent.click(dark)
    expect(dark).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('calls checkForUpdate from the idle button', async () => {
    const update = makeUpdate({ status: 'idle' })
    render(<SettingsPage update={update} />)
    await userEvent.click(screen.getByRole('button', { name: /Nach Updates suchen/ }))
    expect(update.checkForUpdate).toHaveBeenCalled()
  })

  it('offers install when an update is available', async () => {
    const update = makeUpdate({ status: 'available' })
    render(<SettingsPage update={update} />)
    await userEvent.click(screen.getByRole('button', { name: /Update installieren/ }))
    expect(update.applyUpdate).toHaveBeenCalled()
  })

  it('reflects checking, current, and error statuses', () => {
    const { rerender } = render(<SettingsPage update={makeUpdate({ status: 'checking' })} />)
    // When checking, button text is "Suche …" and it is disabled
    expect(screen.getByRole('button', { name: /Suche/ })).toBeDisabled()
    rerender(<SettingsPage update={makeUpdate({ status: 'current' })} />)
    expect(screen.getByText(/Auf dem neuesten Stand/)).toBeInTheDocument()
    rerender(<SettingsPage update={makeUpdate({ status: 'error' })} />)
    expect(screen.getByText(/Prüfung nicht möglich/)).toBeInTheDocument()
  })
})
