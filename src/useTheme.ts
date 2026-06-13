import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
type Effective = 'light' | 'dark'

const MEDIA = '(prefers-color-scheme: dark)'

function initialMode(): ThemeMode {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function resolve(mode: ThemeMode): Effective {
  if (mode === 'system') {
    return window.matchMedia(MEDIA).matches ? 'dark' : 'light'
  }
  return mode
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(initialMode)
  const [effective, setEffective] = useState<Effective>(() => resolve(initialMode()))

  // Persist the mode and recompute the effective theme when the mode changes.
  useEffect(() => {
    localStorage.setItem('theme', mode)
    setEffective(resolve(mode))
  }, [mode])

  // While in system mode, follow OS scheme changes live.
  useEffect(() => {
    if (mode !== 'system') return
    const mql = window.matchMedia(MEDIA)
    const onChange = () => setEffective(mql.matches ? 'dark' : 'light')
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [mode])

  // Apply the effective theme to the document + theme-color meta.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effective)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', effective === 'dark' ? '#0f1115' : '#b91c1c')
  }, [effective])

  return { mode, setMode }
}
