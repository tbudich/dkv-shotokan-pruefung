import { infoSections } from '../data/info'
import { useTheme, type ThemeMode } from '../useTheme'
import type { AppUpdate } from '../useAppUpdate'
import { useInstallPrompt, chromeIntentUrl } from '../useInstallPrompt'

const MODES: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
  { value: 'system', label: 'System' },
]

function formatBuildDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export function SettingsPage({ update }: { update: AppUpdate }) {
  const { mode, setMode } = useTheme()
  const { status, checkForUpdate, applyUpdate } = update
  const { state: installState, promptInstall } = useInstallPrompt()

  return (
    <div className="info">
      <section className="card">
        <h3>Darstellung</h3>
        <div className="card-body">
          <div className="segmented" role="group" aria-label="Farbschema">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`seg${mode === m.value ? ' active' : ''}`}
                aria-pressed={mode === m.value}
                onClick={() => setMode(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {installState !== 'installed' && installState !== 'checking' && (
        <section className="card">
          <h3>App installieren</h3>
          <div className="card-body">
            {installState === 'available' && (
              <button type="button" className="btn" onClick={promptInstall}>
                Auf Homebildschirm installieren
              </button>
            )}
            {installState === 'samsung' && (
              <>
                <p className="bodytext">
                  Tipp: in Chrome installieren – das erstellt eine verifizierte
                  App und vermeidet die Play-Protect-Warnung.
                </p>
                {/* link, not a button: the intent URL navigates and Android
                    hands off to Chrome (same tab, so it isn't target=_blank). */}
                <a className="btn" href={chromeIntentUrl()}>
                  In Chrome öffnen
                </a>
              </>
            )}
            {installState === 'ios' && (
              <p className="bodytext">
                Zum Installieren in Safari: Teilen-Symbol antippen und „Zum
                Home-Bildschirm" wählen.
              </p>
            )}
            {installState === 'unsupported' && (
              <p className="bodytext">
                Zum Installieren das Browser-Menü öffnen und „Zum
                Startbildschirm hinzufügen" wählen. Für eine verifizierte
                Installation die Seite in Chrome öffnen.
              </p>
            )}
          </div>
        </section>
      )}

      <section className="card">
        <h3>App-Version</h3>
        <div className="card-body">
          <p className="app-version">
            Version {__APP_VERSION__} · Stand {formatBuildDate(__BUILD_DATE__)}
          </p>
          {status === 'available' ? (
            <>
              <p className="bodytext">Neue Version verfügbar.</p>
              <button type="button" className="btn" onClick={applyUpdate}>
                Update installieren
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn"
              onClick={checkForUpdate}
              disabled={status === 'checking'}
            >
              {status === 'checking' ? 'Suche …' : 'Nach Updates suchen'}
            </button>
          )}
          {status === 'current' && (
            <p className="update-status">✓ Auf dem neuesten Stand</p>
          )}
          {status === 'error' && (
            <p className="update-status">Prüfung nicht möglich.</p>
          )}
        </div>
      </section>

      {infoSections.map((s) => (
        <section className="card" key={s.id}>
          <h3>{s.title}</h3>
          <div className="card-body">
            {s.body?.map((p, i) => (
              <p className="bodytext" key={i}>
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul>
                {s.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
            {s.legend?.map(([k, v]) => (
              <div className="kv" key={k}>
                <div className="k">{k}</div>
                {v}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
