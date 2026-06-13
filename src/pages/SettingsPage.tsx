import { infoSections } from '../data/info'
import { useTheme, type ThemeMode } from '../useTheme'

const MODES: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
  { value: 'system', label: 'System' },
]

export function SettingsPage() {
  const { mode, setMode } = useTheme()

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
