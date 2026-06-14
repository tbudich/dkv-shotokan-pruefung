import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { GradeDetailPage } from './GradeDetailPage'
import { renderWithRouter } from '../test/render'

function renderGrade(id: string) {
  return renderWithRouter(
    <Routes>
      <Route path="/grade/:id" element={<GradeDetailPage />} />
    </Routes>,
    `/grade/${id}`,
  )
}

describe('GradeDetailPage Kumite layouts', () => {
  it('renders the thread layout for an exchange form (6. Kyu)', () => {
    // 6-kyu: Kihon-Ippon-Kumite with Ablauf rows where uke is not "frei"
    const { container } = renderGrade('6-kyu')
    expect(container.querySelector('.kumite-thread')).toBeInTheDocument()
    expect(screen.getByText(/Tori · Angriff 1/)).toBeInTheDocument()
    expect(container.querySelector('.kumite-free')).toBeNull()
  })

  it('renders the free-defense layout for a Jiyu form (2. Kyu)', () => {
    // 2-kyu: Jiyu-Ippon-Kumite with all Angriff rows having uke === "frei"
    const { container } = renderGrade('2-kyu')
    expect(container.querySelector('.kumite-free')).toBeInTheDocument()
    expect(container.querySelector('.kumite-free ol')).toBeInTheDocument()
    expect(container.querySelector('.kumite-thread')).toBeNull()
  })

  it('renders only chips for a pure Dan form (3. Dan)', () => {
    // 3-dan: kumite has only extra (chips), no rows at all
    const { container } = renderGrade('3-dan')
    expect(container.querySelector('.kumite-thread')).toBeNull()
    expect(container.querySelector('.kumite-free')).toBeNull()
    expect(container.querySelector('.kumite-setup')).toBeNull()
    expect(container.querySelector('.chips')).toBeInTheDocument()
  })

  it('renders the Kihon table and a setup strip where present (8. Kyu)', () => {
    // 8-kyu: Gohon-Kumite with Ausgangsstellung/Bewegung setup rows
    const { container } = renderGrade('8-kyu')
    expect(container.querySelector('.kihon-table')).toBeInTheDocument()
    expect(container.querySelector('.kumite-setup')).toBeInTheDocument()
  })

  it('shows a not-found fallback for an unknown id', () => {
    renderGrade('nope')
    expect(screen.getByText(/Grad nicht gefunden/)).toBeInTheDocument()
  })
})
