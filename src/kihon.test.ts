import { describe, it, expect } from 'vitest'
import { groupSteps, parseKihon, type KihonStep } from './kihon'
import type { KihonItem } from './types'

const step = (over: Partial<KihonStep> = {}): KihonStep => ({ dir: 'none', text: 'x', ...over })

describe('groupSteps', () => {
  it('keeps countless steps in one group', () => {
    const groups = groupSteps([step(), step()])
    expect(groups).toHaveLength(1)
    expect(groups[0].steps).toHaveLength(2)
    expect(groups[0].count).toBeUndefined()
  })

  it('starts a new group at each counted step', () => {
    const groups = groupSteps([step({ count: '5×' }), step(), step({ count: '2×' })])
    expect(groups.map((g) => g.count)).toEqual(['5×', '2×'])
    expect(groups[0].steps).toHaveLength(2)
    expect(groups[1].steps).toHaveLength(1)
  })
})

describe('parseKihon', () => {
  it('parses a simple stance + technique with the item direction', () => {
    const item: KihonItem = { no: 1, dir: 'vor', stance: 'ZK', text: '5 × Oi-Zuki' }
    const { steps, groups } = parseKihon(item)
    expect(steps[0].dir).toBe('vor')
    expect(steps[0].stance).toBe('ZK')
    expect(steps[0].text).toContain('Oi-Zuki')
    expect(groups[0].count).toBe('5×')
  })

  it('treats "/" as an on-the-spot (none) follow-up step', () => {
    const item: KihonItem = { no: 2, dir: 'zurück', stance: 'ZK', text: '5 × Age-Uke / Gyaku-Zuki' }
    const { steps } = parseKihon(item)
    expect(steps.length).toBeGreaterThanOrEqual(2)
    expect(steps[steps.length - 1].dir).toBe('none')
  })

  it('splits a counted sub-group but not "3× rechts"', () => {
    const item: KihonItem = {
      no: 7,
      dir: 'vor',
      stance: 'KB',
      text: '3 × Mawashi-Geri (aus Kamae, 3× rechts u. links)',
    }
    const { groups } = parseKihon(item)
    expect(groups).toHaveLength(1)
    expect(groups[0].count).toBe('3×')
  })

  it('does not split separators inside parentheses', () => {
    const item: KihonItem = {
      no: 3,
      stance: 'Shizentai',
      text: '6 × Soto-Ude-Uke (erneute Ausholbewegung nach dem Block)',
    }
    const { steps } = parseKihon(item)
    expect(steps).toHaveLength(1)
    expect(steps[0].text).toContain('(erneute Ausholbewegung nach dem Block)')
  })
})
