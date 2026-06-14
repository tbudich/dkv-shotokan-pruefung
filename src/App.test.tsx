import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { resetSwState } from './test/stubs/pwa-register'

function renderApp(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routing', () => {
  beforeEach(() => {
    resetSwState()
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('shows the overview title on the home route', () => {
    renderApp('/')
    // h1 text content: "Shotokan Prüfungsordnung 9. Kyu – 8. Dan"
    expect(screen.getByRole('heading', { name: /Shotokan Prüfungsordnung/ })).toBeInTheDocument()
  })

  it('titles the glossary route', () => {
    renderApp('/glossar')
    expect(screen.getByRole('heading', { name: /Glossar/ })).toBeInTheDocument()
  })

  it('titles the settings route', () => {
    renderApp('/info')
    expect(screen.getByRole('heading', { name: /Einstellung/ })).toBeInTheDocument()
  })

  it('shows a belt header and back button on a grade detail', () => {
    renderApp('/grade/9-kyu')
    expect(screen.getByText('9. Kyu')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Zur Gürtel-Übersicht/ })).toBeInTheDocument()
  })

  it('falls back to home for an unknown path', () => {
    renderApp('/totally-unknown')
    // The catch-all route renders HomePage; AppBar shows the home h1
    expect(screen.getByRole('heading', { name: /Shotokan Prüfungsordnung/ })).toBeInTheDocument()
  })
})
