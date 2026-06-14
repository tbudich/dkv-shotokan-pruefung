import { describe, it, expect } from 'vitest'
import { grades, kyuGrades, danGrades, getGrade, getAdjacentGrades } from './grades'

describe('grades data', () => {
  it('has 17 grades partitioned into 9 kyu + 8 dan', () => {
    expect(grades).toHaveLength(17)
    expect(kyuGrades).toHaveLength(9)
    expect(danGrades).toHaveLength(8)
    expect(kyuGrades.length + danGrades.length).toBe(grades.length)
  })

  it('has unique ids and required fields', () => {
    const ids = grades.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const g of grades) {
      expect(g.id).toBeTruthy()
      expect(g.title).toBeTruthy()
      expect(g.belt).toBeTruthy()
      expect(g.beltColor).toMatch(/^#?[0-9a-fA-F]{6}$/)
      expect(g.group).toBeTruthy()
    }
  })
})

describe('getGrade', () => {
  it('returns a grade for a known id', () => {
    expect(getGrade('9-kyu')?.title).toBe('9. Kyu')
  })
  it('returns undefined for an unknown id', () => {
    expect(getGrade('nope')).toBeUndefined()
  })
})

describe('getAdjacentGrades', () => {
  it('has no prev at the first grade', () => {
    const { prev, next } = getAdjacentGrades('9-kyu')
    expect(prev).toBeUndefined()
    expect(next?.id).toBe('8-kyu')
  })
  it('has no next at the last grade', () => {
    const { prev, next } = getAdjacentGrades('8-dan')
    expect(next).toBeUndefined()
    expect(prev?.id).toBe('7-dan')
  })
  it('returns both neighbors in the middle', () => {
    const { prev, next } = getAdjacentGrades('5-kyu')
    expect(prev?.id).toBe('6-kyu')
    expect(next?.id).toBe('4-kyu')
  })
  it('returns empty for an unknown id', () => {
    expect(getAdjacentGrades('nope')).toEqual({})
  })
})
