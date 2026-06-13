import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Belt } from '../components/Belt'
import { grades, kyuGrades, danGrades } from '../data/grades'
import { glossary } from '../data/glossary'
import type { Grade } from '../types'

function gradeHaystack(g: Grade): string {
  const parts: string[] = [g.title, g.belt, g.group]
  g.kihon.forEach((k) => parts.push(k.text, k.stance ?? ''))
  if (g.kata?.list) parts.push(...g.kata.list)
  if (g.kata?.tokui) parts.push(g.kata.tokui)
  if (g.kata?.shitei) parts.push(g.kata.shitei)
  if (g.kumite?.form) parts.push(g.kumite.form)
  if (g.kumite?.extra) parts.push(...g.kumite.extra)
  g.kumite?.rows?.forEach((r) => parts.push(r.tori, r.uke))
  if (g.bunkai) parts.push(g.bunkai)
  return parts.join(' ').toLowerCase()
}

function GradeRow({ g }: { g: Grade }) {
  return (
    <Link className="grade-card" to={`/grade/${g.id}`}>
      <Belt grade={g} />
      <div className="meta">
        <div className="title">{g.title}</div>
        <div className="belt-name">{g.belt}</div>
      </div>
      <span className="chev">›</span>
    </Link>
  )
}

export function HomePage() {
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()

  const matchedGrades = useMemo(() => {
    if (!query) return null
    return grades.filter((g) => gradeHaystack(g).includes(query))
  }, [query])

  const matchedTerms = useMemo(() => {
    if (!query) return []
    return glossary.filter(
      (e) =>
        e.term.toLowerCase().includes(query) || e.meaning.toLowerCase().includes(query),
    )
  }, [query])

  return (
    <div>
      <div className="search">
        <span className="glass">🔍</span>
        <input
          type="search"
          inputMode="search"
          placeholder="Suche: Technik, Kata, Grad, Begriff…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {matchedGrades === null ? (
        <>
          <div className="section-label">Kyu-Grade</div>
          <div className="grade-grid">
            {kyuGrades.map((g) => (
              <GradeRow key={g.id} g={g} />
            ))}
          </div>
          <div className="section-label">Dan-Grade</div>
          <div className="grade-grid">
            {danGrades.map((g) => (
              <GradeRow key={g.id} g={g} />
            ))}
          </div>
        </>
      ) : (
        <>
          {matchedGrades.length > 0 && (
            <>
              <div className="section-label">Grade ({matchedGrades.length})</div>
              <div className="grade-grid">
                {matchedGrades.map((g) => (
                  <GradeRow key={g.id} g={g} />
                ))}
              </div>
            </>
          )}
          {matchedTerms.length > 0 && (
            <>
              <div className="section-label">Begriffe ({matchedTerms.length})</div>
              <div className="card">
                <div className="card-body">
                  <div className="gloss-list">
                    {matchedTerms.map((e) => (
                      <div className="gloss-item" key={e.term}>
                        <span className="term">{e.term}</span> ·{' '}
                        <span className="mean">{e.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          {matchedGrades.length === 0 && matchedTerms.length === 0 && (
            <p className="empty">Keine Treffer für „{q}“.</p>
          )}
        </>
      )}
    </div>
  )
}
