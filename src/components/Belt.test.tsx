import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Belt } from './Belt'
import { getGrade } from '../data/grades'

describe('Belt', () => {
  it('labels a kyu grade with its rank and tints with the belt color', () => {
    const g = getGrade('9-kyu')!
    const { container } = render(<Belt grade={g} />)
    const swatch = container.querySelector('.belt')!
    expect(swatch).toHaveTextContent('9')
    expect(swatch).toHaveClass('outline')
  })

  it('labels a dan grade with a trailing dot and no outline', () => {
    const g = getGrade('1-dan')!
    const { container } = render(<Belt grade={g} />)
    const swatch = container.querySelector('.belt')!
    expect(swatch).toHaveTextContent('1.')
    expect(swatch).not.toHaveClass('outline')
  })
})
