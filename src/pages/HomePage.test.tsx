import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomePage } from './HomePage'
import { renderWithRouter } from '../test/render'

describe('HomePage', () => {
  it('lists kyu and dan grades by default', () => {
    renderWithRouter(<HomePage />)
    expect(screen.getByText('9. Kyu')).toBeInTheDocument()
    expect(screen.getByText('1. Dan')).toBeInTheDocument()
  })

  it('filters grades by a query', async () => {
    renderWithRouter(<HomePage />)
    // Placeholder: "Suche: Technik, Kata, Grad, Begriff…"
    await userEvent.type(screen.getByPlaceholderText(/Suche/i), 'Heian Shodan')
    expect(screen.getByText(/Grade \(/)).toBeInTheDocument()
  })

  it('shows the empty state for a no-match query', async () => {
    renderWithRouter(<HomePage />)
    await userEvent.type(screen.getByPlaceholderText(/Suche/i), 'zzzzzzz')
    expect(screen.getByText(/Keine Treffer/)).toBeInTheDocument()
  })
})
