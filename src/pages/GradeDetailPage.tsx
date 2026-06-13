import { Link, useParams } from 'react-router-dom'
import { Belt } from '../components/Belt'
import { getAdjacentGrades, getGrade } from '../data/grades'
import { parseKihon, type StepDirOrNone } from '../kihon'
import type { KihonItem, KumiteBlock } from '../types'

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

function KumiteView({ k }: { k: KumiteBlock }) {
  return (
    <div className="card-body">
      {k.form && <div className="formline">{k.form}</div>}
      {k.rows && k.rows.length > 0 && (
        <div className="kumite-rows">
          {k.rows.map((r, i) => (
            <div className="kumite-row" key={i}>
              <div className="aspect">{r.aspect}</div>
              <div className="pair">
                <div className="cell">
                  <span className="role tori">Tori (Angreifer)</span>
                  {r.tori}
                </div>
                <div className="cell">
                  <span className="role uke">Uke (Verteidiger)</span>
                  {r.uke}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
        <Link className="gradenav-btn prev" to={`/grade/${prev.id}`}>
          <span className="arrow" aria-hidden="true">‹</span>
          <span className="lbl">{prev.title}</span>
        </Link>
      ) : (
        <span className="gradenav-btn prev disabled" aria-hidden="true">
          <span className="arrow">‹</span>
        </span>
      )}
      {next ? (
        <Link className="gradenav-btn next" to={`/grade/${next.id}`}>
          <span className="lbl">{next.title}</span>
          <span className="arrow" aria-hidden="true">›</span>
        </Link>
      ) : (
        <span className="gradenav-btn next disabled" aria-hidden="true">
          <span className="arrow">›</span>
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
      <div className="detail-head">
        <Belt grade={grade} />
        <div>
          <h2>{grade.title}</h2>
          <div className="belt-name">
            {grade.belt} · {grade.group}
          </div>
        </div>
      </div>

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

      {/* Prev / next grade */}
      <GradeNav id={grade.id} />
    </div>
  )
}
