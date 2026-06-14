import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallState =
  | 'checking'
  | 'available'
  | 'samsung'
  | 'ios'
  | 'installed'
  | 'unsupported'

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isSamsungInternet(): boolean {
  return /SamsungBrowser/i.test(navigator.userAgent)
}

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/** Reopen the current page in Chrome via an Android intent URL. */
export function chromeIntentUrl(): string {
  const { host, pathname, search, hash } = window.location
  return `intent://${host}${pathname}${search}${hash}#Intent;scheme=https;package=com.android.chrome;end`
}

export function useInstallPrompt() {
  const [state, setState] = useState<InstallState>('checking')
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isStandalone()) {
      setState('installed')
      return
    }

    const samsung = isSamsungInternet()

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      // Samsung's native install yields a Play-Protect-distrusted WebAPK;
      // keep steering those users to Chrome instead of upgrading to 'available'.
      if (samsung) return
      setPromptEvent(e as BeforeInstallPromptEvent)
      setState('available')
    }
    const onInstalled = () => {
      setState('installed')
      setPromptEvent(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)

    // Resolve non-prompt fallbacks. If beforeinstallprompt fires (Chromium,
    // non-Samsung), the handler above upgrades the state to 'available'.
    if (samsung) setState('samsung')
    else if (isIos()) setState('ios')
    else setState('unsupported')

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    // The event can only be prompted once; drop it either way.
    setPromptEvent(null)
    // On accept, the 'appinstalled' listener flips state to 'installed'.
    // On dismiss, fall back to guidance instead of a dead 'available' button.
    if (outcome !== 'accepted') setState('unsupported')
  }

  return { state, promptInstall }
}
