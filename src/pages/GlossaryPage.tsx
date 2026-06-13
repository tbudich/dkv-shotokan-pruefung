import { useMemo, useState } from 'react'
import { glossary, glossaryCategories } from '../data/glossary'

export function GlossaryPage() {
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!query) return glossary
    return glossary.filter(
      (e) =>
        e.term.toLowerCase().includes(query) || e.meaning.toLowerCase().includes(query),
    )
  }, [query])

  const byCategory = useMemo(
    () =>
      glossaryCategories
        .map((cat) => ({ cat, items: filtered.filter((e) => e.category === cat) }))
        .filter((g) => g.items.length > 0),
    [filtered],
  )

  return (
    <div>
      <div className="search">
        <span className="glass">🔍</span>
        <input
          type="search"
          inputMode="search"
          placeholder="Begriff suchen…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {byCategory.length === 0 && <p className="empty">Keine Treffer für „{q}“.</p>}

      {byCategory.map(({ cat, items }) => (
        <section key={cat}>
          <div className="section-label">{cat}</div>
          <div className="card">
            <div className="card-body">
              <div className="gloss-list">
                {items.map((e) => (
                  <div className="gloss-item" key={e.term}>
                    <div className="term">{e.term}</div>
                    <div className="mean">{e.meaning}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}
