import { describe, it, expect } from 'vitest'
import { beltContrast } from './belt'

describe('beltContrast', () => {
  it('uses dark ink on bright belts', () => {
    for (const hex of ['#f5f5f5', '#facc15', '#f97316', '#16a34a']) {
      const { fg, isLight } = beltContrast(hex)
      expect(isLight).toBe(true)
      expect(fg).toBe('#1f2937')
    }
  })

  it('uses white ink on dark belts', () => {
    for (const hex of ['#2563eb', '#92400e', '#1f2937']) {
      const { fg, isLight } = beltContrast(hex)
      expect(isLight).toBe(false)
      expect(fg).toBe('#ffffff')
    }
  })

  it('tolerates a missing leading #', () => {
    expect(beltContrast('f5f5f5')).toEqual(beltContrast('#f5f5f5'))
  })
})
