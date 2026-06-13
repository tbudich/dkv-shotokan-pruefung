import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
type Effective = 'light' | 'dark'

const MEDIA = '(prefers-color-scheme: dark)'

function initialMode(): ThemeMode {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function apply(effective: Effective) {
  document.documentElement.setAttribute('data-theme', effective)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', effective === 'dark' ? '#0f1115' : '#b91c1c')
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(initialMode)

  // Persist the mode, apply the effective theme to the document, and — while in
  // system mode — follow OS scheme changes live.
  useEffect(() => {
    localStorage.setItem('theme', mode)
    if (mode !== 'system') {
      apply(mode)
      return
    }
    const mql = window.matchMedia(MEDIA)
    apply(mql.matches ? 'dark' : 'light')
    const onChange = () => apply(mql.matches ? 'dark' : 'light')
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [mode])

  return { mode, setMode }
}
