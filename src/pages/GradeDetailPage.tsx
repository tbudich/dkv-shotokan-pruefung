import { Link, useParams } from 'react-router-dom'
import { getAdjacentGrades, getGrade } from '../data/grades'
import { beltContrast } from '../belt'
import { parseKihon, type StepDirOrNone } from '../kihon'
import type { KihonItem, KumiteBlock, KumiteRow } from '../types'

const DIR_META: Record<StepDirOrNone, { arrow: string; label: string }> = {
  vor: { arrow: '→', label: 'Schritt vorwärts' },
  zurück: { arrow: '←', label: 'Schritt rückwärts' },
  seit: { arrow: '↔', label: 'Schritt seitwärts' },
  none: { arrow: '·', label: 'ohne Schritt' },
}

function StepArrow({ dir }: { dir: StepDirOrNone }) {
  const m = DIR_META[dir]
  return (
    <span className={`stepdir ${dir}`} title={m.label} aria-label={m.label}>
      {m.arrow}
    </span>
  )
}

function Rep({ count }: { count?: string }) {
  const value = count ?? '5×'
  const isDefault = value === '5×'
  return <span className={`rep${isDefault ? ' rep-default' : ''}`}>{value}</span>
}

function KihonTable({ items }: { items: KihonItem[] }) {
  return (
    <table className="kihon-table">
      <thead>
        <tr>
          <th className="c-no">#</th>
          <th>Technik</th>
          <th className="c-rep">Wdh.</th>
        </tr>
      </thead>
      <tbody>
        {items.flatMap((item) => {
          const { groups, notes } = parseKihon(item)
          return groups.map((g, gi) => (
            <tr key={`${item.no}-${gi}`} className={gi === 0 ? 'combo-start' : ''}>
              <td className="c-no">{gi === 0 ? `${item.no}.` : ''}</td>
              <td>
                {g.steps.map((s, i) => (
                  <div className="step" key={i}>
                    <StepArrow dir={s.dir} />
                    {s.stance && <span className="stance">{s.stance}</span>}
                    <span className="txt">{s.text}</span>
                  </div>
                ))}
                {gi === groups.length - 1 &&
                  notes.map((n, i) => (
                    <div className="combo-note" key={i}>
                      {n}
                    </div>
                  ))}
              </td>
              <td className="c-rep">
                <Rep count={g.count} />
              </td>
            </tr>
          ))
        })}
      </tbody>
    </table>
  )
}

const SETUP_ASPECTS = new Set(['Ausgangsstellung', 'Bewegung'])

/** Split Kumite rows into setup context vs. the technique sequence. */
function splitRows(rows: KumiteRow[] = []) {
  const setup = rows.filter((r) => SETUP_ASPECTS.has(r.aspect))
  const sequence = rows.filter((r) => !SETUP_ASPECTS.has(r.aspect))
  return { setup, sequence }
}

/** Jiyu-style forms: every exchange leaves the defense free ("frei"). */
function isFreeDefense(sequence: KumiteRow[]) {
  return sequence.length > 0 && sequence.every((r) => r.uke.trim().toLowerCase() === 'frei')
}

/** Exchange forms sometimes pack a counter into the Uke cell (e.g. "Age-Uke / Gyaku-Zuki"). */
function ukeThreadLabel(uke: string) {
  return uke.includes('/') ? 'Uke · Abwehr / Konter' : 'Uke · Abwehr'
}

function KumiteSetup({ rows }: { rows: KumiteRow[] }) {
  if (rows.length === 0) return null
  return (
    <div className="kumite-setup">
      {rows.map((r, i) => (
        <div className="su-row" key={i}>
          <span className="su-k">{r.aspect}</span>
          <span className="su-v">
            <span className="txt-tori">{r.tori}</span>
            <span className="su-sep" aria-hidden="true">·</span>
            <span className="txt-uke">{r.uke}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function KumiteThread({ rows }: { rows: KumiteRow[] }) {
  return (
    <div className="kumite-thread">
      {rows.map((r, i) => (
        <div className="kt-ex" key={i}>
          <div className="kt-bub kt-tori">
            <span className="role tori">Tori · Angriff {i + 1}</span>
            {r.tori}
          </div>
          <div className="kt-bub kt-uke">
            <span className="role uke">{ukeThreadLabel(r.uke)}</span>
            {r.uke}
          </div>
        </div>
      ))}
    </div>
  )
}

function KumiteFreeDefense({ rows }: { rows: KumiteRow[] }) {
  return (
    <div className="kumite-free">
      <div className="kf-box kf-tori">
        <span className="role tori">Tori · Angriffe (nacheinander)</span>
        <ol>
          {rows.map((r, i) => (
            <li key={i}>{r.tori}</li>
          ))}
        </ol>
      </div>
      <div className="kf-box kf-uke">
        <span className="role uke">Uke · Abwehr &amp; Gegenangriff</span>
        <strong>{rows[0].uke}</strong>
      </div>
    </div>
  )
}

function KumiteView({ k }: { k: KumiteBlock }) {
  const { setup, sequence } = splitRows(k.rows)
  const free = isFreeDefense(sequence)
  return (
    <div className="card-body">
      {k.form && <div className="formline">{k.form}</div>}
      <KumiteSetup rows={setup} />
      {sequence.length > 0 &&
        (free ? <KumiteFreeDefense rows={sequence} /> : <KumiteThread rows={sequence} />)}
      {k.note && <p className="note inset">{k.note}</p>}
      {k.extra && k.extra.length > 0 && (
        <div className="chips">
          {k.extra.map((e) => (
            <span className="chip" key={e}>
              {e}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function GradeNav({ id }: { id: string }) {
  const { prev, next } = getAdjacentGrades(id)
  return (
    <nav className="gradenav" aria-label="Grad-Navigation">
      {prev ? (
        <Link
          className="gradenav-btn prev"
          to={`/grade/${prev.id}`}
          style={{ background: prev.beltColor, color: beltContrast(prev.beltColor).fg }}
        >
          <span className="arrow" aria-hidden="true">‹</span>
          <span className="lbl">
            <span className="g-title">{prev.title}</span>
            <span className="g-belt">{prev.belt}</span>
          </span>
        </Link>
      ) : (
        <span className="gradenav-btn prev disabled" aria-label="Kein vorheriger Grad">
          <span className="arrow" aria-hidden="true">‹</span>
        </span>
      )}
      {next ? (
        <Link
          className="gradenav-btn next"
          to={`/grade/${next.id}`}
          style={{ background: next.beltColor, color: beltContrast(next.beltColor).fg }}
        >
          <span className="lbl">
            <span className="g-title">{next.title}</span>
            <span className="g-belt">{next.belt}</span>
          </span>
          <span className="arrow" aria-hidden="true">›</span>
        </Link>
      ) : (
        <span className="gradenav-btn next disabled" aria-label="Kein nächster Grad">
          <span className="arrow" aria-hidden="true">›</span>
        </span>
      )}
    </nav>
  )
}

export function GradeDetailPage() {
  const { id } = useParams()
  const grade = id ? getGrade(id) : undefined

  if (!grade) {
    return (
      <p className="empty">
        Grad nicht gefunden. <Link to="/">Zurück zur Übersicht</Link>
      </p>
    )
  }

  return (
    <div>
      {/* Kihon */}
      {(grade.kihon.length > 0 || grade.kihonNote) && (
        <section className="card">
          <h3>
            Kihon <span className="badge">Grundschule</span>
          </h3>
          {grade.kihonNote && <p className="note">{grade.kihonNote}</p>}
          {grade.kihon.length > 0 && (
            <div className="card-body">
              <KihonTable items={grade.kihon} />
            </div>
          )}
        </section>
      )}

      {/* Kata */}
      {grade.kata && (
        <section className="card">
          <h3>Kata</h3>
          <div className="card-body">
            {grade.kata.list && (
              <>
                {grade.kata.note && <p className="bodytext">{grade.kata.note}:</p>}
                <div className="chips">
                  {grade.kata.list.map((kt) => (
                    <span className="chip" key={kt}>
                      {kt}
                    </span>
                  ))}
                </div>
              </>
            )}
            {grade.kata.tokui && (
              <div className="kv">
                <div className="k">Tokui Kata</div>
                {grade.kata.tokui}
              </div>
            )}
            {grade.kata.shitei && (
              <div className="kv">
                <div className="k">Shitei Kata</div>
                {grade.kata.shitei}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Anwendung / Bunkai */}
      {grade.bunkai && (
        <section className="card">
          <h3>Anwendung / Bunkai</h3>
          <div className="card-body">
            <p className="bodytext">{grade.bunkai}</p>
          </div>
        </section>
      )}

      {/* Kumite */}
      {grade.kumite && (
        <section className="card">
          <h3>
            Kumite <span className="badge">Partner</span>
          </h3>
          <KumiteView k={grade.kumite} />
        </section>
      )}

      {/* Prev / next grade. Keyed by id so the sticky footer fully remounts on
          navigation — iOS WebKit does not repaint a `position: sticky` bottom
          element when only its contents change, leaving stale prev/next labels.
          Remounting hands it a fresh DOM node, forcing a clean paint. */}
      <GradeNav key={grade.id} id={grade.id} />
    </div>
  )
}
