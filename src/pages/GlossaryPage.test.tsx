import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlossaryPage } from './GlossaryPage'
import { renderWithRouter } from '../test/render'
import { glossary } from '../data/glossary'

describe('GlossaryPage', () => {
  it('renders glossary entries', () => {
    renderWithRouter(<GlossaryPage />)
    expect(screen.getByText(glossary[0].term)).toBeInTheDocument()
  })

  it('filters by query and shows the empty state on no match', async () => {
    renderWithRouter(<GlossaryPage />)
    // Placeholder: "Begriff suchen…"
    const input = screen.getByPlaceholderText(/Begriff suchen/i)
    await userEvent.type(input, glossary[0].term)
    expect(screen.getByText(glossary[0].term)).toBeInTheDocument()
    await userEvent.clear(input)
    await userEvent.type(input, 'zzzzzzz')
    expect(screen.getByText(/Keine Treffer/)).toBeInTheDocument()
  })
})
