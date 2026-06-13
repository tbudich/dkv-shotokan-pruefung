import type { Grade } from '../types'

/** Belt swatch showing the grade number (e.g. "9" or "1.") over the belt color. */
export function Belt({ grade }: { grade: Grade }) {
  const label = grade.type === 'dan' ? `${grade.rank}.` : `${grade.rank}`
  return (
    <div
      className={`belt${grade.beltOutline ? ' outline' : ''}`}
      style={{ background: grade.beltColor }}
      aria-hidden
    >
      {label}
      <span className="knot" />
    </div>
  )
}
