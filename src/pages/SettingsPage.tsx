import { infoSections } from '../data/info'
import { useTheme, type ThemeMode } from '../useTheme'
import type { AppUpdate } from '../useAppUpdate'

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
